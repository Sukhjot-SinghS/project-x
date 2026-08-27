'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { trips as allTrips } from '@/lib/mockData/trips';
import { TripCard } from '@/components/Feed/TripCard';
import { Button } from '@/components/Shared/Button';
import { EmptyState } from '@/components/Shared/EmptyState';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [budgetMax, setBudgetMax] = useState(15000);
  const [selectedDest, setSelectedDest] = useState<string[]>([]);
  const [tripType, setTripType] = useState('all');
  const [minCScore, setMinCScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const allDestinations = useMemo(
    () => [...new Set(allTrips.flatMap((t) => t.keyDestinations))].sort(),
    [],
  );

  const filteredTrips = useMemo(() => {
    return allTrips.filter((t) => {
      if (query) {
        const q = query.toLowerCase();
        const match =
          t.title.toLowerCase().includes(q) ||
          t.keyDestinations.some((d) => d.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (t.estimatedCost > budgetMax) return false;
      if (selectedDest.length > 0 && !selectedDest.some((d) => t.keyDestinations.includes(d))) return false;
      if (tripType !== 'all' && !t.tags.some((tag) => tag.toLowerCase() === tripType.toLowerCase())) return false;
      return true;
    });
  }, [query, budgetMax, selectedDest, tripType, minCScore]);

  const toggleDest = (dest: string) => {
    setSelectedDest((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest],
    );
  };

  const reset = () => {
    setQuery('');
    setBudgetMax(15000);
    setSelectedDest([]);
    setTripType('all');
    setMinCScore(0);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream animate-slide-up">
      <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-charcoal/5">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-charcoal/5">
            <X className="w-5 h-5 text-charcoal" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-white border border-charcoal/15 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-charcoal/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trips, destinations..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-charcoal/40"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              'p-2.5 rounded-xl border transition-colors',
              showFilters ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-charcoal/15 text-charcoal',
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4 py-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-charcoal/70 block mb-1.5">
                Max Budget: Rs. {budgetMax.toLocaleString()}
              </label>
              <input
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-terracotta"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 block mb-1.5">Destinations</label>
              <div className="flex gap-1.5 flex-wrap">
                {allDestinations.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => toggleDest(dest)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      selectedDest.includes(dest)
                        ? 'bg-dusty-teal text-white border-dusty-teal'
                        : 'bg-white text-charcoal/60 border-charcoal/15',
                    )}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 block mb-1.5">Trip Type</label>
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'Adventure', 'Nature', 'Roadtrip', 'Trek', 'Staycation'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      tripType === t
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-white text-charcoal/60 border-charcoal/15',
                    )}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal/70 block mb-1.5">
                Min C-Score: {minCScore.toFixed(1)}
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minCScore}
                onChange={(e) => setMinCScore(Number(e.target.value))}
                className="w-full accent-terracotta"
              />
            </div>

            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <p className="text-sm text-charcoal/55 mb-3">
          {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
        </p>
        {filteredTrips.length === 0 ? (
          <EmptyState title="No trips match your filters" message="Try widening your search or resetting filters." />
        ) : (
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
    </div>
  );
}
