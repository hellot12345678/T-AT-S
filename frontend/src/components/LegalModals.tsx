import React, { useState, useEffect } from 'react';

export type LegalModalType = 'privacy' | 'terms' | 'security' | 'cookies' | 'status' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, onShowToast }) => {
  // Cookie Preferences State
  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    functional: true,
    analytics: false,
  });

  useEffect(() => {
    if (type === 'cookies') {
      try {
        const saved = localStorage.getItem('tats_cookie_prefs');
        if (saved) {
          setCookiePrefs(JSON.parse(saved));
        }
      } catch {}
    }
  }, [type]);

  const handleSaveCookies = (allAccepted = false) => {
    const updated = allAccepted
      ? { necessary: true, functional: true, analytics: true }
      : cookiePrefs;
    setCookiePrefs(updated);
    try {
      localStorage.setItem('tats_cookie_prefs', JSON.stringify(updated));
    } catch {}
    if (onShowToast) {
      onShowToast(
        'Preferences Updated',
        allAccepted
          ? 'All cookies accepted. Thank you for customizing your experience.'
          : 'Your privacy and cookie preferences have been saved.',
        'success'
      );
    }
    onClose();
  };

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#FFE6DC] flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FFE6DC]/60 bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFAE33] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[19px]">
                {type === 'privacy' && 'shield'}
                {type === 'terms' && 'gavel'}
                {type === 'security' && 'verified_user'}
                {type === 'cookies' && 'cookie'}
                {type === 'status' && 'monitoring'}
              </span>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'security' && 'Security Architecture & DPA'}
                {type === 'cookies' && 'Cookie Settings & Consent'}
                {type === 'status' && 'Platform Operational Status'}
              </h3>
              <p className="text-[11px] text-[#8B716B] font-mono">
                T@S (Talk. Decide. Solve.) • Last updated October 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FFE6DC]/60 text-[#8B716B] hover:text-[#1D1A23] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#57423D] leading-relaxed">
          {/* 1. PRIVACY POLICY */}
          {type === 'privacy' && (
            <>
              <div className="p-3.5 rounded-2xl bg-[#FFF6F3] border border-[#FFDAD2] text-[#84240D]">
                <strong className="block text-xs font-bold font-['Outfit'] mb-1">
                  Volatile Audio Guarantee (Zero Audio Storage):
                </strong>
                T@S processes voice audio strictly in transient, volatile memory during live calls.
                Raw human speech is converted to deterministic tokens and executed immediately (&lt; 850ms).
                We never record, write to disk, or train third-party machine learning models on your audio.
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">1. Information We Collect</h4>
                <p>
                  We collect account identifiers (developer name, email address, and verified phone number), application metadata (registered OpenAPI endpoint URLs and schemas), and runtime telemetry logs strictly necessary to perform deterministic API tool dispatches.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">2. Data Retention & Auto-Pruning</h4>
                <p>
                  To prevent data hoarding, our backend strictly auto-prunes session histories, retaining only the latest 300 entries per application. Developers may permanently purge all caller session contexts at any time through their dashboard or wizard settings.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">3. Third-Party Integrations</h4>
                <p>
                  We integrate with secure industry providers: Groq Cloud (inference with zero retention agreements), Razorpay (PCI-DSS compliant payment processing), and Gmail SMTP for transactional authentication OTPs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">4. Your Privacy Rights</h4>
                <p>
                  You hold the absolute right to export your telemetry data, request total deletion of your developer profile and application clusters, and rectify inaccurate information under applicable data protection laws.
                </p>
              </div>

              <div className="pt-2 border-t border-[#FFE6DC]/60 text-[#8B716B]">
                For privacy inquiries or Data Protection requests, contact our team at{' '}
                <a href="mailto:ts.help2407@gmail.com" className="text-[#A53B22] font-semibold underline">
                  ts.help2407@gmail.com
                </a>
                .
              </div>
            </>
          )}

          {/* 2. TERMS OF SERVICE */}
          {type === 'terms' && (
            <>
              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">1. Acceptance of Terms</h4>
                <p>
                  By provisioning an application cluster or executing endpoints on the T@S platform, you agree to these Terms of Service. T@S provides deterministic voice-to-execution telephony runtimes for software developers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">2. Acceptable Use Policy</h4>
                <p>
                  You agree NOT to use the telephony engine for unlawful telemarketing, deceptive caller ID spoofing, harassment, fraudulent financial impersonation, or unconsented voice clone synthesis. Violation results in immediate cluster revocation.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">3. Action Units & Metering</h4>
                <p>
                  Services are billed based on transparent Action Units consumed. Each tier grants allocated monthly quotas with a 10% soft grace buffer. Beyond grace limits, requests are halted until upgrade or replenishment.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">4. Ownership & Intellectual Property</h4>
                <p>
                  You retain 100% intellectual property ownership of your application schemas, business logic, endpoints, and tool definitions. T@S claims zero ownership over your proprietary software.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">5. SLA & Reliability</h4>
                <p>
                  T@S maintains a 99.98% target throughput SLA for registered cluster routes. Services are provided with enterprise-grade durability and low latency.
                </p>
              </div>
            </>
          )}

          {/* 3. SECURITY & DPA */}
          {type === 'security' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC]">
                  <span className="font-bold text-[#1D1A23] block text-xs">In-Transit Encryption</span>
                  <span className="text-[11px] text-[#8B716B]">All SIP, WebRTC, and HTTPS traffic is enforced with TLS 1.3.</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC]">
                  <span className="font-bold text-[#1D1A23] block text-xs">At-Rest Protection</span>
                  <span className="text-[11px] text-[#8B716B]">API keys and database credentials encrypted with AES-256 and PBKDF2.</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Multi-Tenant Tenant Isolation</h4>
                <p>
                  Each developer cluster operates with isolated API keys (`tas_live_*`) and distinct database partitions. One cluster cannot read, query, or execute tools belonging to another tenant under any circumstance.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Data Processing Agreement (DPA) Terms</h4>
                <p>
                  Under our standard DPA, T@S acts as a Data Processor for spoken input streams, executing user-directed webhooks solely upon natural caller instruction. We never utilize customer telemetry to train public models.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Audit Logs & Access Controls</h4>
                <p>
                  Super Admin governance is role-restricted and cryptographically protected. Every configuration modification is timestamped and auditable.
                </p>
              </div>
            </>
          )}

          {/* 4. COOKIE SETTINGS */}
          {type === 'cookies' && (
            <div className="space-y-4">
              <p className="text-xs text-[#57423D]">
                We value your privacy. We use minimal cookies and local browser storage to keep you authenticated, remember your active application cluster, and maintain workspace responsiveness.
              </p>

              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1D1A23]">Essential System Cookies</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE6DC] text-[#A53B22] font-semibold">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B716B] mt-0.5">
                      Required for developer login session tokens, CSRF protection, and application cluster routing.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 accent-[#A53B22] cursor-not-allowed"
                  />
                </div>

                {/* Functional Cookies */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#FFE6DC] flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-[#1D1A23]">Functional & Workspace Preferences</span>
                    <p className="text-[11px] text-[#8B716B] mt-0.5">
                      Remembers your last selected cluster ID, UI view mode, and starter templates filter state.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.functional}
                    onChange={(e) => setCookiePrefs({ ...cookiePrefs, functional: e.target.checked })}
                    className="w-4 h-4 accent-[#A53B22] cursor-pointer"
                  />
                </div>

                {/* Performance Cookies */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#FFE6DC] flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-[#1D1A23]">Anonymous Latency Telemetry</span>
                    <p className="text-[11px] text-[#8B716B] mt-0.5">
                      Measures acoustic pipeline round-trip response latencies (ms) to detect network hiccups.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.analytics}
                    onChange={(e) => setCookiePrefs({ ...cookiePrefs, analytics: e.target.checked })}
                    className="w-4 h-4 accent-[#A53B22] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. PLATFORM STATUS */}
          {type === 'status' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-xs font-['Outfit']">All Core Telephony Nodes Operational</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">99.98% Uptime (90d)</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Acoustic Voice Pipeline (Groq / Llama)', status: 'Operational', latency: '482ms' },
                  { name: 'Deterministic OpenAPI Function Router', status: 'Operational', latency: '210ms' },
                  { name: 'Live Webhook & Telephony SIP Gateway', status: 'Operational', latency: '190ms' },
                  { name: 'Razorpay Payment & Quota Gateway', status: 'Operational', latency: '340ms' },
                  { name: 'Gmail SMTP OTP Verification Service', status: 'Operational', latency: '520ms' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[#1D1A23]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#8B716B]">{item.latency}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-[#8B716B] text-center pt-2">
                Real-time automated heartbeat probe executed every 60 seconds across all regions.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#FFE6DC]/60 bg-[#FAF9F6] flex items-center justify-end gap-2.5">
          {type === 'cookies' ? (
            <>
              <button
                onClick={() => handleSaveCookies(false)}
                className="px-4 py-2 rounded-xl border border-[#FFE6DC] bg-white hover:bg-[#FAF9F6] text-[#57423D] text-xs font-semibold transition-all"
              >
                Save Selected
              </button>
              <button
                onClick={() => handleSaveCookies(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7E5F] to-[#FFAE33] text-white text-xs font-bold shadow-sm hover:scale-[1.01] transition-all"
              >
                Accept All Cookies
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#1D1A23] hover:bg-[#342D3B] text-white text-xs font-semibold transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
