// Type declarations for pokersolver library
declare module 'pokersolver' {
  export class Hand {
    rank: number;
    name: string;
    descr: string;
    cards: Array<{ value: string; suit: string }>;
    
    static solve(cards: string[]): Hand;
    static winners(hands: Hand[]): Hand[];
  }
}
