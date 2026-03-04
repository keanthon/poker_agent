'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { isValidImageSrc } from '@/lib/utils/image';
import { PlayerState } from '@/lib/poker';
import { AgentThought, TableChat } from '@/lib/agents';
import { PlayingCard } from './Card';
import { useSettingsStore } from '@/store';
import { useEffect } from 'react';
import { speakWithPersonality, tts } from '@/lib/audio';

interface AgentDetailViewProps {
  player: PlayerState;
  thoughts: AgentThought[];
  chats: TableChat[];
  onClose: () => void;
}

export function AgentDetailView({ player, thoughts, chats, onClose }: AgentDetailViewProps) {
  const audioEnabled = useSettingsStore(state => state.audioEnabled);
  const toggleAudio = useSettingsStore(state => state.toggleAudio);

  // Filter thoughts and chats for this agent
  const agentThoughts = thoughts.filter(t => t.agentId === player.id);
  const agentChats = chats.filter(c => c.agentId === player.id);

  // Play latest thought on audio if enabled
  useEffect(() => {
    if (audioEnabled && agentThoughts.length > 0) {
      const latestThought = agentThoughts[agentThoughts.length - 1];
      if (latestThought.reasoning) {
        speakWithPersonality(latestThought.reasoning, 'neutral');
      }
    }
  }, [audioEnabled, agentThoughts.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-lg shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500">
            {isValidImageSrc(player.profileImage) ? (
              <Image
                src={player.profileImage}
                alt={player.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                <span className="text-xl text-white font-bold drop-shadow-md">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{player.name}</h2>
            <div className="text-yellow-400 text-sm font-mono">
              ${player.chips.toLocaleString()} chips
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {audioEnabled ? (
              <Volume2 className="w-5 h-5 text-green-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Cards section */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-gray-400 text-sm uppercase mb-3">Hole Cards</h3>
        <div className="flex gap-3 justify-center">
          {player.holeCards.length > 0 ? (
            <>
              <PlayingCard card={player.holeCards[0]} size="large" />
              <PlayingCard card={player.holeCards[1]} size="large" delay={0.1} />
            </>
          ) : (
            <div className="text-gray-500 text-sm">No cards dealt yet</div>
          )}
        </div>
      </div>

      {/* Thoughts section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-gray-400 text-sm uppercase mb-3 sticky top-0 bg-gray-900/95 py-1">
          Internal Thoughts
        </h3>
        <div className="space-y-3">
          <AnimatePresence>
            {agentThoughts.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No thoughts recorded yet
              </div>
            ) : (
              agentThoughts.map((thought, index) => (
                <motion.div
                  key={`${thought.agentId}-${thought.timestamp}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-lg p-3"
                >
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {thought.reasoning}
                  </p>
                  {thought.decision && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Decision:</span>
                      <span className="text-green-400 text-sm font-semibold uppercase">
                        {thought.decision.action}
                        {thought.decision.amount && ` $${thought.decision.amount}`}
                      </span>
                    </div>
                  )}
                  {thought.confidence !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Confidence:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            thought.confidence > 70 
                              ? 'bg-green-500' 
                              : thought.confidence > 40 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${thought.confidence}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs">{thought.confidence}%</span>
                    </div>
                  )}
                  <div className="mt-2 text-gray-500 text-xs">
                    {new Date(thought.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat history */}
      {agentChats.length > 0 && (
        <div className="p-4 border-t border-gray-700 max-h-48 overflow-y-auto">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Table Talk</h3>
          <div className="space-y-2">
            {agentChats.map((chat) => (
              <div
                key={chat.id}
                className={`rounded-lg p-2 text-sm ${
                  chat.tone === 'aggressive'
                    ? 'bg-red-900/30 text-red-200'
                    : chat.tone === 'confident'
                      ? 'bg-purple-900/30 text-purple-200'
                      : chat.tone === 'nervous'
                        ? 'bg-yellow-900/30 text-yellow-200'
                        : 'bg-gray-800 text-gray-200'
                }`}
              >
                "{chat.message}"
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
