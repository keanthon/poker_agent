'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
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
    }}>
      {/* Background patterned overlay (simulate felt texture subtly) */}
      <div style={{
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
      }} />

      {/* Main Content Container with Glassmorphism */}
      <div style={{
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
      }}>
        
        {/* Chips / Cards Visual Element */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          margin: '0 auto 40px',
        }}>
          {['♠️', '♥️', '♣️', '♦️'].map((suit, i) => (
            <div key={suit} style={{
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
              transform: `rotate(${i % 2 === 0 ? '-5deg' : '5deg'}) translateY(${i % 2 === 0 ? '0' : '10px'})`,
              color: suit === '♥️' || suit === '♦️' ? '#ef4444' : '#e5e5e5',
            }}>
              {suit}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #ffffff 0%, #a3a3a3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
        }}>
          AI Poker Arena
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#a3a3a3',
          margin: '0 auto 48px auto',
          maxWidth: '500px',
          lineHeight: 1.6,
        }}>
          Practice your reads, bet sizing, and bluffs against AI agents powered by the latest LLMs.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link href="/game" style={{ textDecoration: 'none' }}>
            <button style={{
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
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(220, 38, 38, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(220, 38, 38, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
            }}
            >
              <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                background: 'linear-gradient(rgba(255,255,255,0.1), transparent)',
                pointerEvents: 'none'
              }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Playing
            </button>
          </Link>

          <Link href="/agents" style={{ textDecoration: 'none' }}>
            <button style={{
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
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Manage Agents
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
