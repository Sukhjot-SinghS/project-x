import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-soft',
  secondary: 'bg-dusty-teal text-white hover:bg-dusty-teal/90 shadow-soft',
  ghost: 'text-charcoal hover:bg-charcoal/5',
  outline: 'border border-charcoal/15 text-charcoal hover:bg-charcoal/5 bg-white/60',
  danger: 'bg-terracotta/10 text-terracotta hover:bg-terracotta/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
