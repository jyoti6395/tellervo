import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Sparkles, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#183324]/95 text-[#FAF8F3] text-xs font-medium shadow-float border border-[#2B4D36] backdrop-blur-md animate-in slide-in-from-top-3 fade-in duration-200"
        >
          {toast.type === 'reward' && <Sparkles className="w-4 h-4 text-[#E5A953] shrink-0" />}
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#9FD8B1] shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-[#E5A953] shrink-0" />}

          <span className="leading-tight">{toast.message}</span>

          <button
            onClick={() => dismissToast(toast.id)}
            className="w-4 h-4 ml-1 text-white/60 hover:text-white rounded-full flex items-center justify-center shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
