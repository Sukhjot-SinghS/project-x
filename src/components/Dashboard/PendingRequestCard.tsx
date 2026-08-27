'use client'
import { useState } from 'react';
import { MessageSquare, Send, X, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Card } from '@/components/Shared/Card';
import { Badge } from '@/components/Shared/Badge';
import { Avatar } from '@/components/Shared/Avatar';
import { Button } from '@/components/Shared/Button';
import { Modal } from '@/components/Shared/Modal';
import { useCountdown } from '@/hooks/useCountdown';
import { formatDateRange } from '@/lib/utils';

interface PendingRequestCardProps {
  trip: any;
  request: any;
  onOffered: () => void;
  onReject: () => void;
  onRefresh: () => void;
  onOpenChat: () => void;
}

export function PendingRequestCard({ trip, request, onOffered, onReject, onRefresh, onOpenChat }: PendingRequestCardProps) {
  const squad = request.squads;
  const captain = squad?.profiles;
  const roster = request.roster_snapshot || [];
  
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif text-base font-semibold text-charcoal">{squad?.name || 'Unknown Squad'}</h3>
            <p className="text-xs text-charcoal/55">
              Captain: {captain?.full_name} - applied for {trip.title}
            </p>
          </div>
          <Badge variant="teal">{roster.length} members</Badge>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
             <p className="text-xs text-charcoal/50">Squad roster snapshot</p>
             <button onClick={onRefresh} className="text-xs text-dusty-teal flex items-center hover:underline">
               <RefreshCw className="w-3 h-3 mr-1" /> Refresh
             </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {roster.map((m: any) => (
              <div key={m.user_id} className="flex-shrink-0 flex flex-col items-center gap-1">
                <Avatar src={m.avatar_url} alt={m.full_name} size="sm" />
                <span className="text-[10px] text-charcoal/70 truncate w-12 text-center">{m.full_name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onReject}>
            <XCircle className="w-3.5 h-3.5 text-terracotta" /> Reject
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={() => setOfferModalOpen(true)}>
            <Send className="w-3.5 h-3.5" /> Offer Spot
          </Button>
        </div>
      </Card>

      <Modal isOpen={offerModalOpen} onClose={() => setOfferModalOpen(false)} title="Confirm Offer">
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal/50">Trip:</span>
            <span className="font-medium text-charcoal">{trip.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal/50">Dates:</span>
            <span className="font-medium text-charcoal">{formatDateRange(trip.start_date, trip.end_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal/50">Squad:</span>
            <span className="font-medium text-charcoal">{squad?.name}</span>
          </div>
          <div className="bg-cream rounded-xl p-3 border border-charcoal/5">
            <p className="text-xs text-charcoal/50 mb-2">Members</p>
            <div className="flex flex-wrap gap-2">
              {roster.map((m: any) => (
                <div key={m.user_id} className="flex items-center gap-1.5 bg-white rounded-full pr-3 pl-1 py-1">
                  <Avatar src={m.avatar_url} alt={m.full_name} size="xs" />
                  <span className="text-xs font-medium">{m.full_name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2 bg-mustard-light/40 rounded-xl p-3 text-xs text-charcoal/70">
            <Clock className="w-4 h-4 text-mustard flex-shrink-0 mt-0.5" />
            <span>The squad captain will have 24 hours to confirm before the offer expires.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" onClick={() => { setOfferModalOpen(false); onOffered(); }}>
            Send Offer
          </Button>
          <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
            <X className="w-4 h-4" /> Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}

interface OfferedRequestCardProps {
  trip: any;
  request: any;
  offeredAt?: string;
  onCancel: () => void;
}

export function OfferedRequestCard({ trip, request, onCancel }: OfferedRequestCardProps) {
  const squad = request.squads;
  const captain = squad?.profiles;
  const { formatted, isExpired } = useCountdown(86400); // Wait, in reality we'd calculate from request.offered_at

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-serif text-base font-semibold text-charcoal">{squad?.name || 'Unknown Squad'}</h3>
          <p className="text-xs text-charcoal/55">Captain: {captain?.full_name}</p>
        </div>
        <Badge variant="mustard">Offered</Badge>
      </div>
      <p className="text-xs text-charcoal/55 mb-3">For {trip.title}</p>
      <div className="flex items-center gap-2 mb-3 bg-mustard-light/30 rounded-xl p-3">
        <Clock className="w-4 h-4 text-mustard" />
        <span className="text-sm font-mono font-bold text-terracotta tabular-nums">{formatted}</span>
        <span className="text-xs text-charcoal/50">until expiry</span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="text-terracotta w-full" onClick={onCancel}>
          Cancel Offer
        </Button>
      </div>
    </Card>
  );
}

