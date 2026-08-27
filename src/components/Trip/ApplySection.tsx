'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Lock } from 'lucide-react';
import type { Squad, User } from '@/types';
import { Button } from '@/components/Shared/Button';
import { useToast } from '@/components/Shared/Toast';
import { applyToTripAction } from '@/app/actions/trip';
import { cn } from '@/lib/utils';

interface ApplySectionProps {
  tripId: string;
  isHost: boolean;
  isCaptain: boolean;
  userSquads: any[]; // Changed from Squad[] since we fetch raw squad rows
  user: any | null; // Changed to any to accept useAuth's user
  hasPendingReviews: boolean;
  onApplied?: () => void;
}

export function ApplySection({
  tripId,
  isHost,
  userSquads,
  user,
  hasPendingReviews,
  onApplied,
}: ApplySectionProps) {
  const [selectedSquadId, setSelectedSquadId] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const toast = useToast();
  const router = useRouter();

  if (isHost) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-soft text-center">
        <div className="flex justify-center mb-2 text-charcoal/30">
          <Lock className="w-6 h-6" />
        </div>
        <p className="text-sm text-charcoal/60">You are hosting this trip.</p>
        <p className="text-xs text-charcoal/40 mt-1">You can't apply to your own trip.</p>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="bg-sage/20 rounded-2xl p-5 border border-sage/40 shadow-soft text-center animate-scale-in">
        <p className="text-sm font-medium text-dusty-teal">Application submitted!</p>
        <p className="text-xs text-charcoal/55 mt-1">
          The host will review your squad and respond soon.
        </p>
      </div>
    );
  }

  if (hasPendingReviews) {
    return (
      <div className="bg-mustard-light/50 rounded-2xl p-5 border border-mustard/40 shadow-soft">
        <div className="flex items-start gap-2 mb-3">
          <Info className="w-5 h-5 text-mustard flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-charcoal">Pending reviews</p>
            <p className="text-xs text-charcoal/60 mt-0.5">
              You have reviews pending from your last trip. Submit them to unlock new applications.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/review')}>
          Review Now
        </Button>
      </div>
    );
  }

  const handleApply = async () => {
    if (!selectedSquadId) {
      toast.error('Select a squad to apply with.');
      return;
    }
    setIsApplying(true);
    try {
      const result = await applyToTripAction(tripId, selectedSquadId);
      if (result.success) {
        setHasApplied(true);
        toast.success('Application submitted successfully!');
        if (onApplied) onApplied();
      } else {
        toast.error(result.message || 'Failed to apply.');
      }
    } catch (err) {
      toast.error('Failed to apply.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-soft">
      <h3 className="font-serif text-base font-semibold text-charcoal mb-1">Join this trip</h3>
      <p className="text-xs text-charcoal/55 mb-4">Apply with one of your squads or as a solo traveller.</p>

      <label className="block text-xs font-medium text-charcoal/70 mb-1.5">Select a squad</label>
      <select
        value={selectedSquadId}
        onChange={(e) => setSelectedSquadId(e.target.value)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal',
          'focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all',
        )}
      >
        <option value="">Choose a squad...</option>
        {userSquads.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.members.length} members)
          </option>
        ))}
        <option value="solo">Apply solo</option>
      </select>

      <div className="flex gap-2 mt-4">
        <Button variant="primary" className="flex-1" loading={isApplying} onClick={handleApply}>
          {isApplying ? 'Applying...' : 'Apply with Squad'}
        </Button>
        {!user?.verified && (
          <div className="flex items-center text-xs text-charcoal/40 px-2">
            <Info className="w-3.5 h-3.5 mr-1" /> Unverified
          </div>
        )}
      </div>
    </div>
  );
}



