import React from 'react';
import { AppView } from '../../types';

interface AboutViewProps {
  onNavigate: (view: AppView) => void;
  onOpenAuth: (notice?: string, targetView?: AppView) => void;
  developer: any;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenAuth, developer }) => {
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
            <span className="text-[11px] font-bold text-[#A53B22] font-['Outfit']">About Us</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#A53B22] text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF7E5F] animate-pulse"></span>
            <span>Talk. Decide. Solve.</span>
          </div>

          <h1 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D1A23] tracking-tight leading-tight">
            We build the autonomous voice-to-execution layer for modern software.
          </h1>

          <p className="text-sm sm:text-base text-[#57423D] leading-relaxed">
            T@S was founded to solve a simple problem: voice bots talk too much and do too little. 
            We replace sluggish, multi-second conversational chatbots with a real-time acoustic engine 
            that deterministically executes software actions the moment humans speak.
          </p>
        </div>

        {/* 1. What We Do */}
        <div className="space-y-6">
          <div className="border-b border-[#FFE6DC]/80 pb-3">
            <span className="text-[11px] font-mono font-bold text-[#A53B22] uppercase tracking-wider">
              Core Purpose
            </span>
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">
              What We Do
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">hearing</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">1. Talk (Listen)</h3>
                <p className="text-xs text-[#57423D] leading-relaxed">
                  Callers speak in everyday natural human language over telephony SIP or WebRTC. 
                  Our pipeline breaks down phonemes and acoustic intent in under 480ms.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">psychology</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">2. Decide (Map)</h3>
                <p className="text-xs text-[#57423D] leading-relaxed">
                  Rather than guessing or hallucinating answers, our engine extracts and validates exact 
                  parameter arguments against your developer-registered OpenAPI tool schemas.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">3. Solve (Execute)</h3>
                <p className="text-xs text-[#57423D] leading-relaxed">
                  Your webhooks, database mutations, and backend endpoints execute immediately, 
                  returning spoken conversational confirmations back to the caller in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. How We Are Better Than Other Alternatives */}
        <div className="space-y-6">
          <div className="border-b border-[#FFE6DC]/80 pb-3">
            <span className="text-[11px] font-mono font-bold text-[#A53B22] uppercase tracking-wider">
              Competitive Advantage
            </span>
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">
              How We Are Better Than Other Voice AI Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">speed</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">Sub-850ms vs 3-5s Delays</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                Traditional voice bots pass audio through multiple heavy cloud layers, causing awkward 3 to 5 second silences. 
                T@S operates on a synchronized acoustic graph that completes reasoning and execution in sub-850ms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">lock</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">Zero Audio Storage Guarantee</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                Most telephony aggregators record, store, and mine your voice calls. 
                T@S processes voice strictly in volatile RAM and immediately purges audio frames. 
                Your customer voice data is never stored on disk or used for model training.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">savings</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">70-80% Lower Costs</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                No high per-minute voice markups or unpredictable per-token LLM bills. 
                We charge simple, transparent Action Units. You pay only for real, completed software operations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">check_circle</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">Deterministic Real Execution</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                Conversational LLMs are notorious for hallucinating promises they cannot fulfill. 
                T@S enforces strict schema validation before any API dispatch, ensuring zero false-positive mutations.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Types of Benefits We Provide */}
        <div className="space-y-6">
          <div className="border-b border-[#FFE6DC]/80 pb-3">
            <span className="text-[11px] font-mono font-bold text-[#A53B22] uppercase tracking-wider">
              Developer &amp; Business Value
            </span>
            <h2 className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">
              What Benefits You Receive
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                title: '5-Minute Drop-in Integration',
                desc: 'Works with your existing backend stack. Native SDKs for Python, Django, React, plus standard REST endpoints. Simply import your OpenAPI JSON to register tools.',
                icon: 'extension'
              },
              {
                title: 'Multi-Tenant Security & Automated Pruning',
                desc: 'Isolated application clusters with dedicated API keys and encrypted schemas. Database session history is automatically capped at 300 entries to prevent storage bloat.',
                icon: 'security'
              },
              {
                title: 'Built-in Visual Tool Builder & Templates',
                desc: 'Build, test, and deploy telephony endpoints visually with pre-built starter templates for task management, calendar bookings, banking inquiries, and refunds.',
                icon: 'build'
              },
              {
                title: '99.98% High-Throughput SLA',
                desc: 'Architected for enterprise reliability with multi-region failover and real-time automated health probes.',
                icon: 'verified'
              }
            ].map((b, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#FFE6DC] flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-[#A53B22] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">{b.icon}</span>
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-[#1D1A23]">{b.title}</h3>
                  <p className="text-xs text-[#57423D] mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#18161D] to-[#25202D] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-['Outfit'] text-xl font-bold">Ready to voice-enable your software?</h3>
            <p className="text-xs text-[#A49BAF]">
              Provision your first application cluster in under 60 seconds with 2,000 free Action Units.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('services')}
              className="px-4 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-all"
            >
              Explore Services
            </button>
            <button
              onClick={() => {
                if (developer) onNavigate('developer-dashboard');
                else onOpenAuth('Sign in or register to get started for free.');
              }}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FFAE33] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all"
            >
              Start Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
