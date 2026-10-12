import { TelemetrySession, ToolParam, TenantRecord, DeveloperUser, EndUserVoiceConfig } from '../types';

export const INITIAL_TELEMETRY: TelemetrySession[] = [
  {
    id: 'tlm_01',
    sessionId: 'sess_9a8f2c',
    wakeWord: 'Hey Acme',
    transcript: 'Authorize refund 4920 to customer wallet',
    authStatus: 'verified',
    timeAgo: '2.1s ago',
    actionName: 'refund_order()',
    endpoint: 'POST /api/v2/finance/refund',
    method: 'POST',
    totalLatency: 680,
    asrLatency: 210,
    llmLatency: 290,
    actLatency: 180,
    status: 200,
    statusText: '200 OK',
    voiceConfidence: 0.994,
    taskPayload: {
      amount: 4920,
      currency: 'INR',
      target: 'customer_wallet',
      auth_salt: 'bcrypt$2a$12$e8Jk201948xL0',
      reason: 'automated_voice_intent'
    }
  },
  {
    id: 'tlm_02',
    sessionId: 'sess_81e3d4',
    wakeWord: 'System Action',
    transcript: 'Schedule urgent follow up with lead tds',
    authStatus: 'verified',
    timeAgo: '5.4s ago',
    actionName: 'create_task()',
    endpoint: 'POST /webhooks/linear/tasks',
    method: 'POST',
    totalLatency: 595,
    asrLatency: 150,
    llmLatency: 285,
    actLatency: 160,
    status: 201,
    statusText: '201 Created',
    voiceConfidence: 0.988,
    taskPayload: {
      title: 'Urgent follow up with lead tds',
      priority: 'high',
      due: '2026-10-10T17:00:00Z',
      assignee: 'tds'
    }
  },
  {
    id: 'tlm_03',
    sessionId: 'sess_74bc10',
    wakeWord: 'Talk Engine',
    transcript: 'Fetch recent invoices for Stripe customer 881',
    authStatus: 'verified',
    timeAgo: '9.8s ago',
    actionName: 'lookup_crm()',
    endpoint: 'GET /api/v1/crm/customer/881',
    method: 'GET',
    totalLatency: 740,
    asrLatency: 240,
    llmLatency: 320,
    actLatency: 180,
    status: 200,
    statusText: '200 OK',
    voiceConfidence: 0.991,
    taskPayload: {
      customer_id: 'cus_881928',
      records_returned: 4,
      retrieval_ms: 180
    }
  },
  {
    id: 'tlm_04',
    sessionId: 'sess_63aa99',
    wakeWord: 'Hey Acme',
    transcript: 'Delete customer account permanently',
    authStatus: 'rejected',
    timeAgo: '14s ago',
    actionName: 'delete_account()',
    endpoint: 'DELETE /api/users/8892',
    method: 'DELETE',
    totalLatency: 240,
    asrLatency: 240,
    llmLatency: 0,
    actLatency: 0,
    status: 403,
    statusText: '403 Forbidden',
    voiceConfidence: 0.742,
    taskPayload: {
      error: 'Passphrase mismatch. Elevated privilege blocked.',
      attempted_user: '8892',
      guard_status: 'INTERCEPTED'
    }
  },
  {
    id: 'tlm_05',
    sessionId: 'sess_55bd12',
    wakeWord: 'Hey Acme',
    transcript: 'Scale staging Kubernetes deployment replicas to four',
    authStatus: 'verified',
    timeAgo: '28s ago',
    actionName: 'cluster_deploy()',
    endpoint: 'POST /api/v1/orchestrator/execute',
    method: 'POST',
    totalLatency: 482,
    asrLatency: 110,
    llmLatency: 210,
    actLatency: 162,
    status: 200,
    statusText: '200 OK',
    voiceConfidence: 0.995,
    taskPayload: {
      environment: 'staging',
      replica_count: 4,
      target_patch: 'hotfix_pending'
    }
  }
];

export const INITIAL_PARAMS: ToolParam[] = [
  {
    id: 'param-1',
    name: 'title',
    type: 'string',
    required: true,
    guide: 'Extract task description or actionable summary'
  },
  {
    id: 'param-2',
    name: 'due_date',
    type: 'datetime',
    required: false,
    guide: 'Parse natural date like tomorrow 5pm or next Monday'
  },
  {
    id: 'param-3',
    name: 'priority',
    type: 'enum',
    required: false,
    guide: "Classify urgency into low, medium, or high",
    enumValues: ['low', 'medium', 'high'],
    defaultValue: 'medium'
  },
  {
    id: 'param-4',
    name: 'assignee_id',
    type: 'string',
    required: false,
    guide: 'Match team member name via vector search'
  }
];

export const TENANT_RECORDS: TenantRecord[] = [
  {
    id: 't_01',
    name: 'Acme Workspace',
    initial: 'A',
    appId: 'tenant_acme_prod',
    schemaName: 'schema_acme_v2',
    vectorSpace: 'HNSW cosine (1536d)',
    currentUsage: 1820,
    cap: 2000,
    isolationStatus: 'RLS ENFORCED',
    renderUptime: '99.98%',
    ping: '2ms',
    colorScheme: 'coral'
  },
  {
    id: 't_02',
    name: 'PulseSync Health',
    initial: 'P',
    appId: 'tenant_pulsesync_hipaa',
    schemaName: 'schema_pulse_enc',
    vectorSpace: 'AES-256 HNSW (1536d)',
    currentUsage: 1120,
    cap: 2000,
    isolationStatus: 'RLS ENFORCED',
    renderUptime: '100%',
    ping: '1ms',
    colorScheme: 'amber'
  },
  {
    id: 't_03',
    name: 'LogiWave Logistics',
    initial: 'L',
    appId: 'tenant_logiwave_geo',
    schemaName: 'schema_logi_fleet',
    vectorSpace: 'HNSW euclidean (768d)',
    currentUsage: 2480,
    cap: 2000,
    isolationStatus: 'BUFFER SURGE',
    renderUptime: '99.94%',
    ping: '4ms',
    colorScheme: 'coral'
  },
  {
    id: 't_04',
    name: 'FinFlow Banking',
    initial: 'F',
    appId: 'tenant_finflow_pci',
    schemaName: 'schema_finflow_ledger',
    vectorSpace: 'Dedicated VPC pgvector',
    currentUsage: 940,
    cap: 2000,
    isolationStatus: 'RLS ENFORCED',
    renderUptime: '100%',
    ping: '0.8ms',
    colorScheme: 'cyan'
  }
];

export const PLAYGROUND_PRESETS = [
  {
    label: '“Check database latency”',
    utterance: 'Check database latency and report active pgvector connection count',
    action: 'query_db_metrics()',
    endpoint: 'GET /api/v1/cluster/latency',
    method: 'GET' as const,
    totalLatency: 412,
    asr: 120,
    llm: 180,
    act: 112,
    result: { status: 'optimal', latency_ms: 18, active_pools: 24, p99_ms: 32 }
  },
  {
    label: '“Send deploy notification to Slack”',
    utterance: 'Send deploy notification to Slack engineering channel with staging commit 4f92',
    action: 'slack_broadcast()',
    endpoint: 'POST /webhooks/slack/channel',
    method: 'POST' as const,
    totalLatency: 540,
    asr: 160,
    llm: 220,
    act: 160,
    result: { status: 'dispatched', channel: '#eng-releases', ts: '1728562910.4' }
  },
  {
    label: '“Scale replica set to 4”',
    utterance: 'Scale replica set to 4 in production Kubernetes cluster',
    action: 'k8s_scale()',
    endpoint: 'POST /api/v1/orchestrator/scale',
    method: 'POST' as const,
    totalLatency: 495,
    asr: 140,
    llm: 195,
    act: 160,
    result: { target: 'acme-web-svc', requested: 4, actual: 4, ready: '4/4' }
  },
  {
    label: '“Authorize refund 4920”',
    utterance: 'Authorize refund 4920 to customer wallet under invoice INV-8819',
    action: 'refund_order()',
    endpoint: 'POST /api/v2/finance/refund',
    method: 'POST' as const,
    totalLatency: 680,
    asr: 210,
    llm: 290,
    act: 180,
    result: { refund_id: 'ref_981a349f', amount: 4920, status: 'processed_instantly' }
  }
];

export const DEVELOPER_USERS: DeveloperUser[] = [
  {
    id: 'usr_dev_01',
    name: 'tds',
    appName: 'Acme Product Engine',
    email: 'tds@acme.engineering',
    baseUrl: 'https://api.acme.app/v1',
    unitsUsed: 16800,
    monthlyLimit: 20000,
    planStatus: 'Active',
    joinedDate: 'Jan 14, 2026',
    apiKey: 'tas_live_89f029148b3049a2',
    memoryCount: 142
  },
  {
    id: 'usr_dev_02',
    name: 'tds',
    appName: 'PulseSync Clinical Voice',
    email: 'tds@pulsesync.health',
    baseUrl: 'https://gateway.pulsesync.internal',
    unitsUsed: 1120,
    monthlyLimit: 2000,
    planStatus: 'Active',
    joinedDate: 'Feb 02, 2026',
    apiKey: 'tas_live_33c19284fa0192bc',
    memoryCount: 89
  },
  {
    id: 'usr_dev_03',
    name: 'tds',
    appName: 'LogiWave Fleet Command',
    email: 'tds@logiwave.in',
    baseUrl: 'https://fleet.logiwave.net/api/v2',
    unitsUsed: 2480,
    monthlyLimit: 2000,
    planStatus: 'Warning',
    joinedDate: 'Nov 19, 2025',
    apiKey: 'tas_live_77ab401948ce1992',
    memoryCount: 310
  },
  {
    id: 'usr_dev_04',
    name: 'tds',
    appName: 'FinFlow Pay & Ledger',
    email: 'tds@finflow.bank',
    baseUrl: 'https://core.finflow.bank/voice-relay',
    unitsUsed: 940,
    monthlyLimit: 2000,
    planStatus: 'Active',
    joinedDate: 'Mar 10, 2026',
    apiKey: 'tas_live_99d109247ccb5510',
    memoryCount: 64
  },
  {
    id: 'usr_dev_05',
    name: 'tds',
    appName: 'AutoDeploy Bot Studio',
    email: 'tds@deploybot.io',
    baseUrl: 'https://hooks.deploybot.io/voice',
    unitsUsed: 520,
    monthlyLimit: 1000,
    planStatus: 'Suspended',
    joinedDate: 'Apr 05, 2026',
    apiKey: 'tas_live_11bf491024bb3381',
    memoryCount: 12
  }
];

export const END_USER_VOICE_CONFIGS: EndUserVoiceConfig[] = [
  {
    id: 'cfg_usr_101',
    userId: 'acme_lead_tds',
    developerAppName: 'Acme Product Engine',
    wakePhrase: 'Hey Acme',
    voiceTier: 'Studio Library (Aura)',
    memoryCount: 48,
    lastActive: '2 mins ago',
    securityMode: 'Passphrase Protected'
  },
  {
    id: 'cfg_usr_102',
    userId: 'doctor_tds',
    developerAppName: 'PulseSync Clinical Voice',
    wakePhrase: 'Doctor Assistant',
    voiceTier: 'Cloned (6-Sec)',
    memoryCount: 126,
    lastActive: '14 mins ago',
    securityMode: 'Passphrase Protected'
  },
  {
    id: 'cfg_usr_103',
    userId: 'dispatcher_tds',
    developerAppName: 'LogiWave Fleet Command',
    wakePhrase: 'Fleet Command',
    voiceTier: 'Browser (Free)',
    memoryCount: 74,
    lastActive: '1 hour ago',
    securityMode: 'Standard Voice'
  },
  {
    id: 'cfg_usr_104',
    userId: 'treasury_tds',
    developerAppName: 'FinFlow Pay & Ledger',
    wakePhrase: 'System Action',
    voiceTier: 'Studio Library (Aura)',
    memoryCount: 31,
    lastActive: '3 hours ago',
    securityMode: 'Passphrase Protected'
  }
];

