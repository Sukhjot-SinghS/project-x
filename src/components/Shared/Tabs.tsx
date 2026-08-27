'use client'
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-charcoal/10', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
            active === tab.id
              ? 'text-terracotta'
              : 'text-charcoal/50 hover:text-charcoal/70',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                active === tab.id ? 'bg-terracotta-light text-terracotta' : 'bg-charcoal/5 text-charcoal/50',
              )}
            >
              {tab.count}
            </span>
          )}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ children, isActive }: { children: ReactNode; isActive: boolean }) {
  if (!isActive) return null;
  return <div className="pt-4 animate-fade-in">{children}</div>;
}

