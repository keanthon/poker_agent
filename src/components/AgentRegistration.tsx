'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useSettingsStore } from '@/store';
import { StoredAgent } from '@/lib/agents';
import Image from 'next/image';

interface AgentRegistrationFormProps {
  onComplete?: () => void;
  editAgent?: StoredAgent;
}

export function AgentRegistrationForm({ onComplete, editAgent }: AgentRegistrationFormProps) {
  const registerAgent = useSettingsStore(state => state.registerAgent);
  const updateAgent = useSettingsStore(state => state.updateAgent);
  
  const [name, setName] = useState(editAgent?.name || '');
  const [apiUrl, setApiUrl] = useState(editAgent?.apiUrl || 'https://api.openai.com/v1/chat/completions');
  const [apiKey, setApiKey] = useState(editAgent?.apiKey || '');
  const [profileImage, setProfileImage] = useState(editAgent?.profileImage || '');
  const [personality, setPersonality] = useState(editAgent?.personality || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!apiUrl.trim()) {
      setError('API URL is required');
      return;
    }
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }

    if (editAgent) {
      updateAgent(editAgent.id, {
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        profileImage: profileImage.trim() || '/default-avatar.png',
        personality: personality.trim(),
      });
    } else {
      registerAgent({
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        profileImage: profileImage.trim() || '/default-avatar.png',
        personality: personality.trim(),
      });
    }

    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Agent Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., GPT-4 Poker Pro"
          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">API URL *</label>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.openai.com/v1/chat/completions"
          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all font-mono text-sm"
        />
        <p className="text-gray-500 text-xs mt-2">
          Must be OpenAI-compatible chat completions endpoint
        </p>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">API Key *</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Profile Image URL</label>
        <div className="flex gap-4">
          <input
            type="url"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="flex-1 bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all text-sm"
          />
          {profileImage && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
              <Image
                src={profileImage}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => setProfileImage('')}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Personality (optional)</label>
        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="Describe this agent's playstyle and personality..."
          rows={3}
          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:via-violet-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/30"
      >
        {editAgent ? 'Update Agent' : 'Register Agent'}
      </button>
    </form>
  );
}

// Agent list component
export function AgentList({ onSelectForGame }: { onSelectForGame?: (agents: StoredAgent[]) => void }) {
  const registeredAgents = useSettingsStore(state => state.registeredAgents);
  const removeAgent = useSettingsStore(state => state.removeAgent);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<StoredAgent | null>(null);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleStartGame = () => {
    if (selectedIds.size >= 2 && onSelectForGame) {
      const selected = registeredAgents.filter(a => selectedIds.has(a.id));
      onSelectForGame(selected);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Registered Agents</h2>
        <button
          onClick={() => {
            setEditingAgent(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30"
        >
          <Plus className="w-5 h-5" />
          Add Agent
        </button>
      </div>

      {/* Agent grid */}
      {registeredAgents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
        >
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-gray-400 text-lg mb-4">No agents registered yet</div>
          <button
            onClick={() => setShowForm(true)}
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Register your first AI agent →
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {registeredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-sm
                  ${selectedIds.has(agent.id)
                    ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-900/20'
                    : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60'
                  }
                `}
                onClick={() => toggleSelect(agent.id)}
              >
                {/* Selected indicator */}
                {selectedIds.has(agent.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-600/50 flex-shrink-0">
                    {agent.profileImage && agent.profileImage !== '/default-avatar.png' ? (
                      <Image
                        src={agent.profileImage}
                        alt={agent.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <span className="text-2xl text-white font-bold">
                          {agent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg truncate mb-1">{agent.name}</h3>
                    <p className="text-gray-500 text-xs truncate font-mono">{agent.apiUrl}</p>
                    {agent.personality && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {agent.personality}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAgent(agent);
                      setShowForm(true);
                    }}
                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAgent(agent.id);
                      selectedIds.delete(agent.id);
                      setSelectedIds(new Set(selectedIds));
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Start game button */}
      <AnimatePresence>
        {selectedIds.size >= 2 && onSelectForGame && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <button
              onClick={handleStartGame}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-green-900/40 transition-all hover:scale-105"
            >
              <span>Start Game with {selectedIds.size} Agents</span>
              <span className="text-2xl">🎮</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => {
              setShowForm(false);
              setEditingAgent(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-gray-700/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingAgent ? 'Edit Agent' : 'Register New Agent'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgent(null);
                  }}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AgentRegistrationForm
                editAgent={editingAgent || undefined}
                onComplete={() => {
                  setShowForm(false);
                  setEditingAgent(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
