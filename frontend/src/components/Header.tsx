import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { TATSBackendAPI } from '../services/api';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommand: () => void;
  onOpenWizard: () => void;
  developer: { id?: string; name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  applications: any[];
  activeAppId: string;
  onSelectApp: (app: any) => void;
  onOpenCreateApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCommand,
  onOpenWizard,
  developer,
  onOpenAuth,
  onLogout,
  applications,
  activeAppId,
  onSelectApp,
  onOpenCreateApp
}) => {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  const activeApp = applications.find((a) => a.id === activeAppId) || applications[0];

  useEffect(() => {
    const checkEngine = async () => {
      const res = await TATSBackendAPI.checkHealth();
      setIsBackendConnected(Boolean(res && res.status === 'healthy'));
    };
    checkEngine();
    const interval = setInterval(checkEngine, 10000);
    return () => clearInterval(interval);
  }, []);


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
          {/* Live Backend Connection Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm"
               style={{
                 backgroundColor: isBackendConnected ? '#E6F9EE' : '#FFF4E5',
                 borderColor: isBackendConnected ? '#6EE7B7' : '#FCD34D',
                 color: isBackendConnected ? '#065F46' : '#92400E'
               }}
               title={isBackendConnected ? "Connected to Django Acoustic Action Engine at http://127.0.0.1:8000" : "Engine is currently offline (using offline mock mode)"}
          >
            <span
              className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`}
            />
            <span className="hidden sm:inline font-mono text-[11px]">
              {isBackendConnected === null ? 'Engine: Checking...' : isBackendConnected ? 'Engine: Live' : 'Engine: Offline (Mock)'}
            </span>
          </div>

          {/* Real Application Cluster Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F1FE] hover:bg-[#EDE5F2] border border-[#DEC0B9]/30 text-[#1D1A23] text-xs font-semibold transition-all shadow-[0_1px_4px_rgba(255,126,95,0.04)]"
            >
              <span className="material-symbols-outlined text-[#845400] text-[16px]">dns</span>
              <span className="truncate max-w-[170px]">{activeApp ? activeApp.app_name : 'Default Cluster'}</span>
              <span className="material-symbols-outlined text-[16px] text-[#8B716B]">expand_more</span>
            </button>

            {showEnvDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit'] border-b border-[#FFE6DC]/50">
                  <span>Your App Clusters</span>
                  <span className="font-mono text-[#A53B22]">{applications.length} Active</span>
                </div>
                <div className="py-1 max-h-56 overflow-y-auto">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        onSelectApp(app);
                        setShowEnvDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        activeApp?.id === app.id
                          ? 'bg-[#FFDAD2]/40 text-[#A53B22] font-semibold'
                          : 'hover:bg-[#FAF9F6] text-[#1D1A23]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold">{app.app_name}</span>
                        <span className="font-mono text-[10px] text-[#8B716B] truncate">{app.api_key_prefix || 'tas_live_...'}</span>
                      </div>
                      {activeApp?.id === app.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#A53B22]">check</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-1 border-t border-[#FFE6DC]/60">
                  <button
                    onClick={() => {
                      setShowEnvDropdown(false);
                      onOpenCreateApp();
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#A53B22] hover:bg-[#FFDAD2]/30 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>+ Create New Application</span>
                  </button>
                </div>
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

          {/* User Profile or Sign In Button */}
          {developer ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#00C2FF] p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#A53B22] uppercase">
                    {developer.name.slice(0, 2)}
                  </div>
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1D1A23] leading-none group-hover:text-[#A53B22] transition-colors">
                    {developer.name}
                  </span>
                  <span className="text-[10px] text-[#57423D] leading-none mt-1">Developer</span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#FFE6DC]/50">
                    <p className="text-xs font-bold text-[#1D1A23]">{developer.name}</p>
                    <p className="text-[11px] text-[#57423D] truncate">{developer.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenCreateApp();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#006688]">add_circle</span>
                      <span>New Application</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('developer-dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#A53B22]">dashboard</span>
                      <span>Workspace Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('super-admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#845400]">admin_panel_settings</span>
                      <span>Platform Governance</span>
                    </button>
                    <div className="my-1 border-t border-[#FFE6DC]/60"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[15px] text-red-600">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
