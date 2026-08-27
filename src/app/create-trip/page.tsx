'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { createTripAction, generateAIItineraryAction } from '@/app/actions/trip';
import { StepIndicator } from '@/components/CreateTrip/StepIndicator';
import { Step1Essentials } from '@/components/CreateTrip/Step1Essentials';
import { Step2ItineraryBudget } from '@/components/CreateTrip/Step2ItineraryBudget';
import { Step3Preview } from '@/components/CreateTrip/Step3Preview';
import { Button } from '@/components/Shared/Button';
import { useToast } from '@/components/Shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { generateTripCover } from '@/lib/mockData/trips';
import type { TripFormData } from '@/types';

export default function TripCreationWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Host Selection State
  const [hostMode, setHostMode] = useState<'solo' | 'squad'>('solo');
  const [selectedSquadId, setSelectedSquadId] = useState('');
  const [squads, setSquads] = useState<any[]>([]);

  // Fetch squads where user is captain
  useEffect(() => {
    if (!user) return;
    const fetchSquads = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('squads')
        .select('*')
        .eq('captain_id', user.id)
        .eq('status', 'active');
      setSquads(data || []);
    };
    fetchSquads();
  }, [user]);

  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    coverImage: generateTripCover('trek'),
    keyDestinations: [],
    tripType: 'trek',
    description: '',
    startDate: '',
    endDate: '',
    about: '',
    itinerary: { days: [] },
    budget: 0,
    tags: [],
  });

  const update = (patch: Partial<TripFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const canProceed = () => {
    if (hostMode === 'squad' && !selectedSquadId) return false;
    if (step === 1) return formData.title.trim() !== '' && formData.startDate !== '' && formData.endDate !== '';
    if (step === 2) return formData.budget > 0;
    return true;
  };

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAIItineraryAction(
        formData.about || formData.description || 'A fun trip',
        formData.keyDestinations || [],
        { start: formData.startDate, end: formData.endDate }
      );
      if (result.success && result.data) {
        update({ itinerary: result.data });
        toast.success('Itinerary generated!');
      } else {
        toast.error(result.message || 'Failed to generate itinerary');
      }
    } catch (error) {
      toast.error('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await createTripAction({
        title: formData.title,
        coverImageUrl: formData.coverImage,
        keyDestinations: formData.keyDestinations,
        tripType: formData.tripType as any,
        description: formData.about || formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        estimatedCost: formData.budget,
        itinerary: formData.itinerary || { days: [] },
        budgetBreakdown: { transport: 0, stay: 0, food: formData.budget, misc: 0 },
        tags: formData.tags || [],
        squadId: hostMode === 'solo' ? 'solo' : selectedSquadId,
      });

      if (result.success) {
        toast.success('Trip published successfully!');
        router.push(`/trip/${result.tripId}`);
      } else {
        toast.error(result.message || 'Failed to publish trip');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Create a Trip</h1>
      <p className="text-sm text-charcoal/55 mb-5">Build your trip in three quick steps.</p>

      {/* Host As Selector */}
      <div className="mb-8 p-5 bg-white border border-terracotta/20 rounded-2xl shadow-sm">
        <h2 className="font-serif text-lg font-bold text-charcoal mb-4">🏕️ Who is hosting this trip?</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setHostMode('solo')}
            className={`flex-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
              hostMode === 'solo' ? 'border-terracotta bg-terracotta/5 text-terracotta' : 'border-gray-200 text-charcoal/60'
            }`}
          >
            🧍 Host Solo
          </button>
          <button
            onClick={() => setHostMode('squad')}
            className={`flex-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
              hostMode === 'squad' ? 'border-terracotta bg-terracotta/5 text-terracotta' : 'border-gray-200 text-charcoal/60'
            }`}
          >
            🏕️ Host with Squad
          </button>
        </div>

        {hostMode === 'squad' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium mb-2 text-charcoal">Select Your Squad</label>
            <select
              value={selectedSquadId}
              onChange={(e) => setSelectedSquadId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-terracotta/50"
            >
              <option value="">Choose a squad...</option>
              {squads.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {squads.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                You are not the captain of any squad. <span className="underline cursor-pointer" onClick={() => router.push('/squads')}>Create one first</span>, or Host Solo.
              </p>
            )}
          </div>
        )}
      </div>

      <StepIndicator current={step} total={3} labels={['Essentials', 'Itinerary', 'Preview']} />

      {step === 1 && <Step1Essentials data={formData} update={update} />}
      {step === 2 && (
        <Step2ItineraryBudget 
          data={formData} 
          update={update} 
        />
      )}
      {step === 3 && <Step3Preview data={formData} hostId={user?.id || 'u1'} />}
      
      {step === 2 && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" loading={isGenerating} onClick={handleGenerateItinerary}>
            {isGenerating ? 'Generating...' : '✨ Generate AI Itinerary'}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-charcoal/8 pb-20">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        )}

        {step < 3 ? (
          <Button variant="primary" disabled={!canProceed()} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="primary" loading={isPublishing} onClick={handlePublish} disabled={!canProceed()}>
            <Send className="w-4 h-4" /> Publish Trip
          </Button>
        )}
      </div>
    </div>
  );
}
