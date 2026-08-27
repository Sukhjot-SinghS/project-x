'use client'
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-soft border border-charcoal/5',
        onClick && 'cursor-pointer transition-all duration-200 hover:shadow-warm hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

