'use client'
import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Shared/Button';
import { useRouter } from 'next/navigation';

export function PendingReviewsBanner() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  return (
    <div className="bg-mustard-light/50 rounded-2xl p-4 border border-mustard/30 flex items-center gap-3 mb-5 animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-mustard flex items-center justify-center text-white flex-shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-charcoal">Pending reviews</p>
        <p className="text-xs text-charcoal/60">Rate your crew from your last trip to unlock new applications.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => router.push('/review')}>
        Review Now <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}



