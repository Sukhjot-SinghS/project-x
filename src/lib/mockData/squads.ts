import type { Squad } from '@/types';

export const squads: Squad[] = [
  {
    id: 's1',
    name: 'Guwahati Crew',
    captainId: 'u2',
    members: ['u2', 'u3', 'u4'],
    isLocked: true,
    status: 'active',
    description: 'The original crew. Tight-knit, reliable, always on time.',
    pendingRequests: [
      { userId: 'u5', requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 's2',
    name: 'Shillong Squad',
    captainId: 'u5',
    members: ['u5', 'u1', 'u6'],
    isLocked: false,
    status: 'active',
    description: 'Mixed-experience squad looking for one more for the Meghalaya circuit.',
    pendingRequests: [],
  },
  {
    id: 's3',
    name: 'Solo Travellers',
    captainId: 'u6',
    members: ['u6'],
    isLocked: false,
    status: 'active',
    description: 'For those who travel alone but want company on the trail.',
    pendingRequests: [],
  },
];

export const getSquadById = (id: string): Squad | undefined => squads.find((s) => s.id === id);
