import { describe, it, expect } from 'vitest';
import { evaluateHand, findWinners, getHandStrengthDescription } from '../evaluator';
import { Card } from '../deck';

describe('hand evaluator utilities', () => {
  const royalFlush: Card[] = [
    { rank: 'A', suit: 'spades' },
    { rank: 'K', suit: 'spades' },
    { rank: 'Q', suit: 'spades' },
    { rank: 'J', suit: 'spades' },
    { rank: 'T', suit: 'spades' },
  ];

  const fullHouse: Card[] = [
    { rank: 'K', suit: 'hearts' },
    { rank: 'K', suit: 'diamonds' },
    { rank: 'K', suit: 'clubs' },
    { rank: '2', suit: 'spades' },
    { rank: '2', suit: 'hearts' },
  ];

  const twoPair: Card[] = [
    { rank: 'A', suit: 'hearts' },
    { rank: 'A', suit: 'diamonds' },
    { rank: 'K', suit: 'clubs' },
    { rank: 'K', suit: 'spades' },
    { rank: '2', suit: 'hearts' },
  ];

  it('evaluates a single hand correctly', () => {
    const result = evaluateHand(fullHouse);
    expect(result.name).toBe('Full House');
    expect(result.descr).toBe('Full House, K\'s over 2\'s');
    // Ensure all 5 cards are returned
    expect(result.cards.length).toBe(5);
  });

  it('gets hand strength description directly', () => {
    expect(getHandStrengthDescription(royalFlush)).toBe('Royal Flush');
  });

  it('finds the correct winner among multiple hands', () => {
    const result = findWinners([
      { playerId: 'p1', cards: twoPair },
      { playerId: 'p2', cards: fullHouse },
      { playerId: 'p3', cards: royalFlush }
    ]);

    expect(result.winners.length).toBe(1);
    expect(result.winners[0]).toBe('p3'); // Player 3 has Royal Flush

    expect(result.handResults.get('p1')?.name).toBe('Two Pair');
    expect(result.handResults.get('p2')?.name).toBe('Full House');
    expect(result.handResults.get('p3')?.name).toBe('Straight Flush');
  });

  it('handles ties with multiple winners', () => {
    const anotherTwoPair: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'clubs' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'diamonds' },
      { rank: '2', suit: 'spades' },
    ];

    const result = findWinners([
      { playerId: 'p1', cards: twoPair },
      { playerId: 'p2', cards: anotherTwoPair }
    ]);

    // Should be a tie since they have identical hand ranks
    expect(result.winners.length).toBe(2);
    expect(result.winners).toContain('p1');
    expect(result.winners).toContain('p2');
  });
});
