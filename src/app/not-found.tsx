'use client'

import { useRouter } from 'next/navigation';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/Shared/Button';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-terracotta-light/50 flex items-center justify-center mb-4 text-terracotta">
        <Compass className="w-10 h-10" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Lost the trail</h1>
      <p className="text-sm text-charcoal/60 max-w-xs mb-6">
        This page does not exist or has moved. Let&apos;s get you back to familiar ground.
      </p>
      <Button variant="primary" onClick={() => router.push('/')}>
        <Home className="w-4 h-4" /> Back to Feed
      </Button>
    </div>
  );
}
