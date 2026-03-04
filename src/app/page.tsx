'use client';

import Link from 'next/link';
import {
  containerStyle,
  overlayStyle,
  glassCardStyle,
  suitContainerStyle,
  getSuitIconStyle,
  titleStyle,
  subtitleStyle,
  buttonContainerStyle,
  primaryButtonStyle,
  primaryButtonHoverStyle,
  primaryButtonGlareStyle,
  secondaryButtonStyle,
  secondaryButtonHoverStyle,
} from '../styles/pageStyles';

export default function HomePage() {
  return (
    <div style={containerStyle}>
      {/* Background patterned overlay (simulate felt texture subtly) */}
      <div style={overlayStyle} />

      {/* Main Content Container with Glassmorphism */}
      <div style={glassCardStyle}>
        
        {/* Chips / Cards Visual Element */}
        <div style={suitContainerStyle}>
          {['♠️', '♥️', '♣️', '♦️'].map((suit, i) => (
            <div key={suit} style={getSuitIconStyle(i, suit)}>
              {suit}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 style={titleStyle}>
          AI Poker Arena
        </h1>
        
        <p style={subtitleStyle}>
          Practice your reads, bet sizing, and bluffs against AI agents powered by the latest LLMs.
        </p>

        {/* Buttons */}
        <div style={buttonContainerStyle}>
          <Link href="/game" style={{ textDecoration: 'none' }}>
            <button style={primaryButtonStyle}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, primaryButtonHoverStyle);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = primaryButtonStyle.boxShadow as string;
            }}
            >
              <div style={primaryButtonGlareStyle} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Playing
            </button>
          </Link>

          <Link href="/agents" style={{ textDecoration: 'none' }}>
            <button style={secondaryButtonStyle}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, secondaryButtonHoverStyle);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = secondaryButtonStyle.background as string;
              e.currentTarget.style.borderColor = secondaryButtonStyle.border?.toString().split(' ')[2] as string; // Quick reset
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
