// AI Agent Orchestrator - manages turn-taking and AI communication

import { v4 as uuidv4 } from 'uuid';
import { GameState, PlayerState, getValidActions, ActionType, cardToDisplayString } from '../poker';
import { AIAgent, AgentThought, TableChat, GameContext, AIAgentResponse } from './types';
import { POKER_TOOLS, SYSTEM_PROMPT, ToolName } from './tools';

// Build game context for AI
export function buildGameContext(
  state: GameState,
  player: PlayerState,
  agents: AIAgent[],
  recentActions: { playerId: string; playerName: string; action: string; amount?: number }[],
  recentChat: TableChat[]
): GameContext {
  const playerIndex = state.players.findIndex(p => p.id === player.id);
  const dealerDistance = (playerIndex - state.dealerIndex + state.players.length) % state.players.length;
  
  let position: GameContext['position'];
  if (dealerDistance === 0) position = 'dealer';
  else if (dealerDistance === 1) position = 'small_blind';
  else if (dealerDistance === 2) position = 'big_blind';
  else if (dealerDistance <= state.players.length / 3) position = 'early';
  else if (dealerDistance <= (state.players.length * 2) / 3) position = 'middle';
  else position = 'late';

  const validActions = getValidActions(state);
  
  return {
    gameId: state.id,
    yourPlayerId: player.id,
    yourName: player.name,
    yourChips: player.chips,
    yourHoleCards: player.holeCards.map(cardToDisplayString),
    communityCards: state.communityCards.map(cardToDisplayString),
    pot: state.pot,
    currentBet: state.currentBet,
    yourCurrentBet: player.currentBet,
    bettingRound: state.bettingRound,
    position,
    validActions,
    minRaise: state.currentBet + state.minimumRaise,
    maxRaise: player.chips + player.currentBet,
    opponents: state.players
      .filter(p => p.id !== player.id)
      .map(p => {
        const agent = agents.find(a => a.id === p.id);
        return {
          id: p.id,
          name: p.name,
          chips: p.chips,
          currentBet: p.currentBet,
          hasFolded: p.hasFolded,
          isAllIn: p.isAllIn,
          profileImage: agent?.profileImage || '/default-avatar.png',
        };
      }),
    recentActions: recentActions.slice(-10),
    recentChat: recentChat.slice(-10),
  };
}

// Call AI agent API
export async function callAgent(
  agent: AIAgent,
  context: GameContext
): Promise<AIAgentResponse> {
  const userMessage = `
Current game state:
- Betting round: ${context.bettingRound}
- Your cards: ${context.yourHoleCards.join(', ')}
- Community cards: ${context.communityCards.length > 0 ? context.communityCards.join(', ') : 'None yet'}
- Pot: ${context.pot} chips
- Current bet to call: ${context.currentBet - context.yourCurrentBet} chips
- Your chips: ${context.yourChips}
- Your position: ${context.position}
- Valid actions: ${context.validActions.join(', ')}
${context.validActions.includes('raise') ? `- Minimum raise to: ${context.minRaise} chips` : ''}

Opponents:
${context.opponents.map(o => 
  `- ${o.name}: ${o.chips} chips, bet: ${o.currentBet}${o.hasFolded ? ' (folded)' : ''}${o.isAllIn ? ' (all-in)' : ''}`
).join('\n')}

Recent actions:
${context.recentActions.map(a => 
  `- ${a.playerName}: ${a.action}${a.amount ? ` (${a.amount})` : ''}`
).join('\n') || 'None yet'}

${context.recentChat.length > 0 ? `
Recent table talk:
${context.recentChat.map(c => `- ${c.agentName}: "${c.message}"`).join('\n')}
` : ''}

What's your move? Think through your decision first, then use the appropriate tool.`;

  try {
    const response = await fetch(agent.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent.apiKey}`,
      },
      body: JSON.stringify({
        model: agent.model || 'gpt-4o-mini', // Use configured model or default to fast model
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        tools: POKER_TOOLS,
        tool_choice: 'required',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return parseAgentResponse(agent.id, data);
  } catch (error) {
    console.error('Error calling agent:', error);
    // Return a default fold action on error
    return {
      thought: {
        agentId: agent.id,
        timestamp: Date.now(),
        reasoning: 'Error occurred, folding by default.',
        confidence: 0,
      },
      action: { name: 'fold' },
    };
  }
}

// Parse OpenAI-format response
function parseAgentResponse(agentId: string, data: unknown): AIAgentResponse {
  const response = data as {
    choices?: {
      message?: {
        content?: string;
        tool_calls?: {
          function: {
            name: string;
            arguments: string;
          };
        }[];
      };
    }[];
  };

  const message = response.choices?.[0]?.message;
  const reasoning = message?.content || '';
  const toolCalls = message?.tool_calls || [];

  let action: AIAgentResponse['action'];
  let chat: AIAgentResponse['chat'];

  for (const toolCall of toolCalls) {
    const name = toolCall.function.name as ToolName;
    let args: Record<string, unknown> = {};
    
    try {
      args = JSON.parse(toolCall.function.arguments || '{}');
    } catch {
      // Ignore parse errors
    }

    if (name === 'say') {
      chat = {
        message: (args.message as string) || '',
        tone: (args.tone as TableChat['tone']) || 'neutral',
      };
    } else {
      action = {
        name,
        arguments: args,
      };
    }
  }

  // Extract confidence from reasoning if mentioned
  let confidence = 50;
  const confidenceMatch = reasoning.match(/confidence[:\s]+(\d+)/i);
  if (confidenceMatch) {
    confidence = parseInt(confidenceMatch[1], 10);
  }

  return {
    thought: {
      agentId,
      timestamp: Date.now(),
      reasoning,
      confidence,
    },
    action,
    chat,
  };
}

// Convert AI action to game action
export function convertToGameAction(
  playerId: string,
  aiAction: AIAgentResponse['action'],
  validActions: ActionType[]
): { type: ActionType; amount?: number } {
  if (!aiAction) {
    // Default to fold if no action
    return { type: 'fold' };
  }

  const actionName = aiAction.name as ActionType;

  // Validate the action is allowed
  if (!validActions.includes(actionName)) {
    // Try to find a valid alternative
    if (validActions.includes('check')) {
      return { type: 'check' };
    }
    if (validActions.includes('fold')) {
      return { type: 'fold' };
    }
    return { type: validActions[0] };
  }

  if (actionName === 'raise' && aiAction.arguments?.amount) {
    return {
      type: 'raise',
      amount: aiAction.arguments.amount as number,
    };
  }

  return { type: actionName };
}

// Create chat message from AI response
export function createChatMessage(
  agentId: string,
  agentName: string,
  chat: AIAgentResponse['chat']
): TableChat | null {
  if (!chat?.message) return null;

  return {
    id: uuidv4(),
    agentId,
    agentName,
    message: chat.message,
    tone: chat.tone || 'neutral',
    type: 'discussion',
    timestamp: Date.now(),
  };
}
