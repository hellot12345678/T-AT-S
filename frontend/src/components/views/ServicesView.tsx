import React, { useState } from 'react';
import { AppView } from '../../types';

interface ServicesViewProps {
  onNavigate: (view: AppView) => void;
  onOpenAuth: (notice?: string, targetView?: AppView) => void;
  developer: any;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate, onOpenAuth, developer }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'voice' | 'tools' | 'infra'>('all');

  const services = [
    {
      id: 'telephony',
      category: 'voice',
      title: 'Phone & Web Voice Calls',
      badge: 'Core Engine',
      latency: '< 850ms Speed',
      icon: 'call',
      summary: 'Talk with callers over regular phone lines or web browsers, and run your app\'s code live during the call.',
      details: [
        'Works on standard phone numbers (SIP) and web apps (WebRTC).',
        'Zero audio saved on disk: voice is processed in memory and deleted right after the call.',
        'Natural human speech with smart turn-taking and smooth interruption handling.',
        'Built-in caller consent controls and privacy safeguards.'
      ],
      actionLabel: 'Test in Voice Playground',
      actionView: 'live-voice-playground' as AppView
    },
    {
      id: 'tool_calling',
      category: 'tools',
      title: 'Reliable API & Tool Calling',
      badge: 'Zero Guessing',
      latency: 'Instant Hook',
      icon: 'build_circle',
      summary: 'Extracts exact names, dates, and numbers from spoken words and calls your API without making things up.',
      details: [
        'Strict parameter checking against your OpenAPI specifications.',
        'Eliminates made-up or hallucinated actions common in standard AI chatbots.',
        'Supports GET, POST, PUT, and DELETE with custom headers and timeouts.',
        'Runs actions instantly during calls or in the background via webhooks.'
      ],
      actionLabel: 'Open Visual Tool Builder',
      actionView: 'visual-tool-builder' as AppView
    },
    {
      id: 'voice_synthesis',
      category: 'voice',
      title: 'Instant Custom Brand Voices',
      badge: 'Instant Setup',
      latency: '6-Sec Voice',
      icon: 'record_voice_over',
      summary: 'Create natural, custom brand voices in seconds from just a short audio sample.',
      details: [
        '6-second setup from an audio file or microphone recording.',
        'Natural speaking tone designed for friendly customer support.',
        'Fast streaming playback with zero awkward pauses.',
        'Built-in voice verification to prevent unauthorized voice cloning.'
      ],
      actionLabel: 'Calibrate Voice Profile',
      actionView: 'component-wizard' as AppView
    },
    {
      id: 'cluster_isolation',
      category: 'infra',
      title: 'Dedicated App Workspaces',
      badge: 'Private & Secure',
      latency: '100% Isolated',
      icon: 'dns',
      summary: 'Separate workspaces with dedicated API keys, private data, and custom usage limits.',
      details: [
        'Complete separation of workspace apps to keep your data safe and isolated.',
        'Scoped `tas_live_*` API keys that you can generate or revoke anytime.',
        'Role-based access control with developer and admin permissions.',
        'Option to run on your own internal servers or private cloud.'
      ],
      actionLabel: 'Manage App Clusters',
      actionView: 'developer-dashboard' as AppView
    },
    {
      id: 'telemetry_metering',
      category: 'infra',
      title: 'Simple Usage & Fair Billing',
      badge: 'Transparent',
      latency: 'Pay As You Go',
      icon: 'speed',
      summary: 'Clear Action Unit accounting with automatic history cleanup so you never overpay.',
      details: [
        'Simple units: 1 unit per text query, 2 units per voice turn, 3 units per API action.',
        'Automatic cleanup keeps only the newest 300 sessions to keep things fast.',
        '10% grace buffer ensures important customer calls are never cut off.',
        'Safe payments powered by Razorpay for easy top-ups and upgrades.'
      ],
      actionLabel: 'View Subscription & Pricing',
      actionView: 'subscription-pricing' as AppView
    },
    {
      id: 'developer_sdk',
      category: 'tools',
      title: 'Developer SDKs & Starter Templates',
      badge: '5-Min Setup',
      latency: 'Ready to Run',
      icon: 'terminal',
      summary: 'Ready-to-use libraries and templates for Python, Django, and React apps.',
      details: [
        'Python SDK (`pip install t-at-s`) with simple function decorators.',
        'React hooks (`useAcousticSession`) for 1-click web microphone streaming.',
        'Starter templates for bookings, customer support, orders, and inquiries.',
        'Interactive API sandbox to test endpoints in your browser before going live.'
      ],
      actionLabel: 'Launch Developer Dashboard',
      actionView: 'developer-dashboard' as AppView
    }
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-[#1D1A23] font-['Manrope'] pb-20">
      {/* Top Banner Navigation */}
      <div className="w-full border-b border-[#FFE6DC]/60 bg-white/70 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate(developer ? 'developer-dashboard' : 'landing')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#57423D] hover:text-[#A53B22] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8B716B]">T@S Platform Overview</span>
            <span className="text-[#DEC0B9]">•</span>
            <span className="text-[11px] font-bold text-[#A53B22] font-['Outfit']">Our Services</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold text-[#A53B22] uppercase tracking-wider">
            Our Capabilities
          </span>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#1D1A23] tracking-tight">
            Explore T@S Platform Services
          </h1>
          <p className="text-xs sm:text-sm text-[#57423D] leading-relaxed">
            Everything you need to build fast, private voice agents that run your code in real time.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'voice', label: 'Voice & Calling' },
              { id: 'tools', label: 'API Tools & SDKs' },
              { id: 'infra', label: 'Security & Billing' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1D1A23] text-white shadow-xs'
                    : 'bg-white text-[#57423D] hover:text-[#1D1A23] border border-[#FFE6DC]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#8B716B] font-mono text-[10px] font-semibold">
                      {svc.latency}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD2]/50 text-[#A53B22] font-mono text-[10px] font-bold">
                      {svc.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-['Outfit'] font-bold text-lg text-[#1D1A23]">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-[#57423D] mt-1 leading-relaxed">
                    {svc.summary}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#FFE6DC]/60">
                  {svc.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-[#57423D]">
                      <span className="material-symbols-outlined text-[14px] text-[#FF7E5F] shrink-0 mt-0.5">check</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (developer) {
                      onNavigate(svc.actionView);
                    } else {
                      onOpenAuth(`Sign in or register to launch ${svc.title}.`, svc.actionView);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDAD2]/30 border border-[#FFE6DC] text-[#A53B22] text-xs font-bold transition-all hover:border-[#DEC0B9] cursor-pointer"
                >
                  <span>{svc.actionLabel}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Contact / Inquiries Box */}
        <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">Need a custom enterprise voice setup?</h4>
            <p className="text-xs text-[#57423D]">
              Our engineering team helps developers connect phone systems and custom APIs.
            </p>
          </div>
          <a
            href="mailto:ts.help2407@gmail.com?subject=T%40S%20Enterprise%20Architecture%20Inquiry"
            className="px-5 py-2.5 rounded-full bg-[#1D1A23] hover:bg-[#342D3B] text-white text-xs font-bold transition-all shrink-0"
          >
            Contact Engineering Team
          </a>
        </div>
      </div>
    </div>
  );
};

