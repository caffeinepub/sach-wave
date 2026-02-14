import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetConversation, useGetUserProfile, useSendMessage, useMarkMessageAsRead } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { GlassCard } from '../../components/system/GlassSurface';

export default function ConversationPage() {
  const { userId } = useParams({ from: '/authenticated/messages/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading } = useGetConversation(userId);
  const { data: otherUserProfile } = useGetUserProfile(userId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessageAsRead();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = identity?.getPrincipal().toString();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages) {
      messages.forEach((message) => {
        if (message.receiver.toString() === currentUserId && !message.read) {
          markAsRead.mutate(message.id);
        }
      });
    }
  }, [messages, currentUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMessage.mutateAsync({ receiver: userId, content: messageText.trim() });
      setMessageText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-8">
        <GlassCard className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <GlassCard className="p-4 mb-4 animate-slide-down">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/messages' })}
            className="rounded-full hover:bg-white/5 press-feedback"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Button>
          <Avatar className="h-10 w-10 ring-2 ring-white/10">
            <AvatarImage src={otherUserProfile?.profilePicture?.getDirectURL()} />
            <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white">
              {otherUserProfile?.name.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{otherUserProfile?.name || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground">{otherUserProfile?.classInfo.className}</p>
          </div>
        </div>
      </GlassCard>

      {/* Messages */}
      <GlassCard className="p-4 mb-4 h-[500px] flex flex-col">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender.toString() === currentUserId;
                return (
                  <div
                    key={message.id.toString()}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-gradient-to-r from-neon-blue to-neon-violet text-white shadow-neon-blue'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          )}
        </ScrollArea>
      </GlassCard>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
          className="flex-1 rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50 glass-surface"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending}
          className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback h-10 w-10"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" strokeWidth={2} />
          )}
        </Button>
      </form>
    </div>
  );
}
