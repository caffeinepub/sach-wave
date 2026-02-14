import { useState } from 'react';
import { useCommentOnPost, useGetUserProfile } from '../../hooks/useQueries';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import type { Post } from '../../backend';
import { UserRole } from '../../backend';
import { toast } from 'sonner';
import RoleBadge from '../system/RoleBadge';

interface CommentsDrawerProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsDrawer({ post, open, onOpenChange }: CommentsDrawerProps) {
  const [comment, setComment] = useState('');
  const commentOnPost = useCommentOnPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await commentOnPost.mutateAsync({ postId: post.id, content: comment.trim() });
      setComment('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col glass-surface border-white/10">
        <SheetHeader className="p-4 border-b border-white/10">
          <SheetTitle className="text-lg font-bold">Comments ({post.comments.length})</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment, index) => (
                <CommentItem key={index} comment={comment} />
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={commentOnPost.isPending}
            className="flex-1 rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={commentOnPost.isPending}
            className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback"
          >
            {commentOnPost.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function CommentItem({ comment }: { comment: { author: any; content: string; timestamp: bigint } }) {
  const { data: authorProfile } = useGetUserProfile(comment.author.toString());

  return (
    <div className="flex gap-3 animate-slide-up">
      <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-white/10">
        <AvatarImage src={authorProfile?.profilePicture?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'} />
        <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white text-xs">
          {authorProfile?.name.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{authorProfile?.name || 'Loading...'}</p>
            {authorProfile?.role && (authorProfile.role === UserRole.owner || authorProfile.role === UserRole.admin) && (
              <RoleBadge role={authorProfile.role === UserRole.owner ? 'owner' : 'admin'} className="scale-75" />
            )}
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-3">
          {formatTimestamp(comment.timestamp)}
        </p>
      </div>
    </div>
  );
}
