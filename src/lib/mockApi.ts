import type { Trip, TripFormData, Itinerary } from '@/types';
import { trips as mockTrips } from '@/lib/mockData/trips';

export const mockFetchTrips = async (): Promise<Trip[]> => {
  return mockTrips;
};

export const mockFetchTrip = async (id: string): Promise<Trip | undefined> => {
  return mockTrips.find((t) => t.id === id);
};

export const mockApplyToTrip = async (
  _tripId: string,
  _squadId: string,
): Promise<{ success: boolean; message: string }> => {
  return { success: true, message: 'Application submitted successfully!' };
};

export const mockConfirmOffer = async (
  _tripId: string,
  _squadId: string,
): Promise<{ success: boolean; message: string }> => {
  return { success: true, message: 'Trip confirmed!' };
};

export const mockPublishTrip = async (
  _tripData: TripFormData,
): Promise<{ success: boolean; tripId: string }> => {
  return { success: true, tripId: 't' + Date.now() };
};

export const mockSubmitReviews = async (
  _reviews: unknown,
): Promise<{ success: boolean; message: string }> => {
  return { success: true, message: 'Reviews submitted!' };
};

export const mockGenerateItinerary = async (_prompt: string): Promise<Itinerary> => {
  return {
    days: [
      { day: 1, summary: 'Arrival and orientation walk. Settle in, local dinner.', weather: 'Sunny, 26C', driveTime: '2 hours' },
      { day: 2, summary: 'Main trail day. Scenic stops, packed lunch, sunset viewpoint.', weather: 'Clear, 22C', driveTime: '1 hour + trail' },
      { day: 3, summary: 'Optional sunrise hike, brunch, return journey.', weather: 'Cloudy, 24C', driveTime: '3 hours' },
    ],
  };
};

export const mockAsyncUpdate = async (_data: unknown): Promise<{ success: boolean }> => {
  return { success: true };
};
