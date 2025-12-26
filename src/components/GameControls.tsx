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
      <div className="flex items-center bg-gray-800/60 backdrop-blur-xl rounded-xl p-1.5 border border-gray-700/50">
        <button
          onClick={() => setViewMode('transparent')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ${
            viewMode === 'transparent'
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm">Transparent</span>
        </button>
        <button
          onClick={() => setViewMode('player')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ${
            viewMode === 'player'
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span className="text-sm">Player</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-700/50 hidden sm:block" />

      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        className={`p-3.5 rounded-xl transition-all border ${
          audioEnabled
            ? 'bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/30'
            : 'bg-gray-800/60 border-gray-700/50 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
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
                : 'bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/30'
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
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30'
                : 'bg-gray-800/40 border-gray-700/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </>
      ) : (
        <button
          onClick={onNewHand}
          className="flex items-center gap-3 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:via-violet-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-purple-900/30"
        >
          <span>Deal New Hand</span>
          <span className="text-xl">🃏</span>
        </button>
      )}
    </motion.div>
  );
}
