// AI Agent and game interaction types

import { ActionType } from '../poker/game';

// Registered AI agent configuration
export interface AIAgent {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  profileImage: string;
  personality?: string;
  voiceId?: string; // For TTS differentiation
  model?: string; // AI model to use (e.g., gpt-4o-mini, grok-2-1212)
  customPrompt?: string; // Custom instructions prepended to the system prompt
}

// Agent's internal thought process
export interface AgentThought {
  agentId: string;
  timestamp: number;
  reasoning: string;
  handAnalysis?: string;
  opponentReads?: string;
  decision?: {
    action: ActionType;
    amount?: number;
  };
  confidence?: number; // 0-100
}

// Table chat message
export interface TableChat {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  tone: 'confident' | 'nervous' | 'aggressive' | 'friendly' | 'neutral';
  type: 'trash_talk' | 'reaction' | 'bluff' | 'discussion' | 'greeting';
  timestamp: number;
  linkedThought?: AgentThought;
  actionDisplay?: string;
  handId?: string;
}

// AI response from API
export interface AIAgentResponse {
  thought: AgentThought;
  action?: {
    name: string;
    arguments?: Record<string, unknown>;
  };
  chat?: {
    message: string;
    tone: TableChat['tone'];
  };
}

// Game context sent to AI
export interface GameContext {
  gameId: string;
  yourPlayerId: string;
  yourName: string;
  yourChips: number;
  yourHoleCards: string[];
  communityCards: string[];
  pot: number;
  currentBet: number;
  yourCurrentBet: number;
  bettingRound: string;
  position: 'dealer' | 'small_blind' | 'big_blind' | 'early' | 'middle' | 'late';
  validActions: ActionType[];
  minRaise: number;
  maxRaise: number;
  opponents: {
    id: string;
    name: string;
    chips: number;
    currentBet: number;
    hasFolded: boolean;
    isAllIn: boolean;
    profileImage: string;
  }[];
  recentActions: {
    playerId: string;
    playerName: string;
    action: string;
    amount?: number;
    timestamp?: number;
  }[];
  recentChat: TableChat[];
  previousHands: string[]; // Summaries of past hands
}

// Stored agent registration (for persistence)
export interface StoredAgent {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string; // Should be encrypted in production
  profileImage: string;
  personality?: string;
  voiceId?: string;
  model?: string; // AI model to use
  customPrompt?: string; // Custom instructions prepended to the system prompt
  createdAt: number;
}
