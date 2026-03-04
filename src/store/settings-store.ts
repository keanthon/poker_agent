// Settings store for UI preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIAgent, StoredAgent } from '../lib/agents/types';

export type ViewMode = 'transparent' | 'player';

interface SettingsStore {
  // View settings
  viewMode: ViewMode;
  audioEnabled: boolean;
  autoPlay: boolean;
  autoPlayDelay: number; // ms between turns

  // Registered agents (persisted)
  registeredAgents: StoredAgent[];

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleAudio: () => void;
  setAutoPlay: (enabled: boolean) => void;
  setAutoPlayDelay: (delay: number) => void;
  
  // Agent management
  registerAgent: (agent: Omit<StoredAgent, 'id' | 'createdAt'>) => StoredAgent;
  updateAgent: (id: string, updates: Partial<StoredAgent>) => void;
  removeAgent: (id: string) => void;
  getAgentById: (id: string) => StoredAgent | undefined;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      viewMode: 'transparent',
      audioEnabled: true,
      autoPlay: true,
      autoPlayDelay: 2000,
      registeredAgents: [],

      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleAudio: () => set(state => ({ audioEnabled: !state.audioEnabled })),
      
      setAutoPlay: (enabled) => set({ autoPlay: enabled }),
      
      setAutoPlayDelay: (delay) => set({ autoPlayDelay: delay }),

      registerAgent: (agentData) => {
        const newAgent: StoredAgent = {
          ...agentData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        
        set(state => ({
          registeredAgents: [...state.registeredAgents, newAgent],
        }));
        
        return newAgent;
      },

      updateAgent: (id, updates) => {
        set(state => ({
          registeredAgents: state.registeredAgents.map(agent =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
        }));
      },

      removeAgent: (id) => {
        set(state => ({
          registeredAgents: state.registeredAgents.filter(agent => agent.id !== id),
        }));
      },

      getAgentById: (id) => {
        return get().registeredAgents.find(agent => agent.id === id);
      },
    }),
    {
      name: 'poker-agent-settings',
      partialize: (state) => ({
        viewMode: state.viewMode,
        audioEnabled: state.audioEnabled,
        autoPlay: state.autoPlay,
        autoPlayDelay: state.autoPlayDelay,
        registeredAgents: state.registeredAgents,
      }),
    }
  )
);

// Helper to convert StoredAgent to AIAgent for game use
export function storedAgentToAIAgent(stored: StoredAgent): AIAgent {
  return {
    id: stored.id,
    name: stored.name,
    apiUrl: stored.apiUrl,
    apiKey: stored.apiKey,
    profileImage: stored.profileImage,
    personality: stored.personality,
    voiceId: stored.voiceId,
    model: stored.model,
    customPrompt: stored.customPrompt,
    isHuman: stored.isHuman,
  };
}
