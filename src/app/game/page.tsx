'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  PokerTable, 
  AgentDetailView, 
  TableChatPanel, 
  GameControls 
} from '@/components';
import { useGameStore, useSettingsStore } from '@/store';

export default function GamePage() {
  const router = useRouter();
  
  // Game state
  const gameState = useGameStore(state => state.gameState);
  const thoughts = useGameStore(state => state.thoughts);
  const chatMessages = useGameStore(state => state.chatMessages);
  const isProcessingTurn = useGameStore(state => state.isProcessingTurn);
  const error = useGameStore(state => state.error);
  const processNextTurn = useGameStore(state => state.processNextTurn);
  const startNewHand = useGameStore(state => state.startNewHand);
  const selectAgent = useGameStore(state => state.selectAgent);
  const selectedAgentId = useGameStore(state => state.selectedAgentId);
  const clearError = useGameStore(state => state.clearError);
  const reset = useGameStore(state => state.reset);

  // Settings
  const autoPlay = useSettingsStore(state => state.autoPlay);
  const setAutoPlay = useSettingsStore(state => state.setAutoPlay);
  const autoPlayDelay = useSettingsStore(state => state.autoPlayDelay);

  // Local state
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Redirect if no game
  useEffect(() => {
    if (!gameState) {
      router.push('/agents');
    }
  }, [gameState, router]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying || !gameState || gameState.isHandComplete || isProcessingTurn) {
      return;
    }

    const timer = setTimeout(() => {
      processNextTurn();
    }, autoPlayDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, gameState, isProcessingTurn, autoPlayDelay, processNextTurn]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    setAutoPlay(!isPlaying);
  }, [isPlaying, setAutoPlay]);

  const handleAdvance = useCallback(() => {
    if (!isProcessingTurn && gameState && !gameState.isHandComplete) {
      processNextTurn();
    }
  }, [isProcessingTurn, gameState, processNextTurn]);

  const handleNewHand = useCallback(() => {
    startNewHand();
    setIsPlaying(autoPlay);
  }, [startNewHand, autoPlay]);

  const handleAgentClick = useCallback((agentId: string) => {
    selectAgent(selectedAgentId === agentId ? null : agentId);
  }, [selectAgent, selectedAgentId]);

  const handleRestart = useCallback(() => {
    reset();
    router.push('/agents');
  }, [reset, router]);

  // Get selected player
  const selectedPlayer = selectedAgentId 
    ? gameState?.players.find(p => p.id === selectedAgentId)
    : null;

  if (!gameState) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a12]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col flex-1 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link 
            href="/agents"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </Link>

          <div 
            className="text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI Poker Arena
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>New Game</span>
          </button>
        </motion.div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center justify-between backdrop-blur-sm"
            >
              <span className="text-red-200">{error}</span>
              <button onClick={clearError} className="text-red-300 hover:text-white ml-4">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main game area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Poker table */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center min-h-[450px]">
              <PokerTable
                gameState={gameState}
                thoughts={thoughts}
                onAgentClick={handleAgentClick}
              />
            </div>

            {/* Controls */}
            <div className="mt-6">
              <GameControls
                isPlaying={isPlaying}
                canAdvance={!isProcessingTurn && !gameState.isHandComplete}
                onTogglePlay={handleTogglePlay}
                onAdvance={handleAdvance}
                onNewHand={handleNewHand}
                isHandComplete={gameState.isHandComplete}
              />
            </div>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:w-96">
            <TableChatPanel messages={chatMessages} />
          </div>
        </div>
      </div>

      {/* Agent detail view */}
      <AnimatePresence>
        {selectedPlayer && (
          <AgentDetailView
            player={selectedPlayer}
            thoughts={thoughts}
            chats={chatMessages}
            onClose={() => selectAgent(null)}
          />
        )}
      </AnimatePresence>

      {/* Processing indicator */}
      <AnimatePresence>
        {isProcessingTurn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 bg-gray-800/90 backdrop-blur-xl rounded-xl px-5 py-3 flex items-center gap-3 border border-gray-700/50 shadow-xl"
          >
            <motion.div
              className="w-5 h-5 border-2 border-t-transparent border-purple-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-gray-300 text-sm font-medium">AI is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
