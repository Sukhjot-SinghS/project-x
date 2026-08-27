'use client'
import { cn } from '@/lib/utils';

const filters = ['all', 'Adventure', 'Nature', 'Roadtrip', 'Trek', 'Staycation'];

interface FilterChipsProps {
  active: string;
  onChange: (filter: string) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            active === f
              ? 'bg-terracotta text-white shadow-soft'
              : 'bg-white text-charcoal/60 border border-charcoal/10 hover:border-terracotta/30 hover:text-charcoal',
          )}
        >
          {f === 'all' ? 'All Trips' : f}
        </button>
      ))}
    </div>
  );
}

