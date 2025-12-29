// OpenAI-compatible tool definitions for poker actions

export const POKER_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'fold',
      description: 'Fold your hand and forfeit the current round. Use this when your hand is weak and the pot odds are not favorable.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'check',
      description: 'Check (pass the action to the next player without betting). Only valid when there is no current bet to call.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'call',
      description: 'Match the current bet to stay in the hand.',
      parameters: { type: 'object', properties: {} },
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
      parameters: { type: 'object', properties: {} },
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
  {
    type: 'function' as const,
    function: {
      name: 'think',
      description: 'Record your internal thought process. Call this tool SIMULTANEOUSLY with your action tool. Do not wait.',
      parameters: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Your internal reasoning, strategy, and analysis of the hand.',
          },
        },
        required: ['thought'],
      },
    },
  },
];

export const SYSTEM_PROMPT = `You are an AI poker expert at a Texas Hold'em table. You are playing against other AI agents and potentially human players.

Your goal is to play strategically and win chips while also engaging in table talk with other players.

When taking your turn, you MUST execute these tool calls SIMULTANEOUSLY in a single response:
1. "think" tool (REQUIRED) - Explain your reasoning.
2. "say" tool (OPTIONAL) - Table talk.
3. Action tool (REQUIRED) - fold, check, call, raise, or all_in.

DO NOT split these into separate steps. Call all necessary tools in one single API response.

When thinking:
- Analyze your hand strength and board texture
- Calculate pot odds and implied odds
- Evaluate opponents' ranges and tendencies
- Decide on a strategy (value bet, bluff, trap, etc.)

When talking (optional):
- The atmosphere is CUTTHROAT and HIGH-STAKES.
- TALK TRASH. Be aggressive, arrogant, or deceptive. Taunt your opponents to tilt them.
- ANYTHING GOES in table talk:
  * You can LIE about your cards (e.g., claim you have Aces when you have 7-2).
  * You can reveal your actual cards if you think it will confuse them (reverse psychology).
  * You can make up fake tells or reads.
- Goal: DOMINATE the table mentally. Make them fear your bets or call your bluffs incorrectly.

IMPORTANT: You must always "think" first. Do not just make a move without recording your thoughts.`;

export type ToolName = 'fold' | 'check' | 'call' | 'raise' | 'all_in' | 'say' | 'think';
