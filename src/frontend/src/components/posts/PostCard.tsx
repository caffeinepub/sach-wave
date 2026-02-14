import { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useLikePost, useDeletePost, useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MediaPost from './MediaPost';
import CommentsDrawer from './CommentsDrawer';
import RoleBadge from '../system/RoleBadge';
import { UserRole, type Post } from '../../backend';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface PostCardProps {
  post: Post;
  authorProfile?: { name: string; profilePicture?: any; role: UserRole };
}

export default function PostCard({ post, authorProfile }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const isOwnPost = identity?.getPrincipal().toString() === post.author.toString();
  const canDelete = isOwnPost || isAdmin;

  const handleLike = async () => {
    if (!identity) return;
    
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    
    try {
      await likePost.mutateAsync(post.id);
    } catch (error) {
      setIsLiked(wasLiked);
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleShare = () => {
    toast.info('Sharing is coming soon!');
  };

  const handleProfileClick = () => {
    navigate({ to: `/profile/${post.author.toString()}` });
  };

  return (
    <>
      <div className="glass-surface-elevated rounded-3xl p-6 post-card-premium gradient-border">
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-3 press-feedback hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-12 w-12 avatar-ring-glow">
              <AvatarImage src={authorProfile?.profilePicture?.getDirectURL()} />
              <AvatarFallback className="bg-accent-gradient text-white font-semibold">
                {authorProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{authorProfile?.name || 'Unknown User'}</p>
                {authorProfile?.role && (authorProfile.role === UserRole.owner || authorProfile.role === UserRole.admin) && (
                  <RoleBadge role={authorProfile.role === UserRole.owner ? 'owner' : 'admin'} />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}
              </p>
            </div>
          </button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 press-feedback rounded-xl"
            >
              <Trash2 className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
        )}

        {/* Media */}
        {post.media && (
          <div className="mb-4">
            <MediaPost
              mediaUrl={post.media.getDirectURL()}
              isVideo={post.media.getDirectURL().includes('video')}
              alt="Post media"
            />
          </div>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={likePost.isPending}
              className={`flex items-center gap-2 press-feedback ${
                isLiked ? 'text-red-500 action-icon-active' : 'text-muted-foreground action-icon'
              }`}
            >
              <Heart 
                className="h-5 w-5" 
                strokeWidth={1.5}
                fill={isLiked ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-medium">{Number(post.likes)}</span>
            </button>

            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 text-muted-foreground action-icon press-feedback"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground action-icon press-feedback"
            >
              <Share2 className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <CommentsDrawer
        open={showComments}
        onOpenChange={setShowComments}
        post={post}
      />
    </>
  );
}
