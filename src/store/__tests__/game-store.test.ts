import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../game-store';
import { AIAgent } from '@/lib/agents';

describe('GameStore', () => {
  const testAgents: AIAgent[] = [
    {
      id: 'p1',
      name: 'Alice',
      model: 'gpt-4o',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'test-key',
      profileImage: '',
      isHuman: true,
    },
    {
      id: 'p2',
      name: 'BotBob',
      model: 'grok-3',
      apiUrl: 'https://api.x.ai/v1/chat/completions',
      apiKey: 'test-key',
      profileImage: '',
      isHuman: false,
    },
    {
      id: 'p3',
      name: 'BotCharlie',
      model: 'gpt-4o',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'test-key',
      profileImage: '',
      isHuman: false,
    },
  ];

  beforeEach(() => {
    // Reset the store before each test
    useGameStore.getState().reset();
  });

  describe('createNewGame', () => {
    it('initializes game state with correct agents', () => {
      const store = useGameStore.getState();
      store.createNewGame(testAgents, 10, 20);

      const state = useGameStore.getState();
      expect(state.gameState).not.toBeNull();
      expect(state.gameState!.players).toHaveLength(3);
      expect(state.agents).toHaveLength(3);
      expect(state.chatMessages).toHaveLength(0);
      expect(state.error).toBeNull();
    });
  });

  describe('processHumanAction', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.createNewGame(testAgents, 10, 20);
      store.startNewHand();
    });

    it('records a fold action in chat messages without table talk', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Only proceed if it's the human player's turn
      // Process a fold
      state.processHumanAction({ type: 'fold', playerId: currentPlayer.id });

      const updatedState = useGameStore.getState();
      const chatMsgs = updatedState.chatMessages;

      // Should have at least one chat message
      expect(chatMsgs.length).toBeGreaterThanOrEqual(1);

      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.actionDisplay).toBe('Folds');
      expect(lastMsg.type).toBe('action');
      expect(lastMsg.message).toBe('Folds');
      expect(lastMsg.agentId).toBe(currentPlayer.id);
      expect(lastMsg.agentName).toBe(currentPlayer.name);
      expect(lastMsg.handId).toBe(gameState.handId);
    });

    it('records a call action in chat messages without table talk', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      state.processHumanAction({ type: 'call', playerId: currentPlayer.id });

      const chatMsgs = useGameStore.getState().chatMessages;
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.actionDisplay).toBe('Calls');
      expect(lastMsg.type).toBe('action');
    });

    it('records a raise action with correct amount', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      state.processHumanAction({
        type: 'raise',
        amount: 100,
        playerId: currentPlayer.id,
      });

      const chatMsgs = useGameStore.getState().chatMessages;
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.actionDisplay).toBe('Raises 100');
      expect(lastMsg.type).toBe('action');
    });

    it('records an all-in action in chat messages', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      state.processHumanAction({
        type: 'all_in',
        playerId: currentPlayer.id,
      });

      const chatMsgs = useGameStore.getState().chatMessages;
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.actionDisplay).toBe('Goes All-In');
      expect(lastMsg.type).toBe('action');
    });

    it('includes table talk message when provided', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      state.processHumanAction(
        { type: 'call', playerId: currentPlayer.id },
        'You think you can bluff me?'
      );

      const chatMsgs = useGameStore.getState().chatMessages;
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.message).toBe('You think you can bluff me?');
      expect(lastMsg.type).toBe('trash_talk');
      expect(lastMsg.actionDisplay).toBe('Calls');
    });

    it('ignores empty/whitespace table talk', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      state.processHumanAction(
        { type: 'fold', playerId: currentPlayer.id },
        '   '
      );

      const chatMsgs = useGameStore.getState().chatMessages;
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      expect(lastMsg.message).toBe('Folds');
      expect(lastMsg.type).toBe('action');
    });

    it('updates action history correctly', () => {
      const state = useGameStore.getState();
      const gameState = state.gameState!;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const prevLength = state.actionHistory.length;

      state.processHumanAction({ type: 'call', playerId: currentPlayer.id });

      const history = useGameStore.getState().actionHistory;
      expect(history.length).toBe(prevLength + 1);
      const lastEntry = history[history.length - 1];
      expect(lastEntry.playerId).toBe(currentPlayer.id);
      expect(lastEntry.playerName).toBe(currentPlayer.name);
      expect(lastEntry.action).toBe('call');
    });
  });

  describe('addChatMessage', () => {
    it('appends a chat message to the store', () => {
      const store = useGameStore.getState();
      store.createNewGame(testAgents, 10, 20);

      store.addChatMessage({
        id: 'test-msg-1',
        agentId: 'p2',
        agentName: 'BotBob',
        message: 'Nice hand!',
        tone: 'confident',
        type: 'trash_talk',
        timestamp: Date.now(),
        handId: 'hand-1',
        actionDisplay: 'Calls',
      });

      const messages = useGameStore.getState().chatMessages;
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Nice hand!');
      expect(messages[0].type).toBe('trash_talk');
    });
  });

  describe('togglePkMode', () => {
    it('toggles PK mode on and off', () => {
      expect(useGameStore.getState().pkMode).toBe(false);

      useGameStore.getState().togglePkMode();
      expect(useGameStore.getState().pkMode).toBe(true);

      useGameStore.getState().togglePkMode();
      expect(useGameStore.getState().pkMode).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets all store state', () => {
      const store = useGameStore.getState();
      store.createNewGame(testAgents, 10, 20);
      store.startNewHand();

      store.reset();

      const state = useGameStore.getState();
      expect(state.gameState).toBeNull();
      expect(state.agents).toHaveLength(0);
      expect(state.chatMessages).toHaveLength(0);
      expect(state.thoughts).toHaveLength(0);
      expect(state.actionHistory).toHaveLength(0);
      expect(state.error).toBeNull();
    });
  });
});
