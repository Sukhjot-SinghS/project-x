import { useEffect, useState } from 'react';
import { currentUser } from '@/lib/mockData/users';
import type { User } from '@/types';

export function useAuth(): { user: User | null } {
  const [user] = useState<User | null>(currentUser);
  return { user };
}
