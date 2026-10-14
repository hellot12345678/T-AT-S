import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';
import { TATSBackendAPI } from '../../services/api';
import { LegalModalType } from '../LegalModals';

interface LandingViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenWizard: () => void;
  developer: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    is_admin?: boolean;
    is_verified?: boolean;
  } | null;
  onOpenAuth: (notice?: string, targetView?: AppView) => void;
  activeAppId?: string;
  onRefreshApps?: () => void;
  onOpenLegalModal?: (type: LegalModalType) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onShowToast,
  onOpenWizard,
  developer,
  onOpenAuth,
  activeAppId,
  onRefreshApps,
  onOpenLegalModal
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'django' | 'react'>('django');
  const [units, setUnits] = useState(50000);
  const [activeUtteranceIndex, setActiveUtteranceIndex] = useState(0);
  const [isSimulatingSpeech, setIsSimulatingSpeech] = useState(false);
  const [latencyProgress, setLatencyProgress] = useState(482);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [platformConfig, setPlatformConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await TATSBackendAPI.getPlatformConfig();
        if (cfg) setPlatformConfig(cfg);
      } catch {}
    };
    fetchConfig();
  }, []);

  const utterances = [
    {
      phrase: '“Hey, deploy the pending hotfix to the staging cluster and bump replicas to four.”',
      action: 'cluster_deploy',
      endpoint: '/api/v1/orchestrator/execute',
      latency: 482,
      arguments: { environment: 'staging', target_patch: 'hotfix_pending', replica_count: 4 },
      status: 'EXECUTED_SUCCESSFULLY',
      units: 3
    },
    {
      phrase: '“Hey tds, create a task to ship code review by 5 PM today with high priority.”',
      action: 'create_task',
      endpoint: '/api/v1/tasks/create/',
      latency: 395,
      arguments: { title: 'Ship code review', due: '17:00', priority: 'high', assignee: 'tds' },
      status: 'TASK_CREATED_LINEAR',
      units: 3
    },
    {
      phrase: '“Authorize refund 4920 to customer wallet under invoice INV-8819.”',
      action: 'refund_order',
      endpoint: '/api/v2/finance/refund',
      latency: 520,
      arguments: { amount: 4920, currency: 'INR', target: 'customer_wallet' },
      status: 'REFUND_SETTLED',
      units: 3
    }
  ];

  const currentUtterance = utterances[activeUtteranceIndex];

  const handleSimulateUtterance = (index: number) => {
    setActiveUtteranceIndex(index);
    setIsSimulatingSpeech(true);
    setLatencyProgress(Math.floor(360 + Math.random() * 180));
    setTimeout(() => {
      setIsSimulatingSpeech(false);
      onShowToast('Acoustic speech token resolved', `Webhook dispatched to ${utterances[index].endpoint}`);
    }, 600);
  };

  // Pricing calculation
  const calculatedCost = Math.max(999, Math.round(units * 0.1));
  const competitorCost = Math.round(units * 0.648);
  const savingsPercent = Math.round(((competitorCost - calculatedCost) / competitorCost) * 100);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied to clipboard!', 'SDK snippet copied to system clipboard.');
  };

  // Razorpay Live Payment Checkout Handler
  const handleDeployGrowth = async () => {
    if (!developer) {
      onOpenAuth('Please sign in or register to deploy the Growth Startup plan.');
      return;
    }

    setIsPaymentProcessing(true);

    try {
      // 1. Create order on Django backend
      const orderRes = await TATSBackendAPI.createRazorpayOrder('GROWTH_STARTUP', activeAppId);
      if (!orderRes.ok) {
        onShowToast('Order Failed', orderRes.data.error || 'Failed to create payment order.', 'warning');
        setIsPaymentProcessing(false);
        return;
      }

      const orderData = orderRes.data;

      // 2. Dynamically load Razorpay SDK
      const loadRazorpay = () => {
        return new Promise<boolean>((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();

      // Check if real Razorpay keys are configured or in simulation mode
      if (orderData.is_live_gateway && isLoaded) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'T@S Acoustic AI',
          description: 'Growth Startup Plan (50,000 Action Units)',
          image: 'https://cdn-icons-png.flaticon.com/512/3247/3247310.png',
          order_id: orderData.order_id,
          prefill: orderData.prefill || {
            name: developer.name,
            email: developer.email,
            contact: developer.phone || '+919999999999',
          },
          theme: {
            color: '#A53B22',
          },
          handler: async function (response: any) {
            const verifyRes = await TATSBackendAPI.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              app_id: activeAppId,
            });

            if (verifyRes.ok) {
              onShowToast(
                'Growth Plan Activated!',
                `Payment of ₹4,999 captured. 50,000 Action Units credited.`,
                'success'
              );
              if (onRefreshApps) onRefreshApps();
              onNavigate('developer-dashboard');
            } else {
              onShowToast('Verification Failed', verifyRes.data.error || 'Signature check failed.', 'warning');
            }
            setIsPaymentProcessing(false);
          },
          modal: {
            ondismiss: function () {
              setIsPaymentProcessing(false);
              onShowToast('Payment Cancelled', 'Razorpay checkout was dismissed.', 'info');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Live keys pending in .env: Execute verified direct simulation to complete onboarding cleanly
        const simPaymentId = `pay_live_${Date.now().toString(36)}`;
        const verifyRes = await TATSBackendAPI.verifyRazorpayPayment({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: simPaymentId,
          razorpay_signature: `simulated_${Date.now()}`,
          app_id: activeAppId,
        });

        if (verifyRes.ok) {
          onShowToast(
            'Growth Plan Activated (Test Mode)',
            `Order ${orderData.order_id} verified. 50,000 Units loaded. Add RAZORPAY_KEY_ID in .env for live bank checkout.`,
            'success'
          );
          if (onRefreshApps) onRefreshApps();
          onNavigate('developer-dashboard');
        } else {
          onShowToast('Verification Error', verifyRes.data.error || 'Failed to verify transaction.', 'warning');
        }
        setIsPaymentProcessing(false);
      }
    } catch {
      onShowToast('Payment Network Error', 'Failed to communicate with payment service.', 'warning');
      setIsPaymentProcessing(false);
    }
  };

  const djangoCode = `# 1. Install the engine: pip install t-at-s
from django.http import JsonResponse
from tat_engine import AcousticEngine, ActionRegistry

# Initialize isolated, self-hosted pgvector action brain
engine = AcousticEngine(
    api_key="tas_live_981a34...",
    vector_store="postgresql://postgres:secret@db.internal:5432/memory"
)

@engine.register_action(name="create_task", schema={"title": str, "priority": str})
def handle_task_action(voice_payload):
    # Triggered automatically upon human utterance completion (<850ms)
    task = Task.objects.create(**voice_payload.arguments)
    return JsonResponse({"status": "created", "task_id": task.id})`;

  const reactCode = `// 1. Install client: npm install t-at-s
import React from 'react';
import { useAcousticSession } from 't-at-s';

export function VoiceController() {
  const { isListening, startSession, lastAction, latencyMs } = useAcousticSession({
    endpoint: '/api/actions/voice_router/',
    onExecution: (res) => console.log('Backend action dispatched:', res)
  });

  return (
    <button onClick={startSession} className="acoustic-trigger-pill">
      {isListening ? 'Analyzing Stream...' : 'Talk to App'} ({latencyMs}ms)
    </button>
  );
}`;

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-[#1D1A23] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-8 pt-10 sm:pt-16 pb-16 overflow-hidden flex flex-col items-center text-center max-w-6xl mx-auto">
        {/* Ambient Radial Coral Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-[#FF7E5F]/20 via-[#FFAE33]/15 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        {/* Announcement Pill (x.ai style) */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FFE6DC] text-xs font-semibold text-[#57423D] mb-6 shadow-xs hover:border-[#FF7E5F] transition-all">
          <span className="px-2 py-0.5 rounded-full bg-[#A53B22] text-white text-[10px] font-bold uppercase tracking-wider">New</span>
          <span className="text-[#1D1A23] font-bold">T@S 2.0</span>
          <span className="text-[#DEC0B9]">•</span>
          <button onClick={() => onNavigate('services')} className="text-[#A53B22] hover:underline flex items-center gap-0.5 cursor-pointer font-medium">
            <span>Autonomous Acoustic Engine</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="relative z-10 max-w-4xl mx-auto mb-6">
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D1A23] tracking-tight leading-[1.1] mb-5 max-w-4xl">
            Autonomous voice runtime for everything you build.
          </h1>
          <p className="font-['Manrope'] text-base sm:text-lg text-[#57423D] max-w-2xl mx-auto leading-relaxed">
            Sub-850ms streaming acoustics, zero-shot voice cloning, and deterministic OpenAPI execution. Engineered for mission-critical software with zero audio disk retention.
          </p>
        </div>

        {/* Action Buttons (Dual high-impact CTAs) */}
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-3.5 mb-12">
          <button
            onClick={() => {
              if (developer) {
                onNavigate('developer-dashboard');
              } else {
                onOpenAuth('Sign in or register to get instant API access.');
              }
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] text-white font-['Outfit'] font-bold text-sm shadow-lg shadow-[#FF5F45]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Get API Access</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            onClick={() => {
              if (developer) {
                onNavigate('live-voice-playground');
              } else {
                onOpenAuth('Sign in or register to test the live voice playground.');
              }
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#1D1A23] font-['Outfit'] font-bold text-sm shadow-xs border border-[#DEC0B9]/60 hover:border-[#A53B22] hover:bg-[#FAF9F6] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#A53B22] text-[18px]">terminal</span>
            <span>Test in Voice Playground</span>
          </button>
        </div>

        {/* Interactive Live Acoustic Pipeline Demonstration */}
        <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/95 backdrop-blur-2xl p-5 sm:p-7 border border-[#FFE6DC] shadow-xl overflow-hidden text-left">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#FFE6DC]/60 mb-5 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#BA1A1A]/70"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFAE33]"></span>
              <span className="w-3 h-3 rounded-full bg-[#00C2FF]"></span>
              <span className="font-['Outfit'] text-[11px] font-bold uppercase tracking-wider text-[#8B716B] ml-2">
                Live Acoustic Stream • ID: #vox-9921e
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSimulateUtterance((activeUtteranceIndex + 1) % utterances.length)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] border border-[#DEC0B9]/60 text-xs font-bold text-[#A53B22] transition-colors cursor-pointer"
                title="Trigger simulated voice token to test latency and webhook resolution"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Simulate Spoken Utterance</span>
              </button>
              <div className="flex items-center gap-2 font-['Outfit'] text-xs text-[#A53B22] font-bold">
                <span className={`w-2 h-2 rounded-full bg-[#FF7E5F] ${isSimulatingSpeech ? 'animate-ping' : ''}`}></span>
                <span>Latency: {latencyProgress}ms</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Live Audio Waveform Visualizer (Left 7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4 p-5 rounded-2xl bg-[#F8F1FE]/70 border border-[#DEC0B9]/40">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-['Outfit'] text-[11px] font-bold uppercase text-[#8B716B]">
                    Input Stream: Human Utterance
                  </span>
                  <span className="text-[11px] text-[#845400] font-mono font-semibold">
                    16-bit 48kHz PCM
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#FFE6DC] shadow-sm">
                  <p className="font-['Outfit'] text-base text-[#1D1A23] italic font-medium leading-snug">
                    {currentUtterance.phrase}
                  </p>
                </div>
              </div>

              {/* Bioluminescent Double-Helix Sound Ribbon SVG */}
              <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-[#1D1A23] p-2">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 600 100">
                  <path
                    className="opacity-90"
                    d="M0,50 C75,10 125,90 200,50 C275,10 325,90 400,50 C475,10 525,90 600,50"
                    stroke="#FF7E5F"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                  <path
                    className="opacity-80"
                    d="M0,50 C75,90 125,10 200,50 C275,90 325,10 400,50 C475,90 525,10 600,50"
                    stroke="#FFAE33"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  ></path>
                  <circle cx="100" cy="50" fill="#00C2FF" r="4"></circle>
                  <circle cx="200" cy="50" fill="#FF7E5F" r="5" className="animate-pulse"></circle>
                  <circle cx="300" cy="50" fill="#00C2FF" r="4"></circle>
                  <circle cx="400" cy="50" fill="#FFAE33" r="6"></circle>
                  <circle cx="500" cy="50" fill="#00C2FF" r="4"></circle>
                </svg>
                <div className="absolute bottom-2 right-3 font-['Outfit'] text-[10px] text-[#FFDAD2] uppercase tracking-wider font-bold">
                  Streaming Acoustic Mesh
                </div>
              </div>

              {/* Action Selector Chips */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-[#57423D]">Select Utterance Sample:</span>
                <div className="flex gap-1.5">
                  {utterances.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSimulateUtterance(i)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        activeUtteranceIndex === i
                          ? 'bg-[#A53B22] text-white shadow-sm'
                          : 'bg-white text-[#57423D] border border-[#FFE6DC] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      #{i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synthesized Real-Time JSON Output Node (Right 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-[#1D1A23] text-[#FAF9F6] p-4 sm:p-5 rounded-2xl shadow-inner font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-['Outfit'] text-[11px] font-bold uppercase tracking-wider text-[#FFAE33]">
                  Resolved Tool Call
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FF7E5F] text-white font-['Outfit'] text-[10px] font-bold">
                  LIVE EXECUTION
                </span>
              </div>

              <div className="overflow-x-auto text-[11px] leading-relaxed text-emerald-300/90 py-1">
                <div className="text-sky-300">// Webhook auto-dispatched to Kubernetes Gateway</div>
                <div className="text-[#FF7E5F] font-bold">
                  POST <span className="text-white">{currentUtterance.endpoint}</span>
                </div>
                <pre className="mt-2 text-white/90">
{`{
  "action": "${currentUtterance.action}",
  "intent_confidence": 0.9942,
  "arguments": ${JSON.stringify(currentUtterance.arguments, null, 2).replace(/\n/g, '\n  ')},
  "verification_seal": "bcrypt$v8$4f92...",
  "status": "${currentUtterance.status}"
}`}
                </pre>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="font-bold">200 OK • Scaled in 110ms</span>
                </div>
                <span className="font-['Outfit'] font-bold text-[#FFAE33]">UNITS: {currentUtterance.units}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Minute SDK Quickstart Showcase */}
      <section className="w-full px-4 sm:px-8 py-16 max-w-6xl mx-auto scroll-mt-24" id="quickstart">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="max-w-xl">
            <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
              Instant Developer Integration
            </span>
            <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
              Up and listening in 5 lines of code.
            </h2>
            <p className="text-sm text-[#57423D] mt-1">
              Bind high-security real-time voice controllers straight into your Django backend or React application with zero streaming WebSockets boilerplate.
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-full bg-white border border-[#FFE6DC]">
            <button
              onClick={() => setActiveCodeTab('django')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCodeTab === 'django' ? 'bg-[#A53B22] text-white shadow-sm' : 'text-[#57423D]'
              }`}
            >
              Python / Django
            </button>
            <button
              onClick={() => setActiveCodeTab('react')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCodeTab === 'react' ? 'bg-[#A53B22] text-white shadow-sm' : 'text-[#57423D]'
              }`}
            >
              React / Web SDK
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-[#1D1A23] text-white p-5 sm:p-7 border border-[#DEC0B9]/20 shadow-2xl relative">
          <button
            onClick={() => copyCode(activeCodeTab === 'django' ? djangoCode : reactCode)}
            className="absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Copy Snippet</span>
          </button>
          <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed overflow-x-auto py-2">
            <code>{activeCodeTab === 'django' ? djangoCode : reactCode}</code>
          </pre>
        </div>
      </section>

      {/* Feature Bento Grid (4 Core Capabilities) */}
      <section className="w-full px-4 sm:px-8 py-16 bg-[#F8F1FE]/40 scroll-mt-24" id="architecture">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
              Engineered For Determinism
            </span>
            <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
              Built for real-world enterprise infrastructure.
            </h2>
            <p className="text-sm text-[#57423D] mt-2">
              Eradicate non-deterministic cloud reasoning bottlenecks. T@S operates on direct phoneme-to-intent pathways with complete operational sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Autonomous Voice Telephony */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFDAD2] text-[#A53B22] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[24px]">call</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#A53B22] font-mono text-xs font-bold">
                    &lt; 850ms Latency
                  </span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2 group-hover:text-[#A53B22] transition-colors">
                  Autonomous Voice Telephony
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Full-duplex WebRTC and carrier-grade SIP trunk streaming with active human turn-taking, noise reduction, and interruption handling.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('services')}
                  className="font-bold text-[#A53B22] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Telephony Capabilities</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
                <span className="text-[#8B716B] font-mono text-[11px]">SIP &amp; WebRTC</span>
              </div>
            </div>

            {/* Card 2: Deterministic Action Dispatcher */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFDDB6] text-[#845400] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[24px]">build</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#845400] font-mono text-xs font-bold">
                    0% Hallucinations
                  </span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2 group-hover:text-[#845400] transition-colors">
                  Deterministic Action Dispatcher
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Bypasses LLM hallucinations by binding extracted acoustic arguments directly against your developer-registered OpenAPI parameter schemas.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('visual-tool-builder')}
                  className="font-bold text-[#845400] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Visual Tool Builder</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
                <span className="text-[#8B716B] font-mono text-[11px]">Strict OpenAPI Contracts</span>
              </div>
            </div>

            {/* Card 3: Zero-Shot Voice Synthesis */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C2E8FF] text-[#006688] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#006688] font-mono text-xs font-bold">
                    6-Sec Setup
                  </span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2 group-hover:text-[#006688] transition-colors">
                  Zero-Shot Acoustic Voice Cloning
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Synthesize personalized, conversational brand voices from 6 seconds of reference audio with zero GPU fine-tuning overhead or model drift.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs">
                <button
                  onClick={onOpenWizard}
                  className="font-bold text-[#006688] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Calibrate Voice Profile</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
                <span className="text-[#8B716B] font-mono text-[11px]">WAV / Mic Calibration</span>
              </div>
            </div>

            {/* Card 4: 100% Volatile Ephemeral Destruction */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDE5F2] text-[#1D1A23] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[24px]">shield</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#1D1A23] font-mono text-xs font-bold">
                    Zero Disk Retention
                  </span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2 group-hover:text-[#A53B22] transition-colors">
                  Ephemeral Security &amp; VPC Isolation
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Raw voice streams are processed strictly in volatile RAM and purged immediately post-call. Optional self-hosted pgvector keeps memory on-premise.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenLegalModal?.('security')}
                  className="font-bold text-[#1D1A23] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Security &amp; DPA Terms</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
                <span className="text-[#8B716B] font-mono text-[11px]">SOC2 &amp; GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Transparent Unit Pricing & INR Calculator */}
      <section className="w-full px-4 sm:px-8 py-16 max-w-6xl mx-auto scroll-mt-24" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
            Transparent Acoustic Accounting
          </span>
          <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
            Pay only for deterministic software actions.
          </h2>
          <p className="text-sm text-[#57423D] mt-2">
            Eliminate unpredictable token billing. T@S meters usage purely by acoustic turn and resolved backend action.
          </p>
        </div>

        {/* Dynamic Multiplier Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">Text Utterance Turn</span>
              <div className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">1 Unit</div>
            </div>
            <span className="material-symbols-outlined text-[#845400] text-[28px]">chat</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">Voice Turn (Speech-to-Speech)</span>
              <div className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">2 Units</div>
            </div>
            <span className="material-symbols-outlined text-[#FF5F45] text-[28px]">graphic_eq</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">Tool Execution (Webhook/DB)</span>
              <div className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">3 Units</div>
            </div>
            <span className="material-symbols-outlined text-[#00C2FF] text-[28px]">bolt</span>
          </div>
        </div>

        {/* Interactive INR Cost Calculator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#FFE6DC] shadow-xl mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#FFE6DC]">
            <div>
              <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">Interactive INR Cost Calculator</h3>
              <p className="text-xs text-[#57423D] mt-0.5">
                Estimate monthly operational expenditure across scaled application loads.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">
                Estimated Monthly Cost
              </span>
              <div className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#A53B22]">
                ₹{calculatedCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="py-6">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold">
              <span className="text-[#57423D]">Monthly Action Units:</span>
              <span className="font-bold text-[#1D1A23] font-mono text-sm">
                {units.toLocaleString('en-IN')} units
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full h-2.5 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#FF7E5F]"
            />
            <div className="flex justify-between text-[11px] text-[#8B716B] mt-2 font-mono">
              <span>10k units (MVP)</span>
              <span>100k units</span>
              <span>500k units (Scale)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-[#845400]">Standard LLM Token Equivalent:</span>
              <span className="text-[#1D1A23] font-mono ml-2">
                ~₹{competitorCost.toLocaleString('en-IN')} / mo on standard realtime token billing
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#FFDDB6] text-[#643F00] font-bold font-['Outfit']">
              {savingsPercent}% Direct Margin Saved
            </div>
          </div>
        </div>

        {/* Real Dynamic Tier Cards with Razorpay Live Integration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between">
            <div>
              <span className="font-['Outfit'] text-xs font-bold uppercase text-[#8B716B]">Developer Free</span>
              <div className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] my-2">₹0</div>
              <p className="text-xs text-[#57423D] mb-6">Ideal for local experiments, prototyping, and personal developer agents.</p>
              <ul className="space-y-2 text-xs text-[#57423D]">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> {(platformConfig?.free_tier_units || 2000).toLocaleString('en-IN')} units / month</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Community Discord Support</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 1 Concurrent Voice Stream</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Local SQLite / pgvector</li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (developer) {
                  onNavigate('subscription-pricing');
                } else {
                  onOpenAuth('Sign in or register to start building with Developer Free.', 'subscription-pricing');
                }
              }}
              className="w-full mt-6 py-2.5 rounded-full bg-white text-[#1D1A23] font-bold text-xs border border-[#FFE6DC] hover:bg-[#F8F1FE] transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Growth Startup Tier (Most Popular) with Real Razorpay */}
          <div className="p-7 rounded-3xl bg-white border-2 border-[#FF7E5F] shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FF7E5F] text-white font-['Outfit'] text-[10px] font-bold uppercase">
              MOST POPULAR
            </div>
            <div>
              <span className="font-['Outfit'] text-xs font-bold uppercase text-[#A53B22]">Growth Startup</span>
              <div className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] my-2">
                ₹{(platformConfig?.growth_price_inr || platformConfig?.starter_price_inr || 1999).toLocaleString('en-IN')}<span className="text-xs text-[#8B716B] font-normal">/mo</span>
              </div>
              <p className="text-xs text-[#57423D] mb-6">Engineered for production apps needing reliability and instant latency.</p>
              <ul className="space-y-2 text-xs text-[#57423D]">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> {(platformConfig?.growth_tier_units || 50000).toLocaleString('en-IN')} units included</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> {platformConfig?.grace_buffer_pct || 10}% Grace Unit Buffer</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Sub-850ms latency guarantee</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 25 Concurrent Channels</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Priority WhatsApp & Slack Bridge</li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (developer) {
                  onNavigate('subscription-pricing');
                } else {
                  onOpenAuth('Sign in or register to complete your Growth Startup subscription.', 'subscription-pricing');
                }
              }}
              className="w-full mt-6 py-2.5 rounded-full bg-[#A53B22] hover:bg-[#84240D] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Deploy Growth (₹{(platformConfig?.growth_price_inr || platformConfig?.starter_price_inr || 1999).toLocaleString('en-IN')})</span>
            </button>
          </div>

          {/* Enterprise Dedicated */}
          <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between">
            <div>
              <span className="font-['Outfit'] text-xs font-bold uppercase text-[#8B716B]">Enterprise Dedicated</span>
              <div className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] my-2">Custom</div>
              <p className="text-xs text-[#57423D] mb-6">Dedicated Kubernetes air-gapped clusters for healthcare and fintech.</p>
              <ul className="space-y-2 text-xs text-[#57423D]">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Unlimited volume pricing</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> On-Premises bare metal install</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 99.99% Execution SLA</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Custom acoustics fine-tuning</li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (developer) {
                  onNavigate('subscription-pricing');
                } else {
                  onOpenAuth('Sign in or register to inspect Enterprise plans.', 'subscription-pricing');
                }
              }}
              className="w-full mt-6 py-2.5 rounded-full bg-white text-[#1D1A23] font-bold text-xs border border-[#FFE6DC] hover:bg-[#F8F1FE] transition-colors text-center block"
            >
              Deploy Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full px-4 sm:px-8 py-16 max-w-4xl mx-auto scroll-mt-24" id="faq">
        <div className="text-center mb-8">
          <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            {
              q: 'How does T@S achieve sub-850ms latency without OpenAI?',
              a: 'T@S utilizes a streaming acoustic phoneme graph directly compiled into deterministic backend tool vectors. We bypass heavy generative token-by-token parsing, matching voice intents to pre-compiled code signatures in one continuous edge pass.'
            },
            {
              q: 'Can I run T@S on our internal VPC with zero internet egress?',
              a: 'Yes. The T@S Enterprise container package includes self-hosted acoustic weights and native PostgreSQL pgvector connectors. Your raw audio frames never leave your private network boundary.'
            },
            {
              q: 'What happens if an unexpected ambient sound triggers the microphone?',
              a: 'Our bcrypt-style vocal passphrase gating requires intentional acoustic trigger cadences before authorizing tool invocations. Noise, coughing, or side chatter are dropped before hitting your backend webhooks.'
            }
          ].map((item, idx) => (
            <details
              key={idx}
              className="group p-5 rounded-2xl bg-white border border-[#FFE6DC] shadow-sm [&_summary::-webkit-details-marker]:hidden cursor-pointer"
            >
              <summary className="flex items-center justify-between font-['Outfit'] text-base font-semibold text-[#1D1A23]">
                <span>{item.q}</span>
                <span className="material-symbols-outlined text-[#A53B22] group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="text-xs sm:text-sm text-[#57423D] mt-3 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer CTA Container */}
      <section className="w-full px-4 sm:px-8 pb-12">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] p-10 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold mb-3">
              Give your backend a real-time voice.
            </h2>
            <p className="text-sm text-white/90 mb-6">
              Join thousands of developers turning speech into deterministic software actions. Spin up your free session in less than 5 minutes.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={() => {
                  if (developer) {
                    onNavigate('live-voice-playground');
                  } else {
                    onOpenAuth('Sign in or register to test the live voice playground.');
                  }
                }}
                className="px-8 py-3 rounded-full bg-white text-[#1D1A23] font-['Outfit'] font-bold text-xs shadow-lg hover:scale-105 transition-all"
              >
                Test Live in Playground
              </button>
              <button
                onClick={() => {
                  if (developer) {
                    onOpenWizard();
                  } else {
                    onOpenAuth('Sign in to launch your personalized calibration wizard.');
                  }
                }}
                className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-['Outfit'] font-bold text-xs hover:bg-white/30 transition-all"
              >
                Launch &lt;TASWizard /&gt; →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Page Footer */}
      <footer id="contact" className="w-full bg-[#18161D] text-[#A49BAF] border-t border-[#2F293A] pt-14 pb-8 px-4 sm:px-8 mt-12 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[#2C2736]">
            {/* Brand & Slogan Column */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] flex items-center justify-center text-white font-bold text-xs shadow-md">
                  <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <span className="font-['Outfit'] font-bold text-xl text-white tracking-tight">
                  T@S
                </span>
              </div>

              {/* Slogan with Humanized Warm Color (No Green) */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A2330] border border-[#443850] text-[#FFD1C7] text-[11px] font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF7E5F] animate-pulse"></span>
                <span>Talk. Decide. Solve.</span>
              </div>

              <p className="text-xs text-[#8B8196] leading-relaxed">
                Universal autonomous voice AI platform. Turn spoken commands into deterministic backend software actions in real-time.
              </p>

              {/* Social Links */}
              <div className="pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8196] mb-2 font-['Outfit']">Connect &amp; Community</div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/tusharsune/T-AT-S"
                    target="_blank"
                    rel="noreferrer"
                    title="GitHub Repository"
                    className="w-8 h-8 rounded-xl bg-[#231E2A] hover:bg-[#FF7E5F] hover:text-white border border-[#3A3245] flex items-center justify-center text-[#A49BAF] transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    title="Follow on X / Twitter"
                    className="w-8 h-8 rounded-xl bg-[#231E2A] hover:bg-[#FF7E5F] hover:text-white border border-[#3A3245] flex items-center justify-center text-[#A49BAF] transition-all hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    title="LinkedIn"
                    className="w-8 h-8 rounded-xl bg-[#231E2A] hover:bg-[#FF7E5F] hover:text-white border border-[#3A3245] flex items-center justify-center text-[#A49BAF] transition-all hover:scale-105"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.4 9.74v-8.37H5.06v8.37z"/></svg>
                  </a>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noreferrer"
                    title="Discord Developer Community"
                    className="w-8 h-8 rounded-xl bg-[#231E2A] hover:bg-[#FF7E5F] hover:text-white border border-[#3A3245] flex items-center justify-center text-[#A49BAF] transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Services Column */}
            <div className="space-y-2.5">
              <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
                Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Autonomous Telephony
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Real-Time Tool Calling
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Zero-Shot Voice Synthesis
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Low-Latency Acoustic Engine
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Webhook &amp; SIP Integrations
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Multi-Tenant Cluster Isolation
                  </button>
                </li>
              </ul>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-2.5">
              <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                    About T@S
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Core Capabilities
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('subscription-pricing')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Subscriptions &amp; Units
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('live-voice-playground')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Voice Playground
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('tool-builder')} className="hover:text-white transition-colors cursor-pointer text-left">
                    OpenAPI Tool Builder
                  </button>
                </li>
                <li>
                  <a href="#quickstart" className="hover:text-white transition-colors">
                    Developer SDK &amp; Docs
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Help & Contact Column */}
            <div className="space-y-3">
              <h4 className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white">
                Help &amp; Contact
              </h4>
              
              {/* Help Email */}
              <a
                href="mailto:ts.help2407@gmail.com"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#231E2A] hover:bg-[#2C2534] border border-[#3A3245] transition-all group"
                title="Send email to Help Desk"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF7E5F] shrink-0">mail</span>
                <div className="min-w-0">
                  <div className="text-[10px] text-[#8B8196] uppercase font-bold tracking-wider">Help Desk</div>
                  <div className="text-xs font-mono text-[#E4DFEA] group-hover:text-white truncate">ts.help2407@gmail.com</div>
                </div>
              </a>

              {/* Service Email */}
              <a
                href="mailto:support@tats.ai"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#231E2A] hover:bg-[#2C2534] border border-[#3A3245] transition-all group"
                title="Send email to Technical Support"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FFAE33] shrink-0">headset_mic</span>
                <div className="min-w-0">
                  <div className="text-[10px] text-[#8B8196] uppercase font-bold tracking-wider">Service &amp; Ops</div>
                  <div className="text-xs font-mono text-[#E4DFEA] group-hover:text-white truncate">support@tats.ai</div>
                </div>
              </a>

              {/* Direct Contact Button */}
              <a
                href="mailto:ts.help2407@gmail.com?subject=T%40S%20Platform%20Inquiry"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF7E5F] to-[#FFAE33] hover:from-[#FF6B47] hover:to-[#FF9E1B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Contact Team</span>
              </a>
            </div>
          </div>

          {/* Bottom Legal & Industry Standard Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8B8196]">
            <div>
              &copy; {new Date().getFullYear()} T@S (Talk. Decide. Solve.). All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-[#8B8196]">
              <button
                onClick={() => onOpenLegalModal?.('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                onClick={() => onOpenLegalModal?.('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span>&bull;</span>
              <button
                onClick={() => onOpenLegalModal?.('security')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Security &amp; DPAs
              </button>
              <span>&bull;</span>
              <button
                onClick={() => onOpenLegalModal?.('cookies')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Cookie Settings
              </button>
              <span>&bull;</span>
              <button
                onClick={() => onOpenLegalModal?.('status')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Status Page
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
