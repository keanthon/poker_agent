// Text-to-Speech system using Web Speech API

export interface TTSOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private queue: { text: string; options: TTSOptions }[] = [];
  private isSpeaking = false;
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Voices are loaded asynchronously
      if (this.synth) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Get a distinct voice for an agent based on index
  getVoiceForAgent(agentIndex: number): SpeechSynthesisVoice | undefined {
    if (this.voices.length === 0) return undefined;
    
    // Try to pick different English voices
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      return englishVoices[agentIndex % englishVoices.length];
    }
    return this.voices[agentIndex % this.voices.length];
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled || !this.synth) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options.voice) utterance.voice = options.voice;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      this.synth.speak(utterance);
    });
  }

  // Queue speech and process sequentially
  async queueSpeak(text: string, options: TTSOptions = {}): Promise<void> {
    this.queue.push({ text, options });
    if (!this.isSpeaking) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    this.isSpeaking = true;
    const { text, options } = this.queue.shift()!;
    
    try {
      await this.speak(text, options);
    } catch (error) {
      console.error('TTS error:', error);
    }

    await this.processQueue();
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
  }

  // Check if TTS is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// Singleton instance
export const tts = new TTSEngine();

// Voice personality presets
export const VOICE_PRESETS: Record<string, TTSOptions> = {
  confident: { rate: 1.5, pitch: 0.95, volume: 1.0 },
  nervous: { rate: 1.7, pitch: 1.3, volume: 0.8 },
  aggressive: { rate: 1.5, pitch: 0.8, volume: 1.0 },
  friendly: { rate: 1.55, pitch: 1.1, volume: 0.9 },
  neutral: { rate: 1.5, pitch: 1.0, volume: 0.9 },
  thoughtful: { rate: 2.0, pitch: 0.9, volume: 0.7 }, // For internal thoughts
};

// Speak with personality
export async function speakWithPersonality(
  text: string,
  personality: keyof typeof VOICE_PRESETS,
  voice?: SpeechSynthesisVoice
): Promise<void> {
  const options = { ...VOICE_PRESETS[personality], voice };
  return tts.queueSpeak(text, options);
}
