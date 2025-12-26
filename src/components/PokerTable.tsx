'use client';

import { motion } from 'framer-motion';
import { GameState } from '@/lib/poker';
import { AgentThought } from '@/lib/agents';
import { AgentSeat } from './AgentSeat';
import { PlayingCard } from './Card';
import { useSettingsStore } from '@/store';

interface PokerTableProps {
  gameState: GameState;
  thoughts: AgentThought[];
  onAgentClick?: (agentId: string) => void;
}

export function PokerTable({ gameState, thoughts, onAgentClick }: PokerTableProps) {
  const viewMode = useSettingsStore(state => state.viewMode);
  const showAllCards = viewMode === 'transparent' || gameState.bettingRound === 'showdown';

  // Get latest thought for each agent
  const latestThoughts = new Map<string, AgentThought>();
  for (const thought of thoughts) {
    latestThoughts.set(thought.agentId, thought);
  }

  return (
    <div className="relative w-full aspect-[16/10] max-w-5xl mx-auto">
      {/* Table shadow */}
      <div className="absolute inset-4 rounded-[50%] bg-black/40 blur-xl" />
      
      {/* Table outer rim */}
      <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 shadow-2xl p-3">
        {/* Table felt */}
        <div className="w-full h-full rounded-[50%] bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-900 relative overflow-hidden">
          {/* Felt texture pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }} />
          </div>
          
          {/* Inner felt border */}
          <div className="absolute inset-6 rounded-[50%] border-2 border-green-600/40" />
          <div className="absolute inset-10 rounded-[50%] border border-green-500/20" />
          
          {/* Table logo/branding */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-5xl font-black text-white/5 tracking-widest">AI POKER</span>
          </div>
        </div>
      </div>

      {/* Pot display */}
      <div className="absolute left-1/2 top-[32%] transform -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Chip stack visual */}
          <div className="flex justify-center mb-2">
            <div className="flex -space-x-3">
              {[...Array(Math.min(5, Math.ceil(gameState.pot / 100)))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-md flex items-center justify-center"
                  style={{ transform: `translateY(-${i * 2}px)` }}
                >
                  <div className="w-5 h-5 rounded-full border border-yellow-200/50" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-black/70 backdrop-blur-md rounded-full px-6 py-2 text-center border border-white/10">
            <div className="text-yellow-400/80 text-xs uppercase tracking-wider font-medium">Pot</div>
            <div className="text-white text-2xl font-black font-mono">
              ${gameState.pot.toLocaleString()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Community cards */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="flex gap-2">
          {gameState.communityCards.map((card, index) => (
            <PlayingCard
              key={`${card.rank}-${card.suit}`}
              card={card}
              size="medium"
              delay={index * 0.1}
            />
          ))}
          {/* Empty card slots */}
          {[...Array(5 - gameState.communityCards.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-14 h-20 rounded-lg border-2 border-dashed border-green-600/20 bg-green-900/20"
            />
          ))}
        </div>
      </div>

      {/* Betting round indicator */}
      <div className="absolute left-1/2 top-[68%] transform -translate-x-1/2 z-10">
        <motion.div
          key={gameState.bettingRound}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2 border border-white/10"
        >
          <span className="text-white/60 text-sm uppercase tracking-widest font-medium">
            {gameState.bettingRound}
          </span>
        </motion.div>
      </div>

      {/* Player seats */}
      {gameState.players.map((player, index) => (
        <AgentSeat
          key={player.id}
          player={player}
          isCurrentTurn={index === gameState.currentPlayerIndex && !gameState.isHandComplete}
          isDealer={index === gameState.dealerIndex}
          thought={latestThoughts.get(player.id)}
          showCards={showAllCards}
          position={index}
          totalSeats={gameState.players.length}
          onClick={() => onAgentClick?.(player.id)}
        />
      ))}

      {/* Winner announcement */}
      <AnimatePresence>
        {gameState.isHandComplete && gameState.winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 rounded-2xl px-10 py-6 shadow-2xl shadow-yellow-900/50 border border-yellow-400/20">
              <div className="text-white text-3xl font-black text-center flex items-center gap-3">
                <span className="text-4xl">🏆</span>
                <span>
                  {gameState.winners.map(id => 
                    gameState.players.find(p => p.id === id)?.name
                  ).join(' & ')} wins!
                </span>
              </div>
              {gameState.winners.length === 1 && gameState.handResults.get(gameState.winners[0]) && (
                <div className="text-white/80 text-center mt-2 text-lg">
                  {gameState.handResults.get(gameState.winners[0])?.descr}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need to import AnimatePresence
import { AnimatePresence } from 'framer-motion';
