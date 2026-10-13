import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  // Enforce strictly max 5 toasts visible simultaneously
  const visibleToasts = toasts.slice(-5);
  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none max-w-sm sm:max-w-md w-full px-3 sm:px-0">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#1D1A23]/95 backdrop-blur-md text-[#FAF9F6] shadow-xl border border-white/10 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-150 w-auto max-w-full"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`material-symbols-outlined text-[19px] shrink-0 ${
                toast.type === 'warning'
                  ? 'text-[#FFAE33]'
                  : toast.type === 'info'
                  ? 'text-[#00C2FF]'
                  : 'text-[#FF7E5F]'
              }`}
            >
              {toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold tracking-wide font-['Manrope'] leading-tight truncate">
                {toast.title}
              </span>
              {toast.description && (
                <span className="text-[11px] text-white/70 font-['Manrope'] line-clamp-2 leading-tight mt-0.5">
                  {toast.description}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/40 hover:text-white transition-colors p-1 shrink-0 ml-1 rounded-lg hover:bg-white/10"
            title="Dismiss notification"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
