/**
 * T@S Backend API Client.
 * Connects the dashboard and playground directly to the Django Acoustic Action Engine.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export class TATSBackendAPI {
  private static getToken(): string | null {
    return localStorage.getItem('tats_dev_token');
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
}
