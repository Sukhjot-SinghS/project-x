'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, LayoutDashboard, User as UserIcon, Plus } from 'lucide-react';
import type { User } from '@/types';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  user: User | null;
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();
  const path = pathname;

  const isActive = (route: string) => {
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-charcoal/8">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-around relative">
        <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Feed" active={isActive('/')} />
        <NavItem
          href="/squads"
          icon={<Users className="w-5 h-5" />}
          label="Squads"
          active={isActive('/squads')}
        />
        {user && (
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Host"
            active={isActive('/dashboard')}
          />
        )}
        <NavItem
          href={user ? `/profile/${user.id}` : '/'}
          icon={<UserIcon className="w-5 h-5" />}
          label="Profile"
          active={path.startsWith('/profile')}
        />

        <Link
          href="/create-trip"
          className="absolute -top-5 right-4 w-12 h-12 rounded-full bg-terracotta text-white flex items-center justify-center shadow-warm hover:scale-105 active:scale-95 transition-all"
          aria-label="Create trip"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors',
        active ? 'text-terracotta' : 'text-charcoal/45 hover:text-charcoal/70',
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}


