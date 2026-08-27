import { Cloud, Car, MapPin } from 'lucide-react';
import type { DayPlan } from '@/types';

export function ItineraryTimeline({ days }: { days: DayPlan[] }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-lg font-semibold text-charcoal mb-4">Itinerary</h2>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-terracotta-light" />
        {days.map((day, i) => (
          <div key={i} className="relative mb-5 last:mb-0 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="absolute -left-[1.4rem] top-1 w-4 h-4 rounded-full bg-terracotta border-2 border-cream shadow-soft" />
            <div className="bg-white rounded-2xl p-4 border border-charcoal/5 shadow-soft">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-terracotta uppercase tracking-wide">
                  Day {day.day}
                </span>
              </div>
              <p className="text-sm text-charcoal leading-relaxed mb-3">{day.summary}</p>
              <div className="flex items-center gap-4 text-xs text-charcoal/55">
                <span className="flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-dusty-teal" /> {day.weather}
                </span>
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-mustard" /> {day.driveTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
