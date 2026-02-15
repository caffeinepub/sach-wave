/**
 * Version 12 production build error fix:
 * Previously this file was empty, causing TypeScript build error:
 * "File is not a module" or "No exports found"
 * 
 * This component displays trending posts based on likes.
 * Currently implemented as a placeholder for future trending functionality.
 */

import { useGetAllPosts } from '../../hooks/useQueries';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function TrendingPostsSection() {
  const { data: posts, isLoading } = useGetAllPosts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
          Trending Posts
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Sort by likes and take top 5
  const trendingPosts = [...(posts || [])]
    .sort((a, b) => Number(b.likes) - Number(a.likes))
    .slice(0, 5);

  if (trendingPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
        Trending Posts
      </h2>
      <div className="space-y-4">
        {trendingPosts.map((post) => (
          <PostCard key={post.id.toString()} post={post} />
        ))}
      </div>
    </div>
  );
}
