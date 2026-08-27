'use client'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value: ToastContextValue = {
    success: (m) => add('success', m),
    error: (m) => add('error', m),
    info: (m) => add('info', m),
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-sage" />,
    error: <XCircle className="w-5 h-5 text-terracotta" />,
    info: <Info className="w-5 h-5 text-dusty-teal" />,
  };
  const borders = {
    success: 'border-sage',
    error: 'border-terracotta',
    info: 'border-dusty-teal',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92%] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 bg-white border-l-4 ${borders[t.type]} rounded-2xl shadow-soft px-4 py-3 animate-slide-up`}
          >
            {icons[t.type]}
            <p className="text-sm text-charcoal flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-charcoal/40 hover:text-charcoal">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

