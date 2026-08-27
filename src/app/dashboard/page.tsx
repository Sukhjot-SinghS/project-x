'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Inbox, Plus, Copy, Check, Share2, MapPin } from 'lucide-react';
import { Tabs, TabPanel } from '@/components/Shared/Tabs';
import { Card } from '@/components/Shared/Card';
import { Button } from '@/components/Shared/Button';
import { Badge } from '@/components/Shared/Badge';
import { PendingRequestCard, OfferedRequestCard } from '@/components/Dashboard/PendingRequestCard';
import { ChatPanel } from '@/components/Chat/ChatPanel';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Shared/Toast';
import { getPendingRequestsAction, refreshRosterSnapshotAction } from '@/app/actions/dashboard';
import { offerSquadAction, rejectSquadAction } from '@/app/actions/trip';
import { createClient } from '@/lib/supabase/client';
import { AbstractTripCover } from '@/components/Shared/AbstractTripCover';
import { formatDateRange, formatBudget } from '@/lib/utils';

export default function HostDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [chatSquad, setChatSquad] = useState<any | null>(null);
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [offeredRequests, setOfferedRequests] = useState<any[]>([]);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    
    const supabase = createClient();
    const { data: tripsData } = await supabase
      .from('trips')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });
      
    if (tripsData) setMyTrips(tripsData);

    const result = await getPendingRequestsAction();
    if (result.success && result.data) {
      setPendingRequests(result.data.filter((r: any) => r.status === 'pending'));
      const { data: offered } = await supabase
        .from('trip_members')
        .select(`id, trip_id, squad_id, status, roster_snapshot, offered_at, squads (name, captain_id)`)
        .in('trip_id', tripsData?.map(t => t.id) || [])
        .eq('status', 'offered');
      if (offered) setOfferedRequests(offered);
    } else {
      toast.error(result.message || 'Failed to fetch requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleOffer = async (memberId: string) => {
    const result = await offerSquadAction(memberId);
    if (result.success) {
      toast.success('Offer sent! Squad has 24 hours to confirm.');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to offer');
    }
  };

  const handleReject = async (memberId: string) => {
    const result = await rejectSquadAction(memberId);
    if (result.success) {
      toast.info('Request rejected');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to reject');
    }
  };

  const handleRefreshRoster = async (memberId: string) => {
    const result = await refreshRosterSnapshotAction(memberId);
    if (result.success) {
      toast.success('Roster refreshed!');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to refresh');
    }
  };

  const handleCancelOffer = async (memberId: string) => {
    const result = await rejectSquadAction(memberId);
    if (result.success) {
      toast.info('Offer cancelled');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to cancel');
    }
  };

  const handleCopyLink = (tripId: string) => {
    const link = `${window.location.origin}/trip/${tripId}`;
    navigator.clipboard?.writeText(link);
    setCopiedTripId(tripId);
    toast.success('Trip link copied!');
    setTimeout(() => setCopiedTripId(null), 2000);
  };

  // Pending count per trip for badges on trip cards
  const pendingCountByTrip = pendingRequests.reduce((acc: Record<string, number>, req) => {
    acc[req.trip_id] = (acc[req.trip_id] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4 pb-24">
        <div className="h-8 w-48 bg-charcoal/8 rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-charcoal/5 rounded-lg animate-pulse" />
        <div className="h-36 w-full bg-charcoal/5 rounded-2xl animate-pulse" />
        <div className="h-36 w-full bg-charcoal/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Host Dashboard</h1>
        <p className="text-sm text-charcoal/55">Manage your trips and squad applications.</p>
      </div>

      {/* ── SCENARIO A: No trips yet ── */}
      {myTrips.length === 0 && (
        <div className="mb-6 p-7 bg-white border-2 border-dashed border-terracotta/25 rounded-2xl text-center shadow-soft">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="font-serif text-lg font-bold text-charcoal mb-1">You haven't hosted a trip yet.</h2>
          <p className="text-sm text-charcoal/55 mb-5">
            Create a trip to start receiving squad applications from travellers.
          </p>
          <Button variant="primary" onClick={() => router.push('/create-trip')}>
            <Plus className="w-4 h-4" /> Create Your First Trip
          </Button>
        </div>
      )}

      {/* ── SCENARIO B & C: Has Trips → Trip Cards ── */}
      {myTrips.length > 0 && (
        <div className="mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-charcoal/35 mb-3">Your Active Trips</p>
          <div className="space-y-3">
            {myTrips.slice(0, 3).map((trip) => {
              const tripPending = pendingCountByTrip[trip.id] || 0;
              const isCopied = copiedTripId === trip.id;
              return (
                <Card key={trip.id} className="overflow-hidden">
                  <div className="h-20 w-full">
                    <AbstractTripCover svgString={trip.cover_image_url || ''} rounded={false} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-serif text-sm font-semibold text-charcoal leading-snug flex-1">
                        {trip.title}
                      </h3>
                      {tripPending > 0 && (
                        <Badge variant="terracotta">{tripPending} pending</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal/45 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDateRange(trip.start_date, trip.end_date)}
                      </span>
                      {trip.key_destinations?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {trip.key_destinations[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/trip/${trip.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">View Trip</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(trip.id)}>
                        {isCopied
                          ? <><Check className="w-3.5 h-3.5 text-sage" /> Copied</>
                          : <><Copy className="w-3.5 h-3.5" /> Share</>
                        }
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            {myTrips.length > 3 && (
              <p className="text-xs text-center text-charcoal/35">
                +{myTrips.length - 3} more trip{myTrips.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── REQUESTS SECTION (only if they have trips) ── */}
      {myTrips.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-charcoal/35 mb-3">Applications</p>

          <Tabs
            tabs={[
              { id: 'pending', label: 'Pending', count: pendingRequests.length },
              { id: 'offered', label: 'Offered', count: offeredRequests.length },
              { id: 'active', label: 'Active', count: 0 },
              { id: 'completed', label: 'Done', count: 0 },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          <TabPanel isActive={activeTab === 'pending'}>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-3xl mb-3">📭</div>
                <p className="font-serif text-base font-semibold text-charcoal mb-1">No applications yet</p>
                <p className="text-sm text-charcoal/55 mb-4">
                  Share your trip link with squads and friends to start getting applications!
                </p>
                {myTrips[0] && (
                  <Button variant="outline" size="sm" onClick={() => handleCopyLink(myTrips[0].id)}>
                    <Share2 className="w-3.5 h-3.5" /> Copy Trip Link
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const trip = myTrips.find(t => t.id === req.trip_id);
                  if (!trip) return null;
                  return (
                    <PendingRequestCard
                      key={req.id}
                      trip={trip}
                      request={req}
                      onOffered={() => handleOffer(req.id)}
                      onReject={() => handleReject(req.id)}
                      onRefresh={() => handleRefreshRoster(req.id)}
                      onOpenChat={() => setChatSquad(req.squads)}
                    />
                  );
                })}
              </div>
            )}
          </TabPanel>

          <TabPanel isActive={activeTab === 'offered'}>
            {offeredRequests.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-3xl mb-3">📬</div>
                <p className="font-serif text-base font-semibold text-charcoal mb-1">No offers sent yet</p>
                <p className="text-sm text-charcoal/55">
                  When you offer a spot to a squad, their 24-hour countdown will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {offeredRequests.map((req) => {
                  const trip = myTrips.find(t => t.id === req.trip_id);
                  if (!trip) return null;
                  return (
                    <OfferedRequestCard
                      key={req.id}
                      trip={trip}
                      request={req}
                      offeredAt={req.offered_at}
                      onCancel={() => handleCancelOffer(req.id)}
                    />
                  );
                })}
              </div>
            )}
          </TabPanel>

          <TabPanel isActive={activeTab === 'active'}>
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-3">🏕️</div>
              <p className="font-serif text-base font-semibold text-charcoal mb-1">No active trips yet</p>
              <p className="text-sm text-charcoal/55">Once a squad confirms your offer, they'll appear here.</p>
            </div>
          </TabPanel>

          <TabPanel isActive={activeTab === 'completed'}>
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-3">🗺️</div>
              <p className="font-serif text-base font-semibold text-charcoal mb-1">No trips completed yet</p>
              <p className="text-sm text-charcoal/55">Finished adventures and reviews will show up here.</p>
            </div>
          </TabPanel>
        </>
      )}

      <ChatPanel squad={chatSquad} onClose={() => setChatSquad(null)} />
    </div>
  );
}

import { useToast } from '@/components/Shared/Toast';
import { getPendingRequestsAction, refreshRosterSnapshotAction } from '@/app/actions/dashboard';
import { offerSquadAction, rejectSquadAction } from '@/app/actions/trip';
import { createClient } from '@/lib/supabase/client';
import { AbstractTripCover } from '@/components/Shared/AbstractTripCover';
import { formatDateRange, formatBudget } from '@/lib/utils';
import type { Squad } from '@/types';

export default function HostDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [chatSquad, setChatSquad] = useState<any | null>(null);
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [offeredRequests, setOfferedRequests] = useState<any[]>([]);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch my trips
    const supabase = createClient();
    const { data: tripsData } = await supabase
      .from('trips')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });
      
    if (tripsData) setMyTrips(tripsData);

    // Fetch pending and offered requests
    const result = await getPendingRequestsAction();
    if (result.success && result.data) {
      setPendingRequests(result.data.filter((r: any) => r.status === 'pending'));
      // The action currently filters for 'pending'. We should fetch 'offered' too or just use the same list if we modify the action.
      // Wait, getPendingRequestsAction only returns 'pending'.
      // Let's fetch offered requests manually here for now.
      const { data: offered } = await supabase
        .from('trip_members')
        .select(`
          id, trip_id, squad_id, status, roster_snapshot, offered_at,
          squads (name, captain_id)
        `)
        .in('trip_id', tripsData?.map(t => t.id) || [])
        .eq('status', 'offered');
        
      if (offered) setOfferedRequests(offered);
    } else {
      toast.error(result.message || 'Failed to fetch requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleOffer = async (memberId: string) => {
    const result = await offerSquadAction(memberId);
    if (result.success) {
      toast.success('Offer sent! Squad has 24 hours to confirm.');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to offer');
    }
  };

  const handleReject = async (memberId: string) => {
    const result = await rejectSquadAction(memberId);
    if (result.success) {
      toast.info('Request rejected');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to reject');
    }
  };

  const handleRefreshRoster = async (memberId: string) => {
    const result = await refreshRosterSnapshotAction(memberId);
    if (result.success) {
      toast.success('Roster refreshed!');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to refresh');
    }
  };

  const handleCancelOffer = async (memberId: string) => {
    const result = await rejectSquadAction(memberId); // Reusing reject logic or withdraw
    if (result.success) {
      toast.info('Offer cancelled');
      fetchDashboardData();
    } else {
      toast.error(result.message || 'Failed to cancel');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Host Dashboard</h1>
      <p className="text-sm text-charcoal/55 mb-4">Manage your trips and squad applications.</p>

      {myTrips.length > 0 && (
        <div className="space-y-3 mb-6">
          {myTrips.slice(0, 2).map((trip) => (
            <Card key={trip.id} className="overflow-hidden">
              <div className="h-24 w-full">
                <AbstractTripCover svgString={trip.cover_image_url || ''} rounded={false} />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-semibold text-charcoal mb-2">{trip.title}</h3>
                <div className="flex items-center gap-4 text-xs text-charcoal/60 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDateRange(trip.start_date, trip.end_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" /> Rs. {formatBudget(trip.estimated_cost_per_person)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/trip/${trip.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">View Trip</Button>
                  </Link>
                  <Link href="/create-trip" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'pending', label: 'Pending', count: pendingRequests.length },
          { id: 'offered', label: 'Offered', count: offeredRequests.length },
          { id: 'active', label: 'Active', count: 0 },
          { id: 'completed', label: 'Completed', count: 0 },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <TabPanel isActive={activeTab === 'pending'}>
        {pendingRequests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            message="When squads apply to your trips, you will see them here."
            icon={<Inbox className="w-9 h-9" />}
          />
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const trip = myTrips.find(t => t.id === req.trip_id);
              if (!trip) return null;
              return (
                <PendingRequestCard
                  key={req.id}
                  trip={trip}
                  request={req}
                  onOffered={() => handleOffer(req.id)}
                  onReject={() => handleReject(req.id)}
                  onRefresh={() => handleRefreshRoster(req.id)}
                  onOpenChat={() => setChatSquad(req.squads)}
                />
              );
            })}
          </div>
        )}
      </TabPanel>

      <TabPanel isActive={activeTab === 'offered'}>
        {offeredRequests.length === 0 ? (
          <EmptyState
            title="No offers pending"
            message="Offers you send to squads will show their countdown here."
            icon={<Inbox className="w-9 h-9" />}
          />
        ) : (
          <div className="space-y-3">
            {offeredRequests.map((req) => {
              const trip = myTrips.find(t => t.id === req.trip_id);
              if (!trip) return null;
              return (
                <OfferedRequestCard
                  key={req.id}
                  trip={trip}
                  request={req}
                  offeredAt={req.offered_at}
                  onCancel={() => handleCancelOffer(req.id)}
                />
              );
            })}
          </div>
        )}
      </TabPanel>

      <TabPanel isActive={activeTab === 'active'}>
        <EmptyState
          title="No active trips"
          message="Once a squad confirms, your trip will appear here."
          icon={<Users className="w-9 h-9" />}
        />
      </TabPanel>

      <TabPanel isActive={activeTab === 'completed'}>
        <EmptyState
          title="No completed trips"
          message="Finished trips and their reviews will show here."
          icon={<Calendar className="w-9 h-9" />}
        />
      </TabPanel>

      <ChatPanel squad={chatSquad} onClose={() => setChatSquad(null)} />
    </div>
  );
}
