import { describe, it, expect } from 'vitest';
import { 
  createDeck, 
  shuffleDeck, 
  dealCards, 
  cardToPokerSolverFormat,
  cardsToPokerSolverFormat,
  cardToDisplayString,
  isRedSuit,
  Card,
  SUITS,
  RANKS
} from '../deck';

describe('deck utilities', () => {
  it('creates a standard 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);

    // Verify all combinations exist
    const counts = { suits: new Set(), ranks: new Set() };
    deck.forEach(c => {
      counts.suits.add(c.suit);
      counts.ranks.add(c.rank);
    });
    
    expect(counts.suits.size).toBe(4);
    expect(counts.ranks.size).toBe(13);
  });

  it('shuffles the deck without losing cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    
    expect(shuffled).toHaveLength(52);
    // There's a tiny chance a shuffled deck is identical, but normally they differ:
    expect(shuffled).not.toEqual(deck);
    
    // Verify it still has exact same cards (just in different order)
    const sortedOriginal = [...deck].sort((a,b) => {
      const rankDiff = a.rank.localeCompare(b.rank);
      if (rankDiff !== 0) return rankDiff;
      return a.suit.localeCompare(b.suit);
    });
    const sortedShuffled = [...shuffled].sort((a,b) => {
      const rankDiff = a.rank.localeCompare(b.rank);
      if (rankDiff !== 0) return rankDiff;
      return a.suit.localeCompare(b.suit);
    });
    expect(sortedOriginal).toEqual(sortedShuffled);
  });

  it('deals correct number of cards and mutates deck', () => {
    const deck = createDeck();
    const hand = dealCards(deck, 5);
    
    expect(hand).toHaveLength(5);
    expect(deck).toHaveLength(47);
  });

  it('converts card to pokersolver format correctly', () => {
    const aceOfHearts: Card = { rank: 'A', suit: 'hearts' };
    const tenOfSpades: Card = { rank: 'T', suit: 'spades' };

    expect(cardToPokerSolverFormat(aceOfHearts)).toBe('Ah');
    expect(cardToPokerSolverFormat(tenOfSpades)).toBe('Ts');
  });

  it('converts arrays of cards to pokersolver format correctly', () => {
    const cards: Card[] = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'K', suit: 'diamonds' }
    ];
    expect(cardsToPokerSolverFormat(cards)).toEqual(['Ah', 'Kd']);
  });

  it('gets correct display string', () => {
    const aceOfHearts: Card = { rank: 'A', suit: 'hearts' };
    expect(cardToDisplayString(aceOfHearts)).toBe('Ace♥');
  });

  it('identifies red suits correctly', () => {
    expect(isRedSuit('hearts')).toBe(true);
    expect(isRedSuit('diamonds')).toBe(true);
    expect(isRedSuit('spades')).toBe(false);
    expect(isRedSuit('clubs')).toBe(false);
  });
});
