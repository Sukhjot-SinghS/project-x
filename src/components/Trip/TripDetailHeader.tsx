import Link from 'next/link';
import { Calendar, Wallet, BadgeCheck, Star, Users, MapPin } from 'lucide-react';
import type { Trip } from '@/types';
import { getUserById } from '@/lib/mockData/users';
import { AbstractTripCover } from '@/components/Shared/AbstractTripCover';
import { Avatar } from '@/components/Shared/Avatar';
import { Badge } from '@/components/Shared/Badge';
import { formatDateRange, formatBudget } from '@/lib/utils';

export function TripDetailHeader({ trip }: { trip: Trip }) {
  const host = getUserById(trip.hostId);

  return (
    <div>
      <div className="h-48 w-full -mx-4 -mt-4 mb-4 w-[calc(100%+2rem)] overflow-hidden">
        <AbstractTripCover svgString={trip.coverImage} rounded={false} />
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {trip.tags.map((tag) => (
          <Badge key={tag} variant="terracotta">
            {tag}
          </Badge>
        ))}
      </div>

      <h1 className="font-serif text-2xl font-bold text-charcoal leading-tight mb-3">
        {trip.title}
      </h1>

      {host && (
        <Link
          href={`/profile/${host.id}`}
          className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-charcoal/5 shadow-soft hover:shadow-warm transition-all mb-4"
        >
          <Avatar src={host.avatar} alt={host.name} size="md" ring />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-charcoal">{host.name}</span>
              {host.verified && <BadgeCheck className="w-4 h-4 text-dusty-teal" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-charcoal/55">
              <span className="flex items-center gap-0.5 text-mustard font-semibold">
                <Star className="w-3 h-3 fill-mustard" /> {host.cScore} C-Score
              </span>
              <span>Host</span>
            </div>
          </div>
          <span className="text-xs text-terracotta font-medium">View Profile</span>
        </Link>
      )}

      <div className="flex gap-1.5 flex-wrap mb-4">
        {trip.keyDestinations.map((dest) => (
          <Badge key={dest} variant="teal">
            <MapPin className="w-3 h-3" /> {dest}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 border border-charcoal/5 shadow-soft">
          <div className="flex items-center gap-1.5 text-charcoal/50 text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" /> Dates
          </div>
          <p className="text-sm font-medium text-charcoal">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-charcoal/5 shadow-soft">
          <div className="flex items-center gap-1.5 text-charcoal/50 text-xs mb-1">
            <Wallet className="w-3.5 h-3.5" /> Budget
          </div>
          <p className="text-sm font-medium text-charcoal">
            Rs. {formatBudget(trip.estimatedCost)} per head
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-charcoal/60 mb-6">
        <Users className="w-4 h-4 text-dusty-teal" />
        <span>
          <span className="font-semibold text-charcoal">{trip.squadsJoined}</span> squad
          {trip.squadsJoined !== 1 ? 's have' : ' has'} joined
        </span>
      </div>
    </div>
  );
}

