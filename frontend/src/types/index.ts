export type AppView =
  | 'landing'
  | 'developer-dashboard'
  | 'visual-tool-builder'
  | 'live-voice-playground'
  | 'super-admin'
  | 'component-wizard'
  | 'auth';

export interface TelemetrySession {
  id: string;
  sessionId: string;
  wakeWord: string;
  transcript: string;
  authStatus: 'verified' | 'rejected';
  timeAgo: string;
  actionName: string;
  endpoint: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT';
  totalLatency: number;
  asrLatency: number;
  llmLatency: number;
  actLatency: number;
  status: number;
  statusText: string;
  taskPayload?: Record<string, any>;
  voiceConfidence: number;
}

export interface ToolParam {
  id: string;
  name: string;
  type: 'string' | 'datetime' | 'enum' | 'number' | 'boolean';
  required: boolean;
  guide: string;
  enumValues?: string[];
  defaultValue?: string;
}

export interface TenantRecord {
  id: string;
  name: string;
  initial: string;
  appId: string;
  schemaName: string;
  vectorSpace: string;
  currentUsage: number;
  cap: number;
  isolationStatus: 'RLS ENFORCED' | 'BUFFER SURGE' | 'AIR-GAPPED';
  renderUptime: string;
  ping: string;
  colorScheme: 'coral' | 'amber' | 'cyan' | 'slate';
}

export interface DeveloperUser {
  id: string;
  name: string;
  appName: string;
  email: string;
  baseUrl: string;
  unitsUsed: number;
  monthlyLimit: number;
  planStatus: 'Active' | 'Warning' | 'Suspended';
  joinedDate: string;
  apiKey: string;
  memoryCount: number;
}

export interface EndUserVoiceConfig {
  id: string;
  userId: string;
  developerAppName: string;
  wakePhrase: string;
  voiceTier: 'Browser (Free)' | 'Studio Library (Aura)' | 'Cloned (6-Sec)';
  memoryCount: number;
  lastActive: string;
  securityMode: 'Passphrase Protected' | 'Standard Voice';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}
