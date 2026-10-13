/**
 * T@S Backend API Client.
 * Connects the dashboard, playground, and billing directly to the Django Acoustic Action Engine.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export class TATSBackendAPI {
  public static getApiKey(): string | null {
    return localStorage.getItem('tats_api_key');
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('tats_api_key', key);
  }

  public static clearApiKey(): void {
    localStorage.removeItem('tats_api_key');
  }

  public static getToken(): string | null {
    return localStorage.getItem('tats_dev_token');
  }

  public static setToken(token: string): void {
    localStorage.setItem('tats_dev_token', token);
  }

  public static clearToken(): void {
    localStorage.removeItem('tats_dev_token');
    localStorage.removeItem('tats_dev_profile');
    localStorage.removeItem('tats_api_key');
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
      } else {
        const apiKey = this.getApiKey();
        if (apiKey) {
          headers['Authorization'] = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
        }
      }
    }

    return headers;
  }

  // ==========================================
  // Health & System Status
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

  public static async checkSystemStatus(): Promise<{
    is_initialized: boolean;
    admin_exists: boolean;
    developers_count: number;
    first_user_becomes_admin: boolean;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/system-status/`, { method: 'GET' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ==========================================
  // Developer Auth & OTP Verification
  // ==========================================
  public static async register(name: string, email: string, phone: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password: password || undefined }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async loginRequestOTP(email: string) {
    const res = await fetch(`${API_BASE}/auth/login-request-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async verifyOTP(email: string, otp: string, purpose: string = 'REGISTER') {
    const res = await fetch(`${API_BASE}/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
      if (data.developer) {
        this.setCurrentDeveloper(data.developer);
      }
    }
    return { ok: res.ok, status: res.status, data };
  }

  public static async resendOTP(email: string, purpose: string = 'REGISTER') {
    const res = await fetch(`${API_BASE}/auth/resend-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async recoverEmail(phone: string) {
    const res = await fetch(`${API_BASE}/auth/recover-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async resetPassword(email: string, otp: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
      if (data.developer) {
        this.setCurrentDeveloper(data.developer);
      }
    }
    return { ok: res.ok, status: res.status, data };
  }

  public static async login(identifier: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
      if (data.developer) {
        this.setCurrentDeveloper(data.developer);
      }
    }
    return { ok: res.ok, status: res.status, data };
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

  public static async updateProfile(payload: { name?: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.developer) {
      this.setCurrentDeveloper(data.developer);
    }
    return { ok: res.ok, status: res.status, data };
  }

  public static async changePassword(payload: { old_password: string; new_password: string }) {
    const res = await fetch(`${API_BASE}/auth/change-password/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  // ==========================================
  // Application Management
  // ==========================================
  public static async getApplications() {
    const token = this.getToken();
    if (!token) return null;

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

  public static async updateApplication(appId: string, payload: { app_name?: string; base_url?: string; wake_word_policy?: string }) {
    const res = await fetch(`${API_BASE}/apps/${appId}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async regenerateAppKey(appId: string) {
    const res = await fetch(`${API_BASE}/apps/${appId}/regenerate-keys/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Dynamic Real Notifications
  // ==========================================
  public static async getNotifications() {
    const token = this.getToken();
    if (!token) return { unread_count: 0, notifications: [] };

    try {
      const res = await fetch(`${API_BASE}/notifications/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) return { unread_count: 0, notifications: [] };
      return await res.json();
    } catch {
      return { unread_count: 0, notifications: [] };
    }
  }

  public static async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return { ok: res.ok, data: await res.json() };
  }

  public static async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Razorpay Payments & Subscriptions
  // ==========================================
  public static async createRazorpayOrder(planTier: string = 'GROWTH_STARTUP', appId?: string, units?: number) {
    const res = await fetch(`${API_BASE}/payments/create-order/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ plan_tier: planTier, app_id: appId, units: units || undefined }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async addBonusUnits(appId: string, units: number, reason: string = 'Developer Credit Topup') {
    const res = await fetch(`${API_BASE}/apps/${appId}/add-bonus/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ units, reason }),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  public static async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    app_id?: string;
  }) {
    const res = await fetch(`${API_BASE}/payments/verify/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  // ==========================================
  // Tool Registry
  // ==========================================
  public static async getTools(apiKey?: string) {
    const key = apiKey || this.getApiKey();
    if (!key) return null;

    const res = await fetch(`${API_BASE}/tools/`, {
      method: 'GET',
      headers: this.getHeaders(key),
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
  public static async getUserConfig(clientUserId: string = 'default_user') {
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(clientUserId)}/config/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

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
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  public static async updatePlatformConfig(config: Record<string, any>) {
    const res = await fetch(`${API_BASE}/admin/config/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return { ok: res.ok, data: await res.json() };
  }

  public static async getGovernanceData() {
    const res = await fetch(`${API_BASE}/admin/governance/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  public static async toggleDeveloperStatus(devId: string) {
    const res = await fetch(`${API_BASE}/admin/developers/${encodeURIComponent(devId)}/toggle-status/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return { ok: res.ok, data: await res.json() };
  }

  // ==========================================
  // Developer Profile Local Storage
  // ==========================================
  public static getCurrentDeveloper(): {
    id: string;
    name: string;
    email: string;
    phone?: string;
    is_admin?: boolean;
    is_verified?: boolean;
  } | null {
    const item = localStorage.getItem('tats_dev_profile');
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  public static setCurrentDeveloper(profile: any): void {
    if (profile) {
      localStorage.setItem('tats_dev_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('tats_dev_profile');
    }
  }
}
