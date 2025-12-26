// Core game state and logic for Texas Hold'em

import { v4 as uuidv4 } from 'uuid';
import { Card, createDeck, shuffleDeck, dealCards } from './deck';
import { findWinners, HandResult } from './evaluator';

// Player action types
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

export interface PokerAction {
  type: ActionType;
  amount?: number; // For raise/all_in
  playerId: string;
}

// Betting rounds
export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

// Player state
export interface PlayerState {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisRound: number;
  hasFolded: boolean;
  hasActed: boolean;
  isAllIn: boolean;
  isAI: boolean;
  profileImage?: string;
}

// Game state
export interface GameState {
  id: string;
  players: PlayerState[];
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; eligiblePlayerIds: string[] }[];
  currentBet: number;
  minimumRaise: number;
  bigBlind: number;
  smallBlind: number;
  dealerIndex: number;
  currentPlayerIndex: number;
  bettingRound: BettingRound;
  isHandComplete: boolean;
  winners: string[];
  handResults: Map<string, HandResult>;
  lastAction?: PokerAction;
}

// Create initial game state
export function createGame(
  players: { id: string; name: string; chips: number; isAI: boolean; profileImage?: string }[],
  smallBlind: number = 10,
  bigBlind: number = 20
): GameState {
  return {
    id: uuidv4(),
    players: players.map(p => ({
      ...p,
      holeCards: [],
      currentBet: 0,
      totalBetThisRound: 0,
      hasFolded: false,
      hasActed: false,
      isAllIn: false,
    })),
    deck: [],
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBet: 0,
    minimumRaise: bigBlind,
    bigBlind,
    smallBlind,
    dealerIndex: 0,
    currentPlayerIndex: 0,
    bettingRound: 'preflop',
    isHandComplete: false,
    winners: [],
    handResults: new Map(),
  };
}

// Start a new hand
export function startHand(state: GameState): GameState {
  const newState = { ...state };
  
  // Reset player states
  newState.players = newState.players.map(p => ({
    ...p,
    holeCards: [],
    currentBet: 0,
    totalBetThisRound: 0,
    hasFolded: p.chips <= 0, // Auto-fold if no chips
    hasActed: false,
    isAllIn: false,
  }));

  // Shuffle and deal
  newState.deck = shuffleDeck(createDeck());
  newState.communityCards = [];
  newState.pot = 0;
  newState.sidePots = [];
  newState.currentBet = 0;
  newState.bettingRound = 'preflop';
  newState.isHandComplete = false;
  newState.winners = [];
  newState.handResults = new Map();
  newState.lastAction = undefined;

  // Move dealer button
  newState.dealerIndex = (newState.dealerIndex + 1) % newState.players.length;

  // Deal hole cards (2 per player)
  for (const player of newState.players) {
    if (!player.hasFolded) {
      player.holeCards = dealCards(newState.deck, 2);
    }
  }

  // Post blinds
  const sbIndex = (newState.dealerIndex + 1) % newState.players.length;
  const bbIndex = (newState.dealerIndex + 2) % newState.players.length;

  // Small blind
  const sbPlayer = newState.players[sbIndex];
  const sbAmount = Math.min(newState.smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  sbPlayer.totalBetThisRound = sbAmount;
  newState.pot += sbAmount;

  // Big blind
  const bbPlayer = newState.players[bbIndex];
  const bbAmount = Math.min(newState.bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  bbPlayer.totalBetThisRound = bbAmount;
  newState.pot += bbAmount;
  newState.currentBet = bbAmount;
  newState.minimumRaise = newState.bigBlind;

  // First to act is after big blind
  newState.currentPlayerIndex = (bbIndex + 1) % newState.players.length;
  
  // Skip folded/all-in players
  newState.currentPlayerIndex = findNextActivePlayer(newState, newState.currentPlayerIndex);

  return newState;
}

// Find next player who can act
function findNextActivePlayer(state: GameState, startIndex: number): number {
  let index = startIndex;
  const numPlayers = state.players.length;
  
  for (let i = 0; i < numPlayers; i++) {
    const player = state.players[index];
    if (!player.hasFolded && !player.isAllIn && player.chips > 0) {
      return index;
    }
    index = (index + 1) % numPlayers;
  }
  
  return -1; // No active players
}

// Get valid actions for current player
export function getValidActions(state: GameState): ActionType[] {
  const player = state.players[state.currentPlayerIndex];
  if (!player || player.hasFolded || player.isAllIn) {
    return [];
  }

  const actions: ActionType[] = ['fold'];
  const toCall = state.currentBet - player.currentBet;

  if (toCall === 0) {
    actions.push('check');
  } else if (player.chips >= toCall) {
    actions.push('call');
  }

  if (player.chips > toCall) {
    actions.push('raise');
  }

  actions.push('all_in');

  return actions;
}

// Process a player action
export function processAction(state: GameState, action: PokerAction): GameState {
  const newState = { ...state };
  const playerIndex = newState.players.findIndex(p => p.id === action.playerId);
  
  if (playerIndex === -1 || playerIndex !== newState.currentPlayerIndex) {
    throw new Error('Invalid player or not their turn');
  }

  const player = { ...newState.players[playerIndex] };
  newState.players = [...newState.players];
  newState.players[playerIndex] = player;

  switch (action.type) {
    case 'fold':
      player.hasFolded = true;
      break;

    case 'check':
      if (state.currentBet > player.currentBet) {
        throw new Error('Cannot check when there is a bet to call');
      }
      break;

    case 'call': {
      const toCall = Math.min(state.currentBet - player.currentBet, player.chips);
      player.chips -= toCall;
      player.currentBet += toCall;
      player.totalBetThisRound += toCall;
      newState.pot += toCall;
      if (player.chips === 0) {
        player.isAllIn = true;
      }
      break;
    }

    case 'raise': {
      const raiseAmount = action.amount || (state.currentBet + state.minimumRaise);
      const toCall = state.currentBet - player.currentBet;
      const totalToAdd = raiseAmount - player.currentBet;
      
      if (totalToAdd > player.chips) {
        throw new Error('Not enough chips to raise');
      }

      player.chips -= totalToAdd;
      player.currentBet = raiseAmount;
      player.totalBetThisRound += totalToAdd;
      newState.pot += totalToAdd;
      newState.currentBet = raiseAmount;
      newState.minimumRaise = raiseAmount - state.currentBet;
      
      // Reset hasActed for other players
      newState.players.forEach((p, i) => {
        if (i !== playerIndex && !p.hasFolded && !p.isAllIn) {
          newState.players[i] = { ...p, hasActed: false };
        }
      });
      break;
    }

    case 'all_in': {
      const allInAmount = player.chips;
      player.currentBet += allInAmount;
      player.totalBetThisRound += allInAmount;
      newState.pot += allInAmount;
      player.chips = 0;
      player.isAllIn = true;

      if (player.currentBet > state.currentBet) {
        newState.currentBet = player.currentBet;
        newState.minimumRaise = player.currentBet - state.currentBet;
        // Reset hasActed for other players
        newState.players.forEach((p, i) => {
          if (i !== playerIndex && !p.hasFolded && !p.isAllIn) {
            newState.players[i] = { ...p, hasActed: false };
          }
        });
      }
      break;
    }
  }

  player.hasActed = true;
  newState.lastAction = action;

  // Check if round is complete
  newState.currentPlayerIndex = findNextActivePlayer(newState, (playerIndex + 1) % newState.players.length);
  
  if (isRoundComplete(newState)) {
    return advanceToNextRound(newState);
  }

  return newState;
}

// Check if betting round is complete
function isRoundComplete(state: GameState): boolean {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  
  // Only one player left
  if (activePlayers.length === 1) {
    return true;
  }

  // All active players have acted and bets are equalized
  const playersWhoCanAct = activePlayers.filter(p => !p.isAllIn);
  const allActed = playersWhoCanAct.every(p => p.hasActed);
  const betsEqualized = playersWhoCanAct.every(p => p.currentBet === state.currentBet || p.isAllIn);

  return allActed && betsEqualized;
}

// Advance to next betting round
function advanceToNextRound(state: GameState): GameState {
  const newState = { ...state };
  const activePlayers = newState.players.filter(p => !p.hasFolded);

  // Only one player left - they win
  if (activePlayers.length === 1) {
    newState.isHandComplete = true;
    newState.winners = [activePlayers[0].id];
    newState.bettingRound = 'showdown';
    
    // Award pot
    const winner = newState.players.find(p => p.id === activePlayers[0].id)!;
    winner.chips += newState.pot;
    newState.pot = 0;
    
    return newState;
  }

  // Reset for next round
  newState.players = newState.players.map(p => ({
    ...p,
    currentBet: 0,
    hasActed: false,
  }));
  newState.currentBet = 0;
  newState.minimumRaise = newState.bigBlind;

  // Deal community cards based on round
  switch (newState.bettingRound) {
    case 'preflop':
      newState.bettingRound = 'flop';
      newState.communityCards = dealCards(newState.deck, 3);
      break;
    case 'flop':
      newState.bettingRound = 'turn';
      newState.communityCards.push(...dealCards(newState.deck, 1));
      break;
    case 'turn':
      newState.bettingRound = 'river';
      newState.communityCards.push(...dealCards(newState.deck, 1));
      break;
    case 'river':
      newState.bettingRound = 'showdown';
      return determineWinners(newState);
  }

  // First to act after flop is first active player after dealer
  newState.currentPlayerIndex = findNextActivePlayer(
    newState, 
    (newState.dealerIndex + 1) % newState.players.length
  );

  return newState;
}

// Determine winners at showdown
function determineWinners(state: GameState): GameState {
  const newState = { ...state };
  newState.isHandComplete = true;

  const activePlayers = newState.players.filter(p => !p.hasFolded);
  
  // Build hands for evaluation
  const hands = activePlayers.map(p => ({
    playerId: p.id,
    cards: [...p.holeCards, ...newState.communityCards],
  }));

  const { winners, handResults } = findWinners(hands);
  newState.winners = winners;
  newState.handResults = handResults;

  // Award pot (split if tie)
  const potPerWinner = Math.floor(newState.pot / winners.length);
  for (const winnerId of winners) {
    const winner = newState.players.find(p => p.id === winnerId)!;
    winner.chips += potPerWinner;
  }
  newState.pot = 0;

  return newState;
}

// Get current player
export function getCurrentPlayer(state: GameState): PlayerState | null {
  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
    return null;
  }
  return state.players[state.currentPlayerIndex];
}

// Check if game has active players
export function hasMultiplePlayersWithChips(state: GameState): boolean {
  return state.players.filter(p => p.chips > 0).length > 1;
}
