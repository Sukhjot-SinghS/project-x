'use client'
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-terracotta-light/60 flex items-center justify-center mb-4 text-terracotta">
        <AlertCircle className="w-8 h-8" />
      </div>
      <p className="text-sm text-charcoal/70 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" /> Try again
        </Button>
      )}
    </div>
  );
}

