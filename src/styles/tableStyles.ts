import { CSSProperties } from 'react';

export const agentSeatStyles = {
  container: (left: number, top: number): CSSProperties => ({
    left: `${left}%`,
    top: `${top}%`,
  }),
  thinkingRing: {
    backgroundSize: '200% 100%',
    filter: 'blur(8px)',
    opacity: 0.6,
  } as CSSProperties,
  confidenceBar: (confidence: number): CSSProperties => ({
    width: `${confidence}%`
  })
};

export const cardStyles = {
  perspective: {
    perspective: '1000px',
  } as CSSProperties,
};

export const pokerTableStyles = {
  feltTexture: {
    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0)',
    backgroundSize: '16px 16px',
  } as CSSProperties,
  chipStackWrapper: (i: number): CSSProperties => ({
    transform: `translateY(-${i * 2}px)`,
  })
};

export const agentDetailViewStyles = {
  confidenceBar: (confidence: number): CSSProperties => ({
    width: `${confidence}%`
  })
};
