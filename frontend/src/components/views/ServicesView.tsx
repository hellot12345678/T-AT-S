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
      title: 'Autonomous Voice Telephony Engine',
      badge: 'Core Runtime',
      latency: '< 850ms',
      icon: 'call',
      summary: 'Inbound and outbound voice AI engine that talks with callers and executes live backend code during calls.',
      details: [
        'Full duplex audio streaming with WebRTC and SIP trunk compatibility.',
        'Zero-audio disk storage: acoustic representations are processed in volatile memory and purged.',
        'Humanized natural speech with active turn-taking and interruption handling.',
        'Native call recording consent gating and compliance isolation.'
      ],
      actionLabel: 'Test in Voice Playground',
      actionView: 'live-voice-playground' as AppView
    },
    {
      id: 'tool_calling',
      category: 'tools',
      title: 'Deterministic Tool Calling & Action Dispatcher',
      badge: 'Zero-Hallucination',
      latency: 'Instant Hook',
      icon: 'build_circle',
      summary: 'Extracts exact JSON parameters from spoken words and dispatches verified HTTP calls to your applications.',
      details: [
        'Strict schema validation against developer-registered OpenAPI parameter contracts.',
        'Eliminates hallucinated false-positive API requests common in generic conversational chatbots.',
        'Dispatches GET, POST, PUT, DELETE with configurable authorization headers and timeouts.',
        'Supports synchronous spoken results or asynchronous background webhooks.'
      ],
      actionLabel: 'Open Visual Tool Builder',
      actionView: 'visual-tool-builder' as AppView
    },
    {
      id: 'voice_synthesis',
      category: 'voice',
      title: 'Zero-Shot Voice Synthesis & Acoustic Cloning',
      badge: 'Acoustic AI',
      latency: '6-Sec Setup',
      icon: 'record_voice_over',
      summary: 'Create personalized, lifelike conversational brand voices in seconds with zero specialized GPU hardware.',
      details: [
        '6-second calibration from sample audio WAV or microphone voice sample.',
        'Expressive conversational inflections tuned for professional phone customer service.',
        'Low latency streaming playback with packetized chunk generation.',
        'Voice clone authorization verification preventing unconsented voice spoofing.'
      ],
      actionLabel: 'Calibrate Voice Profile',
      actionView: 'component-wizard' as AppView
    },
    {
      id: 'cluster_isolation',
      category: 'infra',
      title: 'Multi-Tenant Enterprise Cluster Isolation',
      badge: 'VPC Security',
      latency: '100% Isolated',
      icon: 'dns',
      summary: 'Provision dedicated application clusters with isolated schemas, scoped API keys, and custom quotas.',
      details: [
        'Cryptographic separation of workspace applications preventing cross-tenant data leaks.',
        'Scoped `tas_live_*` API keys with automated revocation and rotation.',
        'Role-based access control with dedicated Super Admin governance capabilities.',
        'Self-hosted pgvector memory integration option for on-premise compliance.'
      ],
      actionLabel: 'Manage App Clusters',
      actionView: 'developer-dashboard' as AppView
    },
    {
      id: 'telemetry_metering',
      category: 'infra',
      title: 'Real-Time Telemetry & Quota Metering',
      badge: 'ACID Metering',
      latency: '10% Grace Buffer',
      icon: 'speed',
      summary: 'Transparent Action Unit accounting with automatic database storage pruning to prevent bloat.',
      details: [
        'Dynamic unit multipliers: Text queries (1 unit), Voice chats (2 units), Tool executions (3 units).',
        'Automatic Session History pruning keeping strictly the newest 300 records per app.',
        '10% soft grace buffer so critical customer phone calls are never abruptly dropped.',
        'Live Razorpay payment gateway integration for automated top-ups and plan upgrades.'
      ],
      actionLabel: 'View Subscription & Pricing',
      actionView: 'subscription-pricing' as AppView
    },
    {
      id: 'developer_sdk',
      category: 'tools',
      title: 'Developer SDKs & OpenAPI JSON Connectors',
      badge: '5-Min Drop-in',
      latency: 'Native Code',
      icon: 'terminal',
      summary: 'Pre-built libraries and connectors for Python, Django, and React with starter templates.',
      details: [
        'Native Python SDK (`pip install t-at-s`) with clean `@engine.register_action` decorators.',
        'React hooks (`useAcousticSession`) for 1-click web microphone streaming.',
        'Pre-built templates for Task Managers (Linear/Jira), Calendars (Calendly), Banking, and Support.',
        'Interactive OpenAPI 3.0 Swagger interactive sandbox for live endpoint testing.'
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
            Enterprise Solutions
          </span>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#1D1A23] tracking-tight">
            Explore T@S Platform Services
          </h1>
          <p className="text-xs sm:text-sm text-[#57423D] leading-relaxed">
            Everything you need to deploy enterprise-grade autonomous voice agents that execute verified code in real-time.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'voice', label: 'Voice & Telephony' },
              { id: 'tools', label: 'Tool Calling & SDKs' },
              { id: 'infra', label: 'Infrastructure & Security' },
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
            <h4 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">Need a custom enterprise voice architecture?</h4>
            <p className="text-xs text-[#57423D]">
              Our engineering team helps developers deploy high-throughput SIP trunks and custom OpenAPI integrations.
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
