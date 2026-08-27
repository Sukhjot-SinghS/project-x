import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal placeholder:text-charcoal/40',
        'focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all duration-200',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal placeholder:text-charcoal/40',
        'focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all duration-200 resize-none',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block text-sm font-medium text-charcoal mb-1.5', className)}>
      {children}
    </label>
  );
}
