// Card and Deck types and utilities

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// Symbols for display
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const RANK_NAMES: Record<Rank, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9', 'T': '10',
  'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
};

// Create a fresh 52-card deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards from the deck (mutates deck)
export function dealCards(deck: Card[], count: number): Card[] {
  return deck.splice(0, count);
}

// Convert card to pokersolver format (e.g., "Ah" for Ace of hearts)
export function cardToPokerSolverFormat(card: Card): string {
  const suitChar = card.suit[0]; // h, d, c, s
  return `${card.rank}${suitChar}`;
}

// Convert array of cards to pokersolver format
export function cardsToPokerSolverFormat(cards: Card[]): string[] {
  return cards.map(cardToPokerSolverFormat);
}

// Get display string for a card
export function cardToDisplayString(card: Card): string {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

// Check if suit is red
export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}
