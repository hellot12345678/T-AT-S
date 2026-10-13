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
import { SubscriptionView } from './components/views/SubscriptionView';
import { SettingsView } from './components/views/SettingsView';
import { NotificationsView } from './components/views/NotificationsView';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // Developer Session & Tenancy State
  const [developer, setDeveloper] = useState<any>(TATSBackendAPI.getCurrentDeveloper());
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const cached = localStorage.getItem('tats_current_view') as AppView | null;
    const dev = TATSBackendAPI.getCurrentDeveloper();
    if (!dev) return 'landing';
    if (!cached || cached === 'landing' || cached === 'auth') {
      return 'developer-dashboard';
    }
    return cached;
  });
  const [pendingNavView, setPendingNavView] = useState<AppView | null>(null);

  // Modal Controls
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authBannerNotice, setAuthBannerNotice] = useState<string>('');
  const [isAppCreateModalOpen, setIsAppCreateModalOpen] = useState(false);

  // Application Tenancy State
  const [applications, setApplications] = useState<any[]>([]);
  const [activeAppId, setActiveAppId] = useState<string>(() => localStorage.getItem('tats_active_app_id') || '');
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

  // Sync active view and cluster to localStorage
  useEffect(() => {
    if (currentView && currentView !== 'auth') {
      localStorage.setItem('tats_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (activeAppId) {
      localStorage.setItem('tats_active_app_id', activeAppId);
    }
  }, [activeAppId]);

  // Dedicated Auth Page Navigation
  const handleOpenAuth = (notice?: string, targetView?: AppView) => {
    setAuthBannerNotice(notice || '');
    if (targetView) setPendingNavView(targetView);
    setCurrentView('auth');
  };

  // Navigation Guard: Protect internal workspaces from unauthenticated access & block landing if logged in
  const handleNavigate = (view: AppView) => {
    if (view === 'auth') {
      setCurrentView('auth');
      return;
    }

    // When logged in, block landing/overview page completely
    if (developer && view === 'landing') {
      setCurrentView('developer-dashboard');
      return;
    }

    if (!developer && view !== 'landing') {
      setPendingNavView(view);
      handleOpenAuth('Sign in or register to access this developer workspace.', view);
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
    localStorage.removeItem('tats_current_view');
    localStorage.removeItem('tats_active_app_id');
    setCurrentView('landing');
    addToast('Signed Out', 'You have been safely disconnected from your workspace.', 'info');
  };

  const handleAuthSuccess = (dev: any) => {
    setDeveloper(dev);
    loadApplications();
    addToast('Welcome Back!', `Logged in as ${dev.name}.`, 'success');
    if (pendingNavView && pendingNavView !== 'landing' && pendingNavView !== 'auth') {
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

  const handleSelectApp = (appOrId: any) => {
    if (!appOrId) return;
    const appId = typeof appOrId === 'string' ? appOrId : appOrId.id;
    const appObj = applications.find((a: any) => a.id === appId) || (typeof appOrId === 'object' ? appOrId : null);
    setActiveAppId(appId);
    if (appObj) {
      addToast('Switched Cluster', `Active application context set to "${appObj.app_name}".`);
    }
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
        handleNavigate(developer ? 'developer-dashboard' : 'landing');
      } else if (e.key === '2') {
        handleNavigate('visual-tool-builder');
      } else if (e.key === '3') {
        handleNavigate('live-voice-playground');
      } else if (e.key === '4') {
        handleNavigate('component-wizard');
      } else if (e.key === '5') {
        handleNavigate(developer?.is_admin ? 'super-admin' : 'subscription-pricing');
      } else if (e.key === '6') {
        handleNavigate(developer?.is_admin ? 'subscription-pricing' : 'settings');
      } else if (e.key === '7' && developer?.is_admin) {
        handleNavigate('settings');
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
        onSelectApp={handleSelectApp}
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
          <ErrorBoundary>
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
                activeAppId={activeAppId}
                applications={applications}
                onSelectApp={handleSelectApp}
                developer={developer}
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
                developer={developer}
              />
            )}

            {currentView === 'subscription-pricing' && (
              <SubscriptionView
                onNavigate={handleNavigate}
                onShowToast={addToast}
                developer={developer}
                applications={applications}
                activeAppId={activeAppId}
                onSelectApp={handleSelectApp}
                onRefreshApps={loadApplications}
                onOpenCreateApp={() => setIsAppCreateModalOpen(true)}
              />
            )}

            {currentView === 'settings' && developer && (
              <SettingsView
                onNavigate={handleNavigate}
                onShowToast={addToast}
                developer={developer}
                applications={applications}
                activeAppId={activeAppId}
                onSelectApp={handleSelectApp}
                onRefreshApps={loadApplications}
                onOpenCreateApp={() => setIsAppCreateModalOpen(true)}
                onUpdateDeveloperProfile={(updatedDev) => {
                  setDeveloper(updatedDev);
                }}
              />
            )}

            {currentView === 'notifications' && developer && (
              <NotificationsView
                onNavigate={handleNavigate}
                onShowToast={addToast}
                developer={developer}
              />
            )}
          </ErrorBoundary>
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
