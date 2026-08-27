import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'terracotta' | 'teal' | 'mustard' | 'sage' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-charcoal/8 text-charcoal',
  terracotta: 'bg-terracotta-light text-terracotta',
  teal: 'bg-dusty-teal-light text-dusty-teal',
  mustard: 'bg-mustard-light text-mustard',
  sage: 'bg-sage/30 text-dusty-teal',
  muted: 'bg-charcoal/5 text-charcoal/60',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
