import React, { useState, useEffect } from 'react';
import { AppView, ToastMessage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { TASWizard } from './components/TASWizard';
import { AuthModal } from './components/AuthModal';
import { AppCreateModal } from './components/AppCreateModal';
import { ToastContainer } from './components/Toast';
import { TATSBackendAPI } from './services/api';

import { LandingView } from './components/views/LandingView';
import { AuthView } from './components/views/AuthView';
import { DeveloperDashboardView } from './components/views/DeveloperDashboardView';
import { ToolBuilderView } from './components/views/ToolBuilderView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { SuperAdminView } from './components/views/SuperAdminView';

export default function App() {
  // Developer Session & Tenancy State
  const [developer, setDeveloper] = useState<any>(TATSBackendAPI.getCurrentDeveloper());
  const [currentView, setCurrentView] = useState<AppView>(developer ? 'developer-dashboard' : 'landing');
  const [pendingNavView, setPendingNavView] = useState<AppView | null>(null);

  // Modal Controls
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authBannerNotice, setAuthBannerNotice] = useState<string>('');
  const [isAppCreateModalOpen, setIsAppCreateModalOpen] = useState(false);

  // Application Tenancy State
  const [applications, setApplications] = useState<any[]>([]);
  const [activeAppId, setActiveAppId] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch applications
  const loadApplications = async () => {
    if (!developer) {
      setApplications([]);
      setActiveAppId('');
      return;
    }
    try {
      const res = await TATSBackendAPI.getApplications();
      if (res && res.applications) {
        setApplications(res.applications);
        if (res.applications.length > 0) {
          setActiveAppId((prev) => {
            const exists = res.applications.some((a: any) => a.id === prev);
            return exists ? prev : res.applications[0].id;
          });
        }
      }
    } catch {
      // Backend offline or token expired
    }
  };

  useEffect(() => {
    loadApplications();
  }, [developer]);

  // Dedicated Auth Page Navigation
  const handleOpenAuth = (notice?: string) => {
    setAuthBannerNotice(notice || '');
    setCurrentView('auth');
  };

  // Navigation Guard: Protect internal workspaces from unauthenticated access
  const handleNavigate = (view: AppView) => {
    if (view === 'auth') {
      setCurrentView('auth');
      return;
    }

    if (!developer && view !== 'landing') {
      setPendingNavView(view);
      handleOpenAuth('Sign in or register to access this developer workspace.');
      return;
    }

    if (view === 'super-admin' && (!developer || !developer.is_admin)) {
      addToast('Access Restricted', 'Platform Governance is restricted to the designated Platform Administrator.', 'warning');
      setCurrentView('developer-dashboard');
      return;
    }

    if (view === 'component-wizard') {
      if (!developer) {
        handleOpenAuth('Sign in to launch your personalized acoustic setup wizard.');
      } else {
        setIsWizardOpen(true);
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleLogout = async () => {
    await TATSBackendAPI.logout();
    setDeveloper(null);
    setApplications([]);
    setActiveAppId('');
    setCurrentView('landing');
    addToast('Signed Out', 'You have been safely disconnected from your workspace.', 'info');
  };

  const handleAuthSuccess = (dev: any) => {
    setDeveloper(dev);
    loadApplications();
    addToast('Welcome Back!', `Logged in as ${dev.name}.`, 'success');
    if (pendingNavView) {
      setCurrentView(pendingNavView);
      setPendingNavView(null);
    } else {
      setCurrentView('developer-dashboard');
    }
  };

  const handleAppCreated = (app: any) => {
    setApplications((prev) => [app, ...prev]);
    setActiveAppId(app.id);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (developer) setIsCommandOpen((prev) => !prev);
      } else if (e.key === '1') {
        handleNavigate('landing');
      } else if (e.key === '2') {
        handleNavigate('developer-dashboard');
      } else if (e.key === '3') {
        handleNavigate('visual-tool-builder');
      } else if (e.key === '4') {
        handleNavigate('live-voice-playground');
      } else if (e.key === '5' && developer?.is_admin) {
        handleNavigate('super-admin');
      } else if (e.key === '6') {
        handleNavigate('component-wizard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [developer]);

  // Render dedicated full-page brand & auth portal
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-[#0E0D0C] text-[#F4EFEA]">
        <AuthView
          onAuthSuccess={handleAuthSuccess}
          onReturnHome={() => setCurrentView('landing')}
          bannerNotice={authBannerNotice}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1D1A23] font-['Manrope'] flex flex-col selection:bg-[#FF7E5F]/20 selection:text-[#721702]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenWizard={() => {
          if (!developer) {
            handleOpenAuth('Sign in to launch the calibration wizard.');
          } else {
            setIsWizardOpen(true);
          }
        }}
        developer={developer}
        onOpenAuth={() => handleOpenAuth()}
        onLogout={handleLogout}
        applications={applications}
        activeAppId={activeAppId}
        onSelectApp={(app) => {
          setActiveAppId(app.id);
          addToast('Switched Cluster', `Active application context set to "${app.app_name}".`);
        }}
        onOpenCreateApp={() => setIsAppCreateModalOpen(true)}
      />

      <div className="flex flex-1 pt-16">
        {/* Left Workspaces Sidebar (Shown only when authenticated & not on landing) */}
        {developer && currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isMicActive={currentView === 'live-voice-playground'}
            isAdmin={Boolean(developer?.is_admin)}
          />
        )}

        {/* Main Content View Container */}
        <main
          className={`flex-1 transition-all ${
            developer && currentView !== 'landing' ? 'lg:pl-64' : 'w-full'
          }`}
        >
          {currentView === 'landing' && (
            <LandingView
              onNavigate={handleNavigate}
              onShowToast={addToast}
              onOpenWizard={() => {
                if (!developer) {
                  handleOpenAuth('Sign in to launch the acoustic calibration wizard.');
                } else {
                  setIsWizardOpen(true);
                }
              }}
              developer={developer}
              onOpenAuth={handleOpenAuth}
              activeAppId={activeAppId}
              onRefreshApps={loadApplications}
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

          {currentView === 'super-admin' && developer?.is_admin && (
            <SuperAdminView
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Developer Authentication Modal (Sign In, Indian Mobile Register, OTP, Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onShowToast={addToast}
        bannerNotice={authBannerNotice}
      />

      {/* New Application Cluster Provisioning Modal */}
      <AppCreateModal
        isOpen={isAppCreateModalOpen}
        onClose={() => setIsAppCreateModalOpen(false)}
        onCreated={handleAppCreated}
        onShowToast={addToast}
      />

      {/* 5-Step End-User Setup Wizard Overlay */}
      <TASWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccessToast={(msg) => addToast('Wizard Success', msg)}
      />

      {/* Global ⌘K Command Palette */}
      {developer && (
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onNavigate={handleNavigate}
          onTriggerPreset={(type) => {
            addToast('Preset Loaded', `Initialized ${type} voice profile in playground.`);
          }}
        />
      )}

      {/* Toast Notification Stream */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
