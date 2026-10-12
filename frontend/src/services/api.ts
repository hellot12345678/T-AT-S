/**
 * T@S Backend API Client.
 * Connects the dashboard and playground directly to the Django Acoustic Action Engine.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export class TATSBackendAPI {
  public static readonly DEFAULT_DEMO_API_KEY = 'tas_live_a2fb9c89abcb4d74951548ac001c5707';
  public static readonly DEFAULT_DEMO_DEV_TOKEN = 'tas_dev_5e70d2e115a544f7b23d596380202e16';

  public static getApiKey(): string {
    return localStorage.getItem('tats_api_key') || this.DEFAULT_DEMO_API_KEY;
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('tats_api_key', key);
  }

  public static getToken(): string | null {
    return localStorage.getItem('tats_dev_token') || this.DEFAULT_DEMO_DEV_TOKEN;
  }

  public static setToken(token: string): void {
    localStorage.setItem('tats_dev_token', token);
  }

  public static clearToken(): void {
    localStorage.removeItem('tats_dev_token');
  }

  private static getHeaders(customAuth?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (customAuth) {
      headers['Authorization'] = customAuth.startsWith('Bearer ') ? customAuth : `Bearer ${customAuth}`;
    } else {
      const devToken = this.getToken();
      if (devToken) {
        headers['Authorization'] = `Bearer ${devToken}`;
      }
    }

    return headers;
  }

  // ==========================================
  // Health & Ping
  // ==========================================
  public static async checkHealth(): Promise<{ status: string; service: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/health/`, { method: 'GET' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ==========================================
  // Developer Auth
  // ==========================================
  public static async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
    }
    return { ok: res.ok, data };
  }

  public static async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
    }
    return { ok: res.ok, data };
  }

  public static async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  public static async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  // ==========================================
  // Application Management
  // ==========================================
  public static async getApplications() {
    const res = await fetch(`${API_BASE}/apps/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  public static async createApplication(appName: string, baseUrl: string, wakeWordPolicy: string = 'CUSTOM') {
    const res = await fetch(`${API_BASE}/apps/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ app_name: appName, base_url: baseUrl, wake_word_policy: wakeWordPolicy }),
    });
    return { ok: res.ok, data: await res.json() };
  }

  public static async regenerateAppKey(appId: string) {
    const res = await fetch(`${API_BASE}/apps/${appId}/regenerate-keys/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Tool Registry
  // ==========================================
  public static async getTools(apiKey: string) {
    const res = await fetch(`${API_BASE}/tools/`, {
      method: 'GET',
      headers: this.getHeaders(apiKey),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  public static async registerTool(apiKey: string, toolData: {
    name: string;
    description: string;
    endpoint: string;
    method?: string;
    parameters_schema?: Record<string, any>;
  }) {
    const res = await fetch(`${API_BASE}/tools/register/`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(toolData),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Agent Chat / Voice Execution
  // ==========================================
  public static async chat(apiKey: string, payload: {
    client_user_id: string;
    session_id: string;
    message: string;
    passphrase?: string;
    is_voice?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        ...payload,
        is_voice: payload.is_voice ?? true,
      }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  // ==========================================
  // Session Telemetry
  // ==========================================
  public static async getSessionTelemetry(appId: string) {
    const res = await fetch(`${API_BASE}/apps/${appId}/sessions/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  // ==========================================
  // End User Config
  // ==========================================
  public static async saveUserConfig(clientUserId: string, config: {
    wake_word: string;
    passphrase?: string;
    voice_tier?: string;
  }) {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(clientUserId)}/config/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Super Admin Platform Config
  // ==========================================
  public static async getPlatformConfig() {
    const res = await fetch(`${API_BASE}/admin/config/`, {
      method: 'GET',
    });
    if (!res.ok) return null;
    return await res.json();
  }

  public static async updatePlatformConfig(config: Record<string, any>) {
    const res = await fetch(`${API_BASE}/admin/config/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Developer Profile Local Storage
  // ==========================================
  public static getCurrentDeveloper(): { id: string; name: string; email: string } | null {
    const item = localStorage.getItem('tats_dev_profile');
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  public static setCurrentDeveloper(profile: { id: string; name: string; email: string } | null): void {
    if (profile) {
      localStorage.setItem('tats_dev_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('tats_dev_profile');
    }
  }
}

