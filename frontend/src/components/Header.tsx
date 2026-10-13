import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
import { TATSBackendAPI } from '../services/api';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommand: () => void;
  onOpenWizard: () => void;
  developer: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    is_admin?: boolean;
    is_verified?: boolean;
  } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  applications: any[];
  activeAppId: string;
  onSelectApp: (app: any) => void;
  onOpenCreateApp: () => void;
}

const AD_LINES = [
  "⚡ Sub-850ms Voice AI Telephony Infrastructure",
  "🎙️ 6s Zero-Shot Real-Time Voice Cloning",
  "⚙️ Dynamic OpenAPI Function Tool Execution",
  "🛡️ Isolated Multi-Tenant Enterprise Clusters",
  "📞 Real-Time SIP & WebRTC Telephony Streaming",
  "🚀 99.98% High-Throughput SLA Reliability"
];

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
  const [showQuickstartModal, setShowQuickstartModal] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  // Dynamic Real Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Click Outside References
  const envDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeApp = applications.find((a) => a.id === activeAppId) || applications[0];

  // Vertical ad autoscroll interval
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % AD_LINES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    if (!developer) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const res = await TATSBackendAPI.getNotifications();
    if (res) {
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (developer) {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [developer]);

  // Click outside listener: Automatically closes header dropdowns when user clicks anywhere else
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showEnvDropdown && envDropdownRef.current && !envDropdownRef.current.contains(target)) {
        setShowEnvDropdown(false);
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEnvDropdown, showNotifications, showUserMenu]);

  const handleMarkAllRead = async () => {
    await TATSBackendAPI.markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setTimeout(() => {
      setShowNotifications(false);
    }, 300);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#FFFFFF]/85 backdrop-blur-xl border-b border-[#FFE6DC]/60 shadow-[0_1px_8px_rgba(30,27,36,0.03)]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 min-w-max">
          <button
            onClick={() => onNavigate(developer ? 'developer-dashboard' : 'landing')}
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

        {/* Header Center: Auto-scrolling T@S Ad on Landing/Public, or Quick Command Search when Logged-in */}
        {developer && currentView !== 'landing' ? (
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
        ) : (
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-2 overflow-hidden">
            <button
              onClick={() => {
                if (!developer) onOpenAuth();
                else onNavigate('demo');
              }}
              title="Click to explore T@S Autonomous Telephony Engine"
              className="w-full h-8 px-1 bg-transparent border-0 shadow-none flex items-center overflow-hidden text-left cursor-pointer focus:outline-none"
            >
              <div className="h-7 overflow-hidden relative flex items-center w-full">
                <div
                  key={adIndex}
                  className="text-xs font-semibold text-[#1D1A23] whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {AD_LINES[adIndex]}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Status Indicators & Profile Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Useful In-App SDK Quickstart Button (Visible only when not logged in) */}
          {!developer && (
            <button
              onClick={() => setShowQuickstartModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] border border-[#DEC0B9]/40 text-[#57423D] hover:text-[#1D1A23] text-xs font-semibold transition-all shadow-sm"
              title="View SDK installation and quickstart guide"
            >
              <span className="material-symbols-outlined text-[16px] text-[#A53B22]">terminal</span>
              <span>SDK Quickstart</span>
            </button>
          )}

          {/* Real Application Cluster Selector Dropdown (When Logged In) */}
          {developer && (
            <div ref={envDropdownRef} className="relative">
              <button
                onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F1FE] hover:bg-[#EDE5F2] border border-[#DEC0B9]/30 text-[#1D1A23] text-xs font-semibold transition-all shadow-[0_1px_4px_rgba(255,126,95,0.04)]"
              >
                <span className="material-symbols-outlined text-[#845400] text-[16px]">dns</span>
                <span className="truncate max-w-[170px]">{activeApp ? activeApp.app_name : 'No App Selected'}</span>
                <span className="material-symbols-outlined text-[16px] text-[#8B716B]">expand_more</span>
              </button>

              {showEnvDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#FFE6DC] p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#8B716B] uppercase font-['Outfit'] border-b border-[#FFE6DC]/50">
                    <span>Your App Clusters</span>
                    <span className="font-mono text-[#A53B22]">{applications.length} Active</span>
                  </div>
                  <div className="py-1 max-h-56 overflow-y-auto">
                    {applications.length === 0 ? (
                      <div className="px-3 py-3 text-center text-xs text-[#8B716B]">
                        No application clusters yet. Click below to provision one.
                      </div>
                    ) : (
                      applications.map((app) => (
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
                      ))
                    )}
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
          )}

          {/* Wizard Launcher Icon Button (Logged In Only) */}
          {developer && (
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF7E5F]/15 to-[#FFAE33]/15 hover:from-[#FF7E5F]/25 hover:to-[#FFAE33]/25 text-[#A53B22] border border-[#FF7E5F]/30 text-xs font-semibold transition-all"
              title="Open End-User Setup Wizard"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span className="hidden sm:inline font-mono text-[11px]">&lt;TASWizard /&gt;</span>
            </button>
          )}

          {/* Dynamic Real Notifications Dropdown (Top 10 Notifications) */}
          {developer && (
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-[#57423D] hover:text-[#1D1A23] hover:bg-[#F3EBF8] transition-colors"
                title="Real-Time Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-[#FF5F45] text-white text-[9px] font-bold font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#FFE6DC] p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]/60 mb-2">
                    <span className="text-xs font-bold text-[#1D1A23] font-['Outfit'] uppercase">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#A53B22] hover:underline font-bold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#8B716B]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.is_read) {
                              TATSBackendAPI.markNotificationRead(notif.id);
                              setNotifications((prev) =>
                                prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
                              );
                              setUnreadCount((c) => Math.max(0, c - 1));
                            }
                            if (notif.link) {
                              setShowNotifications(false);
                              if (notif.link.includes('billing') || notif.link.includes('pricing')) {
                                onNavigate('subscription-pricing');
                              } else {
                                onNavigate('developer-dashboard');
                              }
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            notif.is_read
                              ? 'bg-[#FAF9F6] border-[#FFE6DC]/40 text-[#57423D] hover:bg-[#FAF9F6]/80'
                              : 'bg-[#FFF8EB] border-[#FDE047] text-[#1D1A23] hover:bg-[#FEF3C7]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs font-['Outfit']">{notif.title}</span>
                            <span className="text-[10px] text-[#8B716B] font-mono">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Complete History Link Footer */}
                  <div className="pt-2.5 border-t border-[#FFE6DC]/60 mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#8B716B]">
                      Showing top {Math.min(10, notifications.length)} of {notifications.length}
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs text-[#A53B22] hover:text-[#84240D] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>View All History</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Sign In Button */}
          {developer ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#00C2FF] p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#A53B22] uppercase">
                    {developer.name ? developer.name.slice(0, 2) : 'DV'}
                  </div>
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1D1A23] leading-none group-hover:text-[#A53B22] transition-colors">
                    {developer.name}
                  </span>
                  <span className="text-[10px] text-[#57423D] leading-none mt-1 font-mono">
                    {developer.is_admin ? 'Admin' : 'Developer'}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#FFE6DC] p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#FFE6DC]/50">
                    <p className="text-xs font-bold text-[#1D1A23]">{developer.name}</p>
                    <p className="text-[11px] text-[#57423D] truncate">{developer.email}</p>
                    {developer.phone && (
                      <p className="text-[10px] text-[#8B716B] font-mono">{developer.phone}</p>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('notifications');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-[#A53B22]">notifications</span>
                        <span>Notifications History</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#FF5F45] text-white text-[9px] font-bold font-mono">
                          {unreadCount}
                        </span>
                      )}
                    </button>
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
                      <span>Workspace Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('subscription-pricing');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#006688]">payments</span>
                      <span>Subscription & Plans</span>
                    </button>

                    {/* ONLY VISIBLE TO DESIGNATED PLATFORM ADMIN */}
                    {developer.is_admin && (
                      <button
                        onClick={() => {
                          onNavigate('super-admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#845400] font-bold hover:bg-[#FFF8EB] rounded-lg flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[#845400]">admin_panel_settings</span>
                        <span>Platform Governance</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#1D1A23] hover:bg-[#F8F1FE] rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#A53B22]">settings</span>
                      <span>Account & Agent Settings</span>
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
                onClick={() => {
                  const pricingEl = document.getElementById('pricing');
                  if (pricingEl) {
                    pricingEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('subscription-pricing');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DEC0B9]/60 hover:border-[#A53B22] text-[#57423D] hover:text-[#A53B22] text-xs font-semibold bg-[#FAF9F6] transition-all"
                title="View Transparent Pricing Plans"
              >
                <span className="material-symbols-outlined text-[15px] text-[#A53B22]">payments</span>
                <span>Plans</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-xs font-bold shadow-sm shadow-[#FF5F45]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">login</span>
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Useful Interactive SDK Quickstart Modal */}
      {showQuickstartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setShowQuickstartModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#FFE6DC] p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#FFE6DC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#A53B22]/10 text-[#A53B22] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">T@S SDK Quickstart</h3>
                  <p className="text-[11px] text-[#57423D]">Integrate deterministic acoustic AI into your stack</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickstartModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#8B716B] hover:bg-[#FAF9F6]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <span className="font-bold text-[#1D1A23] font-['Outfit']">1. Install Client SDK</span>
                <div className="mt-1.5 p-3 rounded-xl bg-[#1A1816] text-[#F4EFEA] font-mono text-[11px] flex items-center justify-between">
                  <span>pip install tats-ai  # or npm i @tats/sdk</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('pip install tats-ai')}
                    className="text-[#FF7E5F] hover:underline font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#1D1A23] font-['Outfit']">2. Initialize in 3 Lines of Python</span>
                <div className="mt-1.5 p-3 rounded-xl bg-[#1A1816] text-[#F4EFEA] font-mono text-[11px] overflow-x-auto leading-relaxed">
                  <span className="text-[#8B716B]"># Connect directly to your live cluster</span><br />
                  <span className="text-[#FF7E5F]">from</span> tats <span className="text-[#FF7E5F]">import</span> AcousticAgent<br />
                  agent = AcousticAgent(api_key=<span className="text-emerald-400">"tas_live_..."</span>)<br />
                  response = agent.execute_voice(audio_stream)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8EB] border border-[#FDE047] text-[11px] text-[#854D0E]">
                <strong>Sub-100ms Action Routing:</strong> Every voice stream is processed through the acoustic neural core with verified tool execution.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#FFE6DC] flex justify-end">
              <button
                onClick={() => setShowQuickstartModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#A53B22] text-white font-bold text-xs shadow-sm hover:opacity-90"
              >
                Close Quickstart
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
