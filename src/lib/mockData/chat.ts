import type { ChatMessage } from '@/types';

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    userId: 'u1',
    name: 'Aarav',
    message: 'Hey crew! Excited to have you on the Meghalaya Circuit. Any dietary restrictions I should know about?',
    timestamp: '10:32 AM',
  },
  {
    id: 'm2',
    userId: 'u2',
    name: 'Sukhjot',
    message: 'No pork for me. Otherwise I eat everything!',
    timestamp: '10:35 AM',
    isMe: true,
  },
  {
    id: 'm3',
    userId: 'u4',
    name: 'Priya',
    message: 'Vegetarian here. Happy to help plan the food budget.',
    timestamp: '10:36 AM',
  },
  {
    id: 'm4',
    userId: 'u1',
    name: 'Aarav',
    message: 'Got it. I will book a hostel with a kitchen so we can cook. See you all in Guwahati!',
    timestamp: '10:40 AM',
  },
];
