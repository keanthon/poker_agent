import { describe, it, expect } from 'vitest';
import { isValidImageSrc } from '../image';

describe('image utilities', () => {
  it('identifies local paths as valid', () => {
    expect(isValidImageSrc('/assets/avatar1.png')).toBe(true);
    expect(isValidImageSrc('/images/profile.jpg')).toBe(true);
  });

  it('identifies full URLs as valid', () => {
    expect(isValidImageSrc('http://example.com/avatar.png')).toBe(true);
    expect(isValidImageSrc('https://example.com/avatar.png')).toBe(true);
  });

  it('rejects invalid strings completely', () => {
    // Empty/Null
    expect(isValidImageSrc('')).toBe(false);
    expect(isValidImageSrc(null)).toBe(false);
    expect(isValidImageSrc(undefined)).toBe(false);

    // Emojis
    expect(isValidImageSrc('🤖')).toBe(false);
    
    // Normal strings
    expect(isValidImageSrc('avatar1.png')).toBe(false); // Does not start with '/'
    expect(isValidImageSrc('base64:blahblah')).toBe(false);
    expect(isValidImageSrc('data:image/png;base64,iVBO...')).toBe(false); // Data URLs not supported by our function currently
  });
});
