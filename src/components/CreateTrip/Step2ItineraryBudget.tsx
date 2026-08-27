'use client'
import { useState } from 'react';
import { Sparkles, Pencil, Plus, X } from 'lucide-react';
import type { TripFormData } from '@/types';
import { Textarea, Label, Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { useToast } from '@/components/Shared/Toast';
import { mockGenerateItinerary } from '@/lib/mockApi';

interface Step2Props {
  data: TripFormData;
  update: (patch: Partial<TripFormData>) => void;
}

export function Step2ItineraryBudget({ data, update }: Step2Props) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const toast = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt to generate an itinerary.');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await mockGenerateItinerary(prompt);
      update({ itinerary: result });
      toast.success('Itinerary generated!');
    } catch {
      toast.error('Failed to generate itinerary. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !data.tags.includes(v)) {
      update({ tags: [...data.tags, v] });
      setTagInput('');
    }
  };

  const updateDay = (idx: number, summary: string) => {
    const days = [...data.itinerary.days];
    days[idx] = { ...days[idx], summary };
    update({ itinerary: { days } });
  };

  const addDay = () => {
    const nextDay = data.itinerary.days.length + 1;
    update({
      itinerary: {
        days: [...data.itinerary.days, { day: nextDay, summary: '', weather: '', driveTime: '' }],
      },
    });
  };

  const removeDay = (idx: number) => {
    const days = data.itinerary.days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }));
    update({ itinerary: { days } });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <Label>About this trip</Label>
        <Textarea
          rows={4}
          value={data.about}
          onChange={(e) => update({ about: e.target.value })}
          placeholder="Tell potential crew members what makes this trip special..."
        />
      </div>

      <div className="bg-dusty-teal-light/30 rounded-2xl p-4 border border-dusty-teal/15">
        <Label>AI Itinerary Generator</Label>
        <p className="text-xs text-charcoal/55 mb-2">
          Describe your trip and let AI draft a day-by-day plan. You can edit anything after.
        </p>
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 3 days in Meghalaya, relaxed pace, photography focused"
          />
          <Button
            variant="secondary"
            size="md"
            loading={isGenerating}
            onClick={handleGenerate}
            type="button"
          >
            <Sparkles className="w-4 h-4" /> Generate
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Itinerary</Label>
          <button
            onClick={addDay}
            className="text-xs text-terracotta font-medium flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add day
          </button>
        </div>
        {data.itinerary.days.length === 0 ? (
          <div className="text-center py-8 text-sm text-charcoal/40 border border-dashed border-charcoal/15 rounded-2xl">
            No days yet. Generate with AI or add manually.
          </div>
        ) : (
          <div className="space-y-2">
            {data.itinerary.days.map((day, idx) => (
              <div key={idx} className="bg-white rounded-xl p-3 border border-charcoal/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-terracotta uppercase tracking-wide">
                    Day {day.day}
                  </span>
                  <div className="flex items-center gap-2">
                    {day.weather && (
                      <span className="text-[10px] text-charcoal/50">{day.weather}</span>
                    )}
                    {data.itinerary.days.length > 1 && (
                      <button onClick={() => removeDay(idx)} className="text-charcoal/30 hover:text-terracotta">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Pencil className="w-3.5 h-3.5 text-charcoal/30 mt-2 flex-shrink-0" />
                  <textarea
                    value={day.summary}
                    onChange={(e) => updateDay(idx, e.target.value)}
                    placeholder="Day summary..."
                    rows={2}
                    className="flex-1 text-sm text-charcoal bg-transparent resize-none focus:outline-none placeholder:text-charcoal/30"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Budget per head (Rs.)</Label>
        <Input
          type="number"
          value={data.budget || ''}
          onChange={(e) => update({ budget: Number(e.target.value) })}
          placeholder="e.g. 5000"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag and press Enter"
          />
          <Button variant="outline" size="md" onClick={addTag} type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {data.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {data.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-terracotta-light text-terracotta text-xs font-medium"
              >
                {t}
                <button onClick={() => update({ tags: data.tags.filter((x) => x !== t) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

