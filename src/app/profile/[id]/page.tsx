'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BadgeCheck, Star, Pencil, Calendar, Users, Wallet } from 'lucide-react';
import { Avatar } from '@/components/Shared/Avatar';
import { Badge } from '@/components/Shared/Badge';
import { Card } from '@/components/Shared/Card';
import { Button } from '@/components/Shared/Button';
import { GenomeRadar } from '@/components/Profile/GenomeRadar';
import { ProfileEditModal } from '@/components/Profile/ProfileEditModal';
import { PendingReviewsBanner } from '@/components/Profile/PendingReviewsBanner';
import { EmptyState } from '@/components/Shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/mockData/users';
import { squads as allSquads } from '@/lib/mockData/squads';
import { trips as allTrips } from '@/lib/mockData/trips';
import { TripCard } from '@/components/Feed/TripCard';
import { formatDateRange, formatBudget } from '@/lib/utils';
import type { User } from '@/types';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user: currentUser } = useAuth();
  const profileUser = id ? getUserById(id) : undefined;
  const [editOpen, setEditOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(['t4']));

  if (!profileUser) {
    return <EmptyState title="User not found" message="This profile does not exist." />;
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const userSquads = allSquads.filter((s) => s.members.includes(profileUser.id));
  const userTrips = allTrips.filter((t) => t.hostId === profileUser.id);
  const bookmarkedTrips = allTrips.filter((t) => bookmarks.has(t.id));
  const completedTrips = allTrips.slice(0, 2).map((t) => ({
    ...t,
    rating: 4 + Math.random(),
  }));

  const handleSave = (updated: Partial<User>) => {
    Object.assign(profileUser, updated);
  };

  const toggleBookmark = (tripId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) next.delete(tripId);
      else next.add(tripId);
      return next;
    });
  };

  return (
    <div className="animate-fade-in">
      <PendingReviewsBanner />

      <div className="bg-white rounded-3xl p-6 shadow-soft border border-charcoal/5 mb-5">
        <div className="flex flex-col items-center text-center">
          <Avatar src={profileUser.avatar} alt={profileUser.name} size="xl" ring />
          <h1 className="font-serif text-xl font-bold text-charcoal mt-3 flex items-center gap-1.5">
            {profileUser.name}
            {profileUser.verified && <BadgeCheck className="w-5 h-5 text-dusty-teal" />}
          </h1>
          <p className="text-sm text-charcoal/55">{profileUser.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-sm font-semibold text-mustard">
              <Star className="w-4 h-4 fill-mustard" /> {profileUser.cScore} C-Score
            </span>
            {profileUser.isHost && <Badge variant="terracotta">Host</Badge>}
          </div>
          <p className="text-xs text-charcoal/45 mt-1">Member since {profileUser.memberSince}</p>
          {isOwnProfile && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          )}
        </div>

        {profileUser.bio && (
          <p className="text-sm text-charcoal/70 leading-relaxed text-center mt-4 px-4">
            {profileUser.bio}
          </p>
        )}
        {profileUser.interests && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
            {profileUser.interests.split(',').map((interest) => (
              <Badge key={interest} variant="teal">{interest.trim()}</Badge>
            ))}
          </div>
        )}
      </div>

      <Card className="p-5 mb-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-3 text-center">Travel Genome</h2>
        <div className="w-48 h-48 mx-auto">
          <GenomeRadar genome={profileUser.genome} />
        </div>
      </Card>

      <div className="mb-5">
        <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">My Squads</h2>
        {userSquads.length === 0 ? (
          <p className="text-sm text-charcoal/50">Not part of any squad yet.</p>
        ) : (
          <div className="space-y-2">
            {userSquads.map((s) => (
              <Card key={s.id} className="p-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {s.members.slice(0, 3).map((mid) => {
                    const m = getUserById(mid);
                    return m ? <Avatar key={mid} src={m.avatar} alt={m.name} size="sm" className="ring-2 ring-white" /> : null;
                  })}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{s.name}</p>
                  <p className="text-xs text-charcoal/55">{s.members.length} members</p>
                </div>
                {s.captainId === profileUser.id && <Badge variant="mustard">Captain</Badge>}
              </Card>
            ))}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="mb-5">
          <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">My Applications</h2>
          <div className="space-y-2">
            <Card className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">3-Day Meghalaya Circuit</p>
                <p className="text-xs text-charcoal/55">Applied with Guwahati Crew</p>
              </div>
              <Badge variant="mustard">Pending</Badge>
            </Card>
            <Card className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Tunjang Peak Trek</p>
                <p className="text-xs text-charcoal/55">Applied with Guwahati Crew</p>
              </div>
              <Badge variant="teal">Approved</Badge>
            </Card>
          </div>
        </div>
      )}

      {isOwnProfile && bookmarkedTrips.length > 0 && (
        <div className="mb-5">
          <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">Bookmarked Trips</h2>
          <div className="space-y-3">
            {bookmarkedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isBookmarked={bookmarks.has(trip.id)}
                onBookmarkToggle={toggleBookmark}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">Trip History</h2>
        {completedTrips.length === 0 ? (
          <p className="text-sm text-charcoal/50">No completed trips yet.</p>
        ) : (
          <div className="space-y-2">
            {completedTrips.map((t) => (
              <Card key={t.id} className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-charcoal">{t.title}</p>
                  <span className="flex items-center gap-0.5 text-xs text-mustard font-semibold">
                    <Star className="w-3 h-3 fill-mustard" /> {t.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-charcoal/55">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDateRange(t.startDate, t.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Rs. {formatBudget(t.estimatedCost)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        user={profileUser}
        onSave={handleSave}
      />
    </div>
  );
}
