import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-terracotta-light/50 flex items-center justify-center mb-4 text-terracotta">
        {icon || <Compass className="w-9 h-9" />}
      </div>
      <h3 className="text-lg font-serif font-semibold text-charcoal mb-1">{title}</h3>
      {message && <p className="text-sm text-charcoal/60 max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
