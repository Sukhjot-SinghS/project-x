'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Compass } from 'lucide-react';
import type { User } from '@/types';

interface NavbarProps {
  user: User | null;
  notificationsCount: number;
}

export function Navbar({ user, notificationsCount }: NavbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-charcoal/5">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-semibold text-charcoal tracking-tight">
            Crew<span className="text-terracotta">Up</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/search')}
            className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 rounded-full hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </button>
          {user && (
            <Link href={`/profile/${user.id}`} className="ml-1">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-dusty-teal/30 hover:ring-terracotta transition-all"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


