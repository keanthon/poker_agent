import { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#050505',
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(185, 28, 28, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(220, 38, 38, 0.05), transparent 25%)
  `,
  padding: '20px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#ffffff',
};

export const overlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.15,
  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
  backgroundSize: '30px 30px',
  pointerEvents: 'none',
  zIndex: 1,
};

export const glassCardStyle: CSSProperties = {
  position: 'relative',
  zIndex: 10,
  textAlign: 'center',
  background: 'rgba(20, 20, 20, 0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '32px',
  padding: '60px 40px',
  maxWidth: '800px',
  width: '100%',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};

export const suitContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  margin: '0 auto 40px',
};

export const getSuitIconStyle = (index: number, suit: string): CSSProperties => ({
  width: '60px',
  height: '80px',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  transform: `rotate(${index % 2 === 0 ? '-5deg' : '5deg'}) translateY(${index % 2 === 0 ? '0' : '10px'})`,
  color: suit === '♥️' || suit === '♦️' ? '#ef4444' : '#e5e5e5',
});

export const titleStyle: CSSProperties = {
  fontSize: '4.5rem',
  fontWeight: 800,
  background: 'linear-gradient(180deg, #ffffff 0%, #a3a3a3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  margin: '0 0 16px 0',
  letterSpacing: '-0.04em',
  lineHeight: 1.1,
};

export const subtitleStyle: CSSProperties = {
  fontSize: '1.25rem',
  color: '#a3a3a3',
  margin: '0 auto 48px auto',
  maxWidth: '500px',
  lineHeight: 1.6,
};

export const buttonContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

export const primaryButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '1.125rem',
  padding: '16px 36px',
  borderRadius: '9999px',
  border: 'none',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 0 30px rgba(220, 38, 38, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateY(0) scale(1)', // Explicitly set for transition
};

export const primaryButtonHoverStyle = {
  transform: 'translateY(-2px) scale(1.02)',
  boxShadow: '0 0 40px rgba(220, 38, 38, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
};

export const primaryButtonGlareStyle: CSSProperties = {
  position: 'absolute',
  top: 0, right: 0, bottom: 0, left: 0,
  background: 'linear-gradient(rgba(255,255,255,0.1), transparent)',
  pointerEvents: 'none'
};

export const secondaryButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'transparent',
  color: '#e5e5e5',
  fontWeight: 600,
  fontSize: '1.125rem',
  padding: '16px 36px',
  borderRadius: '9999px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

export const secondaryButtonHoverStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.3)',
};
