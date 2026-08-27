'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ChevronDown, Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface SquadOption {
  id: string;
  name: string;
  memberCount: number;
}

interface SquadSelectorProps {
  userId: string;
  value: string;
  onChange: (squadId: string) => void;
}

export function SquadSelector({ userId, value, onChange }: SquadSelectorProps) {
  const [squads, setSquads] = useState<SquadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchSquads = async () => {
      const supabase = createClient();

      const { data: memberships } = await supabase
        .from('squad_members')
        .select('squad_id, squads ( id, name )')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (!active) return;

      const mapped: SquadOption[] = (memberships || [])
        .filter((m: any) => m.squads)
        .map((m: any) => ({ id: m.squads.id, name: m.squads.name, memberCount: 0 }));

      // Fetch member counts per squad in one pass
      if (mapped.length > 0) {
        const squadIds = mapped.map((s) => s.id);
        const { data: counts } = await supabase
          .from('squad_members')
          .select('squad_id')
          .in('squad_id', squadIds)
          .eq('status', 'active');

        if (active && counts) {
          const countMap = counts.reduce<Record<string, number>>((acc, row: any) => {
            acc[row.squad_id] = (acc[row.squad_id] || 0) + 1;
            return acc;
          }, {});
          mapped.forEach((s) => {
            s.memberCount = countMap[s.id] || 0;
          });
        }
      }

      if (active) {
        setSquads(mapped);
        setLoading(false);
      }
    };

    fetchSquads();
    return () => {
      active = false;
    };
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = () => setOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open]);

  if (loading) {
    return (
      <div className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal/40 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your squads...
      </div>
    );
  }

  if (squads.length === 0) {
    return (
      <Link
        href="/squads"
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-terracotta text-white text-sm font-medium shadow-soft hover:bg-terracotta/90 transition-all"
      >
        <Plus className="w-4 h-4" /> Create a Squad
      </Link>
    );
  }

  const selected = squads.find((s) => s.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white text-sm transition-all',
          open
            ? 'border-terracotta ring-2 ring-terracotta/20'
            : 'border-charcoal/15 hover:border-terracotta/40',
        )}
      >
        <span className={selected ? 'text-charcoal' : 'text-charcoal/40'}>
          {selected ? `${selected.name} (${selected.memberCount} members)` : 'Choose a squad...'}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-charcoal/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-charcoal/10 shadow-warm-lg overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {squads.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.id);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                s.id === value
                  ? 'bg-terracotta-light/40 text-terracotta font-medium'
                  : 'text-charcoal hover:bg-charcoal/5',
              )}
            >
              <span>{s.name}</span>
              <span className="flex items-center gap-1 text-xs text-charcoal/45">
                <Users className="w-3 h-3" /> {s.memberCount}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
