'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore, storedAgentToAIAgent } from '@/store';
import { useGameStore } from '@/store';
import { PRECONFIGURED_AGENTS } from '@/lib/agents/preconfigured';
import { isValidImageSrc } from '@/lib/utils/image';
import { agentStyles as styles } from '@/styles/agentStyles';

export default function AgentsPage() {
  const router = useRouter();
  const createNewGame = useGameStore(state => state.createNewGame);
  const startNewHand = useGameStore(state => state.startNewHand);
  const registeredAgents = useSettingsStore(state => state.registeredAgents);
  const registerAgent = useSettingsStore(state => state.registerAgent);
  const updateAgent = useSettingsStore(state => state.updateAgent);
  const removeAgent = useSettingsStore(state => state.removeAgent);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [model, setModel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auto-preload and auto-update agents
  useEffect(() => {
    const hasPreloaded = localStorage.getItem('hasPreloadedAgents');

    if (registeredAgents.length === 0 && !hasPreloaded) {
      // Preload agents if none exist and we haven't done it before
      PRECONFIGURED_AGENTS.forEach(agent => {
        registerAgent({
          name: agent.name,  // Use friendly display name
          apiUrl: agent.apiUrl,
          apiKey: agent.apiKey,
          profileImage: agent.profileImage,
          model: agent.model,
          customPrompt: agent.customPrompt,
        });
      });
      localStorage.setItem('hasPreloadedAgents', 'true');
    } else {
      // Update existing agents with missing model or prompt
      registeredAgents.forEach(agent => {
        let updates: Partial<typeof agent> = {};
        const preconfigured = PRECONFIGURED_AGENTS.find(p => p.model === agent.name || p.name === agent.name);
        
        if (preconfigured && (!agent.model || agent.model !== preconfigured.model)) {
          updates.model = preconfigured.model;
        }
        if (!agent.customPrompt && preconfigured?.customPrompt) {
          updates.customPrompt = preconfigured.customPrompt;
        }
        
        if (Object.keys(updates).length > 0) {
          updateAgent(agent.id, updates);
        }
      });
    }
  }, [registeredAgents.length]);

  // Auto-select all agents when they load
  useEffect(() => {
    if (registeredAgents.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(registeredAgents.map(a => a.id)));
    }
  }, [registeredAgents]);


  const handleQuickStart = () => {
    if (registeredAgents.length >= 2) {
      const agents = registeredAgents.map(storedAgentToAIAgent);
      createNewGame(agents);
      startNewHand();
      router.push('/game');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(registeredAgents.map(a => a.id)));
  };

  const humanAgent = registeredAgents.find(a => a.isHuman);

  const handlePlayAsYourself = () => {
    if (humanAgent) {
      // Remove existing human seat
      removeAgent(humanAgent.id);
    } else {
      // Register a human player slot
      const newAgent = registerAgent({
        name: 'You',
        apiUrl: '',
        apiKey: '',
        profileImage: '',
        isHuman: true,
      });
      setSelectedIds(prev => new Set([...prev, newAgent.id]));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (editingId) {
      updateAgent(editingId, {
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        profileImage: profileImage.trim() || '',
        customPrompt: customPrompt.trim() || undefined,
        model: model.trim() || undefined,
      });
      setEditingId(null);
    } else {
      registerAgent({
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        profileImage: profileImage.trim() || '',
        customPrompt: customPrompt.trim() || undefined,
        model: model.trim() || undefined,
      });
    }
    
    setName('');
    setApiKey('');
    setProfileImage('');
    setCustomPrompt('');
    setModel('');
    setShowForm(false);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Glow */}
      <div style={styles.bgGlowTopLeft} />
      <div style={styles.bgGlowBottomRight} />

      <div style={styles.contentWrapper}>
        {/* Header */}
        <Link href="/" style={styles.backLink}>
          ← Back to Home
        </Link>

        <h1 style={styles.title}>
          Agent Management
        </h1>

        {/* Disclaimer Info Box */}
        <div style={styles.disclaimerBox}>
          <span style={styles.disclaimerIcon}>⚠️</span>
          <div>
            <h4 style={styles.disclaimerTitle}>API Keys Required to Play</h4>
            <p style={styles.disclaimerText}>
              The preconfigured agents (AssGPT, AdamGrok, BillyGrok) are templates and <strong>do not have API keys</strong> built-in.
              <br /><br />
              🃏 <strong>Starting a game without an API key will cause the agent to automatically fold every hand.</strong>
              <br /><br />
              To play properly, click <strong>Edit</strong> on a preconfigured agent and enter your API key, or click <strong>+ Add Agent</strong> to register your own.
              <br /><br />
              <em>🔒 Privacy: API keys are stored only in your browser&apos;s localStorage and are <strong>never logged, stored, or retained server-side</strong>. During gameplay, keys pass through a stateless serverless proxy solely to bypass browser CORS restrictions — the proxy retains zero state between requests. <a href="https://github.com/keanthon/poker_agent/blob/main/src/app/api/chat/route.ts" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>View proxy source code</a></em>
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        {registeredAgents.length >= 2 && (
          <div style={styles.quickStartBox}>
            <div>
              <h3 style={styles.quickStartTitle}>Ready to Play!</h3>
              <p style={styles.quickStartSubtitle}>
                {registeredAgents.length} agents loaded and ready
              </p>
            </div>
            <button
              onClick={handleQuickStart}
              style={styles.quickStartButton}
            >
              <span style={{ fontSize: '20px' }}>▶</span>
              Quick Start Game
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionButtonsContainer}>
          <button
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                setName('');
                setApiUrl('');
                setApiKey('');
                setProfileImage('');
                setCustomPrompt('');
                setModel('');
                setEditingId(null);
                setShowForm(true);
              }
            }}
            style={styles.addAgentButton}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Add Agent
          </button>

          {/* Play as Yourself toggle */}
          <button
            onClick={handlePlayAsYourself}
            style={styles.playAsYourselfButton(!!humanAgent)}
          >
            <span style={{ fontSize: '20px' }}>{humanAgent ? '✕' : '🧑'}</span>
            {humanAgent ? 'Remove Yourself' : 'Play as Yourself'}
          </button>

          {registeredAgents.length > 0 && (
            <button
              onClick={selectAll}
              style={styles.selectAllButton}
            >
              Select All
            </button>
          )}
        </div>

        {/* Registration Form */}
        {showForm && (
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>{editingId ? 'Edit Agent' : 'Register New Agent'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                style={styles.formCloseButton}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleRegister}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GPT-4 Poker Pro"
                  style={styles.formInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  API URL *
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={styles.formInputSecondary}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Model Name *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., gpt-4o, grok-3, claude-sonnet-4-20250514"
                  style={styles.formInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  API Key (required for play)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={styles.formInput}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Profile Image URL (optional)
                </label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  style={styles.formInputSecondary}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Custom Base Prompt (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., You play extremely conservatively and fold to almost any bet."
                  style={styles.formTextarea}
                />
              </div>

              <button
                type="submit"
                style={styles.formSubmitButton}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {editingId ? 'Save Changes' : 'Register Agent'}
              </button>
            </form>
          </div>
        )}

        {/* Helper text */}
        {registeredAgents.length > 0 && (
          <p style={styles.helperText}>
            💡 Click on agents to select/deselect them for the game
          </p>
        )}

        {/* Agent List */}
        {registeredAgents.length === 0 ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingIcon}>🤖</div>
            <p style={styles.loadingText}>
              Loading agents...
            </p>
          </div>
        ) : (
          <div style={styles.agentListGrid}>
            {registeredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleSelect(agent.id)}
                style={styles.agentCard(selectedIds.has(agent.id))}
              >
                <div style={styles.agentCardHeader}>
                  <div style={styles.agentAvatarContainer}>
                    {isValidImageSrc(agent.profileImage) ? (
                      <Image src={agent.profileImage} alt={agent.name} width={56} height={56} style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={styles.agentAvatarFallback}>
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={styles.agentInfoContainer}>
                    <h3 style={styles.agentName}>
                      {agent.name}
                    </h3>
                    <p style={styles.agentApiUrl}>
                      {agent.model && <span style={{ color: '#f59e0b', marginRight: '6px' }}>{agent.model}</span>}
                      {agent.apiUrl}
                    </p>
                  </div>
                  {selectedIds.has(agent.id) && (
                    <div style={styles.agentSelectedBadge}>
                      ✓
                    </div>
                  )}
                </div>
                <div style={styles.agentActionsContainer}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setName(agent.name);
                      setApiUrl(agent.apiUrl);
                      setApiKey(agent.apiKey);
                      setProfileImage(agent.profileImage);
                      setCustomPrompt(agent.customPrompt || '');
                      setModel(agent.model || '');
                      setEditingId(agent.id);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={styles.agentActionButton}
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
                    style={{...styles.agentActionButton, color: '#ef4444'}}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
