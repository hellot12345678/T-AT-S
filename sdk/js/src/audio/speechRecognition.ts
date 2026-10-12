/**
 * Web SpeechRecognition STT Manager.
 * Zero-cloud-cost continuous speech listener with automatic restart and silence endpointing.
 */

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class ASRManager {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldRestart: boolean = false;
  private lang: string = 'en-US';
  private silenceTimer: any = null;
  private currentUtterance: string = '';
  private silenceTimeoutMs: number = 1500;

  public onTranscript?: (text: string, isFinal: boolean) => void;
  public onUtteranceComplete?: (text: string) => void;
  public onError?: (error: any) => void;
  public onStatusChange?: (isListening: boolean) => void;

  constructor(options?: { lang?: string; silenceTimeoutMs?: number }) {
    this.lang = options?.lang ?? 'en-US';
    this.silenceTimeoutMs = options?.silenceTimeoutMs ?? 1500;
    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return;
    }

    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;

    this.recognition.onstart = () => {
      this.isRunning = true;
      this.onStatusChange?.(true);
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }

      const activeText = (final || interim).trim();
      if (activeText) {
        this.currentUtterance = activeText;
        this.onTranscript?.(activeText, Boolean(final));

        // Reset silence timer on incoming speech
        this.resetSilenceTimer();
      }
    };

    this.recognition.onerror = (event: any) => {
      // Ignore routine 'no-speech' network blips during continuous standby
      if (event.error !== 'no-speech') {
        this.onError?.(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      this.onStatusChange?.(false);

      // Auto-restart if continuous listening is requested
      if (this.shouldRestart) {
        try {
          this.recognition.start();
        } catch {
          setTimeout(() => {
            if (this.shouldRestart) this.recognition?.start();
          }, 300);
        }
      }
    };
  }

  public start(): void {
    if (!this.recognition) return;
    this.shouldRestart = true;
    if (!this.isRunning) {
      try {
        this.recognition.start();
      } catch (err) {
        // Recognition already active
      }
    }
  }

  public stop(): void {
    this.shouldRestart = false;
    this.clearSilenceTimer();
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.currentUtterance.trim().length > 0) {
        const completedText = this.currentUtterance.trim();
        this.currentUtterance = '';
        this.onUtteranceComplete?.(completedText);
      }
    }, this.silenceTimeoutMs);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public isListening(): boolean {
    return this.isRunning;
  }
}
