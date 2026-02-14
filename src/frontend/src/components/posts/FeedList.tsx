import { useGetAllPosts } from '../../hooks/useQueries';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '../system/GlassSurface';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedList() {
  const { data: posts, isLoading, error, refetch, isRefetching } = useGetAllPosts();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-5 animate-shimmer">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2 bg-white/10" />
                <Skeleton className="h-3 w-20 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mb-4 bg-white/10" />
            <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-destructive mb-4">Failed to load posts. Please try again.</p>
        <Button onClick={handleRefresh} variant="outline" className="rounded-xl">
          Retry
        </Button>
      </GlassCard>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          disabled={isRefetching}
          variant="ghost"
          size="sm"
          className="rounded-xl hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {posts.map((post) => (
        <PostCard key={post.id.toString()} post={post} />
      ))}
    </div>
  );
}
