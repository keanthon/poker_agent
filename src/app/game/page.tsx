'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isValidImageSrc } from '@/lib/utils/image';
import { useGameStore, useSettingsStore } from '@/store';
import { tts, speakWithPersonality } from '@/lib/audio/tts';
import { PlayerState, getCurrentPlayer, getValidActions } from '@/lib/poker';
import { gameStyles as styles } from '@/styles/gameStyles';

function PlayerAvatar({ player, isCurrentTurn }: { player: PlayerState; isCurrentTurn: boolean }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={styles.playerAvatarContainer(isCurrentTurn)}>
      {isValidImageSrc(player.profileImage) && !imgError ? (
        <Image
          src={player.profileImage!}
          alt={player.name}
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={styles.playerAvatarFallback}>
          {player.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  
  // Game state
  const gameState = useGameStore(state => state.gameState);
  const thoughts = useGameStore(state => state.thoughts);
  const chatMessages = useGameStore(state => state.chatMessages);
  const isProcessingTurn = useGameStore(state => state.isProcessingTurn);
  const error = useGameStore(state => state.error);
  const processNextTurn = useGameStore(state => state.processNextTurn);
  const processHumanAction = useGameStore(state => state.processHumanAction);
  const agents = useGameStore(state => state.agents);
  const startNewHand = useGameStore(state => state.startNewHand);
  const clearError = useGameStore(state => state.clearError);
  const reset = useGameStore(state => state.reset);
  const pkMode = useGameStore(state => state.pkMode);
  const togglePkMode = useGameStore(state => state.togglePkMode);

  // Settings
  const viewMode = useSettingsStore(state => state.viewMode);
  const setViewMode = useSettingsStore(state => state.setViewMode);
  const audioEnabled = useSettingsStore(state => state.audioEnabled);
  const toggleAudio = useSettingsStore(state => state.toggleAudio);
  const autoPlayDelay = useSettingsStore(state => state.autoPlayDelay);

  // Local state
  const [isPlaying, setIsPlaying] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [tableTalkMsg, setTableTalkMsg] = useState('');

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

    // Pause auto-play when it's the human's turn
    const current = getCurrentPlayer(gameState);
    if (current && !current.isAI) {
      return;
    }

    const timer = setTimeout(() => {
      processNextTurn();
    }, autoPlayDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, gameState, isProcessingTurn, autoPlayDelay, processNextTurn]);

  // Auto-continue after human action: if it's an AI's turn and we're not already auto-playing,
  // trigger the next turn automatically so the game doesn't appear to "pause"
  useEffect(() => {
    if (isPlaying || !gameState || gameState.isHandComplete || isProcessingTurn) {
      return;
    }

    const current = getCurrentPlayer(gameState);
    if (!current || !current.isAI) {
      return;
    }

    // Small delay so the human can see their action registered before AI responds
    const timer = setTimeout(() => {
      processNextTurn();
    }, 800);

    return () => clearTimeout(timer);
  }, [isPlaying, gameState, isProcessingTurn, processNextTurn]);

  const handleNewHand = useCallback(() => {
    startNewHand();
  }, [startNewHand]);

  const handleRestart = useCallback(() => {
    reset();
    router.push('/agents');
  }, [reset, router]);

  // Track last spoken message ID to prevent re-speaking on re-renders
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  // Auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  // Determine if it's the human's turn
  const currentPlayer = getCurrentPlayer(gameState);
  const isHumanTurn = !gameState.isHandComplete && currentPlayer && !currentPlayer.isAI;
  const humanAgent = agents.find(a => a.isHuman);
  const validActions = isHumanTurn ? getValidActions(gameState) : [];
  const callAmount = isHumanTurn && currentPlayer
    ? Math.max(0, gameState.currentBet - currentPlayer.currentBet)
    : 0;
  const minRaise = gameState.currentBet + gameState.minimumRaise;
  const maxRaise = currentPlayer ? currentPlayer.chips + currentPlayer.currentBet : 0;

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
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.headerContainer}>
        <Link href="/agents" style={styles.backLink}>
          ← Back
        </Link>
        <h1 style={styles.title}>
          AI Poker Arena
        </h1>
        <button
          onClick={handleRestart}
          style={styles.newGameButton}
        >
          New Game
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={styles.errorContainer}>
          <span>{error}</span>
          <button onClick={clearError} style={styles.errorCloseBtn}>✕</button>
        </div>
      )}

      {/* Main content */}
      <div style={styles.mainContent}>
        {/* Poker Table */}
        <div style={styles.tableArea}>
          <div style={styles.tableWrapper}>
            {/* Table */}
            <div style={styles.tableBorder}>
              {/* Center info */}
              <div style={styles.tableCenterInfo}>
                <div style={styles.potContainer}>
                  <div style={styles.potLabel}>Pot</div>
                  <div style={styles.potAmount}>${gameState.pot}</div>
                </div>
                <div style={styles.bettingRoundText}>
                  {gameState.bettingRound}
                </div>
              </div>

              {/* Community cards */}
              <div style={styles.communityCardsContainer}>
                {gameState.communityCards.map((card, i) => {
                  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
                  return (
                    <div key={i} style={styles.communityCard(isRed)}>
                      {card.rank === 'T' ? '10' : card.rank}{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Players */}
            {gameState.players.map((player, index) => {
              const pos = getSeatPosition(index, gameState.players.length);
              const isCurrentTurn = index === gameState.currentPlayerIndex && !gameState.isHandComplete;
              
              return (
                <div
                  key={player.id}
                  style={styles.playerSeat(pos.left, pos.top, player.hasFolded)}
                >
                  {/* Avatar */}
                  <PlayerAvatar player={player} isCurrentTurn={isCurrentTurn} />

                  {/* Name & chips */}
                  <div style={styles.playerName}>
                    {player.name}
                  </div>
                  <div style={styles.playerChips}>
                    ${player.chips}
                  </div>

                  {/* Current bet */}
                  {player.currentBet > 0 && (
                    <div style={styles.playerCurrentBet}>
                      ${player.currentBet}
                    </div>
                  )}

                  {/* Hole cards */}
                  <div style={styles.holeCardsContainer}>
                    {player.holeCards.map((card, i) => {
                      const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
                      return (
                        <div key={i} style={styles.holeCard(showAllCards, isRed)}>
                          {showAllCards ? `${card.rank === 'T' ? '10' : card.rank}${card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}` : ''}
                        </div>
                      );
                    })}
                  </div>

                  {/* Status badges */}
                  {player.hasFolded ? (
                    <div style={styles.badgeFolded}>FOLDED</div>
                  ) : player.isAllIn ? (
                    <div style={styles.badgeAllIn}>ALL IN</div>
                  ) : gameState.lastAction?.playerId === player.id ? (
                     <div style={styles.badgeAction}>
                       {gameState.lastAction.type} {gameState.lastAction.amount ? `$${gameState.lastAction.amount}` : ''}
                     </div>
                  ) : player.currentBet > 0 ? (
                     <div style={styles.badgeBet}>
                       ${player.currentBet}
                     </div>
                  ) : player.hasActed ? (
                     <div style={styles.badgeCheck}>CHECK</div>
                  ) : null}


                </div>
              );
            })}

            {/* Winner announcement */}
            {gameState.isHandComplete && gameState.winners.length > 0 && (
              <div style={styles.winnerAnnouncement}>
                <div style={styles.winnerIcon}>🏆</div>
                <div style={styles.winnerText}>
                  {gameState.winners.map(id => gameState.players.find(p => p.id === id)?.name).join(' & ')} wins!
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={styles.controlsContainer}>
            {/* View mode toggle */}
            <div style={styles.viewModeToggleContainer}>
              <button
                onClick={() => setViewMode('transparent')}
                style={styles.viewModeBtn(viewMode === 'transparent')}
              >
                👁 Transparent
              </button>
              <button
                onClick={() => setViewMode('player')}
                style={styles.viewModeBtn(viewMode === 'player')}
              >
                🙈 Player
              </button>
              <button
                onClick={togglePkMode}
                title="Enable PK Mode (Voice over thoughts in Heads-Up)"
                style={styles.pkModeBtn(pkMode)}
              >
                ⚔️ PK
              </button>
              <button
                onClick={toggleAudio}
                title={audioEnabled ? 'Turn voice over off' : 'Turn voice over on'}
                style={styles.audioBtn(audioEnabled)}
              >
                {audioEnabled ? '🔊' : '🔇'} Voice
              </button>
            </div>

            {/* Human Action Controls */}
            {isHumanTurn && currentPlayer ? (
              <div style={styles.humanControlsPanel}>
                <div style={styles.humanTurnTitle}>
                  🧑 Your Turn — {currentPlayer.name}
                </div>

                {/* Your cards summary */}
                <div style={styles.humanCardsSummary}>
                  {currentPlayer.holeCards.map((card, i) => {
                    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
                    return (
                      <div key={i} style={styles.humanSummaryCard(isRed)}>
                        {card.rank === 'T' ? '10' : card.rank}
                        {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                      </div>
                    );
                  })}
                  <div style={styles.callAmountText}>
                    To call: <strong style={{ color: 'white' }}>${callAmount}</strong>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={styles.humanActionsContainer}>
                  {validActions.includes('fold') && (
                    <button
                      onClick={() => { processHumanAction({ type: 'fold', playerId: currentPlayer.id }, tableTalkMsg); setTableTalkMsg(''); }}
                      style={styles.btnFold}
                    >✕ Fold</button>
                  )}
                  {validActions.includes('check') && (
                    <button
                      onClick={() => { processHumanAction({ type: 'check', playerId: currentPlayer.id }, tableTalkMsg); setTableTalkMsg(''); }}
                      style={styles.btnCheck}
                    >✓ Check</button>
                  )}
                  {validActions.includes('call') && (
                    <button
                      onClick={() => { processHumanAction({ type: 'call', playerId: currentPlayer.id }, tableTalkMsg); setTableTalkMsg(''); }}
                      style={styles.btnCall}
                    >📞 Call ${callAmount}</button>
                  )}
                  {validActions.includes('all_in') && (
                    <button
                      onClick={() => { processHumanAction({ type: 'all_in', playerId: currentPlayer.id }, tableTalkMsg); setTableTalkMsg(''); }}
                      style={styles.btnAllIn}
                    >🚀 All-In</button>
                  )}
                </div>

                {/* Raise controls */}
                {validActions.includes('raise') && (
                  <div style={styles.raiseControlsContainer}>
                    <input
                      type="number"
                      value={raiseAmount || minRaise}
                      min={minRaise}
                      max={maxRaise}
                      onChange={e => setRaiseAmount(Number(e.target.value))}
                      style={styles.raiseInput}
                    />
                    <button
                      onClick={() => {
                        const amount = raiseAmount > 0 ? raiseAmount : minRaise;
                        processHumanAction({ type: 'raise', amount, playerId: currentPlayer.id }, tableTalkMsg);
                        setTableTalkMsg('');
                      }}
                      style={styles.btnRaise}
                    >⬆ Raise</button>
                  </div>
                )}

                {/* Table Talk Input */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '10px',
                }}>
                  <input
                    type="text"
                    value={tableTalkMsg}
                    onChange={e => setTableTalkMsg(e.target.value)}
                    placeholder="Talk trash... (optional)"
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Playback controls (AI only) */
              !gameState.isHandComplete ? (
                <>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={styles.btnPlaybackToggle(isPlaying)}
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={() => processNextTurn()}
                    disabled={isProcessingTurn}
                    style={styles.btnNext(isProcessingTurn)}
                  >
                    ⏭ Next
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNewHand}
                  style={styles.btnDealNewHand}
                >
                  🃏 Deal New Hand
                </button>
              )
            )}
          </div>
        </div>

        {/* Sidebar - Chat & Thoughts */}
        <div style={styles.sidebar}>
          {/* Table Talk (Enriched) */}
          <div style={styles.chatContainer}>
            <h3 style={styles.chatTitle}>
              💬 Table Talk
            </h3>
            <div style={styles.chatMessagesList}>
              {chatMessages.length === 0 ? (
                <p style={styles.chatEmptyText}>No messages yet...</p>
              ) : (() => {
                // Filter to show only current hand's messages for clarity
                const currentHandId = gameState?.handId;
                const visibleMessages = currentHandId 
                  ? chatMessages.filter(m => m.handId === currentHandId)
                  : chatMessages;
                
                if (visibleMessages.length === 0) {
                  return <p style={styles.chatEmptyText}>New hand — waiting for action...</p>;
                }

                return visibleMessages.map((msg) => {
                  const hasLinkedThoughtAndTransparent = !!(msg.linkedThought && viewMode === 'transparent');
                  return (
                    <div key={msg.id} style={styles.chatMsgContainer}>
                      <div style={styles.chatMsgHeader}>
                        <div style={styles.chatMsgAuthor}>
                          {msg.agentName}
                        </div>
                        
                        {/* Thought Toggle Trigger */}
                        {hasLinkedThoughtAndTransparent && (
                          <div style={styles.chatMsgThoughtIcon} title="Has internal thought">
                             🧠
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.chatMsgText(hasLinkedThoughtAndTransparent)}>
                        "{msg.message}"
                      </div>

                      {msg.actionDisplay && (
                        <div style={styles.chatMsgAction}>
                          <span>⚡</span>
                          {msg.actionDisplay}
                        </div>
                      )}

                      {/* Integrated Thought Reveal */}
                      {hasLinkedThoughtAndTransparent && (
                        <details style={styles.thoughtRevealDetails}>
                          <summary style={styles.thoughtRevealSummary}>
                            Reveal Internal Thought
                          </summary>
                          <div style={styles.thoughtRevealContent}>
                            <div style={styles.thoughtRevealHeader}>Thinking Process:</div>
                            {msg.linkedThought?.reasoning}
                            {msg.linkedThought?.confidence && (
                               <div style={styles.thoughtConfidenceText}>Confidence: {msg.linkedThought.confidence}%</div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })
              })()}
              <div ref={chatEndRef} />
            </div>
          </div>
      </div>

      {/* Processing indicator */}
      {isProcessingTurn && (
        <div style={styles.processingIndicator}>
          <div style={styles.spinner} />
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
