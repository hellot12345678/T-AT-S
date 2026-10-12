/**
 * Web SpeechSynthesis TTS Manager.
 * Zero-cost speech output using browser native voices.
 */
export class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private lang: string = 'en-US';

  constructor(options?: { rate?: number; pitch?: number; lang?: string }) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.rate = options?.rate ?? 1.0;
      this.pitch = options?.pitch ?? 1.0;
      this.lang = options?.lang ?? 'en-US';
      this.initVoice();
    }
  }

  private initVoice(): void {
    if (!this.synth) return;

    const selectBestVoice = () => {
      const voices = this.synth?.getVoices() || [];
      // Prefer modern natural English voices
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny'))
      );
      this.voice = preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
    };

    selectBestVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = selectBestVoice;
    }
  }

  public speak(
    text: string,
    callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }
  ): void {
    if (!this.synth) {
      callbacks?.onEnd?.();
      return;
    }

    // Stop ongoing speech before playing new audio
    this.stop();

    if (!text || text.trim().length === 0) {
      callbacks?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = this.lang;

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      callbacks?.onEnd?.();
    };

    utterance.onerror = (e) => {
      // If cancelled by another speak call, do not treat as error
      if (e.error !== 'canceled') {
        callbacks?.onError?.(e);
      }
      callbacks?.onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}

