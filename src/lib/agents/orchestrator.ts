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
  recentActions: { playerId: string; playerName: string; action: string; amount?: number; timestamp?: number }[],
  recentChat: TableChat[],
  handHistory: { winners: string[]; actions: { playerName: string; action: string; amount?: number; timestamp?: number }[]; chatMessages?: TableChat[]; showdown?: { playerName: string; handDescription: string; cards: string }[] }[] = []
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
  // Calculate previous hands history
  const previousHands = (() => {
      // Format all history
      const fullHistory = handHistory.map((h, i) => {
        // Collect all events with timestamps
        const events: { time: number; str: string }[] = [];
        
        // Add Actions
        h.actions.forEach(a => {
           const actionStr = `[${a.playerName} ${a.action}${a.amount ? ' ' + a.amount : ''}]`;
           events.push({ time: a.timestamp || 0, str: actionStr });
        });

        // Add Chat
        if (h.chatMessages) {
           h.chatMessages.forEach(c => {
              events.push({ time: c.timestamp, str: `[${c.agentName}: "${c.message}"]` });
           });
        }
        
        // Sort by time
        events.sort((a, b) => a.time - b.time);
        
        const eventLog = events.map(e => e.str).join(', ');
        
        let showdownLog = '';
        if (h.showdown && h.showdown.length > 0) {
            const showdownDetails = h.showdown.map(s => `${s.playerName} showed ${s.handDescription} (${s.cards})`);
            showdownLog = ` Showdown: [${showdownDetails.join('], [')}]`;
        }
        
        return `Hand -${handHistory.length - i}: Winners: ${h.winners.join(', ')}. Log: ${eventLog}.${showdownLog}`;
      });
      
      // Safety truncation: If history is too massive (e.g. > 1,500,000 chars), keep only the most recent ones that fit.
      const MAX_TOTAL_CHARS = 1500000;
      const BUFFER_FOR_PROMPT = 10000; // Increased buffer for safety (chatty agents, long rounds)
      const MAX_HISTORY_CHARS = MAX_TOTAL_CHARS - BUFFER_FOR_PROMPT;
      
      let currentLength = 0;
      const recentHistory: string[] = [];
      
      // Iterate backwards (newest first)
      for (let i = fullHistory.length - 1; i >= 0; i--) {
        const entry = fullHistory[i];
        if (currentLength + entry.length > MAX_HISTORY_CHARS) {
          break;
        }
        recentHistory.unshift(entry);
        currentLength += entry.length;
      }
      
      return recentHistory;
  })();

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
    recentActions: recentActions,
    // Only show chat from the current hand to prevent hallucinations
    recentChat: recentChat.filter(msg => msg.handId === state.handId),
    previousHands,
  };
}

// Call AI agent API
export async function callAgent(
  agent: AIAgent,
  context: GameContext
): Promise<AIAgentResponse> {
  // Interleave recent actions and chat
  const recentLog = (() => {
      const events = [
        ...context.recentActions.map(a => ({ 
            time: a.timestamp || 0, 
            str: `- ${a.playerName}: ${a.action}${a.amount ? ` (${a.amount})` : ''}` 
        })),
        ...context.recentChat.map(c => ({ 
            time: c.timestamp, 
            str: `- ${c.agentName} (Chat): "${c.message}"` 
        }))
      ];
      
      // Sort by time
      events.sort((a,b) => a.time - b.time);
      
      return events.map(e => e.str).join('\n') || 'None yet';
  })();

  const userMessage = `
Current game state:
You are playing as: "${context.yourName}"
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

Current Hand Log (Chronological):
${recentLog}

${context.previousHands.length > 0 ? `
Previous Hand History (-1 = Last hand, -2 = 2nd last hand, etc. Use to identify opponent tendencies, bluffs, and patterns):
${context.previousHands.join('\n')}
` : ''}

What's your move? Think through your decision first, then use the appropriate tool.`;

  let messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  let accumulatedReasoning = '';
  let accumulatedChat: AIAgentResponse['chat'] | undefined;
  
  try {
    // Maximum 3 steps to complete one poker turn: 1. Think, 2. Say, 3. Action
    for (let step = 0; step < 3; step++) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiUrl: agent.apiUrl,
          apiKey: agent.apiKey,
          payload: {
            model: agent.model || 'gpt-5-nano',
            messages,
            tools: POKER_TOOLS,
            tool_choice: 'required',
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Details:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`[Step ${step}] Raw Response for ${agent.model}:`, JSON.stringify(data, null, 2));
      const result = parseAgentResponse(agent.id, data);

      // Accumulate reasoning and chat
      if (result.thought?.reasoning && result.thought.reasoning !== 'Thinking context-aware strategy...') {
        accumulatedReasoning = result.thought.reasoning;
      }
      if (result.chat) {
        if (accumulatedChat) {
          accumulatedChat = {
            ...result.chat,
            message: `${accumulatedChat.message} ${result.chat.message}`
          };
        } else {
          accumulatedChat = result.chat;
        }
      }

      // If we have an action, we are done
      if (result.action) {
        // Return combined result
        return {
          thought: {
            agentId: agent.id,
            timestamp: Date.now(),
            reasoning: accumulatedReasoning || result.thought?.reasoning || 'No reasoning provided.',
            confidence: result.thought?.confidence || 50
          },
          action: result.action,
          chat: accumulatedChat || result.chat
        };
      }
      
      // If no action, treat as intermediate step and continue
      const toolCallId = `call_${Date.now()}_${step}`;
      const toolCalls = [];

      // Reconstruct tool calls for history matching
      if (result.thought?.reasoning && result.thought.reasoning !== 'Thinking context-aware strategy...') {
         toolCalls.push({
            id: toolCallId + '_think',
            type: 'function',
            function: { name: 'think', arguments: JSON.stringify({ thought: result.thought.reasoning }) }
         });
      }
      if (result.chat) {
         toolCalls.push({
            id: toolCallId + '_say',
            type: 'function',
            function: { name: 'say', arguments: JSON.stringify(result.chat) }
         });
      }

      // If we truly have no apparent tool calls but no action (parser failed?), break
      if (toolCalls.length === 0) {
        // Check if there was raw content we missed? 
        // If not, break to avoid infinite loop of nothingness
        break;
      }

      // Append assistant message
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: toolCalls
      });
      
      // Append tool results
      toolCalls.forEach(tc => {
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: 'Success.'
        });
      });

      // Prompt for next step
      messages.push({
        role: 'user',
        content: 'Continue. You MUST eventually use an ACTION tool (fold, check, call, raise, all_in).',
      });
    }
    
    // Fallback
    return {
      thought: { agentId: agent.id, timestamp: Date.now(), reasoning: 'No action taken.', confidence: 0 },
      action: { name: 'fold' }
    };

  } catch (error) {
    console.error('Error calling agent:', error);
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
  let reasoning = message?.content || '';
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
    } else if (name === 'think') {
      reasoning = (args.thought as string) || reasoning;
    } else {
      action = {
        name,
        arguments: args,
      };
    }
  }

  // Fallback if still empty
  if (!reasoning) {
    reasoning = 'Thinking context-aware strategy...';
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
