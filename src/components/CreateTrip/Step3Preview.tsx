import { Lock, BadgeCheck, Star, MapPin, Calendar, Wallet } from 'lucide-react';
import type { TripFormData, Trip } from '@/types';
import { getUserById } from '@/lib/mockData/users';
import { AbstractTripCover } from '@/components/Shared/AbstractTripCover';
import { Avatar } from '@/components/Shared/Avatar';
import { Badge } from '@/components/Shared/Badge';
import { formatDateRange, formatBudget } from '@/lib/utils';

interface Step3Props {
  data: TripFormData;
  hostId: string;
}

export function Step3Preview({ data, hostId }: Step3Props) {
  const host = getUserById(hostId);

  const previewTrip: Trip = {
    id: 'preview',
    hostId,
    title: data.title || 'Untitled Trip',
    coverImage: data.coverImage,
    keyDestinations: data.keyDestinations,
    startDate: data.startDate,
    endDate: data.endDate,
    estimatedCost: data.budget,
    description: data.description,
    about: data.about,
    itinerary: data.itinerary,
    budgetBreakdown: { transport: 0, stay: 0, food: 0, misc: 0 },
    tags: data.tags,
    status: 'open',
    squadsJoined: 0,
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-charcoal">Preview</h3>
        <p className="text-xs text-charcoal/55">This is how your trip will look to others.</p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-charcoal/5">
        <div className="h-32 w-full">
          <AbstractTripCover svgString={previewTrip.coverImage} rounded={false} />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
            {previewTrip.title}
          </h3>

          {host && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar src={host.avatar} alt={host.name} size="sm" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-charcoal">{host.name}</span>
                {host.verified && <BadgeCheck className="w-3.5 h-3.5 text-dusty-teal" />}
                <span className="flex items-center gap-0.5 text-xs text-mustard font-semibold">
                  <Star className="w-3 h-3 fill-mustard" /> {host.cScore}
                </span>
              </div>
            </div>
          )}

          {previewTrip.keyDestinations.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {previewTrip.keyDestinations.map((d) => (
                <Badge key={d} variant="teal">
                  <MapPin className="w-3 h-3" /> {d}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-3">
            {previewTrip.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateRange(previewTrip.startDate, previewTrip.endDate)}
              </span>
            )}
            {previewTrip.estimatedCost > 0 && (
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Rs. {formatBudget(previewTrip.estimatedCost)}
              </span>
            )}
          </div>

          {previewTrip.about && (
            <p className="text-sm text-charcoal/70 leading-relaxed mb-3">{previewTrip.about}</p>
          )}

          {previewTrip.itinerary.days.length > 0 && (
            <div className="space-y-2 mb-3">
              {previewTrip.itinerary.days.map((d, i) => (
                <div key={i} className="text-xs">
                  <span className="font-bold text-terracotta">Day {d.day}:</span>{' '}
                  <span className="text-charcoal/70">{d.summary}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-charcoal/5 text-charcoal/40 text-sm cursor-not-allowed">
            <Lock className="w-4 h-4" /> You are hosting
          </div>
        </div>
      </div>
    </div>
  );
}
