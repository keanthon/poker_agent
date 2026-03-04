'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PlayerState } from '@/lib/poker';
import { AgentThought } from '@/lib/agents';
import { PlayingCard } from './Card';
import { useSettingsStore } from '@/store';
import { isValidImageSrc } from '@/lib/utils/image';

interface AgentSeatProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  isDealer: boolean;
  thought?: AgentThought;
  showCards: boolean;
  position: number;
  totalSeats: number;
  onClick?: () => void;
}

export function AgentSeat({
  player,
  isCurrentTurn,
  isDealer,
  thought,
  showCards,
  position,
  totalSeats,
  onClick,
}: AgentSeatProps) {
  const viewMode = useSettingsStore(state => state.viewMode);
  const showThoughts = viewMode === 'transparent';
  const [imgError, setImgError] = useState(false);

  // Calculate position around table (oval distribution)
  const angle = (position / totalSeats) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 44;
  const radiusY = 40;
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Agent container */}
      <div className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl
        backdrop-blur-md transition-all duration-300
        ${isCurrentTurn 
          ? 'bg-gradient-to-b from-yellow-500/30 to-amber-600/20 ring-2 ring-yellow-400/80 shadow-lg shadow-yellow-900/30' 
          : 'bg-black/40 hover:bg-black/50'
        }
        ${player.hasFolded ? 'opacity-40 grayscale' : ''}
      `}>
        {/* Dealer button */}
        {isDealer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-black text-xs font-black flex items-center justify-center shadow-lg border-2 border-yellow-200"
          >
            D
          </motion.div>
        )}

        {/* Thinking animation ring */}
        <AnimatePresence>
          {isCurrentTurn && !player.hasFolded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-1 rounded-2xl overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  backgroundSize: '200% 100%',
                  filter: 'blur(8px)',
                  opacity: 0.6,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar container */}
        <div className="relative z-10">
          <div className={`
            relative w-16 h-16 rounded-xl overflow-hidden
            border-2 transition-colors duration-300
            ${isCurrentTurn ? 'border-yellow-400' : 'border-white/20'}
          `}>
            {isValidImageSrc(player.profileImage) && !imgError ? (
              <Image
                src={player.profileImage!}
                alt={player.name}
                fill
                className="object-cover object-center"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-2xl text-white font-black">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Thinking spinner overlay */}
            <AnimatePresence>
              {isCurrentTurn && !player.hasFolded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <motion.div
                    className="w-8 h-8 border-3 border-t-transparent border-yellow-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Name and chips */}
        <div className="text-center z-10">
          <div className="text-white font-bold text-sm truncate max-w-[100px]">
            {player.name}
          </div>
          <div className="text-yellow-400 text-xs font-mono font-bold">
            ${player.chips.toLocaleString()}
          </div>
        </div>

        {/* Current bet indicator */}
        <AnimatePresence>
          {player.currentBet > 0 && (
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 10 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-xs px-3 py-1 rounded-full font-mono font-bold shadow-lg">
                <div className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-200" />
                ${player.currentBet}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hole cards */}
        <div className="flex gap-1 z-10">
          {player.holeCards.length > 0 && (
            <>
              <PlayingCard
                card={showCards ? player.holeCards[0] : undefined}
                faceDown={!showCards}
                size="small"
                delay={0}
              />
              <PlayingCard
                card={showCards ? player.holeCards[1] : undefined}
                faceDown={!showCards}
                size="small"
                delay={0.1}
              />
            </>
          )}
        </div>

        {/* Status badges */}
        {player.hasFolded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white text-xs px-3 py-1 rounded-lg font-bold z-20 shadow-lg">
            FOLDED
          </div>
        )}
        {player.isAllIn && !player.hasFolded && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-lg font-bold z-20 shadow-lg"
          >
            ALL IN
          </motion.div>
        )}
      </div>

      {/* Thought bubble (transparent mode only) */}
      <AnimatePresence>
        {showThoughts && thought && thought.reasoning && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-52 z-30"
          >
            <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-3 text-xs text-gray-800 shadow-xl border border-gray-200">
              {/* Speech bubble triangle */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/95" />
              
              <p className="line-clamp-3 leading-relaxed">{thought.reasoning}</p>
              
              {thought.confidence !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">Confidence</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${thought.confidence}%` }}
                      className={`h-full rounded-full ${
                        thought.confidence > 70 ? 'bg-green-500' :
                        thought.confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-gray-600 text-[10px] font-mono">{thought.confidence}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
