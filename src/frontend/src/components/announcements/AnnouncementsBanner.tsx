import { useGetAnnouncements } from '../../hooks/useQueries';
import { Megaphone } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import { GlassCard } from '../system/GlassSurface';

export default function AnnouncementsBanner() {
  const { data: announcements, isLoading } = useGetAnnouncements();

  if (isLoading || !announcements || announcements.length === 0) {
    return null;
  }

  const latestAnnouncement = announcements[0];

  return (
    <GlassCard className="mb-6 p-4 border-neon-violet/30 shadow-neon-violet animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-neon-violet to-neon-blue flex items-center justify-center shadow-neon-violet">
          <Megaphone className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-neon-cyan">Announcement</h3>
            <span className="text-xs text-muted-foreground">{formatTimestamp(latestAnnouncement.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{latestAnnouncement.content}</p>
        </div>
      </div>
    </GlassCard>
  );
}
