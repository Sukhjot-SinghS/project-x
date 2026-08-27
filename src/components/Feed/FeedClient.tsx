'use client'

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/Feed/SearchBar';
import { FilterChips } from '@/components/Feed/FilterChips';
import { TripCard } from '@/components/Feed/TripCard';
import { TripCardSkeletonList } from '@/components/Feed/TripCardSkeleton';
import { EmptyState } from '@/components/Shared/EmptyState';
import { Compass } from 'lucide-react';
import type { Trip } from '@/types';

interface FeedClientProps {
  initialTrips: any[];
}

export function FeedClient({ initialTrips }: FeedClientProps) {
  const [filter, setFilter] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('crewup_bookmarks');
    if (saved) setBookmarks(new Set(JSON.parse(saved)));
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('crewup_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const filteredTrips =
    filter === 'all'
      ? initialTrips
      : initialTrips.filter((t) => t.tags?.some((tag: string) => tag.toLowerCase() === filter.toLowerCase()));

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Discover Trips</h1>
        <p className="text-sm text-charcoal/55">Find your next adventure with the right crew.</p>
      </div>

      <SearchBar />

      <div className="mt-3 mb-4">
        <FilterChips active={filter} onChange={setFilter} />
      </div>

      {filteredTrips.length === 0 && (
        <EmptyState
          title="No trips found"
          message="Try a different filter or check back later for new adventures."
          icon={<Compass className="w-9 h-9" />}
        />
      )}

      {filteredTrips.length > 0 && (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isBookmarked={bookmarks.has(trip.id)}
              onBookmarkToggle={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
