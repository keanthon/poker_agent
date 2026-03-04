'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { useSettingsStore } from '@/store';

interface GameControlsProps {
  isPlaying: boolean;
  canAdvance: boolean;
  onTogglePlay: () => void;
  onAdvance: () => void;
  onNewHand: () => void;
  isHandComplete: boolean;
}

export function GameControls({
  isPlaying,
  canAdvance,
  onTogglePlay,
  onAdvance,
  onNewHand,
  isHandComplete,
}: GameControlsProps) {
  const viewMode = useSettingsStore(state => state.viewMode);
  const setViewMode = useSettingsStore(state => state.setViewMode);
  const audioEnabled = useSettingsStore(state => state.audioEnabled);
  const toggleAudio = useSettingsStore(state => state.toggleAudio);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-4 flex-wrap"
    >
      {/* View mode toggle */}
      <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-xl p-1.5 border border-red-900/30">
        <button
          onClick={() => setViewMode('transparent')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ${
            viewMode === 'transparent'
              ? 'bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg shadow-red-900/40'
              : 'text-gray-400 hover:text-white hover:bg-red-900/20'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm">Transparent</span>
        </button>
        <button
          onClick={() => setViewMode('player')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ${
            viewMode === 'player'
              ? 'bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg shadow-red-900/40'
              : 'text-gray-400 hover:text-white hover:bg-red-900/20'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span className="text-sm">Player</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-red-900/30 hidden sm:block" />

      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        className={`p-3.5 rounded-xl transition-all border ${
          audioEnabled
            ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
            : 'bg-black/60 border-red-900/30 text-gray-500 hover:text-gray-300 hover:bg-red-900/20'
        }`}
      >
        {audioEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Playback controls */}
      {!isHandComplete ? (
        <>
          <button
            onClick={onTogglePlay}
            className={`p-3.5 rounded-xl transition-all border shadow-lg ${
              isPlaying
                ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-600/30'
                : 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onAdvance}
            disabled={!canAdvance}
            className={`p-3.5 rounded-xl transition-all border ${
              canAdvance
                ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
                : 'bg-black/40 border-red-900/20 text-gray-600 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </>
      ) : (
        <button
          onClick={onNewHand}
          className="flex items-center gap-3 bg-gradient-to-r from-red-700 via-red-600 to-red-800 hover:from-red-600 hover:via-red-500 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-red-900/40"
        >
          <span>Deal New Hand</span>
          <span className="text-xl">🃏</span>
        </button>
      )}
    </motion.div>
  );
}
