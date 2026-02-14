import { useGetNotifications, useMarkNotificationAsRead } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import { GlassCard } from '../../components/system/GlassSurface';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleNotificationClick = async (notificationId: bigint, read: boolean) => {
    if (!read) {
      try {
        await markAsRead.mutateAsync(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="mb-6 animate-slide-down">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-7 w-7 text-neon-cyan" strokeWidth={2} />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        <p className="text-muted-foreground">Stay updated with your activity</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-1/4 bg-white/10" />
            </GlassCard>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id.toString()}
              className="cursor-pointer press-feedback"
              onClick={() => handleNotificationClick(notification.id, notification.read)}
            >
              <GlassCard
                className={`p-4 transition-all hover:border-neon-cyan/50 ${
                  !notification.read ? 'border-neon-blue/30 shadow-neon-blue' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`leading-relaxed ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-neon-cyan shadow-neon-cyan flex-shrink-0 mt-2" />
                  )}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">No notifications yet</p>
        </GlassCard>
      )}
    </div>
  );
}
