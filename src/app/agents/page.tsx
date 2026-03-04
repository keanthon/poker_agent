'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore, storedAgentToAIAgent } from '@/store';
import { useGameStore } from '@/store';
import { PRECONFIGURED_AGENTS } from '@/lib/agents/preconfigured';

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
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1/chat/completions');
  const [apiKey, setApiKey] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
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
        
        if (!agent.model && preconfigured) {
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

  const handleStartGame = () => {
    const agentsToUse = selectedIds.size >= 2 
      ? registeredAgents.filter(a => selectedIds.has(a.id))
      : registeredAgents;
    
    if (agentsToUse.length >= 2) {
      const agents = agentsToUse.map(storedAgentToAIAgent);
      createNewGame(agents);
      startNewHand();
      router.push('/game');
    }
  };

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
        profileImage: '🧑',
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
      });
      setEditingId(null);
    } else {
      registerAgent({
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        profileImage: profileImage.trim() || '',
        customPrompt: customPrompt.trim() || undefined,
      });
    }
    
    setName('');
    setApiKey('');
    setProfileImage('');
    setCustomPrompt('');
    setShowForm(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0a0a12 100%)',
      padding: '40px',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Link href="/" style={{ 
          color: '#9ca3af', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '30px',
        }}>
          ← Back to Home
        </Link>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 20px 0',
        }}>
          Agent Management
        </h1>

        {/* Disclaimer Info Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '16px' }}>API Keys Required to Play</h4>
            <p style={{ color: '#fca5a5', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              The preconfigured agents (AssGPT, AdamGrok, BillyGrok) are templates and <strong>do not have API keys</strong> built-in.
              <br /><br />
              🃏 <strong>Starting a game without an API key will cause the agent to automatically fold every hand.</strong>
              <br /><br />
              To play properly, click <strong>Edit</strong> on a preconfigured agent and enter your API key, or click <strong>+ Add Agent</strong> to register your own.
              <br /><br />
              <em>Privacy Promise: API Keys are stored only in your browser's local storage and are <strong>never</strong> sent to our servers.</em>
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        {registeredAgents.length >= 2 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px' }}>Ready to Play!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>
                {registeredAgents.length} agents loaded and ready
              </p>
            </div>
            <button
              onClick={handleQuickStart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.3)',
              }}
            >
              <span style={{ fontSize: '20px' }}>▶</span>
              Quick Start Game
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                setName('');
                setApiUrl('https://api.openai.com/v1/chat/completions');
                setApiKey('');
                setProfileImage('');
                setCustomPrompt('');
                setEditingId(null);
                setShowForm(true);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Add Agent
          </button>

          {/* Play as Yourself toggle */}
          <button
            onClick={handlePlayAsYourself}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: humanAgent
                ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.2))'
                : 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))',
              color: humanAgent ? '#f87171' : '#4ade80',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 28px',
              borderRadius: '12px',
              border: humanAgent ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '20px' }}>{humanAgent ? '✕' : '🧑'}</span>
            {humanAgent ? 'Remove Yourself' : 'Play as Yourself'}
          </button>

          {registeredAgents.length > 0 && (
            <button
              onClick={selectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                padding: '14px 28px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
            >
              Select All
            </button>
          )}
        </div>

        {/* Registration Form */}
        {showForm && (
          <div style={{
            background: 'rgba(30, 30, 50, 0.8)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>{editingId ? 'Edit Agent' : 'Register New Agent'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '24px' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GPT-4 Poker Pro"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>
                  API URL *
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>
                  API Key (required for play)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>
                  Profile Image URL (optional)
                </label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>
                  Custom Base Prompt (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., You play extremely conservatively and fold to almost any bet."
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {editingId ? 'Save Changes' : 'Register Agent'}
              </button>
            </form>
          </div>
        )}

        {/* Helper text */}
        {registeredAgents.length > 0 && (
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
            💡 Click on agents to select/deselect them for the game
          </p>
        )}

        {/* Agent List */}
        {registeredAgents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(30, 30, 50, 0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤖</div>
            <p style={{ color: '#9ca3af', fontSize: '18px', margin: '0 0 20px 0' }}>
              Loading agents...
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {registeredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleSelect(agent.id)}
                style={{
                  padding: '24px',
                  background: selectedIds.has(agent.id) 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : 'rgba(30, 30, 50, 0.6)',
                  borderRadius: '16px',
                  border: selectedIds.has(agent.id)
                    ? '2px solid #8b5cf6'
                    : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {agent.profileImage ? (
                      <Image src={agent.profileImage} alt={agent.name} width={50} height={50} style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>
                      {agent.name}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      margin: 0, 
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {agent.apiUrl}
                    </p>
                  </div>
                  {selectedIds.has(agent.id) && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setName(agent.name);
                      setApiUrl(agent.apiUrl);
                      setApiKey(agent.apiKey);
                      setProfileImage(agent.profileImage);
                      setCustomPrompt(agent.customPrompt || '');
                      setEditingId(agent.id);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
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
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Game Button (shown when 2+ selected) */}
        {selectedIds.size >= 2 && (
          <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}>
            <button
              onClick={handleStartGame}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                color: 'white',
                fontWeight: 700,
                fontSize: '18px',
                padding: '20px 40px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.4)',
              }}
            >
              Start Game with {selectedIds.size} Agents
              <span style={{ fontSize: '24px' }}>🎮</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
