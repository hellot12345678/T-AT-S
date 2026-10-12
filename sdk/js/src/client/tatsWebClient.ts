import { TATSConfig, AgentState, ChatResponse, UIEvent } from './types';
import { ASRManager } from '../audio/speechRecognition';
import { TTSManager } from '../audio/speechSynthesis';
import { WakeWordDetector } from '../audio/wakeWordDetector';

export class TATSWebClient {
  private config: TATSConfig;
  private asr: ASRManager;
  private tts: TTSManager;
  private wakeDetector: WakeWordDetector;
  private state: AgentState = 'idle';
  private sessionId: string;
  private isAwake: boolean = false;

  constructor(config: TATSConfig) {
    this.config = {
      apiUrl: 'http://127.0.0.1:8000',
      wakeWord: 'Hey T@S',
      continuousListening: true,
      speechRate: 1.0,
      speechPitch: 1.0,
      lang: 'en-US',
      ...config,
    };

    this.sessionId = this.config.sessionId || `tats_sess_${Math.random().toString(36).substring(2, 11)}`;
    this.wakeDetector = new WakeWordDetector(this.config.wakeWord);
    this.tts = new TTSManager({
      rate: this.config.speechRate,
      pitch: this.config.speechPitch,
      lang: this.config.lang,
    });
    this.asr = new ASRManager({
      lang: this.config.lang,
      silenceTimeoutMs: 1600,
    });

    this.initListeners();
  }

  private initListeners(): void {
    // 1. Transcription listener
    this.asr.onTranscript = (text, isFinal) => {
      this.config.onTranscript?.(text, isFinal);

      // Check for wake word if agent is in standby
      if (!this.isAwake) {
        const check = this.wakeDetector.check(text);
        if (check.detected) {
          this.isAwake = true;
          this.setState('wake_detected');

          // If the user spoke the command in the same sentence (e.g. "Hey T@S create a task")
          if (check.command && check.command.length > 2) {
            this.sendQuery(check.command);
          } else {
            // Otherwise transition to active listening
            this.setState('listening');
          }
        }
      }
    };

    // 2. Utterance completed (user paused speaking)
    this.asr.onUtteranceComplete = (completedText) => {
      if (this.isAwake && this.state !== 'thinking' && this.state !== 'speaking') {
        const check = this.wakeDetector.check(completedText);
        const query = check.detected && check.command ? check.command : completedText;
        if (query.trim().length > 0) {
          this.sendQuery(query.trim());
        }
      }
    };

    // 3. Status and Error listeners
    this.asr.onStatusChange = (isListening) => {
      if (!isListening && this.state === 'listening') {
        this.setState('idle');
      }
    };

    this.asr.onError = (err) => {
      this.config.onError?.(err);
    };
  }

  public setState(newState: AgentState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.config.onStateChange?.(newState);
    }
  }

  public getState(): AgentState {
    return this.state;
  }

  public startListening(): void {
    this.asr.start();
    this.setState('listening');
  }

  public stopListening(): void {
    this.asr.stop();
    this.isAwake = false;
    this.setState('idle');
  }

  public triggerWake(): void {
    this.isAwake = true;
    this.setState('listening');
    if (!this.asr.isListening()) {
      this.asr.start();
    }
  }

  public async sendQuery(queryText: string): Promise<ChatResponse | null> {
    if (!queryText || queryText.trim().length === 0) return null;

    this.setState('thinking');

    try {
      const endpoint = `${(this.config.apiUrl || '').replace(/\/+$/, '')}/api/v1/chat/`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          client_user_id: String(this.config.userId),
          session_id: this.sessionId,
          message: queryText,
          is_voice: true,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`T@S Engine HTTP ${res.status}: ${errorText}`);
      }

      const data: ChatResponse = await res.json();
      this.config.onResponse?.(data);

      // Fire UI events received from executed tools
      if (data.events && Array.isArray(data.events)) {
        for (const event of data.events) {
          this.config.onEvent?.(event);
        }
      }

      // Play synthesized voice reply
      if (data.speech_response) {
        this.speak(data.speech_response);
      } else {
        this.setState(this.config.continuousListening ? 'listening' : 'idle');
      }

      return data;
    } catch (err: any) {
      this.setState('error');
      this.config.onError?.(err);
      setTimeout(() => {
        this.setState(this.config.continuousListening ? 'listening' : 'idle');
      }, 3000);
      return null;
    }
  }

  public speak(text: string): void {
    this.setState('speaking');
    this.tts.speak(text, {
      onEnd: () => {
        // Return to listening standby after speaking
        this.isAwake = false;
        this.setState(this.config.continuousListening ? 'listening' : 'idle');
      },
      onError: (err) => {
        this.config.onError?.(err);
        this.setState(this.config.continuousListening ? 'listening' : 'idle');
      },
    });
  }

  public stopSpeaking(): void {
    this.tts.stop();
    this.setState('idle');
  }

  public setWakeWord(wakeWord: string): void {
    this.config.wakeWord = wakeWord;
    this.wakeDetector.setWakeWord(wakeWord);
  }

  public destroy(): void {
    this.asr.stop();
    this.tts.stop();
    this.setState('idle');
  }
}
