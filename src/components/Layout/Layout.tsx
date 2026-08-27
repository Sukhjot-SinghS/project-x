'use client'
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { notifications } from '@/lib/mockData/notifications';

interface LayoutProps {
  children: ReactNode;
}

const hideChromeRoutes = ['/search'];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const notificationsCount = notifications.filter((n) => !n.isRead).length;
  
  const hideChrome = hideChromeRoutes.some((r) => pathname.startsWith(r));

  if (hideChrome) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar user={user} notificationsCount={notificationsCount} />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-24 min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
      <BottomNav user={user} />
    </div>
  );
}


