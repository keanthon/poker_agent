// Hand evaluation using pokersolver

import { Hand } from 'pokersolver';
import { Card, cardsToPokerSolverFormat } from './deck';

export interface HandResult {
  rank: number;
  name: string;
  descr: string;
  cards: string[];
}

// Evaluate a 5-7 card hand
export function evaluateHand(cards: Card[]): HandResult {
  const pokerCards = cardsToPokerSolverFormat(cards);
  const hand = Hand.solve(pokerCards);
  
  return {
    rank: hand.rank,
    name: hand.name,
    descr: hand.descr,
    cards: hand.cards.map((c: { value: string; suit: string }) => `${c.value}${c.suit}`),
  };
}

// Compare multiple hands and return winners (can be multiple in case of tie)
export function findWinners(hands: { playerId: string; cards: Card[] }[]): {
  winners: string[];
  handResults: Map<string, HandResult>;
} {
  const handResults = new Map<string, HandResult>();
  const solvedHands: { playerId: string; hand: ReturnType<typeof Hand.solve> }[] = [];

  for (const { playerId, cards } of hands) {
    const pokerCards = cardsToPokerSolverFormat(cards);
    const hand = Hand.solve(pokerCards);
    solvedHands.push({ playerId, hand });
    handResults.set(playerId, {
      rank: hand.rank,
      name: hand.name,
      descr: hand.descr,
      cards: hand.cards.map((c: { value: string; suit: string }) => `${c.value}${c.suit}`),
    });
  }

  // Find the winning hands
  const winningHands = Hand.winners(solvedHands.map(h => h.hand));
  const winners = solvedHands
    .filter(h => winningHands.includes(h.hand))
    .map(h => h.playerId);

  return { winners, handResults };
}

// Get hand strength as a descriptive string
export function getHandStrengthDescription(cards: Card[]): string {
  const result = evaluateHand(cards);
  return result.descr;
}
