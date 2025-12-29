'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGameStore, useSettingsStore } from '@/store';
import { tts, speakWithPersonality } from '@/lib/audio/tts';

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
  const clearError = useGameStore(state => state.clearError);
  const reset = useGameStore(state => state.reset);
  const pkMode = useGameStore(state => state.pkMode);
  const togglePkMode = useGameStore(state => state.togglePkMode);

  // Settings
  const viewMode = useSettingsStore(state => state.viewMode);
  const setViewMode = useSettingsStore(state => state.setViewMode);
  const audioEnabled = useSettingsStore(state => state.audioEnabled);
  const autoPlayDelay = useSettingsStore(state => state.autoPlayDelay);

  // Local state
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handleNewHand = useCallback(() => {
    startNewHand();
  }, [startNewHand]);

  const handleRestart = useCallback(() => {
    reset();
    router.push('/agents');
  }, [reset, router]);

  // Track last spoken message ID to prevent re-speaking on re-renders
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  // TTS Integration
  useEffect(() => {
    tts.setEnabled(audioEnabled);
  }, [audioEnabled]);

  // Speak new messages
  useEffect(() => {
    if (!audioEnabled || chatMessages.length === 0) return;

    // Only speak the very last message
    const lastMsg = chatMessages[chatMessages.length - 1];
    
    // Skip if we already spoke this message
    if (lastMsg.id === lastSpokenMessageIdRef.current) {
      return;
    }
    
    // Update ref immediately
    lastSpokenMessageIdRef.current = lastMsg.id;
    
    // Find the player index to assign a consistent voice
    const playerIndex = gameState?.players.findIndex(p => p.id === lastMsg.agentId) ?? 0;
    
    // Determine personality based on content/context (mock logic for now)
    const voice = tts.getVoiceForAgent(playerIndex);
    
    // Verify active players for PK Mode (Heads-Up or 2 players left)
    const activePlayers = gameState?.players.filter(p => !p.hasFolded) || [];
    const isHeadsUp = activePlayers.length <= 2;

    const speakSequence = async () => {
       // Only read thoughts for active players (don't read the thought of the guy who just folded)
       const speaker = gameState?.players.find(p => p.id === lastMsg.agentId);
       const speakerIsActive = speaker && !speaker.hasFolded;

       if (pkMode && isHeadsUp && speakerIsActive && lastMsg.linkedThought?.reasoning) {
          // Speak thought first
          await speakWithPersonality(lastMsg.linkedThought.reasoning, 'thoughtful', voice);
       }
       // Speak chat
       await speakWithPersonality(lastMsg.message, lastMsg.linkedThought ? 'confident' : 'neutral', voice);
    };

    speakSequence().catch(console.error);
    
  }, [chatMessages, audioEnabled, gameState?.players, pkMode]);

  // Get latest thought for each agent
  const latestThoughts = new Map<string, typeof thoughts[0]>();
  for (const thought of thoughts) {
    latestThoughts.set(thought.agentId, thought);
  }

  if (!gameState) {
    return null;
  }

  const showAllCards = viewMode === 'transparent' || gameState.bettingRound === 'showdown';

  // Calculate seat positions
  const getSeatPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radiusX = 35;
    const radiusY = 35;
    return {
      left: `${50 + radiusX * Math.cos(angle)}%`,
      top: `${50 + radiusY * Math.sin(angle)}%`,
    };
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0a0a12 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <Link href="/agents" style={{ color: '#9ca3af', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          AI Poker Arena
        </h1>
        <button
          onClick={handleRestart}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
          }}
        >
          New Game
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#fca5a5',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>{error}</span>
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
        {/* Poker Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            aspectRatio: '16/10',
            margin: '0 auto',
          }}>
            {/* Table */}
            <div style={{
              position: 'absolute',
              inset: '10%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #166534, #15803d)',
              border: '12px solid #78350f',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 20px rgba(255,255,255,0.1)',
            }}>
              {/* Center info */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  marginBottom: '10px',
                }}>
                  <div style={{ color: '#facc15', fontSize: '12px', textTransform: 'uppercase' }}>Pot</div>
                  <div style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>${gameState.pot}</div>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                }}>
                  {gameState.bettingRound}
                </div>
              </div>

              {/* Community cards */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
              }}>
                {gameState.communityCards.map((card, i) => (
                  <div key={i} style={{
                    width: '50px',
                    height: '70px',
                    background: 'white',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#dc2626' : '#1f2937',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}>
                    {card.rank === 'T' ? '10' : card.rank}{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                  </div>
                ))}
              </div>
            </div>

            {/* Players */}
            {gameState.players.map((player, index) => {
              const pos = getSeatPosition(index, gameState.players.length);
              const thought = latestThoughts.get(player.id);
              const isCurrentTurn = index === gameState.currentPlayerIndex && !gameState.isHandComplete;
              
              return (
                <div
                  key={player.id}
                  style={{
                    position: 'absolute',
                    left: pos.left,
                    top: pos.top,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    opacity: player.hasFolded ? 0.4 : 1,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: isCurrentTurn ? '3px solid #facc15' : '3px solid rgba(255,255,255,0.2)',
                    boxShadow: isCurrentTurn ? '0 0 20px rgba(250,204,21,0.5)' : 'none',
                    margin: '0 auto 8px',
                    position: 'relative',
                  }}>
                    {player.profileImage ? (
                      <Image
                        src={player.profileImage}
                        alt={player.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name & chips */}
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {player.name}
                  </div>
                  <div style={{ color: '#facc15', fontSize: '12px' }}>
                    ${player.chips}
                  </div>

                  {/* Current bet */}
                  {player.currentBet > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #ca8a04, #a16207)',
                      color: 'white',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      marginTop: '6px',
                    }}>
                      ${player.currentBet}
                    </div>
                  )}

                  {/* Hole cards */}
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                    {player.holeCards.map((card, i) => (
                      <div key={i} style={{
                        width: '35px',
                        height: '50px',
                        background: showAllCards ? 'white' : 'linear-gradient(135deg, #1e3a8a, #1e40af)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: showAllCards ? (card.suit === 'hearts' || card.suit === 'diamonds' ? '#dc2626' : '#1f2937') : 'transparent',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}>
                        {showAllCards ? `${card.rank === 'T' ? '10' : card.rank}${card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}` : ''}
                      </div>
                    ))}
                  </div>

                  {/* Status badges */}
                  {/* Status badges */}
                  {player.hasFolded ? (
                    <div style={{ background: '#dc2626', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: 'bold' }}>FOLDED</div>
                  ) : player.isAllIn ? (
                    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: 'bold' }}>ALL IN</div>
                  ) : gameState.lastAction?.playerId === player.id ? (
                     <div style={{ background: '#2563eb', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                       {gameState.lastAction.type} {gameState.lastAction.amount ? `$${gameState.lastAction.amount}` : ''}
                     </div>
                  ) : player.currentBet > 0 ? (
                     <div style={{ background: '#ca8a04', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: 'bold' }}>
                       ${player.currentBet}
                     </div>
                  ) : player.hasActed ? (
                     <div style={{ background: '#4b5563', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: 'bold' }}>CHECK</div>
                  ) : null}


                </div>
              );
            })}

            {/* Winner announcement */}
            {gameState.isHandComplete && gameState.winners.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #ca8a04, #a16207)',
                borderRadius: '16px',
                padding: '20px 40px',
                zIndex: 20,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                  {gameState.winners.map(id => gameState.players.find(p => p.id === id)?.name).join(' & ')} wins!
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '30px',
            flexWrap: 'wrap',
          }}>
            {/* View mode toggle */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '4px',
            }}>
              <button
                onClick={() => setViewMode('transparent')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: viewMode === 'transparent' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                  color: 'white',
                }}
              >
                👁 Transparent
              </button>
              <button
                onClick={() => setViewMode('player')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: viewMode === 'player' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                  color: 'white',
                }}
              >
                🙈 Player
              </button>
              <button
                onClick={togglePkMode}
                title="Enable PK Mode (Voice over thoughts in Heads-Up)"
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: pkMode ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'transparent',
                  color: pkMode ? 'white' : '#9ca3af',
                  marginLeft: '10px',
                }}
              >
                ⚔️ PK
              </button>
            </div>

            {/* Playback controls */}
            {!gameState.isHandComplete ? (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    background: isPlaying ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                    color: isPlaying ? '#facc15' : '#4ade80',
                  }}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => processNextTurn()}
                  disabled={isProcessingTurn}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: isProcessingTurn ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    background: 'rgba(59,130,246,0.2)',
                    color: '#60a5fa',
                    opacity: isProcessingTurn ? 0.5 : 1,
                  }}
                >
                  ⏭ Next
                </button>
              </>
            ) : (
              <button
                onClick={handleNewHand}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: 'white',
                }}
              >
                🃏 Deal New Hand
              </button>
            )}
          </div>
        </div>

        {/* Sidebar - Chat & Thoughts */}
        <div style={{
          width: '350px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden',
        }}>
          {/* Table Talk */}
          {/* Table Talk (Enriched) */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ color: 'white', margin: '0 0 15px 0', fontSize: '18px' }}>
              💬 Table Talk
            </h3>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              maxHeight: '500px',
              minHeight: 0
            }}>
              {chatMessages.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No messages yet...</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: '13px' }}>
                        {msg.agentName}
                      </div>
                      
                      {/* Thought Toggle Trigger */}
                      {msg.linkedThought && viewMode === 'transparent' && (
                        <div style={{ fontSize: '12px', cursor: 'help' }} title="Has internal thought">
                           🧠
                        </div>
                      )}
                    </div>
                    
                    <div style={{ color: '#d1d5db', fontSize: '14px', fontStyle: 'italic', marginBottom: msg.linkedThought && viewMode === 'transparent' ? '8px' : '0' }}>
                      "{msg.message}"
                    </div>

                    {msg.actionDisplay && (
                      <div style={{ 
                        marginTop: '6px',
                        fontSize: '11px', 
                        color: '#34d399', 
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>⚡</span>
                        {msg.actionDisplay}
                      </div>
                    )}

                    {/* Integrated Thought Reveal */}
                    {msg.linkedThought && viewMode === 'transparent' && (
                      <details style={{ marginTop: '8px' }}>
                        <summary style={{
                          cursor: 'pointer',
                          color: '#6b7280',
                          fontSize: '11px',
                          userSelect: 'none',
                          outline: 'none',
                        }}>
                          Reveal Internal Thought
                        </summary>
                        <div style={{
                          marginTop: '8px',
                          padding: '10px',
                          background: 'rgba(139,92,246,0.1)',
                          borderLeft: '2px solid #8b5cf6',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#c4b5fd',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.4',
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 }}>Thinking Process:</div>
                          {msg.linkedThought.reasoning}
                          {msg.linkedThought.confidence && (
                             <div style={{ marginTop: '6px', fontSize: '10px', opacity: 0.7 }}>Confidence: {msg.linkedThought.confidence}%</div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
      </div>

      {/* Processing indicator */}
      {isProcessingTurn && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(30,30,50,0.9)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#d1d5db',
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #8b5cf6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          AI is thinking...
        </div>
      )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
