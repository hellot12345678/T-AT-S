import React, { useState, useEffect } from 'react';
import { AppView, ToastMessage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { TASWizard } from './components/TASWizard';
import { ToastContainer } from './components/Toast';

import { LandingView } from './components/views/LandingView';
import { DeveloperDashboardView } from './components/views/DeveloperDashboardView';
import { ToolBuilderView } from './components/views/ToolBuilderView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { SuperAdminView } from './components/views/SuperAdminView';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('developer-dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard navigation shortcuts: ⌘K for command palette, 1-6 for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === '1') {
        setCurrentView('landing');
      } else if (e.key === '2') {
        setCurrentView('developer-dashboard');
      } else if (e.key === '3') {
        setCurrentView('visual-tool-builder');
      } else if (e.key === '4') {
        setCurrentView('live-voice-playground');
      } else if (e.key === '5') {
        setCurrentView('super-admin');
      } else if (e.key === '6') {
        setIsWizardOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: AppView) => {
    if (view === 'component-wizard') {
      setIsWizardOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1D1A23] font-['Manrope'] flex flex-col selection:bg-[#FF7E5F]/20 selection:text-[#721702]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      <div className="flex flex-1 pt-16">
        {/* Left Workspaces Sidebar */}
        {currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isMicActive={currentView === 'live-voice-playground'}
          />
        )}

        {/* Main Content View Container */}
        <main
          className={`flex-1 transition-all ${
            currentView !== 'landing' ? 'lg:pl-64' : 'w-full'
          }`}
        >
          {currentView === 'landing' && (
            <LandingView
              onNavigate={handleNavigate}
              onShowToast={addToast}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {currentView === 'developer-dashboard' && (
            <DeveloperDashboardView
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {currentView === 'visual-tool-builder' && (
            <ToolBuilderView
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {currentView === 'live-voice-playground' && (
            <PlaygroundView
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {currentView === 'super-admin' && (
            <SuperAdminView
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* 5-Step End-User Setup Wizard Overlay */}
      <TASWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccessToast={(msg) => addToast('Wizard Success', msg)}
      />

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={handleNavigate}
        onTriggerPreset={(type) => {
          addToast('Preset Triggered', `Loaded ${type} voice intent into playground.`);
        }}
      />

      {/* Toast Notification Stream */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
