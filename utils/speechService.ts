/**
 * Browser Web Speech API text-to-speech helper with Tamil and English voice support.
 */

export interface SpeechStateCallback {
  (isPlaying: boolean): void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speak(
    text: string,
    lang: 'ta' | 'en',
    onStateChange?: SpeechStateCallback
  ): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Stop ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Select language & voice
    if (lang === 'ta') {
      utterance.lang = 'ta-IN';
      // Look for Tamil voice if present
      const voices = this.synth.getVoices();
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
    } else {
      utterance.lang = 'en-IN';
      const voices = this.synth.getVoices();
      const enVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStateChange) onStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onStateChange) onStateChange(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onStateChange) onStateChange(false);
    };

    this.synth.speak(utterance);
  }

  public stop(onStateChange?: SpeechStateCallback): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onStateChange) onStateChange(false);
    }
  }

  public getStatus(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
