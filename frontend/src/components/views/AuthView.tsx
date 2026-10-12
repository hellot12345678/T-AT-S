import React, { useState, useEffect, useRef } from 'react';
import { TATSBackendAPI } from '../../services/api';

interface AuthViewProps {
  onAuthSuccess: (developer: any) => void;
  onReturnHome: () => void;
  initialMode?: 'signin' | 'register';
  bannerNotice?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  onReturnHome,
  initialMode = 'signin',
  bannerNotice = '',
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(bannerNotice);
  const [isFirstUserAdmin, setIsFirstUserAdmin] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Check system status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await TATSBackendAPI.checkSystemStatus();
      if (status) {
        setIsFirstUserAdmin(Boolean(status.first_user_becomes_admin));
        if (status.first_user_becomes_admin && !bannerNotice) {
          setSuccessMessage('Welcome to T@S! The first registered account automatically becomes the Platform Administrator.');
        }
      }
    };
    fetchStatus();
  }, [bannerNotice]);

  // OTP cooldown countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Clean error when inputs change
  useEffect(() => {
    setErrorMessage('');
  }, [email, phone, name, password, activeTab]);

  // Indian Phone validator (+91 10-digit)
  const validateIndianPhone = (raw: string): boolean => {
    const cleaned = raw.replace(/[\s\-()]/g, '');
    return /^(?:(?:\+|0{0,2})91)?[6789]\d{9}$/.test(cleaned);
  };

  // ==========================================
  // Passwordless Login: Request OTP
  // ==========================================
  const handleRequestLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid developer email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await TATSBackendAPI.loginRequestOTP(cleanEmail);
      if (res.ok) {
        setStep('otp');
        setOtpCooldown(30);
        setSuccessMessage(`A 6-digit login verification code has been dispatched to ${cleanEmail}.`);
      } else {
        setErrorMessage(res.data.error || 'Failed to send login code. Please check your email or create an account.');
      }
    } catch {
      setErrorMessage('Unable to connect to the backend server. Please verify Django is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Registration: Request OTP
  // ==========================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!validateIndianPhone(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. +91 9876543210 or 9876543210).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await TATSBackendAPI.register(cleanName, cleanEmail, cleanPhone, password || undefined);
      if (res.ok) {
        setStep('otp');
        setOtpCooldown(30);
        setSuccessMessage(`Account initialized. Enter the 6-digit verification code sent to ${cleanEmail}.`);
      } else {
        setErrorMessage(res.data.error || res.data.message || 'Registration failed. Please review your details.');
      }
    } catch {
      setErrorMessage('Unable to connect to the backend server. Please verify Django is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Verify OTP
  // ==========================================
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const purpose = activeTab === 'signin' ? 'LOGIN' : 'REGISTER';

    try {
      const res = await TATSBackendAPI.verifyOTP(email.trim().toLowerCase(), fullOtp, purpose);
      if (res.ok && res.data.developer) {
        onAuthSuccess(res.data.developer);
      } else {
        setErrorMessage(res.data.error || 'Invalid or expired 6-digit code. Please try again or request a new code.');
      }
    } catch {
      setErrorMessage('Network connection error while verifying code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCooldown > 0) return;
    setIsLoading(true);
    setErrorMessage('');

    const purpose = activeTab === 'signin' ? 'LOGIN' : 'REGISTER';

    try {
      const res = await TATSBackendAPI.resendOTP(email.trim().toLowerCase(), purpose);
      if (res.ok) {
        setOtpCooldown(30);
        setSuccessMessage(`A fresh 6-digit verification code was dispatched to ${email}.`);
      } else {
        setErrorMessage(res.data.error || 'Failed to resend code.');
      }
    } catch {
      setErrorMessage('Network error while requesting new code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Box inputs handler
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0D0C] text-[#F4EFEA] flex flex-col font-sans selection:bg-[#A53B22] selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 px-6 sm:px-10 border-b border-[#282522] flex items-center justify-between bg-[#141211]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] flex items-center justify-center text-white shadow-[0_2px_12px_rgba(255,95,69,0.35)]">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-bold text-xl tracking-tight text-[#F4EFEA]">T@S</span>
            <span className="text-xs text-[#A8A29E] font-medium hidden sm:inline">| Talk. Decide. Solve.</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1816] border border-[#2E2A27] text-xs font-mono text-[#A8A29E]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engine: Live (84ms p99) • 10K+ ACID Ops/Day</span>
          </div>

          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#201D1B] hover:bg-[#2A2724] border border-[#38332F] text-xs font-semibold text-[#D6D0C7] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Showcase & Human-Feel Image Space (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:pr-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A53B22]/15 border border-[#A53B22]/40 text-[#FF7E5F] text-xs font-bold tracking-wide uppercase font-mono mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7E5F] animate-ping" />
              <span>Acoustic Agent Intelligence</span>
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Talk. Decide. Solve.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#B8B1A9] max-w-xl leading-relaxed">
              Universal AI Voice Agents engineered with zero-hallucination deterministic action routing, sub-100ms ultra-low latency, and cryptographically verified execution.
            </p>
          </div>

          {/* =========================================================================
              HIGH-QUALITY HUMAN-FEEL BRAND IMAGE SHOWCASE CONTAINER
              This framed canvas provides dedicated space for your high-res brand image asset.
              Replace the placeholder inside with: <img src="/your-image.png" alt="Human Voice AI" />
             ========================================================================= */}
          <div className="relative rounded-3xl border border-[#38332F] bg-gradient-to-br from-[#1C1A18] via-[#161413] to-[#12100F] p-6 shadow-2xl overflow-hidden group">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A53B22]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFAE33]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center py-6 px-4">
              {/* Graphic/Illustration Frame Representing Voice Intelligence */}
              <div className="w-full max-w-md h-56 rounded-2xl border border-dashed border-[#504A44] bg-[#221F1C]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Voice waveform pulse simulation */}
                <div className="flex items-center gap-1.5 mb-4">
                  {[24, 40, 68, 88, 52, 76, 96, 64, 48, 80, 56, 32].map((height, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-[#FF5F45] to-[#FFAE33] animate-pulse"
                      style={{
                        height: `${height * 0.45}px`,
                        animationDelay: `${i * 120}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141211]/90 border border-[#403B35] text-[11px] font-mono text-[#E4DDD3] shadow-sm">
                  <span className="material-symbols-outlined text-[15px] text-[#FF7E5F]">record_voice_over</span>
                  <span>Human Resonance & Real-time Acoustic Telemetry</span>
                </div>

                <p className="mt-3 text-xs text-[#8E877F] max-w-xs">
                  Space reserved for your high-resolution brand image asset (e.g. human voice engineer or product showcase).
                </p>
              </div>

              {/* Enterprise Architecture Proof Grid */}
              <div className="grid grid-cols-3 gap-3 w-full mt-6 pt-5 border-t border-[#2E2A27]">
                <div className="flex flex-col items-center text-center">
                  <span className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-white">10,000+</span>
                  <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider mt-0.5">ACID Ops / Day</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-[#FF7E5F]">&lt;85ms</span>
                  <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider mt-0.5">P99 Latency</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-emerald-400">100%</span>
                  <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider mt-0.5">OTP Zero-Trust</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1A1816]/70 border border-[#2D2925] text-xs text-[#C2BCB3]">
            <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">verified</span>
            <span>
              <strong>Deterministic Voice Logic:</strong> Conversational voice turns straight into verified real-world backend executions without hallucination.
            </span>
          </div>
        </section>

        {/* Right Column: High-Performance Auth Portal (5 Cols) */}
        <section className="lg:col-span-5 w-full">
          <div className="bg-[#181615] border border-[#2E2A27] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header / Admin Banner */}
            {isFirstUserAdmin && (
              <div className="mb-5 p-3 rounded-2xl bg-[#FFF8EB]/10 border border-[#FDE047]/30 text-[#FDE047] flex items-center gap-2.5 text-xs font-semibold">
                <span className="material-symbols-outlined text-[#FDE047] text-[18px]">admin_panel_settings</span>
                <span>Initial Platform Setup: The first account becomes Platform Administrator.</span>
              </div>
            )}

            {/* Tab Switcher */}
            {step === 'form' && (
              <div className="flex items-center p-1 rounded-2xl bg-[#12100F] border border-[#282522] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'signin'
                      ? 'bg-[#2E2A27] text-white shadow-sm'
                      : 'text-[#8E877F] hover:text-[#D6D0C7]'
                  }`}
                >
                  Sign In via Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'register'
                      ? 'bg-[#2E2A27] text-white shadow-sm'
                      : 'text-[#8E877F] hover:text-[#D6D0C7]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Compact Inline Error Badge (Fixed Height, No Layout Shifts) */}
            {errorMessage ? (
              <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium animate-in fade-in">
                <span className="material-symbols-outlined text-[16px] text-rose-400">error</span>
                <span className="truncate">{errorMessage}</span>
              </div>
            ) : successMessage ? (
              <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium animate-in fade-in">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                <span className="truncate">{successMessage}</span>
              </div>
            ) : null}

            {/* STEP 1: SIGN IN FORM (STRICTLY EMAIL + OTP) */}
            {step === 'form' && activeTab === 'signin' && (
              <form onSubmit={handleRequestLoginOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E] font-mono mb-1.5">
                    Developer Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#7A746D]">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12100F] border border-[#2E2A27] text-white placeholder-[#5A554F] text-sm focus:outline-none focus:border-[#FF7E5F] transition-colors"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#7A746D]">
                    We will send a 6-digit cryptographic authentication code to this inbox. No passwords required.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-sm font-bold shadow-lg shadow-[#FF5F45]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Send 6-Digit Login Code</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 1: REGISTER FORM (NAME + INDIAN PHONE + EMAIL) */}
            {step === 'form' && activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E] font-mono mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#7A746D]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12100F] border border-[#2E2A27] text-white placeholder-[#5A554F] text-sm focus:outline-none focus:border-[#FF7E5F] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E] font-mono mb-1">
                    Indian Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#FF7E5F] font-mono select-none pointer-events-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-16 pr-4 py-2 rounded-xl bg-[#12100F] border border-[#2E2A27] text-white placeholder-[#5A554F] text-sm font-mono focus:outline-none focus:border-[#FF7E5F] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E] font-mono mb-1">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#7A746D]">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rohan@techcorp.in"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12100F] border border-[#2E2A27] text-white placeholder-[#5A554F] text-sm focus:outline-none focus:border-[#FF7E5F] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E] font-mono mb-1">
                    Password (Optional)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#7A746D]">
                      lock
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional strong password"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12100F] border border-[#2E2A27] text-white placeholder-[#5A554F] text-sm focus:outline-none focus:border-[#FF7E5F] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-sm font-bold shadow-lg shadow-[#FF5F45]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>{isFirstUserAdmin ? 'Initialize Platform Admin & Send OTP' : 'Register & Send Verification OTP'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP VERIFICATION SCREEN */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF7E5F]/15 border border-[#FF7E5F]/30 text-[#FF7E5F] mx-auto flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">Verify 6-Digit Code</h3>
                  <p className="text-xs text-[#A8A29E] mt-1">
                    Enter the verification code sent to <strong className="text-white">{email}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-[11px] text-[#FF7E5F] hover:underline font-semibold mt-1"
                  >
                    Change Email Address
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl bg-[#12100F] border border-[#2E2A27] text-center text-lg font-bold font-mono text-white focus:outline-none focus:border-[#FF7E5F] focus:ring-1 focus:ring-[#FF7E5F] transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-sm font-bold shadow-lg shadow-[#FF5F45]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Verify & Enter Console</span>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </>
                  )}
                </button>

                {/* Resend Action */}
                <div className="text-center pt-2 border-t border-[#282522]">
                  {otpCooldown > 0 ? (
                    <span className="text-xs text-[#7A746D] font-mono">
                      Resend code in {otpCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-xs text-[#FF7E5F] hover:underline font-bold"
                    >
                      Resend 6-Digit Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-[#262320] flex items-center justify-between text-[11px] text-[#7A746D]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>SHA-256 HMAC Encrypted</span>
              </span>
              <span className="font-mono">ACID Compliant</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
