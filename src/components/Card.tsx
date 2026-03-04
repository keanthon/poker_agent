'use client';

import { motion } from 'framer-motion';
import { Card as CardType, isRedSuit, RANK_NAMES, SUIT_SYMBOLS } from '@/lib/poker';

import { cardStyles } from '@/styles/tableStyles';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  delay?: number;
}

const sizeClasses = {
  small: 'w-10 h-14 text-xs',
  medium: 'w-14 h-20 text-sm',
  large: 'w-20 h-28 text-lg',
};

export function PlayingCard({ card, faceDown = false, size = 'medium', delay = 0 }: CardProps) {
  const isRed = card ? isRedSuit(card.suit) : false;
  
  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        delay,
      }}
      className={`
        ${sizeClasses[size]}
        rounded-lg shadow-lg
        flex items-center justify-center
        font-bold
        ${faceDown 
          ? 'bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-600' 
          : 'bg-white border border-gray-300'
        }
      `}
      style={cardStyles.perspective}
    >
      {faceDown ? (
        <div className="w-full h-full rounded-md bg-gradient-to-br from-blue-700 to-purple-800 m-1 flex items-center justify-center">
          <span className="text-white/30 text-2xl">🂠</span>
        </div>
      ) : card ? (
        <div className={`text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          <div className="text-lg font-bold">{RANK_NAMES[card.rank]}</div>
          <div className="text-xl">{SUIT_SYMBOLS[card.suit]}</div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function CardBack({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  return <PlayingCard faceDown size={size} />;
}
