import type { Trip } from '@/types';

export const generateTripCover = (type: string): string => {
  const svgs: Record<string, string> = {
    trek: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0E0B3"/><stop offset="1" stop-color="#F0D1C3"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky1)"/><path d="M0 200 L80 110 L160 150 L260 60 L360 120 L400 90 L400 200 Z" fill="#5A7D7C" opacity="0.35"/><path d="M80 110 L160 150 L260 60 L360 120" stroke="#D97A5C" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="260" cy="60" r="9" fill="#D4A843"/><path d="M260 60 L260 90 M254 75 L260 60 L266 75" stroke="#2C2C2C" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    roadtrip: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5C9C8"/><stop offset="1" stop-color="#F9F6F0"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky2)"/><path d="M0 200 L0 140 Q 100 120 200 140 T 400 140 L400 200 Z" fill="#A8B5A0" opacity="0.5"/><rect x="40" y="150" width="320" height="8" fill="#5A7D7C" rx="4"/><circle cx="100" cy="168" r="14" fill="#D97A5C"/><circle cx="300" cy="168" r="14" fill="#D97A5C"/><rect x="170" y="120" width="60" height="30" rx="6" fill="#D4A843"/><rect x="185" y="108" width="30" height="16" rx="4" fill="#D97A5C"/><circle cx="100" cy="168" r="5" fill="#F9F6F0"/><circle cx="300" cy="168" r="5" fill="#F9F6F0"/></svg>`,
    staycation: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D1C3"/><stop offset="1" stop-color="#F9F6F0"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky3)"/><rect x="90" y="70" width="220" height="130" fill="#5A7D7C" opacity="0.3" rx="10"/><rect x="170" y="30" width="60" height="60" fill="#D97A5C" rx="6"/><rect x="190" y="44" width="20" height="20" fill="#F9F6F0" rx="2"/><rect x="120" y="120" width="50" height="80" fill="#D4A843" opacity="0.5" rx="4"/><rect x="230" y="120" width="50" height="80" fill="#D4A843" opacity="0.5" rx="4"/><circle cx="320" cy="50" r="16" fill="#D4A843" opacity="0.6"/></svg>`,
    adventure: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A7D7C"/><stop offset="1" stop-color="#B5C9C8"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky4)"/><path d="M0 200 L120 80 L200 140 L300 40 L400 120 L400 200 Z" fill="#2C2C2C" opacity="0.3"/><path d="M120 80 L200 140 L300 40" stroke="#D97A5C" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 200 Q 200 170 360 200" stroke="#F9F6F0" stroke-width="2" fill="none" opacity="0.5"/><circle cx="300" cy="40" r="6" fill="#D4A843"/></svg>`,
    nature: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8B5A0"/><stop offset="1" stop-color="#F9F6F0"/></linearGradient></defs><rect width="400" height="200" fill="url(#sky5)"/><path d="M0 200 L0 160 Q 400 140 400 160 L400 200 Z" fill="#5A7D7C" opacity="0.4"/><circle cx="80" cy="150" r="22" fill="#5A7D7C" opacity="0.5"/><circle cx="80" cy="150" r="12" fill="#5A7D7C" opacity="0.7"/><circle cx="320" cy="140" r="26" fill="#5A7D7C" opacity="0.5"/><circle cx="320" cy="140" r="14" fill="#5A7D7C" opacity="0.7"/><path d="M180 200 L180 120 M170 130 L180 120 L190 130 M172 150 L180 140 L188 150" stroke="#2C2C2C" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  };
  return svgs[type] || svgs.trek;
};

export const trips: Trip[] = [
  {
    id: 't1',
    hostId: 'u1',
    title: '3-Day Meghalaya Circuit',
    coverImage: generateTripCover('trek'),
    keyDestinations: ['Shillong', 'Dawki', 'Mawlynnong'],
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    estimatedCost: 5000,
    description: 'Relaxed trip for photography lovers. Hostel in Shillong, camp in Dawki.',
    about:
      'A slow-paced loop through the wettest hills in the world. We chase light, lakes, and lazy cafe mornings. Perfect for first-time trekkers who want comfort without the crowds. Bring a camera and a sense of wonder.',
    itinerary: {
      days: [
        { day: 1, summary: 'Guwahati to Shillong. Umiam Lake, cafe crawl.', weather: 'Sunny, 28C', driveTime: '3 hours' },
        { day: 2, summary: 'Shillong to Dawki. Bridge, swimming, riverside camp.', weather: 'Cloudy, 32C', driveTime: '2.5 hours' },
        { day: 3, summary: 'Dawki to Mawlynnong, then back to Guwahati.', weather: 'Sunny, 30C', driveTime: '4 hours' },
      ],
    },
    budgetBreakdown: { transport: 1200, stay: 2000, food: 1000, misc: 800 },
    tags: ['Adventure', 'Nature'],
    status: 'open',
    squadsJoined: 3,
    joinedSquadMembers: ['u2', 'u3', 'u4', 'u6'],
  },
  {
    id: 't2',
    hostId: 'u1',
    title: 'Tunjang Peak Trek',
    coverImage: generateTripCover('adventure'),
    keyDestinations: ['Tunjang Base', 'Ridge Camp', 'Summit'],
    startDate: '2026-09-05',
    endDate: '2026-09-07',
    estimatedCost: 6500,
    description: 'A proper ridge trek for fit crews. Two nights on the trail.',
    about:
      'Three days, one ridge, zero crowds. Tunjang is a serious-but-doable trek for crews who train together. We move light and fast, camp high, and watch the sunrise from the top.',
    itinerary: {
      days: [
        { day: 1, summary: 'Base camp arrival, gear check, acclimatisation walk.', weather: 'Crisp, 18C', driveTime: '5 hours' },
        { day: 2, summary: 'Ridge traverse to high camp. Sunset over the valley.', weather: 'Clear, 12C', driveTime: '0 (on foot)' },
        { day: 3, summary: 'Pre-dawn summit push, descend, drive home.', weather: 'Windy, 10C', driveTime: '4 hours' },
      ],
    },
    budgetBreakdown: { transport: 1800, stay: 1500, food: 1200, misc: 2000 },
    tags: ['Adventure', 'Trek'],
    status: 'open',
    squadsJoined: 2,
    joinedSquadMembers: ['u2', 'u3'],
  },
  {
    id: 't3',
    hostId: 'u6',
    title: 'Roadtrip to Shillong',
    coverImage: generateTripCover('roadtrip'),
    keyDestinations: ['Guwahati', 'Nongpoh', 'Shillong'],
    startDate: '2026-08-20',
    endDate: '2026-08-22',
    estimatedCost: 3500,
    description: 'A chill highway roadtrip with playlist wars and food stops.',
    about:
      'Windows down, playlist up. We drive the old highway to Shillong with stops at every roadside chai stall worth its salt. No itinerary pressure, just good company and better snacks.',
    itinerary: {
      days: [
        { day: 1, summary: 'Guwahati to Nongpoh. Food stop, sunset viewpoint.', weather: 'Sunny, 30C', driveTime: '2 hours' },
        { day: 2, summary: 'Nongpoh to Shillong. Cafe crawl, evening market.', weather: 'Cloudy, 24C', driveTime: '2 hours' },
        { day: 3, summary: 'Shillong viewpoints, drive back to Guwahati.', weather: 'Rainy, 22C', driveTime: '3 hours' },
      ],
    },
    budgetBreakdown: { transport: 1500, stay: 800, food: 700, misc: 500 },
    tags: ['Roadtrip', 'Nature'],
    status: 'open',
    squadsJoined: 1,
    joinedSquadMembers: ['u5', 'u1'],
  },
  {
    id: 't4',
    hostId: 'u1',
    title: 'Coorg Staycation',
    coverImage: generateTripCover('staycation'),
    keyDestinations: ['Madikeri', 'Abbey Falls', 'Coffee Estate'],
    startDate: '2026-10-01',
    endDate: '2026-10-04',
    estimatedCost: 8000,
    description: 'Four days of coffee, mist, and doing absolutely nothing.',
    about:
      'A staycation for crews who need to decompress. We rent a homestay inside a coffee estate, eat too much, and let the mist do the rest. Bring a book, leave the alarm clock.',
    itinerary: {
      days: [
        { day: 1, summary: 'Arrive Madikeri, settle in, estate walk.', weather: 'Misty, 20C', driveTime: '6 hours' },
        { day: 2, summary: 'Abbey Falls, Raja Seat, slow lunch.', weather: 'Rainy, 19C', driveTime: '1 hour' },
        { day: 3, summary: 'Coffee tour, bonfire night.', weather: 'Clear, 21C', driveTime: '0 (at stay)' },
        { day: 4, summary: 'Lazy breakfast, drive home.', weather: 'Sunny, 23C', driveTime: '6 hours' },
      ],
    },
    budgetBreakdown: { transport: 2000, stay: 4000, food: 1200, misc: 800 },
    tags: ['Staycation', 'Nature'],
    status: 'open',
    squadsJoined: 2,
    joinedSquadMembers: ['u4', 'u6'],
  },
  {
    id: 't5',
    hostId: 'u6',
    title: 'Sunderbans Boat Trail',
    coverImage: generateTripCover('nature'),
    keyDestinations: ['Gosaba', 'Sajnekhali', 'Netidhopani'],
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    estimatedCost: 6000,
    description: 'Two nights on a boat through the mangroves. Birdwatchers welcome.',
    about:
      'We live on a boat for three days and let the tide decide the day. The Sunderbans is quiet, vast, and a little wild. Bring binoculars and patience.',
    itinerary: {
      days: [
        { day: 1, summary: 'Gosaba to Sajnekhali. Watchtower, sunset on deck.', weather: 'Humid, 30C', driveTime: '3 hours + boat' },
        { day: 2, summary: 'Cruise to Netidhopani. Wildlife spotting.', weather: 'Cloudy, 29C', driveTime: '0 (on boat)' },
        { day: 3, summary: 'Return cruise, drive back.', weather: 'Sunny, 31C', driveTime: '4 hours' },
      ],
    },
    budgetBreakdown: { transport: 2500, stay: 1500, food: 1000, misc: 1000 },
    tags: ['Nature', 'Adventure'],
    status: 'open',
    squadsJoined: 1,
    joinedSquadMembers: ['u2'],
  },
  {
    id: 't6',
    hostId: 'u1',
    title: 'Spiti Valley Circuit',
    coverImage: generateTripCover('adventure'),
    keyDestinations: ['Shimla', 'Kalpa', 'Tabo', 'Kaza'],
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    estimatedCost: 14000,
    description: 'A week in the high desert. Monasteries, passes, and star-filled nights.',
    about:
      'The full Spiti loop for crews who can handle altitude and long drives. We cross high passes, sleep in mud-brick homestays, and watch the sky turn to milk at night. This one stays with you.',
    itinerary: {
      days: [
        { day: 1, summary: 'Shimla to Kalpa. Apple orchards, first mountain views.', weather: 'Clear, 22C', driveTime: '8 hours' },
        { day: 2, summary: 'Kalpa to Tabo. Monastery visit, desert landscape.', weather: 'Dry, 18C', driveTime: '7 hours' },
        { day: 3, summary: 'Tabo to Kaza. Settle in, acclimatise.', weather: 'Cold, 14C', driveTime: '3 hours' },
        { day: 4, summary: 'Kaza local. Key Monastery, Kibber village.', weather: 'Sunny, 16C', driveTime: '2 hours' },
        { day: 5, summary: 'Chandratal Lake day trip.', weather: 'Windy, 12C', driveTime: '4 hours' },
        { day: 6, summary: 'Kaza to Kalpa. Long drive back.', weather: 'Cloudy, 17C', driveTime: '9 hours' },
        { day: 7, summary: 'Kalpa to Shimla. End of circuit.', weather: 'Rainy, 23C', driveTime: '8 hours' },
      ],
    },
    budgetBreakdown: { transport: 6000, stay: 4000, food: 2500, misc: 1500 },
    tags: ['Adventure', 'Trek', 'Roadtrip'],
    status: 'open',
    squadsJoined: 2,
    joinedSquadMembers: ['u3', 'u4'],
  },
];

export const getTripById = (id: string): Trip | undefined => trips.find((t) => t.id === id);
export const getTripsByHost = (hostId: string): Trip[] => trips.filter((t) => t.hostId === hostId);
