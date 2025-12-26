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
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0a0a12 100%)',
      padding: '20px',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '30%',
        width: '400px',
        height: '400px',
        background: 'rgba(139, 92, 246, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '30%',
        width: '400px',
        height: '400px',
        background: 'rgba(59, 130, 246, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 40px',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
        }}>
          <span style={{ fontSize: '60px' }}>🎰</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 60px 0',
          letterSpacing: '-2px',
        }}>
          AI Poker Arena
        </h1>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link href="/agents" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
              color: 'white',
              fontWeight: 700,
              fontSize: '18px',
              padding: '20px 40px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
            }}
            >
              <span style={{ fontSize: '20px' }}>▶</span>
              Start Playing
            </button>
          </Link>

          <Link href="/agents" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontWeight: 600,
              fontSize: '18px',
              padding: '20px 40px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            >
              <span style={{ fontSize: '20px' }}>⚙️</span>
              Manage Agents
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
