'use client'
import { Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/Shared/Button';
import { useCountdown } from '@/hooks/useCountdown';

interface OfferBannerProps {
  timeLeft: number;
  onConfirm: () => void;
  onDecline: () => void;
  isConfirming?: boolean;
}

export function OfferBanner({ timeLeft, onConfirm, onDecline, isConfirming }: OfferBannerProps) {
  const { formatted, isExpired } = useCountdown(timeLeft);

  if (isExpired) {
    return (
      <div className="bg-terracotta-light/40 rounded-2xl p-5 border border-terracotta/30 shadow-soft text-center">
        <p className="text-sm font-medium text-terracotta">This offer has expired.</p>
        <p className="text-xs text-charcoal/55 mt-1">The host has been notified.</p>
      </div>
    );
  }

  return (
    <div className="bg-mustard-light/50 rounded-2xl p-5 border border-mustard/40 shadow-warm animate-scale-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-mustard flex items-center justify-center text-white">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">You have an offer!</p>
          <p className="text-xs text-charcoal/55">Confirm before time runs out</p>
        </div>
        <div className="ml-auto font-mono text-lg font-bold text-terracotta tabular-nums">
          {formatted}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="primary" className="flex-1" loading={isConfirming} onClick={onConfirm}>
          <Check className="w-4 h-4" /> Confirm Trip
        </Button>
        <Button variant="outline" onClick={onDecline}>
          <X className="w-4 h-4" /> Decline
        </Button>
      </div>
    </div>
  );
}

