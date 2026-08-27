'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle, XCircle, Edit, Star, Bell, Check, ArrowRight } from 'lucide-react';
import { notifications as initialNotifications } from '@/lib/mockData/notifications';
import { EmptyState } from '@/components/Shared/EmptyState';
import { Badge } from '@/components/Shared/Badge';
import { timeAgo } from '@/lib/utils';
import type { NotificationType, AppNotification } from '@/types';
import type { ComponentType } from 'react';

const notificationConfig: Record<NotificationType, { icon: ComponentType<{ className?: string }>; color: string; bg: string }> = {
  offer_received: { icon: Mail, color: 'text-dusty-teal', bg: 'bg-dusty-teal-light/50' },
  request_approved: { icon: CheckCircle, color: 'text-sage', bg: 'bg-sage/30' },
  request_rejected: { icon: XCircle, color: 'text-terracotta', bg: 'bg-terracotta-light/50' },
  trip_edited: { icon: Edit, color: 'text-mustard', bg: 'bg-mustard-light/50' },
  review_prompt: { icon: Star, color: 'text-dusty-teal', bg: 'bg-dusty-teal-light/50' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleAction = (n: AppNotification, action: 'confirm' | 'decline' | 'view') => {
    if (action === 'view' && n.data.tripId) {
      router.push(`/trip/${n.data.tripId}`);
    }
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-charcoal/5">
            <ArrowLeft className="w-5 h-5 text-charcoal" />
          </button>
          <h1 className="font-serif text-xl font-bold text-charcoal">Notifications</h1>
          {unreadCount > 0 && <Badge variant="terracotta">{unreadCount} new</Badge>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-terracotta font-medium flex items-center gap-1 hover:underline">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          message="You are all caught up. New activity will appear here."
          icon={<Bell className="w-9 h-9" />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = notificationConfig[n.type];
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all ${
                  n.isRead
                    ? 'bg-white border-charcoal/5'
                    : 'bg-terracotta-light/20 border-terracotta/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-charcoal">{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-charcoal/65 leading-relaxed mt-0.5">{n.body}</p>
                    <p className="text-xs text-charcoal/40 mt-1">{timeAgo(n.created_at)}</p>

                    {n.type === 'offer_received' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAction(n, 'confirm')}
                          className="px-3 py-1.5 rounded-lg bg-terracotta text-white text-xs font-medium hover:bg-terracotta/90 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleAction(n, 'decline')}
                          className="px-3 py-1.5 rounded-lg border border-charcoal/15 text-charcoal text-xs font-medium hover:bg-charcoal/5 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {(n.type === 'request_approved' || n.type === 'trip_edited' || n.type === 'review_prompt') && n.data.tripId && (
                      <button
                        onClick={() => handleAction(n, 'view')}
                        className="flex items-center gap-1 mt-2 text-xs text-terracotta font-medium hover:underline"
                      >
                        {n.type === 'review_prompt' ? 'Review Now' : 'View Trip'} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
