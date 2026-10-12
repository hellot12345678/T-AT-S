import React, { useState } from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommand: () => void;
  onOpenWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCommand,
  onOpenWizard
}) => {
  const [selectedEnv, setSelectedEnv] = useState('Production: Acme App (v2.4)');
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const envs = [
    'Production: Acme App (v2.4)',
    'Staging: Acme Hotfix (v2.5-rc)',
    'Local Node (127.0.0.1:8000)'
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#FFFFFF]/85 backdrop-blur-xl border-b border-[#FFE6DC]/60 shadow-[0_1px_8px_rgba(30,27,36,0.03)]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 min-w-max">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(255,95,69,0.25)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Outfit'] font-bold text-xl tracking-tight text-[#1D1A23]">
                T@S
              </span>
            </div>
          </button>
        </div>

        {/* Global Quick Command Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-2">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full bg-[#F3EBF8]/50 hover:bg-[#F3EBF8] border border-[#DEC0B9]/40 text-[#57423D] hover:text-[#1D1A23] transition-all text-xs font-medium group"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#A53B22]">search</span>
              <span>Search tools, routes, or commands...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/80 border border-[#DEC0B9]/60 text-[10px] font-mono text-[#57423D]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Status Indicators & Profile Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Environment Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F1FE] hover:bg-[#EDE5F2] border border-[#DEC0B9]/30 text-[#1D1A23] text-xs font-semibold transition-all shadow-[0_1px_4px_rgba(255,126,95,0.04)]"
            >
              <span className="material-symbols-outlined text-[#845400] text-[16px]">dns</span>
              <span className="truncate max-w-[170px]">{selectedEnv}</span>
              <span className="material-symbols-outlined text-[16px] text-[#8B716B]">expand_more</span>
            </button>

            {showEnvDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit']">
                  Cluster Environment
                </div>
                {envs.map((env) => (
                  <button
                    key={env}
                    onClick={() => {
                      setSelectedEnv(env);
                      setShowEnvDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedEnv === env
                        ? 'bg-[#FFDAD2]/40 text-[#A53B22] font-semibold'
                        : 'hover:bg-[#FAF9F6] text-[#1D1A23]'
                    }`}
                  >
                    <span>{env}</span>
                    {selectedEnv === env && (
                      <span className="material-symbols-outlined text-[16px] text-[#A53B22]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wizard Launcher Icon Button in Header */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF7E5F]/15 to-[#FFAE33]/15 hover:from-[#FF7E5F]/25 hover:to-[#FFAE33]/25 text-[#A53B22] border border-[#FF7E5F]/30 text-xs font-semibold transition-all"
            title="Open End-User Setup Wizard"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span className="hidden sm:inline font-mono text-[11px]">&lt;TASWizard /&gt;</span>
          </button>

          {/* Notifications Flyout */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-[#57423D] hover:text-[#1D1A23] hover:bg-[#F3EBF8] transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5F45] ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]/60 mb-2">
                  <span className="text-xs font-bold text-[#1D1A23] font-['Outfit'] uppercase">
                    Live Acoustic Alerts
                  </span>
                  <span className="text-[10px] bg-[#FFDAD2] text-[#84240D] font-bold px-1.5 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#FFE6DC]/40">
                    <p className="font-semibold text-[#1D1A23]">Webhook auto-dispatched (201)</p>
                    <p className="text-[11px] text-[#57423D]">
                      Linear task "Ship review by 5 PM" created in 184ms.
                    </p>
                    <span className="text-[10px] text-[#8B716B]">2m ago</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#FFE6DC]/40">
                    <p className="font-semibold text-[#845400]">Quota Alert (84.2%)</p>
                    <p className="text-[11px] text-[#57423D]">
                      Monthly unit consumption at 16.8k/20k. +10% Grace buffer active.
                    </p>
                    <span className="text-[10px] text-[#8B716B]">14m ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1.5 focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#00C2FF] p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#A53B22]">
                  TDS
                </div>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#1D1A23] leading-none group-hover:text-[#A53B22] transition-colors">
                  tds
                </span>
                <span className="text-[10px] text-[#57423D] leading-none mt-1">Lead Eng</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#FFE6DC]/50">
                  <p className="text-xs font-bold text-[#1D1A23]">tds</p>
                  <p className="text-[11px] text-[#57423D]">tds@acme.engineering</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('developer-dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg"
                  >
                    Workspace Settings
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('super-admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg"
                  >
                    Platform Governance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
