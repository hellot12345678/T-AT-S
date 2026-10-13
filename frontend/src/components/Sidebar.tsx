import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isMicActive?: boolean;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMicActive, isAdmin }) => {
  const rawNavItems: { path: AppView; label: string; icon: string }[] = [
    { path: 'developer-dashboard', label: 'Developer Dashboard', icon: 'monitoring' },
    { path: 'visual-tool-builder', label: 'Visual Tool Builder', icon: 'account_tree' },
    { path: 'live-voice-playground', label: 'Live Voice Playground', icon: 'mic' },
    { path: 'component-wizard', label: 'Component Wizard', icon: 'auto_awesome' },
    ...(isAdmin
      ? [
          { path: 'super-admin' as AppView, label: 'Platform Governance', icon: 'admin_panel_settings' },
          { path: 'subscription-pricing' as AppView, label: 'Subscription & Plans', icon: 'payments' },
        ]
      : [{ path: 'subscription-pricing' as AppView, label: 'Subscription & Plans', icon: 'payments' }]),
    { path: 'notifications' as AppView, label: 'Notifications & Alerts', icon: 'notifications' },
    { path: 'settings' as AppView, label: 'Account & Settings', icon: 'settings' },
  ];

  const navItems = rawNavItems.map((item, idx) => ({
    ...item,
    shortcut: String(idx + 1),
  }));

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#F8F1FE]/80 backdrop-blur-xl z-30 flex flex-col justify-between py-4 border-r border-[#FFE6DC]/60 shadow-[0_4px_20px_-2px_rgba(30,27,36,0.03)] hidden lg:flex">
      {/* Workspace Menu */}
      <div className="flex flex-col gap-1 px-3">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="font-['Outfit'] text-[11px] font-bold text-[#57423D] uppercase tracking-wider">
            Workspaces
          </span>
          <span className="text-[10px] text-[#8B716B] font-mono">1-{navItems.length}</span>
        </div>

        <nav className="flex flex-col gap-1 mt-1">
          {navItems.map((item) => {
            const isActive = currentView === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold group text-left ${
                  isActive
                    ? 'bg-[#FF7E5F] text-white shadow-[0_4px_16px_-2px_rgba(255,126,95,0.35)] font-bold'
                    : 'text-[#57423D] hover:bg-[#EDE5F2] hover:text-[#1D1A23]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[19px] transition-colors ${
                      isActive ? 'text-white' : 'text-[#8B716B] group-hover:text-[#A53B22]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'text-[#8B716B] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Acoustic Node Bottom Status Box */}
      <div className="px-4">
        <div className="p-3.5 rounded-2xl bg-white/90 border border-[#FFE6DC] shadow-[0_2px_8px_-1px_rgba(255,126,95,0.08)] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#A53B22]">
              <span className="material-symbols-outlined text-[16px] animate-pulse">graphic_eq</span>
              <span className="font-['Outfit'] text-[11px] font-bold uppercase tracking-wider">
                Acoustic Node
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                isMicActive ? 'bg-[#00C2FF] animate-ping' : 'bg-[#10B981]'
              }`}
            />
          </div>
          <p className="text-[11px] text-[#57423D] leading-snug">
            Stream ready on edge cluster. Deterministic action inference under 850ms.
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8B716B] font-mono pt-1 border-t border-[#FFE6DC]/60">
            <span>Sample: 16-bit 48kHz</span>
            <span className="text-[#A53B22] font-semibold">&lt;15ms Buffer</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
