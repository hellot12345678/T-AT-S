import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#1D1A23] text-[#FAF9F6] shadow-xl border border-white/10 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="material-symbols-outlined text-[20px] text-[#FF7E5F]">
            {toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide font-['Manrope'] leading-tight">
              {toast.title}
            </span>
            {toast.description && (
              <span className="text-[11px] text-white/70 font-['Manrope']">
                {toast.description}
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
