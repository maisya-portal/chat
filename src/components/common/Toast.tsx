import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-slate-900/90 text-emerald-200',
    error: 'border-rose-500/40 bg-slate-900/90 text-rose-200',
    info: 'border-sky-500/40 bg-slate-900/90 text-sky-200'
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce duration-300 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${borderColors[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};
