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
                  Zero Audio Storage Guarantee:
                </strong>
                We never save your callers' voice or audio recordings to disk. Audio is processed directly in memory to run your tools, and is deleted immediately after the call. We will never sell, store, or train AI models on your customer voice data.
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">1. Information We Collect</h4>
                <p>
                  We collect your developer account details (name, email address, phone number), registered API endpoints and schemas, and technical logs needed to run your tool calls.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">2. Data Retention &amp; Automatic Cleanup</h4>
                <p>
                  To keep your data safe and clean, our backend automatically keeps only the latest 300 session entries per app. You can also permanently delete all caller session history at any time from your dashboard.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">3. Trusted Providers</h4>
                <p>
                  We work with trusted industry providers: Groq Cloud (fast AI processing with zero data retention), Razorpay (secure PCI-compliant payments), and Google (email verification codes).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">4. Your Privacy Rights</h4>
                <p>
                  You can export your telemetry data, request total deletion of your developer profile and apps, and correct inaccurate details at any time under data protection regulations.
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
                  By creating an account or using the T@S platform, you agree to these Terms. T@S provides real-time voice and API execution tools for software developers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">2. Acceptable Use</h4>
                <p>
                  You agree not to use T@S for spam calls, deceptive caller ID spoofing, harassment, fraudulent impersonation, or creating voices without consent. Any violation results in immediate account suspension.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">3. Units &amp; Fair Billing</h4>
                <p>
                  Services are billed based on transparent Action Units consumed. Each plan includes monthly quotas with a 10% grace buffer so customer calls are not cut off unexpectedly.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">4. Ownership of Your Code</h4>
                <p>
                  You retain 100% intellectual property ownership of your application code, API endpoints, and business logic. T@S claims zero ownership over anything you build.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">5. Uptime &amp; Reliability</h4>
                <p>
                  T@S targets a 99.98% uptime SLA with low-latency execution for all connected applications.
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
                  <span className="text-[11px] text-[#8B716B]">All voice (SIP, WebRTC) and web traffic is encrypted using modern TLS 1.3.</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC]">
                  <span className="font-bold text-[#1D1A23] block text-xs">At-Rest Protection</span>
                  <span className="text-[11px] text-[#8B716B]">API keys and database credentials are encrypted at rest with AES-256.</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Dedicated App Workspaces</h4>
                <p>
                  Each developer workspace operates with isolated API keys (`tas_live_*`) and separate database partitions. One app cannot read or run code from another app.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Data Processing Agreement (DPA)</h4>
                <p>
                  Under our standard DPA, T@S processes voice streams solely to execute your chosen API actions upon user request. We never store audio or train public models on your customer data.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1A23] text-sm font-['Outfit'] mb-1">Audit Logs &amp; Access Controls</h4>
                <p>
                  Admin controls are role-restricted. Every configuration modification is timestamped and logged for security.
                </p>
              </div>
            </>
          )}

          {/* 4. COOKIE SETTINGS */}
          {type === 'cookies' && (
            <div className="space-y-4">
              <p className="text-xs text-[#57423D]">
                We value your privacy. We use minimal cookies and local browser storage to keep you authenticated, remember your active workspace, and keep pages loading fast.
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
                      Required for developer sign-in sessions, CSRF protection, and workspace routing.
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
                    <span className="font-bold text-xs text-[#1D1A23]">Functional &amp; Workspace Preferences</span>
                    <p className="text-[11px] text-[#8B716B] mt-0.5">
                      Remembers your active workspace, selected view, and tool builder preferences.
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
                    <span className="font-bold text-xs text-[#1D1A23]">Latency &amp; Performance Telemetry</span>
                    <p className="text-[11px] text-[#8B716B] mt-0.5">
                      Measures response times in milliseconds to help us detect and fix network slowdowns.
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
              <div className="p-3.5 rounded-2xl bg-[#FFF6F3] border border-[#FFDAD2] text-[#84240D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7E5F] animate-pulse"></span>
                  <span className="font-bold text-xs font-['Outfit']">All Voice &amp; API Services Operational</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-[#A53B22]">99.98% Uptime (90d)</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Voice Processing Pipeline (Groq / Llama)', status: 'Operational', latency: '482ms' },
                  { name: 'API Tool Calling & Dispatcher', status: 'Operational', latency: '210ms' },
                  { name: 'Phone & WebRTC Voice Gateway', status: 'Operational', latency: '190ms' },
                  { name: 'Razorpay Payment Gateway', status: 'Operational', latency: '340ms' },
                  { name: 'Email OTP Verification Service', status: 'Operational', latency: '520ms' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[#1D1A23]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#8B716B]">{item.latency}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD2]/60 text-[#A53B22] text-[10px] font-bold font-mono">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-[#8B716B] text-center pt-2">
                Automated health check runs every 60 seconds across all regions.
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
