export type AgentState = 
  | 'idle' 
  | 'listening' 
  | 'wake_detected' 
  | 'thinking' 
  | 'speaking' 
  | 'error';

export type VoiceTier = 'BROWSER' | 'LIBRARY' | 'CLONED';

export interface UIEvent {
  type: string;
  data: any;
  tool?: string;
  timestamp?: number;
}

export interface UnitMetrics {
  consumed: number;
  remaining: number;
}

export interface ChatResponse {
  session_id: string;
  speech_response: string;
  events: UIEvent[];
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, any>;
    status?: string;
  }>;
  units?: UnitMetrics;
  latencies?: {
    asr_ms?: number;
    llm_ms?: number;
    api_ms?: number;
    tts_ms?: number;
    total_ms?: number;
  };
}

export interface TATSConfig {
  apiKey: string;
  apiUrl?: string;
  userId: string;
  sessionId?: string;
  wakeWord?: string;
  continuousListening?: boolean;
  voiceTier?: VoiceTier;
  speechRate?: number;
  speechPitch?: number;
  lang?: string;
  onStateChange?: (state: AgentState) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (response: ChatResponse) => void;
  onEvent?: (event: UIEvent) => void;
  onError?: (error: Error | string) => void;
}
