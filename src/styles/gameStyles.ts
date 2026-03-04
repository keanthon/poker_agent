import { CSSProperties } from 'react';

export const gameStyles = {
  playerAvatarContainer: (isCurrentTurn: boolean): CSSProperties => ({
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: isCurrentTurn ? '3px solid #facc15' : '3px solid rgba(255,255,255,0.2)',
    boxShadow: isCurrentTurn ? '0 0 20px rgba(250,204,21,0.5)' : 'none',
    margin: '0 auto 8px',
    position: 'relative',
    flexShrink: 0,
  }),

  playerAvatarFallback: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
  } as CSSProperties,

  pageContainer: {
    height: '100vh',
    background: 'linear-gradient(135deg, #2d0a13 0%, #1a0508 50%, #0a0002 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as CSSProperties,

  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as CSSProperties,

  backLink: {
    color: '#9ca3af',
    textDecoration: 'none',
  } as CSSProperties,

  title: {
    fontSize: '24px',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ffb3b8, #da2b3f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  } as CSSProperties,

  newGameButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
  } as CSSProperties,

  errorContainer: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    color: '#fca5a5',
    display: 'flex',
    justifyContent: 'space-between',
  } as CSSProperties,

  errorCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#fca5a5',
    cursor: 'pointer',
  } as CSSProperties,

  mainContent: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  } as CSSProperties,

  tableArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  tableWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    aspectRatio: '16/10',
  } as CSSProperties,

  tableBorder: {
    position: 'absolute',
    inset: '10%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #166534, #15803d)',
    border: '12px solid #78350f',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 20px rgba(255,255,255,0.1)',
  } as CSSProperties,

  tableCenterInfo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  } as CSSProperties,

  potContainer: {
    background: 'rgba(0,0,0,0.6)',
    borderRadius: '12px',
    padding: '12px 24px',
    marginBottom: '10px',
  } as CSSProperties,

  potLabel: {
    color: '#facc15',
    fontSize: '12px',
    textTransform: 'uppercase',
  } as CSSProperties,

  potAmount: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
  } as CSSProperties,

  bettingRoundText: {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '20px',
    padding: '6px 16px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    textTransform: 'uppercase',
  } as CSSProperties,

  communityCardsContainer: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
  } as CSSProperties,

  communityCard: (isRed: boolean): CSSProperties => ({
    width: '50px',
    height: '70px',
    background: 'white',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    color: isRed ? '#dc2626' : '#1f2937',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  }),

  playerSeat: (left: string, top: string, isFolded: boolean): CSSProperties => ({
    position: 'absolute',
    left,
    top,
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    opacity: isFolded ? 0.4 : 1,
  }),

  playerName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
  } as CSSProperties,

  playerChips: {
    color: '#facc15',
    fontSize: '12px',
  } as CSSProperties,

  playerCurrentBet: {
    background: 'linear-gradient(135deg, #ca8a04, #a16207)',
    color: 'white',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    marginTop: '6px',
  } as CSSProperties,

  holeCardsContainer: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    marginTop: '8px',
  } as CSSProperties,

  holeCard: (showAllCards: boolean, isRed: boolean): CSSProperties => ({
    width: '35px',
    height: '50px',
    background: showAllCards ? 'white' : 'linear-gradient(135deg, #1e3a8a, #1e40af)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: showAllCards ? (isRed ? '#dc2626' : '#1f2937') : 'transparent',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  }),

  badgeFolded: {
    background: '#dc2626',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    fontWeight: 'bold',
  } as CSSProperties,

  badgeAllIn: {
    background: 'linear-gradient(135deg, #7c3aed, #db2777)',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    fontWeight: 'bold',
  } as CSSProperties,

  badgeAction: {
    background: '#2563eb',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  } as CSSProperties,

  badgeBet: {
    background: '#ca8a04',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    fontWeight: 'bold',
  } as CSSProperties,

  badgeCheck: {
    background: '#4b5563',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    fontWeight: 'bold',
  } as CSSProperties,

  winnerAnnouncement: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(135deg, #ca8a04, #a16207)',
    borderRadius: '16px',
    padding: '20px 40px',
    zIndex: 20,
    textAlign: 'center',
  } as CSSProperties,

  winnerIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  } as CSSProperties,

  winnerText: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
  } as CSSProperties,

  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
    flexWrap: 'wrap',
  } as CSSProperties,

  viewModeToggleContainer: {
    display: 'flex',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '4px',
  } as CSSProperties,

  viewModeBtn: (isActive: boolean): CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    background: isActive ? 'linear-gradient(135deg, #a31d2e, #7a111b)' : 'transparent',
    color: 'white',
  }),

  pkModeBtn: (isActive: boolean): CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    fontWeight: 600,
    background: isActive ? 'linear-gradient(135deg, #a31d2e, #7a111b)' : 'transparent',
    color: isActive ? 'white' : '#9ca3af',
    marginLeft: '10px',
  }),

  audioBtn: (isActive: boolean): CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    fontWeight: 600,
    background: isActive ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
    color: isActive ? 'white' : '#9ca3af',
    marginLeft: '10px',
  }),

  humanControlsPanel: {
    background: 'rgba(94, 19, 32, 0.25)',
    backdropFilter: 'blur(24px) saturate(120%)',
    WebkitBackdropFilter: 'blur(24px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '340px',
  } as CSSProperties,

  humanTurnTitle: {
    color: '#ffb3b8',
    fontWeight: 700,
    fontSize: '14px',
    textAlign: 'center',
  } as CSSProperties,

  humanCardsSummary: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  } as CSSProperties,

  humanSummaryCard: (isRed: boolean): CSSProperties => ({
    background: 'white',
    borderRadius: '6px',
    padding: '4px 10px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: isRed ? '#dc2626' : '#111827',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  }),

  callAmountText: {
    color: '#9ca3af',
    fontSize: '13px',
    alignSelf: 'center',
    marginLeft: '8px',
  } as CSSProperties,

  humanActionsContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  } as CSSProperties,

  btnFold: {
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    background: 'rgba(239,68,68,0.2)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)',
  } as CSSProperties,

  btnCheck: {
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    background: 'rgba(107,114,128,0.2)',
    color: '#d1d5db',
    border: '1px solid rgba(107,114,128,0.3)',
  } as CSSProperties,

  btnCall: {
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    background: 'rgba(59,130,246,0.2)',
    color: '#60a5fa',
    border: '1px solid rgba(59,130,246,0.3)',
  } as CSSProperties,

  btnAllIn: {
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    background: 'linear-gradient(135deg, rgba(163,29,46,0.4), rgba(122,17,27,0.4))',
    color: '#ffb3b8',
    border: '1px solid rgba(255, 100, 100, 0.4)',
  } as CSSProperties,

  raiseControlsContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  raiseInput: {
    width: '100px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: '14px',
    textAlign: 'center',
  } as CSSProperties,

  btnRaise: {
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(217,119,6,0.3))',
    color: '#fbbf24',
    border: '1px solid rgba(234,179,8,0.4)',
  } as CSSProperties,

  btnPlaybackToggle: (isPlaying: boolean): CSSProperties => ({
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    background: isPlaying ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
    color: isPlaying ? '#facc15' : '#4ade80',
  }),

  btnNext: (isProcessingTurn: boolean): CSSProperties => ({
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: isProcessingTurn ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    background: 'rgba(59,130,246,0.2)',
    color: '#60a5fa',
    opacity: isProcessingTurn ? 0.5 : 1,
  }),

  btnDealNewHand: {
    padding: '16px 32px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '16px',
    background: 'linear-gradient(135deg, #a31d2e, #7a111b)',
    color: 'white',
  } as CSSProperties,

  sidebar: {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflow: 'hidden',
  } as CSSProperties,

  chatContainer: {
    background: 'rgba(94, 19, 32, 0.2)',
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,

  chatTitle: {
    color: 'white',
    margin: '0 0 15px 0',
    fontSize: '18px',
  } as CSSProperties,

  chatMessagesList: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '500px',
    minHeight: 0,
  } as CSSProperties,

  chatEmptyText: {
    color: '#6b7280',
    fontSize: '14px',
  } as CSSProperties,

  chatMsgContainer: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
  } as CSSProperties,

  chatMsgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  } as CSSProperties,

  chatMsgAuthor: {
    color: '#ffb3b8',
    fontWeight: 600,
    fontSize: '13px',
  } as CSSProperties,

  chatMsgThoughtIcon: {
    fontSize: '12px',
    cursor: 'help',
  } as CSSProperties,

  chatMsgText: (hasLinkedThoughtAndTransparent: boolean): CSSProperties => ({
    color: '#d1d5db',
    fontSize: '14px',
    fontStyle: 'italic',
    marginBottom: hasLinkedThoughtAndTransparent ? '8px' : '0',
  }),

  chatMsgAction: {
    marginTop: '6px',
    fontSize: '11px',
    color: '#34d399',
    fontWeight: 700,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as CSSProperties,

  thoughtRevealDetails: {
    marginTop: '8px',
  } as CSSProperties,

  thoughtRevealSummary: {
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '11px',
    userSelect: 'none',
    outline: 'none',
  } as CSSProperties,

  thoughtRevealContent: {
    marginTop: '8px',
    padding: '10px',
    background: 'rgba(239,68,68,0.1)',
    borderLeft: '2px solid #ef4444',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#fca5a5',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4',
  } as CSSProperties,

  thoughtRevealHeader: {
    fontWeight: 'bold',
    marginBottom: '4px',
    opacity: 0.8,
  } as CSSProperties,

  thoughtConfidenceText: {
    marginTop: '6px',
    fontSize: '10px',
    opacity: 0.7,
  } as CSSProperties,

  processingIndicator: {
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
  } as CSSProperties,

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #8b5cf6',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as CSSProperties,
};
