import React, { useState } from 'react';
import { TATSBackendAPI } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (developer: { id: string; name: string; email: string }) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail('demo@tats.ai');
    setPassword('demo12345');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await TATSBackendAPI.login(email, password);
        if (res.ok && res.data.developer) {
          TATSBackendAPI.setCurrentDeveloper(res.data.developer);
          onSuccess(res.data.developer);
          onShowToast(`Welcome back, ${res.data.developer.name}!`, 'Authenticated with Django Acoustic Action Engine.');
          onClose();
          return;
        } else {
          setErrorMessage(res.data.error || 'Invalid email or password.');
        }
      } else {
        // Register flow
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        const res = await TATSBackendAPI.register(name, email, password);
        if (res.ok && res.data.developer) {
          TATSBackendAPI.setCurrentDeveloper(res.data.developer);
          // Automatically create a default application cluster so the user has immediate access
          await TATSBackendAPI.createApplication(`${name}'s Voice Engine`, 'http://127.0.0.1:8000', 'CUSTOM');
          onSuccess(res.data.developer);
          onShowToast(`Account created!`, `Welcome to T@S, ${res.data.developer.name}. Default application cluster provisioned.`);
          onClose();
          return;
        } else {
          setErrorMessage(res.data.error || 'Failed to register account.');
        }
      }
    } catch (err: any) {
      setErrorMessage('Network connection to engine failed. Please ensure Django is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(30,27,36,0.22)] border border-[#FFE6DC] p-6 sm:p-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
        {/* Top Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#FFE6DC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFAE33] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <h2 className="font-['Outfit'] text-xl font-bold text-[#1D1A23]">
                {tab === 'login' ? 'Developer Sign In' : 'Create Developer Account'}
              </h2>
              <p className="text-xs text-[#57423D]">
                {tab === 'login' ? 'Access your clusters, keys, and quotas' : 'Deploy acoustic voice agents to your software'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8B716B] hover:bg-[#FAF9F6] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-[#FAF9F6] p-1 border border-[#FFE6DC] text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-full transition-all ${
              tab === 'login' ? 'bg-white text-[#1D1A23] shadow-sm' : 'text-[#57423D] hover:text-[#1D1A23]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-full transition-all ${
              tab === 'register' ? 'bg-white text-[#1D1A23] shadow-sm' : 'text-[#57423D] hover:text-[#1D1A23]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {tab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#57423D]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-xs text-[#1D1A23] focus:outline-none focus:ring-2 focus:ring-[#FF7E5F]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D]">Developer Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@acme.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-xs text-[#1D1A23] focus:outline-none focus:ring-2 focus:ring-[#FF7E5F]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#57423D]">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-xs text-[#1D1A23] focus:outline-none focus:ring-2 focus:ring-[#FF7E5F]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FF5F45] hover:from-[#FF5F45] hover:to-[#FFAE33] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Authenticating with Engine...</span>
              </>
            ) : (
              <span>{tab === 'login' ? 'Sign In to Dashboard' : 'Create Account & Cluster'}</span>
            )}
          </button>
        </form>

        {/* 1-Click Demo Shortcut */}
        {tab === 'login' && (
          <div className="pt-2 border-t border-[#FFE6DC] flex items-center justify-between text-xs text-[#57423D]">
            <span>Need sample credentials?</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="font-bold text-[#A53B22] hover:underline"
            >
              Fill Demo Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
