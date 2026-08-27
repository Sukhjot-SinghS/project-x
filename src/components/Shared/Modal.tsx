'use client'
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md bg-cream rounded-t-3xl sm:rounded-3xl shadow-warm-lg animate-slide-up sm:animate-scale-in max-h-[90vh] overflow-y-auto',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-charcoal/5">
            <h3 className="text-lg font-serif font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-charcoal/5 text-charcoal/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

