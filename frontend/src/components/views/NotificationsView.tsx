import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';
import { TATSBackendAPI } from '../../services/api';

interface NotificationsViewProps {
  onNavigate: (view: AppView) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
  developer: any;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onNavigate,
  onShowToast,
  developer,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const PAGE_SIZE = 25;
  const [notifPage, setNotifPage] = useState<number>(1);

  const fetchNotifications = async () => {
    if (!developer) return;
    setIsLoading(true);
    try {
      const res = await TATSBackendAPI.getNotifications({ limit: 150 });
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
        setTotalCount(res.total_count || (res.notifications || []).length);
      }
    } catch {
      onShowToast('Error', 'Could not refresh notifications.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [developer]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await TATSBackendAPI.markNotificationRead(id);
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      onShowToast('Error', 'Failed to mark notification as read.', 'warning');
    }
  };

  const handleMarkAllRead = async () => {
    setIsProcessing(true);
    try {
      const res = await TATSBackendAPI.markAllNotificationsRead();
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        onShowToast('Updated', 'All notifications marked as read.', 'success');
      }
    } catch {
      onShowToast('Error', 'Could not mark all as read.', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await TATSBackendAPI.deleteNotification(id);
      if (res.ok) {
        const deletedItem = notifications.find((n) => n.id === id);
        if (deletedItem && !deletedItem.is_read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotalCount((t) => Math.max(0, t - 1));
        onShowToast('Deleted', 'Notification removed from your history.', 'info');
      } else {
        onShowToast('Error', 'Failed to delete notification.', 'warning');
      }
    } catch {
      onShowToast('Error', 'Could not delete notification.', 'warning');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsProcessing(true);
    try {
      const res = await TATSBackendAPI.clearAllNotifications();
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
        setShowClearAllModal(false);
        onShowToast('History Cleared', 'All notifications have been removed.', 'success');
      } else {
        onShowToast('Error', 'Failed to clear notifications.', 'warning');
      }
    } catch {
      onShowToast('Error', 'Could not clear notifications.', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter((notif) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notif.title?.toLowerCase().includes(q);
      const matchMsg = notif.message?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'ALL') {
      const type = (notif.notification_type || 'INFO').toUpperCase();
      if (selectedCategory === 'BILLING' && type !== 'BILLING') return false;
      if (selectedCategory === 'SECURITY' && !type.includes('SECURITY') && !type.includes('AUTH') && type !== 'WARNING') return false;
      if (selectedCategory === 'SYSTEM' && type !== 'SYSTEM' && type !== 'INFO') return false;
      if (selectedCategory === 'SUCCESS' && type !== 'SUCCESS') return false;
    }

    // 3. Read Status Filter
    if (filterReadStatus === 'unread' && notif.is_read) return false;
    if (filterReadStatus === 'read' && !notif.is_read) return false;

    return true;
  });

  const totalNotifPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const paginatedNotifications = filteredNotifications.slice(
    (notifPage - 1) * PAGE_SIZE,
    notifPage * PAGE_SIZE
  );

  const getCategoryMeta = (type?: string) => {
    const t = String(type || 'INFO').toUpperCase();
    if (t === 'BILLING') {
      return {
        icon: 'payments',
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
        label: 'Billing & Plan',
      };
    }
    if (t === 'SUCCESS') {
      return {
        icon: 'verified',
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Success & SLA',
      };
    }
    if (t === 'WARNING') {
      return {
        icon: 'warning',
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: 'Warning Alert',
      };
    }
    return {
      icon: 'info',
      bg: 'bg-[#FFDAD2]',
      text: 'text-[#A53B22]',
      border: 'border-[#FF7E5F]/30',
      label: 'System & Activity',
    };
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FFE6DC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFAE33] flex items-center justify-center text-white shadow-md shadow-[#FF7E5F]/20 shrink-0">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-[#1D1A23]">
                Notifications & System Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF5F45] text-white font-mono text-[10px] font-bold shadow-xs">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-[#57423D] mt-1">
              Real-time transactional audit stream, quota updates, billing receipts, and cluster telemetry.
            </p>
          </div>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2.5 shrink-0 z-10 flex-wrap">
          <button
            onClick={fetchNotifications}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#FFE6DC] bg-[#FAF9F6] hover:bg-[#FFE6DC]/40 text-[#57423D] transition-colors"
            title="Refresh notifications"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#A53B22] border border-[#FF7E5F]/40 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#FFE6DC] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#8B716B]">
            search
          </span>
          <input
            type="text"
            placeholder="Search notifications by title or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setNotifPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF9F6] border border-[#FFE6DC] text-xs text-[#1D1A23] focus:outline-none focus:border-[#FF7E5F] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setNotifPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B716B] hover:text-[#1D1A23]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Badges & Read State Tabs */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Category Dropdown / Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl flex-wrap">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'BILLING', label: 'Billing' },
              { id: 'SECURITY', label: 'Security' },
              { id: 'SUCCESS', label: 'Success' },
              { id: 'SYSTEM', label: 'System' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setNotifPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-['Outfit'] font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1D1A23] text-white shadow-xs'
                    : 'text-[#57423D] hover:text-[#1D1A23]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Read Status Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#FFE6DC] rounded-xl">
            {(['all', 'unread', 'read'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterReadStatus(st);
                  setNotifPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  filterReadStatus === st
                    ? 'bg-[#FF7E5F] text-white shadow-xs'
                    : 'text-[#57423D] hover:text-[#1D1A23]'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Stream Container */}
      <div className="bg-white rounded-3xl border border-[#FFE6DC] shadow-sm overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <span className="material-symbols-outlined text-[32px] text-[#FF7E5F] animate-spin">
              refresh
            </span>
            <p className="text-xs font-semibold text-[#57423D]">Loading notification history...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#FFE6DC] flex items-center justify-center text-[#8B716B]">
              <span className="material-symbols-outlined text-[28px]">notifications_off</span>
            </div>
            <div>
              <p className="font-['Outfit'] font-bold text-base text-[#1D1A23]">
                No matching notifications
              </p>
              <p className="text-xs text-[#57423D] mt-1 max-w-sm">
                {searchQuery || selectedCategory !== 'ALL' || filterReadStatus !== 'all'
                  ? 'Try clearing your search query or adjusting your category filter.'
                  : "You're completely caught up! No notifications have been dispatched yet."}
              </p>
            </div>
            {(searchQuery || selectedCategory !== 'ALL' || filterReadStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setFilterReadStatus('all');
                  setNotifPage(1);
                }}
                className="mt-2 px-4 py-1.5 rounded-full bg-[#FAF9F6] border border-[#FFE6DC] text-xs font-bold text-[#A53B22] hover:bg-[#FFE6DC]/60 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="divide-y divide-[#FFE6DC]/60">
              {paginatedNotifications.map((notif) => {
              const meta = getCategoryMeta(notif.notification_type);
              const isDeleting = deletingId === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`p-5 sm:p-6 transition-colors flex items-start gap-4 group ${
                    notif.is_read
                      ? 'bg-white hover:bg-[#FAF9F6]/80'
                      : 'bg-[#FFFBF7] hover:bg-[#FFF8F2] border-l-4 border-l-[#FF7E5F]'
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center ${meta.text} shrink-0 mt-0.5 shadow-xs`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-['Outfit'] font-bold text-sm text-[#1D1A23]">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5F45] inline-block animate-pulse" />
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#8B716B] font-mono shrink-0">
                        {formatTimestamp(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-[#57423D] leading-relaxed pr-2">
                      {notif.message}
                    </p>

                    {/* Notification Link Button (if applicable) */}
                    {notif.link && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            if (notif.link.includes('billing') || notif.link.includes('pricing')) {
                              onNavigate('subscription-pricing');
                            } else {
                              onNavigate('developer-dashboard');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A53B22] hover:text-[#84240D] hover:underline"
                        >
                          <span>Open Associated Workspace</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Item Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-2 rounded-xl text-[#8B716B] hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Mark as read"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-[#8B716B] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Delete notification"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isDeleting ? 'animate-spin' : ''}`}>
                        {isDeleting ? 'refresh' : 'delete'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredNotifications.length > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#FFE6DC] bg-[#FAF9F6]/50 text-xs">
              <span className="text-[#8B716B]">
                Showing <strong className="text-[#1D1A23]">{(notifPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
                <strong className="text-[#1D1A23]">{Math.min(notifPage * PAGE_SIZE, filteredNotifications.length)}</strong> of{' '}
                <strong className="text-[#1D1A23]">{filteredNotifications.length}</strong> notifications
                <span className="ml-2 text-[11px] font-mono text-[#A53B22] font-semibold">(25 per page)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                  disabled={notifPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-[#FFE6DC] text-[#57423D] font-bold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="px-2 py-1 font-mono font-bold text-[#1D1A23]">
                  {notifPage} / {totalNotifPages}
                </span>
                <button
                  onClick={() => setNotifPage((p) => Math.min(totalNotifPages, p + 1))}
                  disabled={notifPage === totalNotifPages}
                  className="px-3 py-1.5 rounded-lg border border-[#FFE6DC] text-[#57423D] font-bold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

      {/* Confirmation Modal for Clearing All Notifications */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setShowClearAllModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#FFE6DC] z-10 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <div className="text-center">
              <h3 className="font-['Outfit'] font-bold text-base text-[#1D1A23]">
                Clear All Notifications?
              </h3>
              <p className="text-xs text-[#57423D] mt-1 leading-relaxed">
                This will permanently delete all {notifications.length} notification records from your history. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#FFE6DC] text-xs font-bold text-[#57423D] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                ) : (
                  <span>Delete All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

