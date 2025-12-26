// Game state management with Zustand

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  createGame, 
  startHand, 
  processAction, 
  getCurrentPlayer,
  PokerAction,
  hasMultiplePlayersWithChips,
  getValidActions,
} from '../lib/poker';
import { 
  AIAgent, 
  AgentThought, 
  TableChat,
  buildGameContext,
  callAgent,
  convertToGameAction,
  createChatMessage,
} from '../lib/agents';

interface GameStore {
  // State
  gameState: GameState | null;
  agents: AIAgent[];
  thoughts: AgentThought[];
  chatMessages: TableChat[];
  actionHistory: { playerId: string; playerName: string; action: string; amount?: number }[];
  isProcessingTurn: boolean;
  selectedAgentId: string | null;
  error: string | null;

  // Actions
  createNewGame: (agents: AIAgent[], smallBlind?: number, bigBlind?: number) => void;
  startNewHand: () => void;
  processNextTurn: () => Promise<void>;
  processHumanAction: (action: PokerAction) => void;
  addChatMessage: (chat: TableChat) => void;
  selectAgent: (agentId: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  agents: [],
  thoughts: [],
  chatMessages: [],
  actionHistory: [],
  isProcessingTurn: false,
  selectedAgentId: null,
  error: null,

  createNewGame: (agents, smallBlind = 10, bigBlind = 20) => {
    const players = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      chips: 1000, // Default starting chips
      isAI: true,
      profileImage: agent.profileImage,
    }));

    const gameState = createGame(players, smallBlind, bigBlind);
    
    set({
      gameState,
      agents,
      thoughts: [],
      chatMessages: [],
      actionHistory: [],
      isProcessingTurn: false,
      selectedAgentId: null,
      error: null,
    });
  },

  startNewHand: () => {
    const { gameState } = get();
    if (!gameState) return;

    if (!hasMultiplePlayersWithChips(gameState)) {
      set({ error: 'Not enough players with chips to continue' });
      return;
    }

    const newState = startHand(gameState);
    set({ 
      gameState: newState,
      thoughts: [],
      actionHistory: [],
    });
  },

  processNextTurn: async () => {
    const { gameState, agents, actionHistory, chatMessages, isProcessingTurn } = get();
    
    if (!gameState || gameState.isHandComplete || isProcessingTurn) return;

    const currentPlayer = getCurrentPlayer(gameState);
    if (!currentPlayer || !currentPlayer.isAI) return;

    const agent = agents.find(a => a.id === currentPlayer.id);
    if (!agent) return;

    set({ isProcessingTurn: true });

    try {
      // Build context for AI
      const context = buildGameContext(
        gameState,
        currentPlayer,
        agents,
        actionHistory,
        chatMessages
      );

      // Call AI agent
      const response = await callAgent(agent, context);

      // Store thought
      const thoughts = [...get().thoughts, response.thought];

      // Handle chat if any
      let newChatMessages = [...get().chatMessages];
      if (response.chat) {
        const chatMsg = createChatMessage(agent.id, agent.name, response.chat);
        if (chatMsg) {
          newChatMessages.push(chatMsg);
        }
      }

      // Convert and process action
      const validActions = getValidActions(gameState);
      const gameAction = convertToGameAction(currentPlayer.id, response.action, validActions);
      
      const action: PokerAction = {
        type: gameAction.type,
        amount: gameAction.amount,
        playerId: currentPlayer.id,
      };

      const newGameState = processAction(gameState, action);

      // Update action history
      const newActionHistory = [...actionHistory, {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        action: action.type,
        amount: action.amount,
      }];

      set({
        gameState: newGameState,
        thoughts,
        chatMessages: newChatMessages,
        actionHistory: newActionHistory,
        isProcessingTurn: false,
      });
    } catch (error) {
      console.error('Error processing turn:', error);
      set({
        isProcessingTurn: false,
        error: `Error processing ${currentPlayer.name}'s turn`,
      });
    }
  },

  processHumanAction: (action) => {
    const { gameState, actionHistory } = get();
    if (!gameState || gameState.isHandComplete) return;

    try {
      const currentPlayer = getCurrentPlayer(gameState);
      if (!currentPlayer) return;

      const newGameState = processAction(gameState, action);
      
      const newActionHistory = [...actionHistory, {
        playerId: action.playerId,
        playerName: currentPlayer.name,
        action: action.type,
        amount: action.amount,
      }];

      set({
        gameState: newGameState,
        actionHistory: newActionHistory,
      });
    } catch (error) {
      console.error('Error processing human action:', error);
      set({ error: 'Invalid action' });
    }
  },

  addChatMessage: (chat) => {
    set(state => ({
      chatMessages: [...state.chatMessages, chat],
    }));
  },

  selectAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      gameState: null,
      agents: [],
      thoughts: [],
      chatMessages: [],
      actionHistory: [],
      isProcessingTurn: false,
      selectedAgentId: null,
      error: null,
    });
  },
}));
