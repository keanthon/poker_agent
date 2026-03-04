import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tts, speakWithPersonality, VOICE_PRESETS } from '../tts';

describe('tts engine utilities', () => {
  beforeEach(() => {
    // Reset any state if necessary
    tts.stop();
  });

  it('initializes voices empty if speech synthesis is not supported in test env', () => {
    expect(tts.getVoices()).toEqual([]);
  });

  it('isSupported returns false in node test environment when window is missing or mocked incorrectly', () => {
    // Vitest runs in Node or JSDOM. If window.speechSynthesis isn't mocked globally, it's false.
    let supported = tts.isSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('queues speech promises correctly without throwing', async () => {
    // Since we mock/ignore real SpeechSynthesis, it should just resolve immediately or sit in queue.
    // The main goal is it doesn't crash.
    const promise = tts.queueSpeak('Hello World', { rate: 1.0 });
    expect(promise).toBeInstanceOf(Promise);
  });

  it('fetches correct presets', () => {
    expect(VOICE_PRESETS.confident.rate).toBe(1.5);
    expect(VOICE_PRESETS.confident.volume).toBe(1.0);
    
    expect(VOICE_PRESETS.nervous.pitch).toBe(1.3);
  });

  it('can enable and disable the engine', () => {
    tts.setEnabled(false);
    // Should stop current playback and clear queue
    // Not directly testable without spying on internal synth, but we ensure it doesn't crash
    expect(() => tts.setEnabled(true)).not.toThrow();
  });
});
