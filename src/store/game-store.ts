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
  cardToDisplayString,
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

export interface HandSummary {
  id: string;
  winners: string[];
  pot: number;
  actions: { playerName: string; action: string; amount?: number; timestamp?: number }[];
  chatMessages: TableChat[];
  showdown?: { playerName: string; handDescription: string; cards: string }[];
  timestamp: number;
}

interface GameStore {
  // State
  gameState: GameState | null;
  agents: AIAgent[];
  thoughts: AgentThought[];
  chatMessages: TableChat[];
  handHistory: HandSummary[];
  actionHistory: { playerId: string; playerName: string; action: string; amount?: number; timestamp?: number }[];
  isProcessingTurn: boolean;
  selectedAgentId: string | null;
  error: string | null;
  pkMode: boolean;

  // Actions
  createNewGame: (agents: AIAgent[], smallBlind?: number, bigBlind?: number) => void;
  startNewHand: () => void;
  processNextTurn: () => Promise<void>;
  processHumanAction: (action: PokerAction, tableTalk?: string) => void;
  addChatMessage: (chat: TableChat) => void;
  selectAgent: (agentId: string | null) => void;
  togglePkMode: () => void;
  clearError: () => void;
  reset: () => void;
}



export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  agents: [],
  thoughts: [],
  chatMessages: [],
  actionHistory: [],
  handHistory: [],
  isProcessingTurn: false,
  selectedAgentId: null,
  error: null,
  pkMode: false,

  createNewGame: (agents, smallBlind = 10, bigBlind = 20) => {
    const players = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      chips: 1000,
      isAI: !agent.isHuman, // Human players are not AI
      profileImage: agent.profileImage,
    }));

    const gameState = createGame(players, smallBlind, bigBlind);
    
    set({
      gameState,
      agents,
      thoughts: [],
      chatMessages: [],
      actionHistory: [],
      handHistory: [],
      isProcessingTurn: false,
      selectedAgentId: null,
      error: null,
    });
  },

  startNewHand: () => {
    const { gameState, actionHistory, handHistory, chatMessages } = get();
    if (!gameState) return;

    if (!hasMultiplePlayersWithChips(gameState)) {
      set({ error: 'Not enough players with chips to continue' });
      return;
    }

    // Archive previous hand if it was played
    let newHandHistory = [...handHistory];
    if (gameState.isHandComplete && actionHistory.length > 0) {
      // Filter chat messages for the completed hand
      const currentHandChat = chatMessages.filter(msg => msg.handId === gameState.handId);

      // Capture showdown info
      const showdown: { playerName: string; handDescription: string; cards: string }[] = [];
      if (gameState.handResults && gameState.handResults.size > 0) {
        gameState.handResults.forEach((result, playerId) => {
           const player = gameState.players.find(p => p.id === playerId);
           if (player) {
              showdown.push({
                  playerName: player.name,
                  handDescription: result.descr,
                  cards: player.holeCards.map(cardToDisplayString).join(' ')
              });
           }
        });
      }

      newHandHistory.push({
        id: uuidv4(),
        winners: gameState.winners.map(id => gameState.players.find(p => p.id === id)?.name || 'Unknown'),
        pot: 0,
        actions: [...actionHistory],
        chatMessages: currentHandChat,
        showdown,
        timestamp: Date.now(),
      });
    }

    const newState = startHand(gameState);
    
    // Initialize history with blinds
    const initialHistory: { playerId: string; playerName: string; action: string; amount?: number; timestamp: number }[] = [];
    
    // Find players who posted blinds (currentBet > 0)
    // In startHand, currentBet is reset to 0 then blinds added
    newState.players.forEach(p => {
      if (p.currentBet > 0) {
        // Determine if SB or BB based on amount
        let action = 'Post Blind';
        if (p.currentBet === newState.smallBlind) action = 'Post SB';
        if (p.currentBet === newState.bigBlind) action = 'Post BB';
        
        initialHistory.push({
          playerId: p.id,
          playerName: p.name,
          action: action,
          amount: p.currentBet,
          timestamp: Date.now()
        });
      }
    });

    set({ 
      gameState: newState,
      // thoughts: [], // Don't clear thoughts, keep history like chat
      actionHistory: initialHistory,
      handHistory: newHandHistory,
    });
  },

  processNextTurn: async () => {
    const { gameState, agents, actionHistory, chatMessages, isProcessingTurn } = get();
    
    if (!gameState || gameState.isHandComplete) return;
    if (isProcessingTurn) {
        console.warn('Turn processing skipped - already in progress');
        return;
    }

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
        chatMessages,
        get().handHistory
      );

      // Call AI agent
      const response = await callAgent(agent, context);

      // Convert and process action
      const validActions = getValidActions(gameState);
      const gameAction = convertToGameAction(currentPlayer.id, response.action, validActions);
      
      const action: PokerAction = {
        type: gameAction.type,
        amount: gameAction.amount,
        playerId: currentPlayer.id,
      };

      // Store thought
      const thoughts = [...get().thoughts, response.thought];

      // Build action display string
      let actionStr = '';
      if (gameAction.type === 'raise') {
         actionStr = `Raises ${gameAction.amount}`;
      } else if (gameAction.type === 'call') {
         actionStr = `Calls`; 
      } else if (gameAction.type === 'all_in') {
         actionStr = `Goes All-In`;
      } else if (gameAction.type === 'check') {
         actionStr = `Checks`;
      } else {
         actionStr = `Folds`;
      }

      // Always create a chat message for the action (even if AI didn't say anything)
      let newChatMessages = [...get().chatMessages];
      if (response.chat) {
        const chatMsg = createChatMessage(agent.id, agent.name, response.chat);
        if (chatMsg) {
          chatMsg.linkedThought = response.thought;
          chatMsg.handId = gameState.handId;
          chatMsg.actionDisplay = actionStr;
          newChatMessages.push(chatMsg);
        }
      } else {
        // No table talk — create an action-only message
        const actionMsg: TableChat = {
          id: `${agent.id}-${Date.now()}`,
          agentId: agent.id,
          agentName: agent.name,
          message: actionStr,
          tone: 'neutral',
          type: 'action',
          timestamp: Date.now(),
          handId: gameState.handId,
          actionDisplay: actionStr,
        };
        newChatMessages.push(actionMsg);
      }

      const newGameState = processAction(gameState, action);

      // Update action history
      const newActionHistory = [...actionHistory, {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        action: action.type,
        amount: action.amount,
        timestamp: Date.now(),
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

  processHumanAction: (action, tableTalk) => {
    const { gameState, actionHistory, chatMessages } = get();
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
        timestamp: Date.now(),
      }];

      // Create a chat message for the human action so it shows in Table Talk
      let actionStr = '';
      if (action.type === 'raise') {
        actionStr = `Raises ${action.amount}`;
      } else if (action.type === 'call') {
        actionStr = 'Calls';
      } else if (action.type === 'all_in') {
        actionStr = 'Goes All-In';
      } else if (action.type === 'check') {
        actionStr = 'Checks';
      } else {
        actionStr = 'Folds';
      }

      const humanChatMsg: TableChat = {
        id: uuidv4(),
        agentId: currentPlayer.id,
        agentName: currentPlayer.name,
        message: tableTalk?.trim() || actionStr,
        tone: 'neutral',
        type: tableTalk?.trim() ? 'trash_talk' : 'action',
        timestamp: Date.now(),
        handId: gameState.handId,
        actionDisplay: actionStr,
      };

      set({
        gameState: newGameState,
        actionHistory: newActionHistory,
        chatMessages: [...chatMessages, humanChatMsg],
      });
    } catch (error) {
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

  togglePkMode: () => {
    set(state => ({ pkMode: !state.pkMode }));
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
      handHistory: [],
      isProcessingTurn: false,
      pkMode: false,
      selectedAgentId: null,
      error: null,
    });
  },
}));
