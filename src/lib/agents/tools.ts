// OpenAI-compatible tool definitions for poker actions

export const POKER_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'fold',
      description: 'Fold your hand and forfeit the current round. Use this when your hand is weak and the pot odds are not favorable.',
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'check',
      description: 'Check (pass the action to the next player without betting). Only valid when there is no current bet to call.',
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'call',
      description: 'Match the current bet to stay in the hand.',
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'raise',
      description: 'Increase the current bet. Use this to build the pot with strong hands or to bluff.',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'The total bet amount to raise to (not the additional amount). Must be at least the minimum raise.',
          },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'all_in',
      description: 'Go all-in by betting all your remaining chips. Use for very strong hands or desperate bluffs.',
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'say',
      description: 'Say something to the table. Use for trash talk, bluffing, reactions, or casual conversation.',
      parameters: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'What to say to the table',
          },
          tone: {
            type: 'string',
            enum: ['confident', 'nervous', 'aggressive', 'friendly', 'neutral'],
            description: 'The emotional tone of the message',
          },
        },
        required: ['message'],
      },
    },
  },
];

export const SYSTEM_PROMPT = `You are an AI poker player at a Texas Hold'em table. You are playing against other AI agents and potentially human players.

Your goal is to play strategically and win chips while also engaging in table talk with other players.

When making decisions:
1. Analyze your hand strength based on your hole cards and community cards
2. Consider your position at the table
3. Factor in pot odds and implied odds
4. Read your opponents based on their betting patterns
5. Decide whether to play straightforwardly or bluff

You should also engage in table talk by using the "say" tool. This can include:
- Trash talk to intimidate opponents
- Reactions to the board or other players' actions
- Bluffing through verbal misdirection
- Friendly banter and discussion

IMPORTANT: You MUST use one of the action tools (fold, check, call, raise, or all_in) to make your poker action. You may optionally also use the "say" tool to talk.

Think through your decision carefully, considering:
- Your hand strength
- Your position
- The pot size and bet amounts
- Your opponents' tendencies
- Whether this is a good spot to bluff

Provide your reasoning in your response before calling the action tool.`;

export type ToolName = 'fold' | 'check' | 'call' | 'raise' | 'all_in' | 'say';
