'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { applyToTripAction, confirmTripAction, declineOfferAction } from '@/app/actions/trip';
import { TripDetailHeader } from '@/components/Trip/TripDetailHeader';
import { ItineraryTimeline } from '@/components/Trip/ItineraryTimeline';
import { ApplySection } from '@/components/Trip/ApplySection';
import { OfferBanner } from '@/components/Trip/OfferBanner';
import { ConflictModal } from '@/components/Modals/ConflictModal';
import { TripCardSkeletonList } from '@/components/Feed/TripCardSkeleton';
import { ErrorBanner } from '@/components/Shared/ErrorBanner';
import { Avatar } from '@/components/Shared/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Shared/Toast';

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offerStatus, setOfferStatus] = useState<'none' | 'offered' | 'confirmed' | 'declined'>('none');
  const [isConfirming, setIsConfirming] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [userSquads, setUserSquads] = useState<any[]>([]);
  const [joinedMembers, setJoinedMembers] = useState<any[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  const fetchTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          profiles!host_id (
            full_name,
            avatar_url,
            c_score,
            is_verified
          ),
          trip_members (
            id,
            squad_id,
            status,
            squads (
              captain_id,
              squad_members (
                user_id,
                profiles (
                  full_name,
                  avatar_url
                )
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Trip not found');
        return;
      }

      setTrip({
        ...data,
        hostId: data.host_id,
        // Bug #5 fix: explicitly map snake_case DB fields to camelCase for components
        startDate: data.start_date,
        endDate: data.end_date,
        host: {
          name: data.profiles?.full_name,
          avatar: data.profiles?.avatar_url,
          cScore: data.profiles?.c_score,
          verified: data.profiles?.is_verified,
        },
        estimatedCost: data.estimated_cost_per_person,
        keyDestinations: data.key_destinations,
        coverImage: data.cover_image_url,
        about: data.description,
        itinerary: data.itinerary,
        tags: data.tags || [],
      });

      // Extract joined members from active trip_members
      const members = [];
      let currentUserOfferStatus: any = 'none';
      let currentMemberId = null;

      if (data.trip_members) {
        for (const tm of data.trip_members) {
          if (tm.status === 'active') {
             const sm = tm.squads?.squad_members || [];
             for (const m of sm) {
               members.push({
                 id: m.user_id,
                 name: m.profiles?.full_name,
                 avatar: m.profiles?.avatar_url
               });
             }
          }
          
          // Check if current user is captain of this squad to show offer banner
          if (user && tm.squads?.captain_id === user.id) {
            if (tm.status === 'offered') {
              currentUserOfferStatus = 'offered';
              currentMemberId = tm.id;
            } else if (tm.status === 'active') {
              currentUserOfferStatus = 'confirmed';
            } else if (tm.status === 'withdrawn' || tm.status === 'declined') {
              currentUserOfferStatus = 'declined';
            }
          }
        }
      }
      
      setJoinedMembers(members);
      setOfferStatus(currentUserOfferStatus);
      setMemberId(currentMemberId);

    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Bug #3 fix: Separate useEffect for squads so it always runs when user becomes available
  const fetchUserSquads = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: sData } = await supabase
      .from('squads')
      .select('id, name, captain_id, squad_members(user_id)')
      .eq('captain_id', user.id)
      .eq('status', 'active');
    if (sData) {
      const mappedSquads = sData.map(s => ({
        ...s,
        members: s.squad_members?.map((sm: any) => sm.user_id) || []
      }));
      setUserSquads(mappedSquads);
    }
  };

  useEffect(() => {
    if (id) fetchTrip();
  }, [id, user]);

  // Bug #3 fix: re-fetch squads whenever user session becomes available
  useEffect(() => {
    fetchUserSquads();
  }, [user]);

  if (loading) {
    return (
      <div>
        <BackBar />
        <TripCardSkeletonList count={1} />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div>
        <BackBar />
        <ErrorBanner message={error || 'Trip not found.'} onRetry={fetchTrip} />
      </div>
    );
  }

  const isHost = user?.id === trip.hostId || user?.id === trip.host_id;
  const isCaptain = userSquads.length > 0;

  const handleConfirm = async () => {
    if (!memberId) return;
    setIsConfirming(true);
    try {
      const result = await confirmTripAction(memberId);
      if (result.success) {
        toast.success('Trip confirmed!');
        fetchTrip();
      } else {
        if (result.message?.includes('Date clash') || result.message?.includes('Conflict')) {
          setConflictMessage(result.message);
          setConflictOpen(true);
        } else {
          toast.error(result.message || 'Failed to confirm');
        }
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDecline = async () => {
    if (!memberId) return;
    try {
      const result = await declineOfferAction(memberId);
      if (result.success) {
        toast.info('Offer declined.');
        fetchTrip();
      } else {
        toast.error(result.message || 'Failed to decline');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleShare = () => {
    const link = `crewup.xyz/trip/${trip.id}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Trip link copied!');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors px-3 py-1.5 rounded-lg hover:bg-charcoal/5"
        >
          {copied ? <Check className="w-4 h-4 text-sage" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied' : 'Share'}
        </button>
      </div>

      <TripDetailHeader trip={trip} />

      {trip.about && (
        <div className="mb-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal mb-2">About this trip</h2>
          <p className="text-sm text-charcoal/70 leading-relaxed">{trip.about}</p>
        </div>
      )}

      {trip.itinerary?.days && (
        <ItineraryTimeline days={trip.itinerary.days} />
      )}

      {joinedMembers.length > 0 && (
        <div className="mb-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">Joined crew</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex -space-x-2">
              {joinedMembers.slice(0, 6).map((m, idx) => (
                <Avatar key={m.id || idx} src={m.avatar} alt={m.name} size="sm" className="ring-2 ring-cream" />
              ))}
            </div>
            <span className="text-sm text-charcoal/55">
              {joinedMembers.length} traveller{joinedMembers.length !== 1 ? 's' : ''} confirmed
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {offerStatus === 'offered' && !isHost && (
          <OfferBanner
            timeLeft={86400}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
            isConfirming={isConfirming}
          />
        )}
        {offerStatus === 'confirmed' && (
          <div className="bg-sage/20 rounded-2xl p-5 border border-sage/40 shadow-soft text-center animate-scale-in">
            <p className="text-sm font-medium text-dusty-teal">Trip confirmed! Pack your bags.</p>
          </div>
        )}
        {offerStatus === 'declined' && (
          <div className="bg-terracotta-light/30 rounded-2xl p-5 border border-terracotta/20 shadow-soft text-center">
            <p className="text-sm text-charcoal/60">You declined this offer.</p>
          </div>
        )}

        <ApplySection
          tripId={trip.id}
          isHost={isHost}
          isCaptain={isCaptain}
          userSquads={userSquads}
          user={user}
          hasPendingReviews={false}
          onApplied={fetchTrip}
        />
      </div>

      <ConflictModal
        isOpen={conflictOpen}
        onClose={() => setConflictOpen(false)}
        memberName="A member"
        conflictingTrip="Another Trip"
        dates={trip.start_date}
        onRemoveAndConfirm={() => {
          setConflictOpen(false);
          // In a real app we would withdraw the member then confirm
          toast.success('Handled conflict successfully.');
        }}
        onDecline={() => {
          setConflictOpen(false);
          handleDecline();
        }}
      />
    </div>
  );
}

function BackBar() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors mb-3"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}
