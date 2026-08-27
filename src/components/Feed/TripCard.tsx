'use client'
import Link from 'next/link';
import { Bookmark, Calendar, Wallet, Users, BadgeCheck, Star } from 'lucide-react';
import type { Trip } from '@/types';
import { getUserById } from '@/lib/mockData/users';
import { AbstractTripCover } from '@/components/Shared/AbstractTripCover';
import { Badge } from '@/components/Shared/Badge';
import { Avatar } from '@/components/Shared/Avatar';
import { formatDateRange, formatBudget, cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string) => void;
}

export function TripCard({ trip, isBookmarked = false, onBookmarkToggle }: TripCardProps) {
  const host = getUserById(trip.hostId);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-charcoal/5 transition-all duration-300 hover:shadow-warm hover:-translate-y-0.5">
      <Link href={`/trip/${trip.id}`} className="block relative">
        <div className="h-32 w-full">
          <AbstractTripCover svgString={trip.coverImage} rounded={false} />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onBookmarkToggle?.(trip.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft hover:scale-110 transition-all"
          aria-label="Bookmark"
        >
          <Bookmark
            className={cn(
              'w-4.5 h-4.5 transition-colors',
              isBookmarked ? 'fill-terracotta text-terracotta' : 'text-charcoal/50',
            )}
          />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {trip.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="muted" className="bg-white/85 backdrop-blur">
              {tag}
            </Badge>
          ))}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/trip/${trip.id}`}>
          <h3 className="font-serif text-lg font-semibold text-charcoal leading-snug mb-2 hover:text-terracotta transition-colors">
            {trip.title}
          </h3>
        </Link>

        {host && (
          <Link
            href={`/profile/${host.id}`}
            className="flex items-center gap-2 mb-3 group"
          >
            <Avatar src={host.avatar} alt={host.name} size="sm" />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-charcoal group-hover:text-terracotta transition-colors">
                {host.name}
              </span>
              {host.verified && <BadgeCheck className="w-3.5 h-3.5 text-dusty-teal" />}
              <span className="flex items-center gap-0.5 text-xs text-mustard font-semibold">
                <Star className="w-3 h-3 fill-mustard" /> {host.cScore}
              </span>
            </div>
          </Link>
        )}

        <div className="flex gap-1.5 flex-wrap mb-3">
          {trip.keyDestinations.map((dest) => (
            <Badge key={dest} variant="teal">
              {dest}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-charcoal/60 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            Rs. {formatBudget(trip.estimatedCost)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {trip.squadsJoined} squad{trip.squadsJoined !== 1 ? 's' : ''}
          </span>
        </div>

        <Link
          href={`/trip/${trip.id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-terracotta-light/40 text-terracotta text-sm font-medium hover:bg-terracotta hover:text-white transition-all duration-200"
        >
          View Trip
        </Link>
      </div>
    </div>
  );
}


