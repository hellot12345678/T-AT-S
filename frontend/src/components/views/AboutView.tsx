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
            We connect human voice directly to your software.
          </h1>

          <p className="text-sm sm:text-base text-[#57423D] leading-relaxed">
            T@S was built to fix a simple frustration: most voice bots talk a lot, but cannot actually do anything. 
            We replace slow, 5-second chatbots with a fast voice engine that runs your API the moment someone speaks.
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
                  Callers speak naturally over phone lines or web browsers. 
                  T@S understands what they want in under half a second.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">psychology</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">2. Decide (Match)</h3>
                <p className="text-xs text-[#57423D] leading-relaxed">
                  Instead of guessing or making things up, T@S extracts the exact names, dates, or numbers 
                  needed to call your API safely.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#FFE6DC] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFDAD2]/40 text-[#A53B22] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">3. Solve (Run)</h3>
                <p className="text-xs text-[#57423D] leading-relaxed">
                  Your API runs immediately, updates your database, and gives a clear spoken confirmation 
                  back to the caller in real time.
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
                Most voice bots make callers wait 3 to 5 awkward seconds between replies. 
                T@S processes voice and triggers your code in under 1 second, keeping conversations natural and snappy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">lock</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">Zero Audio Saved on Disk</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                Most voice platforms record and store your calls on disk. 
                T@S processes audio directly in memory and deletes it immediately after the call. 
                We never save recordings or train models on your data.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">savings</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">70-80% Lower Costs</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                No surprise bills or high per-minute charges. 
                You only pay transparent units when user questions, replies, or API actions actually run.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#FFE6DC] space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF7E5F] text-[20px]">check_circle</span>
                <h3 className="font-bold text-sm text-[#1D1A23] font-['Outfit']">Reliable Code Execution (No Guessing)</h3>
              </div>
              <p className="text-xs text-[#57423D] leading-relaxed">
                AI chatbots often make up answers or promise things they cannot do. 
                T@S checks every parameter before running your API, ensuring your app runs accurately every time.
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
                title: '5-Minute Setup',
                desc: 'Connect your Python, Django, or React app in minutes. Import your existing OpenAPI file or define endpoints in our visual builder.',
                icon: 'extension'
              },
              {
                title: 'Private Workspaces & Security',
                desc: 'Private workspaces with dedicated API keys. Your data stays separate, safe, and organized with automated history cleanup.',
                icon: 'security'
              },
              {
                title: 'Visual Tool Builder & Templates',
                desc: 'Build and test your API tools visually. Choose from ready-to-use templates for bookings, customer support, and orders.',
                icon: 'build'
              },
              {
                title: 'Reliable 99.98% Uptime',
                desc: 'Built for mission-critical apps with automatic failover and 99.98% uptime.',
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
              Create your free account in under 60 seconds with 2,000 free Action Units included.
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

