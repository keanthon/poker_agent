import { CSSProperties } from 'react';

export const agentStyles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 0%, #3a0a14 0%, #1a0508 60%, #0a0002 100%)',
    padding: '40px',
  } as CSSProperties,

  bgGlowTopLeft: {
    position: 'fixed',
    top: '10%',
    left: '20%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(128, 0, 0, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  } as CSSProperties,

  bgGlowBottomRight: {
    position: 'fixed',
    bottom: '10%',
    right: '10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(94, 19, 32, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  } as CSSProperties,

  contentWrapper: {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
  } as CSSProperties,

  backLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '30px',
  } as CSSProperties,

  title: {
    fontSize: '3.5rem',
    fontWeight: 800,
    background: 'linear-gradient(180deg, #ffffff 0%, #ffb3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 20px 0',
    letterSpacing: '-1px',
    textShadow: '0 4px 20px rgba(128, 0, 0, 0.4)',
  } as CSSProperties,

  disclaimerBox: {
    background: 'rgba(94, 19, 32, 0.2)',
    backdropFilter: 'blur(24px) saturate(120%)',
    WebkitBackdropFilter: 'blur(24px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(74, 14, 20, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '35px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  } as CSSProperties,

  disclaimerIcon: {
    fontSize: '20px',
  } as CSSProperties,

  disclaimerTitle: {
    color: '#f87171',
    margin: '0 0 8px 0',
    fontSize: '16px',
  } as CSSProperties,

  disclaimerText: {
    color: '#fca5a5',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  } as CSSProperties,

  quickStartBox: {
    background: 'linear-gradient(145deg, rgba(94, 19, 32, 0.3), rgba(30, 5, 10, 0.6))',
    backdropFilter: 'blur(24px) saturate(120%)',
    WebkitBackdropFilter: 'blur(24px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '24px 30px',
    marginBottom: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  } as CSSProperties,

  quickStartTitle: {
    color: '#fca5a5',
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: 600,
  } as CSSProperties,

  quickStartSubtitle: {
    color: '#9ca3af',
    margin: 0,
    fontSize: '15px',
  } as CSSProperties,

  quickStartButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #a31d2e 0%, #7a111b 100%)',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px',
    padding: '16px 32px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(128, 0, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
    transition: 'all 0.2s',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  } as CSSProperties,

  actionButtonsContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  } as CSSProperties,

  addAgentButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(180deg, rgba(94,19,32,0.4) 0%, rgba(30,5,10,0.6) 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    padding: '14px 28px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  } as CSSProperties,

  playAsYourselfButton: (isHuman: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: isHuman
      ? 'linear-gradient(180deg, rgba(163,29,46,0.3), rgba(122,17,27,0.3))'
      : 'linear-gradient(180deg, rgba(94,19,32,0.4), rgba(30,5,10,0.6))',
    color: isHuman ? '#ffb3b8' : '#d1d5db',
    fontWeight: 600,
    fontSize: '15px',
    padding: '14px 28px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }),

  selectAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(94, 19, 32, 0.2)',
    backdropFilter: 'blur(10px) saturate(120%)',
    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
    color: '#d1d5db',
    fontWeight: 600,
    fontSize: '15px',
    padding: '14px 28px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as CSSProperties,

  formContainer: {
    background: 'rgba(50, 10, 15, 0.4)',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)',
    borderRadius: '24px',
    padding: '35px',
    marginBottom: '40px',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)',
  } as CSSProperties,

  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as CSSProperties,

  formTitle: {
    color: 'white',
    margin: 0,
    fontSize: '1.25rem',
  } as CSSProperties,

  formCloseButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '24px',
  } as CSSProperties,

  formGroup: {
    marginBottom: '20px',
  } as CSSProperties,

  formLabel: {
    display: 'block',
    color: '#d1d5db',
    marginBottom: '8px',
    fontSize: '14px',
  } as CSSProperties,

  formInput: {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  } as CSSProperties,

  formInputSecondary: {
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
  } as CSSProperties,

  formTextarea: {
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
  } as CSSProperties,

  formSubmitButton: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #a31d2e 0%, #7a111b 100%)',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(128, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    marginTop: '10px',
    transition: 'transform 0.1s',
  } as CSSProperties,

  helperText: {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '20px',
  } as CSSProperties,

  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(30, 30, 50, 0.5)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  } as CSSProperties,

  loadingIcon: {
    fontSize: '60px',
    marginBottom: '20px',
  } as CSSProperties,

  loadingText: {
    color: '#9ca3af',
    fontSize: '18px',
    margin: '0 0 20px 0',
  } as CSSProperties,

  agentListGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  } as CSSProperties,

  agentCard: (isSelected: boolean): CSSProperties => ({
    padding: '24px',
    background: isSelected
      ? 'linear-gradient(145deg, rgba(128, 0, 0, 0.3), rgba(94, 19, 32, 0.2))'
      : 'rgba(50, 10, 15, 0.25)',
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    borderRadius: '20px',
    border: isSelected
      ? '1px solid rgba(255, 120, 120, 0.4)'
      : '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: isSelected
      ? '0 10px 30px rgba(74, 14, 20, 0.6), inset 0 1px 2px rgba(255,255,255,0.2)'
      : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: isSelected ? 'translateY(-4px)' : 'none',
  }),

  agentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  } as CSSProperties,

  agentAvatarContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #a31d2e, #5e1320)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
  } as CSSProperties,

  agentAvatarFallback: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 700,
  } as CSSProperties,

  agentInfoContainer: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,

  agentName: {
    color: 'white',
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: 600,
  } as CSSProperties,

  agentApiUrl: {
    color: '#6b7280',
    margin: 0,
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  agentSelectedBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #a31d2e, #7a111b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 10px rgba(128, 0, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
  } as CSSProperties,

  agentActionsContainer: {
    display: 'flex',
    gap: '15px',
  } as CSSProperties,

  agentActionButton: {
    background: 'none',
    border: 'none',
    color: '#fca5a5',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
  } as CSSProperties,
};
