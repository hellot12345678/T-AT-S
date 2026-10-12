import React, { useState } from 'react';
import { AppView } from '../../types';

interface LandingViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string) => void;
  onOpenWizard: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onShowToast,
  onOpenWizard
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'django' | 'react'>('django');
  const [units, setUnits] = useState(50000);
  const [activeUtteranceIndex, setActiveUtteranceIndex] = useState(0);
  const [isSimulatingSpeech, setIsSimulatingSpeech] = useState(false);
  const [latencyProgress, setLatencyProgress] = useState(482);

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
    <div className="w-full min-h-screen bg-[#FAF9F6] pb-24 text-[#1D1A23]">
      {/* Ambient Floating Sub-nav */}
      <div className="sticky top-20 z-30 w-full px-4 flex justify-center pointer-events-none mb-6">
        <nav className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-[#FFE6DC] shadow-md text-xs font-semibold">
          <a href="#features" className="text-[#57423D] hover:text-[#1D1A23] px-2.5 py-1 rounded-full transition-colors">
            Features
          </a>
          <a href="#quickstart" className="text-[#57423D] hover:text-[#1D1A23] px-2.5 py-1 rounded-full transition-colors">
            5-Min SDK
          </a>
          <a href="#architecture" className="text-[#57423D] hover:text-[#1D1A23] px-2.5 py-1 rounded-full transition-colors">
            Architecture
          </a>
          <a href="#pricing" className="text-[#57423D] hover:text-[#1D1A23] px-2.5 py-1 rounded-full transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-[#57423D] hover:text-[#1D1A23] px-2.5 py-1 rounded-full transition-colors">
            FAQ
          </a>
          <div className="h-3.5 w-[1px] bg-[#DEC0B9]/50 mx-1"></div>
          <button
            onClick={onOpenWizard}
            className="text-white bg-[#A53B22] hover:bg-[#84240D] px-3.5 py-1 rounded-full shadow-sm transition-all text-xs"
          >
            Start Building Free
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-8 pb-16 overflow-hidden flex flex-col items-center text-center max-w-6xl mx-auto">
        {/* Ambient Radial Coral Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-[#FF7E5F]/20 via-[#FFAE33]/15 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        {/* Proof Badges Row */}
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFE6DC] shadow-sm text-xs font-semibold text-[#57423D]">
            <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse"></span>
            <span>Sub-850ms latency SLA</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFE6DC] shadow-sm text-xs font-semibold text-[#57423D]">
            <span className="material-symbols-outlined text-[#845400] text-[15px]">database</span>
            <span>Self-hosted pgvector</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFE6DC] shadow-sm text-xs font-semibold text-[#57423D]">
            <span className="material-symbols-outlined text-[#A53B22] text-[15px]">bolt</span>
            <span>Zero Cold-Start</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFE6DC] shadow-sm text-xs font-semibold text-[#57423D]">
            <span className="material-symbols-outlined text-[#006688] text-[15px]">lock</span>
            <span>bcrypt voice passphrases</span>
          </div>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="relative z-10 max-w-4xl mx-auto mb-6">
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D1A23] tracking-tight leading-tight mb-4">
            Voice-to-Execution Brain for Modern Apps.
          </h1>
          <p className="font-['Manrope'] text-base sm:text-lg text-[#57423D] max-w-2xl mx-auto leading-relaxed">
            Turn human speech into live backend actions with deterministic sub-850ms execution. Zero OpenAI or Anthropic metered cloud bills.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-3.5 mb-12">
          <button
            onClick={() => onNavigate('live-voice-playground')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] text-white font-['Outfit'] font-bold text-sm shadow-xl shadow-[#FF7E5F]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span>Start Building for Free</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            onClick={() => handleSimulateUtterance((activeUtteranceIndex + 1) % utterances.length)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 text-[#1D1A23] font-['Outfit'] font-bold text-sm shadow-md border border-[#FFE6DC] hover:bg-white hover:scale-[1.01] transition-all"
          >
            <span className="material-symbols-outlined text-[#FF5F45] text-[20px]">play_circle</span>
            <span>Simulate Live Spoken Utterance</span>
          </button>
        </div>

        {/* HERO VISUAL: Acoustic Wave Ribbon & Synthesized Tool Node */}
        <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/90 backdrop-blur-2xl p-5 sm:p-7 border border-[#FFE6DC] shadow-xl overflow-hidden text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#FFE6DC]/60 mb-5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#BA1A1A]/70"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFAE33]"></span>
              <span className="w-3 h-3 rounded-full bg-[#00C2FF]"></span>
              <span className="font-['Outfit'] text-[11px] font-bold uppercase tracking-wider text-[#8B716B] ml-2">
                Acoustic Pipeline • Stream ID: #vox-9921e
              </span>
            </div>
            <div className="flex items-center gap-2 font-['Outfit'] text-xs text-[#A53B22] font-bold">
              <span className={`w-2 h-2 rounded-full bg-[#FF7E5F] ${isSimulatingSpeech ? 'animate-ping' : ''}`}></span>
              <span>Execution Latency: {latencyProgress}ms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Live Audio Waveform & Genetic Helix Visualizer (Left 7 cols) */}
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
                  Acoustic Parser • 99.4% Confidence
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#57423D]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#A53B22] text-[16px]">hearing</span>
                  <span>Phoneme Slicing: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B716B]">Preset:</span>
                  {utterances.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => handleSimulateUtterance(i)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                        activeUtteranceIndex === i
                          ? 'bg-[#FF7E5F] text-white'
                          : 'bg-white text-[#57423D] hover:bg-[#EDE5F2]'
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
      <section className="w-full px-4 sm:px-8 py-16 max-w-6xl mx-auto" id="quickstart">
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

          {/* Dual-Tab Code Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#EDE5F2] border border-[#FFE6DC]">
            <button
              onClick={() => setActiveCodeTab('django')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCodeTab === 'django'
                  ? 'bg-white text-[#1D1A23] shadow-sm'
                  : 'text-[#57423D] hover:text-[#1D1A23]'
              }`}
            >
              Django Backend (pip)
            </button>
            <button
              onClick={() => setActiveCodeTab('react')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCodeTab === 'react'
                  ? 'bg-white text-[#1D1A23] shadow-sm'
                  : 'text-[#57423D] hover:text-[#1D1A23]'
              }`}
            >
              React Client (npm)
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="rounded-2xl bg-[#1D1A23] text-white p-5 sm:p-6 shadow-xl border border-white/10 relative">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF7E5F] text-[18px]">terminal</span>
              <span className="text-xs font-mono text-white/70">
                {activeCodeTab === 'django' ? 'apps/actions/voice_router.py' : 'src/components/VoiceController.tsx'}
              </span>
            </div>
            <button
              onClick={() => copyCode(activeCodeTab === 'django' ? djangoCode : reactCode)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy SDK snippet</span>
            </button>
          </div>

          <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre">
            {activeCodeTab === 'django' ? djangoCode : reactCode}
          </pre>
        </div>
      </section>

      {/* Feature Bento Grid (4 Cards) */}
      <section className="w-full px-4 sm:px-8 py-16 bg-[#F8F1FE]/40" id="architecture">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
              Determinism By Architecture
            </span>
            <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
              Built for real-world enterprise infrastructure.
            </h2>
            <p className="text-sm text-[#57423D] mt-2">
              Eradicate non-deterministic cloud reasoning bottlenecks. T@S operates on direct phoneme-to-intent pathways with complete operational sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: 0ms Cold Starts */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFDAD2] text-[#A53B22] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">speed</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2">
                  0ms Cold Starts
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Instant audio stream ingestion via streaming WebSpeech & local lightweight Whisper nodes. Eliminates traditional LLM connection handshake delays.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs text-[#57423D]">
                <span className="font-bold text-[#A53B22]">Streaming Pipeline</span>
                <span className="font-mono">&lt;15ms First Chunk</span>
              </div>
            </div>

            {/* Card 2: Zero-Shot Voice Cloning */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFDDB6] text-[#845400] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2">
                  Zero-Shot Voice Cloning
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Generate dynamic conversational voice responses with 6-second instant reference voice cloning and custom emotional warmth modulation.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs text-[#57423D]">
                <span className="font-bold text-[#845400]">Neural Synthesis</span>
                <span className="font-mono">6-Sec Reference Sample</span>
              </div>
            </div>

            {/* Card 3: Self-Hosted pgvector Privacy */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#C2E8FF] text-[#006688] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">shield</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2">
                  Self-Hosted pgvector Privacy
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Deploy your semantic memory schema inside your existing Postgres instance. No user dialogue transcripts or embeddings ever touch external cloud servers.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs text-[#57423D]">
                <span className="font-bold text-[#006688]">VPC Isolation</span>
                <span className="font-mono">SOC2 & HIPAA Compliant</span>
              </div>
            </div>

            {/* Card 4: 100% Ephemeral Audio Destruction */}
            <div className="p-7 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EDE5F2] text-[#1D1A23] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">auto_delete</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2">
                  100% Ephemeral Audio Destruction
                </h3>
                <p className="text-sm text-[#57423D] leading-relaxed">
                  Audio frames are processed purely in ephemeral RAM and wiped immediately post-execution. Zero audio disk logging and full GDPR Article 17 adherence.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#FFE6DC]/60 flex items-center justify-between text-xs text-[#57423D]">
                <span className="font-bold text-[#1D1A23]">Volatile Memory Only</span>
                <span className="font-mono">Zero Persistence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Transparent Unit Pricing & INR Calculator */}
      <section className="w-full px-4 sm:px-8 py-16 max-w-6xl mx-auto" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-['Outfit'] text-xs font-bold text-[#A53B22] uppercase tracking-widest">
            Predictable Unit Economics
          </span>
          <h2 className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] mt-1">
            Transparent Unit Pricing.
          </h2>
          <p className="text-sm text-[#57423D] mt-2">
            Replace arbitrary input/output LLM token penalties with concrete unit metrics. Save up to 88% versus raw AI vendor API billing.
          </p>
        </div>

        {/* Unit Breakdown Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">Text Turn</span>
              <div className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">1 Unit</div>
            </div>
            <span className="material-symbols-outlined text-[#FFAE33] text-[28px]">chat</span>
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
                ~₹{competitorCost.toLocaleString('en-IN')} / mo on OpenAI GPT-4o Realtime
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#FFDDB6] text-[#643F00] font-bold font-['Outfit']">
              {savingsPercent}% Direct Margin Saved
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between">
            <div>
              <span className="font-['Outfit'] text-xs font-bold uppercase text-[#8B716B]">Developer Free</span>
              <div className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] my-2">₹0</div>
              <p className="text-xs text-[#57423D] mb-6">Ideal for local experiments, prototyping, and personal developer agents.</p>
              <ul className="space-y-2 text-xs text-[#57423D]">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 2,000 units / month</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Community Discord Support</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 1 Concurrent Voice Stream</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Local SQLite / pgvector</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('developer-dashboard')}
              className="w-full mt-6 py-2.5 rounded-full bg-white text-[#1D1A23] font-bold text-xs border border-[#FFE6DC] hover:bg-[#F8F1FE] transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Growth Startup Tier (Most Popular) */}
          <div className="p-7 rounded-3xl bg-white border-2 border-[#FF7E5F] shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FF7E5F] text-white font-['Outfit'] text-[10px] font-bold uppercase">
              MOST POPULAR
            </div>
            <div>
              <span className="font-['Outfit'] text-xs font-bold uppercase text-[#A53B22]">Growth Startup</span>
              <div className="font-['Outfit'] text-3xl font-bold text-[#1D1A23] my-2">
                ₹4,999<span className="text-xs text-[#8B716B] font-normal">/mo</span>
              </div>
              <p className="text-xs text-[#57423D] mb-6">Engineered for production apps needing reliability and instant latency.</p>
              <ul className="space-y-2 text-xs text-[#57423D]">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 50,000 units included</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 10% Grace Unit Buffer</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Sub-850ms latency guarantee</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> 25 Concurrent Channels</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#A53B22] text-[16px]">check</span> Priority WhatsApp & Slack Bridge</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('developer-dashboard')}
              className="w-full mt-6 py-2.5 rounded-full bg-[#A53B22] hover:bg-[#84240D] text-white font-bold text-xs shadow-md transition-all"
            >
              Deploy Growth
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
              onClick={() => onShowToast('Contacting Enterprise Architects', 'A dedicated solutions engineer will reach out.')}
              className="w-full mt-6 py-2.5 rounded-full bg-white text-[#1D1A23] font-bold text-xs border border-[#FFE6DC] hover:bg-[#F8F1FE] transition-colors"
            >
              Contact Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full px-4 sm:px-8 py-16 max-w-4xl mx-auto" id="faq">
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

      {/* Footer CTA */}
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
                onClick={() => onNavigate('live-voice-playground')}
                className="px-8 py-3 rounded-full bg-white text-[#1D1A23] font-['Outfit'] font-bold text-xs shadow-lg hover:scale-105 transition-all"
              >
                Test Live in Playground
              </button>
              <button
                onClick={onOpenWizard}
                className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-['Outfit'] font-bold text-xs hover:bg-white/30 transition-all"
              >
                Launch &lt;TASWizard /&gt; →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
