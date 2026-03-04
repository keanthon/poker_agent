import { describe, it, expect } from 'vitest';
import { 
  createGame, 
  startHand, 
  getValidActions, 
  processAction, 
} from '../game';

describe('core game engine logic', () => {
  const dummyPlayers = [
    { id: 'p1', name: 'Alice', chips: 1000, isAI: false },
    { id: 'p2', name: 'Bob', chips: 1000, isAI: true },
    { id: 'p3', name: 'Charlie', chips: 1000, isAI: true },
  ];

  it('creates a new game with zeroed states', () => {
    const game = createGame(dummyPlayers, 10, 20);
    expect(game.players).toHaveLength(3);
    expect(game.deck).toHaveLength(0);
    expect(game.communityCards).toHaveLength(0);
    expect(game.pot).toBe(0);
    expect(game.bettingRound).toBe('preflop');
  });

  it('starts a new hand and posts blinds', () => {
    let game = createGame(dummyPlayers, 10, 20);
    game = startHand(game);
    
    // Pot should be 30 (SB=10 + BB=20)
    expect(game.pot).toBe(30);
    expect(game.bettingRound).toBe('preflop');
    expect(game.communityCards).toHaveLength(0);
    
    // Check hole cards
    game.players.forEach(p => {
      expect(p.holeCards).toHaveLength(2);
    });

    // In a 3-player game where D=1 (after advancing from 0), SB=2, BB=0
    // UTG = 1. But let's check currentBet matches bigBlind
    expect(game.currentBet).toBe(20);
  });

  it('identifies valid actions correctly', () => {
    let game = createGame(dummyPlayers, 10, 20);
    game = startHand(game);

    // UTG player needs to call 20
    const actions = getValidActions(game);
    expect(actions).toContain('fold');
    expect(actions).toContain('call');
    expect(actions).toContain('raise');
    expect(actions).toContain('all_in');
    
    // Should NOT contain check, because current bet > player's bet (20 > 0)
    expect(actions).not.toContain('check');
  });

  it('processes a fold action', () => {
    let game = createGame(dummyPlayers, 10, 20);
    game = startHand(game);
    const actingPlayer = game.players[game.currentPlayerIndex];

    game = processAction(game, {
      type: 'fold',
      playerId: actingPlayer.id,
    });

    const updatedPlayer = game.players.find(p => p.id === actingPlayer.id)!;
    expect(updatedPlayer.hasFolded).toBe(true);
    expect(game.currentPlayerIndex).not.toBe(-1); // Next player is up
  });

  it('processes a call action', () => {
    let game = createGame(dummyPlayers, 10, 20);
    game = startHand(game);
    
    const initialPot = game.pot;
    const actingPlayer = game.players[game.currentPlayerIndex];
    const toCall = game.currentBet - actingPlayer.currentBet;

    game = processAction(game, {
      type: 'call',
      playerId: actingPlayer.id,
    });

    const updatedPlayer = game.players.find(p => p.id === actingPlayer.id)!;
    expect(game.pot).toBe(initialPot + toCall);
    expect(updatedPlayer.currentBet).toBe(game.currentBet);
    expect(updatedPlayer.hasActed).toBe(true);
  });

  it('processes a raise action and resets hasActed for others', () => {
    let game = createGame(dummyPlayers, 10, 20);
    game = startHand(game);
    
    const actingPlayer = game.players[game.currentPlayerIndex];
    
    game = processAction(game, {
      type: 'raise',
      amount: 40,
      playerId: actingPlayer.id,
    });

    const updatedPlayer = game.players.find(p => p.id === actingPlayer.id)!;
    expect(game.currentBet).toBe(40);
    expect(updatedPlayer.currentBet).toBe(40);
  });
});
