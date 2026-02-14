import { useGetConversations, useGetUserProfile } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import { GlassCard } from '../../components/system/GlassSurface';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useGetConversations();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2 bg-white/10" />
                  <Skeleton className="h-3 w-48 bg-white/10" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="mb-6 animate-slide-down">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-7 w-7 text-neon-cyan" strokeWidth={2} />
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
        <p className="text-muted-foreground">Your conversations</p>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map(([userId, lastMessage]) => (
            <ConversationItem
              key={userId.toString()}
              userId={userId.toString()}
              lastMessage={lastMessage}
              onClick={() => navigate({ to: `/messages/${userId.toString()}` })}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">No messages yet</p>
        </GlassCard>
      )}
    </div>
  );
}

function ConversationItem({ userId, lastMessage, onClick }: any) {
  const { data: userProfile } = useGetUserProfile(userId);

  return (
    <div
      className="cursor-pointer press-feedback"
      onClick={onClick}
    >
      <GlassCard className="p-4 transition-all hover:border-neon-cyan/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-white/10">
            <AvatarImage src={userProfile?.profilePicture?.getDirectURL()} />
            <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white">
              {userProfile?.name.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{userProfile?.name || 'Loading...'}</p>
            <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>
          </div>
          <p className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimestamp(lastMessage.timestamp)}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
