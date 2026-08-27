'use client'
import { useState } from 'react';
import { Plus, X, ImagePlus } from 'lucide-react';
import type { TripFormData, TripType } from '@/types';
import { Input, Textarea, Label } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { generateTripCover } from '@/lib/mockData/trips';
import { cn } from '@/lib/utils';

interface Step1Props {
  data: TripFormData;
  update: (patch: Partial<TripFormData>) => void;
}

const tripTypes: { value: TripType; label: string }[] = [
  { value: 'trek', label: 'Trek' },
  { value: 'roadtrip', label: 'Roadtrip' },
  { value: 'staycation', label: 'Staycation' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'nature', label: 'Nature' },
  { value: 'other', label: 'Other' },
];

export function Step1Essentials({ data, update }: Step1Props) {
  const [destInput, setDestInput] = useState('');

  const addDestination = () => {
    const v = destInput.trim();
    if (v && !data.keyDestinations.includes(v)) {
      update({ keyDestinations: [...data.keyDestinations, v] });
      setDestInput('');
    }
  };

  const removeDestination = (d: string) => {
    update({ keyDestinations: data.keyDestinations.filter((x) => x !== d) });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <Label>Cover image</Label>
        <div className="relative">
          <div className="h-32 rounded-2xl overflow-hidden border border-charcoal/10 bg-white">
            {data.coverImage ? (
              <div dangerouslySetInnerHTML={{ __html: data.coverImage }} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/30">
                <ImagePlus className="w-8 h-8 mb-1" />
                <span className="text-xs">Pick a cover style</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(['trek', 'roadtrip', 'staycation', 'adventure', 'nature'] as TripType[]).map((t) => (
              <button
                key={t}
                onClick={() => update({ coverImage: generateTripCover(t), tripType: t })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  data.tripType === t
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-white text-charcoal/60 border-charcoal/15 hover:border-terracotta/40',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Trip title</Label>
        <Input
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g. 3-Day Meghalaya Circuit"
        />
      </div>

      <div>
        <Label>Key destinations</Label>
        <div className="flex gap-2">
          <Input
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
            placeholder="Add a destination and press Enter"
          />
          <Button variant="outline" size="md" onClick={addDestination} type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.keyDestinations.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {data.keyDestinations.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-dusty-teal-light text-dusty-teal text-xs font-medium"
              >
                {d}
                <button onClick={() => removeDestination(d)} className="hover:text-terracotta">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Trip type</Label>
        <div className="flex gap-2 flex-wrap">
          {tripTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => update({ tripType: t.value })}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                data.tripType === t.value
                  ? 'bg-terracotta text-white border-terracotta shadow-soft'
                  : 'bg-white text-charcoal/60 border-charcoal/15 hover:border-terracotta/40',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Short description</Label>
        <Textarea
          rows={3}
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="One-line summary that shows on the feed card..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Start date</Label>
          <Input
            type="date"
            value={data.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>End date</Label>
          <Input
            type="date"
            value={data.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

