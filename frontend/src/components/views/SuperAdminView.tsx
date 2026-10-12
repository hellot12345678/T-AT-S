import React, { useState, useEffect } from 'react';
import { AppView, DeveloperUser, EndUserVoiceConfig } from '../../types';
import { TENANT_RECORDS, DEVELOPER_USERS, END_USER_VOICE_CONFIGS } from '../../data/mockData';
import { TATSBackendAPI } from '../../services/api';

interface SuperAdminViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  onNavigate,
  onShowToast
}) => {
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active admin tab
  const [adminTab, setAdminTab] = useState<'users' | 'end-users' | 'pricing' | 'database'>('users');

  // Users Directory State
  const [users, setUsers] = useState<DeveloperUser[]>(DEVELOPER_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'Active' | 'Warning' | 'Suspended'>('All');

  // Adjust units modal
  const [selectedUserForUnits, setSelectedUserForUnits] = useState<DeveloperUser | null>(null);
  const [newUnitLimit, setNewUnitLimit] = useState<number>(20000);
  const [bonusUnitsToAdd, setBonusUnitsToAdd] = useState<number>(1000);

  // Pricing & units state
  const [baseTierPrice, setBaseTierPrice] = useState(4999);
  const [freeAllowance, setFreeAllowance] = useState(2000);
  const [gracePercent, setGracePercent] = useState(10);
  const [overageUnitCost, setOverageUnitCost] = useState(0.35);

  const [textMultiplier, setTextMultiplier] = useState(1.0);
  const [voiceMultiplier, setVoiceMultiplier] = useState(2.0);
  const [toolMultiplier, setToolMultiplier] = useState(3.0);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Fetch live platform config from Django backend
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchConfig = async () => {
      const config = await TATSBackendAPI.getPlatformConfig();
      if (config) {
        if (config.starter_price_inr) setBaseTierPrice(Number(config.starter_price_inr));
        if (config.free_tier_units) setFreeAllowance(Number(config.free_tier_units));
        if (config.grace_buffer_pct) setGracePercent(Number(config.grace_buffer_pct));
        if (config.cost_per_extra_unit) setOverageUnitCost(Number(config.cost_per_extra_unit));
        if (config.text_multiplier) setTextMultiplier(Number(config.text_multiplier));
        if (config.voice_multiplier) setVoiceMultiplier(Number(config.voice_multiplier));
        if (config.tool_multiplier) setToolMultiplier(Number(config.tool_multiplier));
      }
    };
    fetchConfig();
  }, [isAuthenticated]);

  const handleSavePlatformConfig = async () => {
    setIsSavingConfig(true);
    const payload = {
      starter_price_inr: baseTierPrice,
      free_tier_units: freeAllowance,
      grace_buffer_pct: gracePercent,
      cost_per_extra_unit: overageUnitCost,
      text_multiplier: textMultiplier,
      voice_multiplier: voiceMultiplier,
      tool_multiplier: toolMultiplier,
    };
    try {
      const res = await TATSBackendAPI.updatePlatformConfig(payload);
      if (res.ok) {
        onShowToast('Platform Config Synchronized', 'Pricing and multipliers saved to Django database.');
        setIsSavingConfig(false);
        return;
      }
    } catch {
      // Fallback
    }
    setIsSavingConfig(false);
    onShowToast('Settings Saved', 'Platform parameters updated in local state.');
  };

  // End user configs
  const [endUserConfigs, setEndUserConfigs] = useState<EndUserVoiceConfig[]>(END_USER_VOICE_CONFIGS);

  // Financial calculations
  const tenantCount = users.length > 0 ? users.length * 100 : 500;
  const subRevenue = baseTierPrice * tenantCount;
  const avgUnitsPerTenant = 8500;
  const overUnitsPerTenant = Math.max(0, avgUnitsPerTenant - freeAllowance);
  const totalOverUnits = overUnitsPerTenant * tenantCount;
  const overageRevenue = totalOverUnits * overageUnitCost;
  const totalRevenue = subRevenue + overageRevenue;
  const estPlatformInfra = totalRevenue * 0.28;
  const netMargin = totalRevenue - estPlatformInfra;

  // Password Unlock Handler
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      onShowToast('Admin Portal Unlocked', 'Welcome back, Platform Administrator.');
    } else {
      setAuthError('Incorrect master password. Please use the demo password: admin123');
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError('');
    onShowToast('Admin Portal Locked', 'Session locked for security.');
  };

  // User Actions
  const handleResetApiKey = (user: DeveloperUser) => {
    const newKey = `tas_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setUsers(users.map((u) => (u.id === user.id ? { ...u, apiKey: newKey } : u)));
    onShowToast(`Reset API Key for ${user.name}`, `New key generated: ${newKey.substring(0, 14)}••••`);
  };

  const handleToggleSuspend = (user: DeveloperUser) => {
    const newStatus = user.planStatus === 'Suspended' ? 'Active' : 'Suspended';
    setUsers(users.map((u) => (u.id === user.id ? { ...u, planStatus: newStatus } : u)));
    onShowToast(
      `${user.appName} is now ${newStatus}`,
      newStatus === 'Suspended' ? 'Voice calls paused for this app.' : 'Access restored.'
    );
  };

  const handleWipeUserMemories = (user: DeveloperUser) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, memoryCount: 0 } : u)));
    onShowToast(`Cleared Voice Memories`, `All ${user.memoryCount} memory records deleted for ${user.appName}.`);
  };

  const handleSaveUnitAdjustment = () => {
    if (!selectedUserForUnits) return;
    setUsers(
      users.map((u) =>
        u.id === selectedUserForUnits.id
          ? {
              ...u,
              monthlyLimit: newUnitLimit,
              unitsUsed: Math.max(0, u.unitsUsed - bonusUnitsToAdd)
            }
          : u
      )
    );
    onShowToast(
      `Updated Limits for ${selectedUserForUnits.appName}`,
      `Limit set to ${newUnitLimit.toLocaleString()} units (+${bonusUnitsToAdd.toLocaleString()} bonus granted).`
    );
    setSelectedUserForUnits(null);
  };

  // Filtered Developer Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.appName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatusFilter === 'All' || u.planStatus === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // PASSWORD GATE VIEW (WHEN LOCKED)
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-8 border border-[#FFE6DC] shadow-[0_20px_50px_-10px_rgba(255,126,95,0.18)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          {/* Key Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFAE33] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(255,126,95,0.35)] mb-5">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>

          <h2 className="font-['Outfit'] text-2xl font-bold text-[#1D1A23]">
            Admin Access Required
          </h2>
          <p className="text-xs sm:text-sm text-[#57423D] mt-2 mb-6 max-w-xs leading-relaxed">
            Please enter your master password to manage users, pricing, and system settings.
          </p>

          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter master password..."
                className="w-full h-12 pl-4 pr-11 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] text-sm text-[#1D1A23] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7E5F] transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8B716B] hover:text-[#1D1A23] p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-[#FFDAD6] border border-[#BA1A1A]/20 text-[#93000A] text-xs flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#FF7E5F] via-[#FF5F45] to-[#FFAE33] hover:from-[#FF5F45] hover:to-[#FFAE33] text-white font-['Outfit'] font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Portal</span>
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
            </button>
          </form>

          {/* Helper note */}
          <div className="mt-6 pt-4 border-t border-[#FFE6DC]/60 w-full text-xs text-[#8B716B] flex items-center justify-center gap-1.5 font-mono">
            <span className="material-symbols-outlined text-[14px] text-[#A53B22]">key</span>
            <span>(Use demo password: <strong className="text-[#A53B22]">admin123</strong>)</span>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED ADMIN PORTAL VIEW
  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Admin Hero Header Block */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDAD2] text-[#84240D] font-['Outfit'] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F45] animate-pulse"></span>
              Admin Portal • Master Control
            </span>
            <span className="text-xs text-[#57423D] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#006688]">lock_open</span>
              Session Unlocked
            </span>
          </div>

          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1D1A23] tracking-tight">
            Platform Admin: Users, Pricing & System Control
          </h1>
          <p className="text-xs sm:text-sm text-[#57423D] max-w-2xl">
            Manage developer accounts, inspect user voice setups, tune pricing plans, and monitor system health.
          </p>
        </div>

        {/* Action Buttons & Lock Button */}
        <div className="flex flex-wrap items-center gap-2 min-w-max">
          <button
            onClick={() => onShowToast('Cache Flushed', 'Memory search cache cleared across all servers.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-[#57423D]">cached</span>
            <span>Refresh Cache</span>
          </button>
          <button
            onClick={() => onShowToast('Usage Exported', 'Downloaded complete developer accounts CSV.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] text-xs font-semibold border border-[#FFE6DC] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-[#845400]">download</span>
            <span>Export User CSV</span>
          </button>
          <button
            onClick={() => onShowToast('Settings Saved', 'Platform pricing and user settings saved successfully.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Save Platform Settings</span>
          </button>
          {/* Lock Admin Portal Button */}
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFDAD6] hover:bg-[#FFDAD6]/80 text-[#93000A] text-xs font-bold transition-all border border-[#BA1A1A]/20"
            title="Lock Admin Portal"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#FFE6DC] rounded-2xl shadow-sm overflow-x-auto">
        {[
          { id: 'users', label: 'User & App Directory', icon: 'group' },
          { id: 'end-users', label: 'End-User Voice Setups', icon: 'record_voice_over' },
          { id: 'pricing', label: 'Pricing Plans & Unit Calculator', icon: 'payments' },
          { id: 'database', label: 'Separate & Secure App Accounts', icon: 'shield' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === tab.id
                ? 'bg-[#FF7E5F] text-white shadow-sm'
                : 'text-[#57423D] hover:bg-[#FAF9F6] hover:text-[#1D1A23]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: COMPLETE USER & APP DIRECTORY */}
      {adminTab === 'users' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">
                Developer & Application Directory
              </h2>
              <p className="text-xs text-[#57423D]">
                Search, inspect, and adjust limits or security settings for all connected customer accounts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#57423D] font-mono">
                Total Developers: <strong className="text-[#1D1A23]">{users.length}</strong>
              </span>
            </div>
          </div>

          {/* Search & Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF9F6] p-3 rounded-2xl border border-[#FFE6DC]">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#FFE6DC] flex-1 max-w-md">
              <span className="material-symbols-outlined text-[18px] text-[#8B716B]">search</span>
              <input
                type="text"
                placeholder="Search by developer name, app, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs text-[#1D1A23] bg-transparent focus:outline-none placeholder:text-[#8B716B]"
              />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="text-[#8B716B] hover:text-[#1D1A23]">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <span className="text-[#8B716B] text-[11px] uppercase font-['Outfit'] font-bold pr-1">Status:</span>
              {(['All', 'Active', 'Warning', 'Suspended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setUserStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    userStatusFilter === status
                      ? 'bg-[#1D1A23] text-white font-bold'
                      : 'bg-white text-[#57423D] hover:bg-[#EDE5F2] border border-[#FFE6DC]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[840px] text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] text-[#8B716B] text-[11px] font-['Outfit'] uppercase tracking-wider border-b border-[#FFE6DC]">
                  <th className="py-3 px-3 rounded-l-xl">Developer & App</th>
                  <th className="py-3 px-3">Contact Email</th>
                  <th className="py-3 px-3">Connected Base URL</th>
                  <th className="py-3 px-3">Units Used / Limit</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 rounded-r-xl text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFE6DC]/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#8B716B]">
                      No developer accounts match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const usagePercent = Math.round((user.unitsUsed / user.monthlyLimit) * 100);
                    return (
                      <tr key={user.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1D1A23] text-sm">{user.appName}</span>
                            <span className="text-xs text-[#57423D]">{user.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-xs text-[#57423D]">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-[#006688] max-w-[200px] truncate">
                          {user.baseUrl}
                        </td>

                        <td className="py-3.5 px-3 min-w-[170px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>{user.unitsUsed.toLocaleString()}</span>
                              <span className="text-[#8B716B]">/ {user.monthlyLimit.toLocaleString()}</span>
                              <span className={`font-bold ${usagePercent > 100 ? 'text-[#BA1A1A]' : 'text-[#A53B22]'}`}>
                                ({usagePercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#EDE5F2] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  user.planStatus === 'Suspended'
                                    ? 'bg-[#8B716B]'
                                    : usagePercent > 90
                                    ? 'bg-[#BA1A1A]'
                                    : 'bg-[#FF7E5F]'
                                }`}
                                style={{ width: `${Math.min(100, usagePercent)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-['Outfit'] ${
                              user.planStatus === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.planStatus === 'Warning'
                                ? 'bg-[#FFDDB6] text-[#643F00]'
                                : 'bg-[#FFDAD6] text-[#93000A]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.planStatus === 'Active'
                                  ? 'bg-emerald-600'
                                  : user.planStatus === 'Warning'
                                  ? 'bg-[#FFAE33]'
                                  : 'bg-[#BA1A1A]'
                              }`}
                            ></span>
                            {user.planStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-[#57423D] text-[11px]">
                          {user.joinedDate}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Adjust Units */}
                            <button
                              onClick={() => {
                                setSelectedUserForUnits(user);
                                setNewUnitLimit(user.monthlyLimit);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#FFE6DC] hover:bg-[#F8F1FE] text-[#1D1A23] font-bold text-[11px] transition-colors"
                              title="Adjust units or monthly limit"
                            >
                              Units
                            </button>

                            {/* Reset Key */}
                            <button
                              onClick={() => handleResetApiKey(user)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#FFE6DC] hover:bg-[#F8F1FE] text-[#845400] font-bold text-[11px] transition-colors"
                              title="Reset API Key"
                            >
                              New Key
                            </button>

                            {/* Wipe Memories */}
                            <button
                              onClick={() => handleWipeUserMemories(user)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#FFE6DC] hover:bg-[#FFDAD6] text-[#93000A] font-bold text-[11px] transition-colors"
                              title="Wipe stored voice memories"
                            >
                              Wipe
                            </button>

                            {/* Suspend / Activate Toggle */}
                            <button
                              onClick={() => handleToggleSuspend(user)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                                user.planStatus === 'Suspended'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#FFDAD6]/80'
                              }`}
                              title={user.planStatus === 'Suspended' ? 'Reactivate App' : 'Suspend App'}
                            >
                              {user.planStatus === 'Suspended' ? 'Activate' : 'Pause'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE END-USER VOICE SETUPS INSPECTOR */}
      {adminTab === 'end-users' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">
                Live End-User Voice Setups & Biometrics
              </h2>
              <p className="text-xs text-[#57423D]">
                Inspect wake words, chosen voice voices, and privacy memory counts for individual callers.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-xs font-mono text-[#57423D]">
              Active Profiles: <strong className="text-[#1D1A23]">{endUserConfigs.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endUserConfigs.map((cfg) => (
              <div
                key={cfg.id}
                className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between gap-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFAE33] flex items-center justify-center text-white font-bold">
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-[#1D1A23] block">{cfg.userId}</span>
                      <span className="text-xs text-[#57423D]">{cfg.developerAppName}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD2] text-[#84240D] font-['Outfit'] text-[10px] font-bold">
                    {cfg.securityMode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#FFE6DC]">
                  <div>
                    <span className="text-[#8B716B] text-[10px] uppercase font-bold font-['Outfit'] block">
                      Custom Wake Word
                    </span>
                    <span className="font-bold text-[#A53B22]">"{cfg.wakePhrase}"</span>
                  </div>
                  <div>
                    <span className="text-[#8B716B] text-[10px] uppercase font-bold font-['Outfit'] block">
                      Voice Persona
                    </span>
                    <span className="font-semibold text-[#1D1A23]">{cfg.voiceTier}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[#8B716B] text-[10px] uppercase font-bold font-['Outfit'] block">
                      Voice Memories
                    </span>
                    <span className="font-mono text-[#006688] font-bold">{cfg.memoryCount} saved</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[#8B716B] text-[10px] uppercase font-bold font-['Outfit'] block">
                      Last Call
                    </span>
                    <span className="text-[#57423D]">{cfg.lastActive}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#8B716B] text-[11px]">Audio file deleted immediately after execution</span>
                  <button
                    onClick={() => {
                      setEndUserConfigs(
                        endUserConfigs.map((c) => (c.id === cfg.id ? { ...c, memoryCount: 0 } : c))
                      );
                      onShowToast(`Purged memories for ${cfg.userId}`, 'Caller voice memories wiped from RAM.');
                    }}
                    className="text-[#93000A] hover:underline font-bold text-[11px]"
                  >
                    Clear Caller Memories
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRICING PLANS & UNIT CALCULATOR */}
      {adminTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left 7 Cols: Sliders with Everyday Clear Terms */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#FFE6DC]">
                <div>
                  <h2 className="font-['Outfit'] text-lg font-bold text-[#1D1A23]">
                    Pricing Plans & Unit Settings
                  </h2>
                  <p className="text-xs text-[#57423D]">
                    Adjust base monthly plan prices, included free units, and cost per extra unit.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#57423D] font-mono text-[11px] font-bold">
                    Live Pricing
                  </span>
                  <button
                    onClick={handleSavePlatformConfig}
                    disabled={isSavingConfig}
                    className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A53B22] hover:bg-[#84240D] text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${isSavingConfig ? 'animate-spin' : ''}`}>
                      {isSavingConfig ? 'refresh' : 'save'}
                    </span>
                    <span>{isSavingConfig ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Slider 1: Base Monthly App Fee */}
              <div className="flex flex-col gap-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#FFE6DC]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#1D1A23] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#A53B22]">payments</span>
                    Base Monthly App Fee
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Outfit'] text-xl font-bold text-[#A53B22]">
                      ₹{baseTierPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#57423D]">/ mo per app</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1999}
                  max={14999}
                  step={500}
                  value={baseTierPrice}
                  onChange={(e) => setBaseTierPrice(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#FF7E5F]"
                />
                <div className="flex justify-between text-[11px] text-[#8B716B] font-mono">
                  <span>₹1,999 (Starter)</span>
                  <span>₹4,999 (Pro)</span>
                  <span>₹14,999 (Scale)</span>
                </div>
              </div>

              {/* Slider 2: Monthly Free Voice Units */}
              <div className="flex flex-col gap-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#FFE6DC]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#1D1A23] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#845400]">token</span>
                    Monthly Free Voice Units Included
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Outfit'] text-xl font-bold text-[#845400]">
                      {freeAllowance.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#57423D]">Free units</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={250}
                  value={freeAllowance}
                  onChange={(e) => setFreeAllowance(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#FFAE33]"
                />
                <div className="flex justify-between text-[11px] text-[#8B716B] font-mono">
                  <span>500 Units</span>
                  <span>2,000 Units (Default)</span>
                  <span>10,000 Units</span>
                </div>
              </div>

              {/* Slider 3: Grace Buffer */}
              <div className="flex flex-col gap-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#FFE6DC]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#1D1A23] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006688]">shield</span>
                      Grace Buffer Before Pause
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-[#C2E8FF] text-[#004D67] font-['Outfit'] text-[9px] font-bold">
                      Prevents Disruption
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Outfit'] text-xl font-bold text-[#006688]">{gracePercent}%</span>
                    <span className="text-xs text-[#57423D]">(+{Math.round((freeAllowance * gracePercent) / 100)} buffer)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={gracePercent}
                  onChange={(e) => setGracePercent(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#00C2FF]"
                />
                <div className="flex justify-between text-[11px] text-[#8B716B]">
                  <span className="text-[#006688] font-semibold">Safe: 0-15%</span>
                  <span className="text-[#845400] font-semibold">Warn: 16-25%</span>
                  <span className="text-[#A53B22] font-semibold">Throttling: &gt;25%</span>
                </div>
              </div>

              {/* Slider 4: Cost per Extra Unit */}
              <div className="flex flex-col gap-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#FFE6DC]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#1D1A23] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#A53B22]">add_shopping_cart</span>
                    Cost per Extra Unit Above Limit
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">
                      ₹{overageUnitCost.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#57423D]">/ unit</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.10}
                  max={1.50}
                  step={0.05}
                  value={overageUnitCost}
                  onChange={(e) => setOverageUnitCost(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE5F2] rounded-lg appearance-none cursor-pointer accent-[#FF7E5F]"
                />
                <div className="flex justify-between text-[11px] text-[#8B716B] font-mono">
                  <span>₹0.10 (Wholesale)</span>
                  <span>₹0.35 (Target)</span>
                  <span>₹1.50 (Peak)</span>
                </div>
              </div>

              {/* Multiplier Weights */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B716B] font-['Outfit']">
                  Live Speech Turn Multipliers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between gap-3">
                    <span className="text-xs font-bold text-[#1D1A23]">Text Message</span>
                    <div className="flex items-center justify-between">
                      <span className="font-['Outfit'] text-lg font-bold text-[#1D1A23]">{textMultiplier.toFixed(1)}x</span>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-[#FFE6DC]">
                        <button
                          onClick={() => setTextMultiplier(1.0)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${textMultiplier === 1.0 ? 'bg-[#FF7E5F] text-white' : 'text-[#57423D]'}`}
                        >
                          1x
                        </button>
                        <button
                          onClick={() => setTextMultiplier(1.2)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${textMultiplier === 1.2 ? 'bg-[#FF7E5F] text-white' : 'text-[#57423D]'}`}
                        >
                          1.2x
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between gap-3">
                    <span className="text-xs font-bold text-[#1D1A23]">Voice Call</span>
                    <div className="flex items-center justify-between">
                      <span className="font-['Outfit'] text-lg font-bold text-[#A53B22]">{voiceMultiplier.toFixed(1)}x</span>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-[#FFE6DC]">
                        <button
                          onClick={() => setVoiceMultiplier(1.5)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${voiceMultiplier === 1.5 ? 'bg-[#FF7E5F] text-white' : 'text-[#57423D]'}`}
                        >
                          1.5x
                        </button>
                        <button
                          onClick={() => setVoiceMultiplier(2.0)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${voiceMultiplier === 2.0 ? 'bg-[#FF7E5F] text-white' : 'text-[#57423D]'}`}
                        >
                          2x
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex flex-col justify-between gap-3">
                    <span className="text-xs font-bold text-[#1D1A23]">Run Live Action</span>
                    <div className="flex items-center justify-between">
                      <span className="font-['Outfit'] text-lg font-bold text-[#006688]">{toolMultiplier.toFixed(1)}x</span>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-[#FFE6DC]">
                        <button
                          onClick={() => setToolMultiplier(2.5)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${toolMultiplier === 2.5 ? 'bg-[#00C2FF] text-white' : 'text-[#57423D]'}`}
                        >
                          2.5x
                        </button>
                        <button
                          onClick={() => setToolMultiplier(3.0)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${toolMultiplier === 3.0 ? 'bg-[#00C2FF] text-white' : 'text-[#57423D]'}`}
                        >
                          3x
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Platform Profit & Cost Forecast */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-['Outfit'] text-base font-bold text-[#1D1A23]">
                  Platform Profit & Cost Forecast
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A53B22] px-2 py-0.5 rounded-full bg-[#FFDAD2] font-['Outfit']">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7E5F] animate-ping"></span>
                  Live Model
                </span>
              </div>

              <p className="text-xs text-[#57423D]">
                Forecasted revenue and margins assuming 500 apps averaging 8,500 monthly transactions each.
              </p>

              <div className="flex flex-col gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between">
                  <span className="text-[#57423D]">Total Monthly Subscriptions</span>
                  <span className="font-['Outfit'] font-bold text-sm text-[#1D1A23]">
                    ₹{Math.round(subRevenue).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between">
                  <span className="text-[#57423D]">Extra Units Billed</span>
                  <span className="font-mono font-bold text-xs text-[#1D1A23]">
                    {totalOverUnits.toLocaleString('en-IN')} units
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-between">
                  <span className="text-[#57423D]">Extra Units Revenue</span>
                  <span className="font-['Outfit'] font-bold text-sm text-[#A53B22]">
                    ₹{Math.round(overageRevenue).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFDAD2]/40 border border-[#FF7E5F]/30 flex items-center justify-between">
                  <span className="font-bold text-[#84240D]">Estimated Net Profit</span>
                  <span className="font-['Outfit'] font-extrabold text-base text-[#84240D]">
                    ₹{Math.round(netMargin).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-[11px] text-[#57423D]">
                Formula: <code className="font-bold text-[#A53B22]">Units = (Text × {textMultiplier}) + (Voice × {voiceMultiplier}) + (Backend Actions × {toolMultiplier})</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEPARATE & SECURE APP ACCOUNTS */}
      {adminTab === 'database' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">
                Separate & Secure App Accounts
              </h2>
              <p className="text-xs text-[#57423D]">
                Every app runs inside its own isolated database partition. No customer ever sees another customer's data or voice transcripts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-[#57423D]">
                Memory RAM: <strong className="text-[#1D1A23]">38.4 GB / 64 GB (60%)</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[720px] text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] text-[#8B716B] text-[11px] font-['Outfit'] uppercase tracking-wider border-b border-[#FFE6DC]">
                  <th className="py-2.5 px-3 rounded-l-xl">App Account</th>
                  <th className="py-2.5 px-3">Private Memory Space</th>
                  <th className="py-2.5 px-3">Usage</th>
                  <th className="py-2.5 px-3">Isolation Status</th>
                  <th className="py-2.5 px-3">Live Server Ping</th>
                  <th className="py-2.5 px-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFE6DC]/60">
                {TENANT_RECORDS.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFDAD2] text-[#A53B22] font-bold flex items-center justify-center font-['Outfit']">
                          {tenant.initial}
                        </div>
                        <div>
                          <span className="font-bold text-[#1D1A23]">{tenant.name}</span>
                          <span className="font-mono text-[10px] text-[#8B716B] block">{tenant.appId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-[#1D1A23] font-semibold">{tenant.schemaName}</span>
                      <span className="text-[10px] text-[#8B716B] block">{tenant.vectorSpace}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#A53B22]">{tenant.currentUsage} / {tenant.cap}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Account Separated
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {tenant.renderUptime} ({tenant.ping})
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onShowToast(`Inspected ${tenant.name}`, 'Verified 100% account isolation.')}
                        className="px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-[#F3EBF8] text-[#1D1A23] font-bold border border-[#FFE6DC] text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUST UNITS MODAL OVERLAY */}
      {selectedUserForUnits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setSelectedUserForUnits(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-[#FFE6DC] shadow-2xl z-10 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A53B22] text-[20px]">tune</span>
                <h3 className="font-['Outfit'] text-base font-bold text-[#1D1A23]">
                  Adjust Units for {selectedUserForUnits.appName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForUnits(null)}
                className="text-[#8B716B] hover:text-[#1D1A23]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] flex justify-between">
                <span>Current Usage:</span>
                <span className="font-mono font-bold text-[#1D1A23]">
                  {selectedUserForUnits.unitsUsed.toLocaleString()} units
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1D1A23]">New Monthly Unit Limit:</label>
                <input
                  type="number"
                  step={1000}
                  value={newUnitLimit}
                  onChange={(e) => setNewUnitLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] font-mono text-sm font-bold text-[#1D1A23] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1D1A23]">Grant One-Time Free Bonus Units:</label>
                <input
                  type="number"
                  step={500}
                  value={bonusUnitsToAdd}
                  onChange={(e) => setBonusUnitsToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] font-mono text-sm font-bold text-[#845400] focus:outline-none"
                />
                <span className="text-[10px] text-[#8B716B]">Bonus units reduce their current billed overage balance.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FFE6DC]">
              <button
                onClick={() => setSelectedUserForUnits(null)}
                className="px-4 py-2 rounded-full bg-[#FAF9F6] text-[#57423D] font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUnitAdjustment}
                className="px-5 py-2 rounded-full bg-[#A53B22] hover:bg-[#84240D] text-white font-bold text-xs shadow-sm"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
