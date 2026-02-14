import { useGetActiveStories, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '../../components/system/GlassSurface';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CreateStoryDialog from '../../components/stories/CreateStoryDialog';

export default function StoriesPage() {
  const navigate = useNavigate();
  const { data: stories, isLoading } = useGetActiveStories();
  const { data: currentUser } = useGetCallerUserProfile();
  const [showCreateStory, setShowCreateStory] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
          Stories
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
          Stories
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Create story card */}
          <button
            onClick={() => setShowCreateStory(true)}
            className="aspect-[9/16] rounded-2xl glass-surface border-2 border-dashed border-white/20 hover:border-neon-cyan/50 flex flex-col items-center justify-center gap-3 transition-all press-feedback group"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-neon-blue to-neon-violet flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium">Create Story</span>
          </button>

          {/* Story cards */}
          {stories?.map((story) => (
            <button
              key={story.id.toString()}
              onClick={() => navigate({ to: `/stories/${story.id.toString()}` })}
              className="aspect-[9/16] rounded-2xl overflow-hidden relative group press-feedback"
            >
              {story.image ? (
                <img
                  src={story.image.getDirectURL()}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-violet flex items-center justify-center p-4">
                  <p className="text-white text-center font-medium">{story.content}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">{story.content}</p>
              </div>
            </button>
          ))}
        </div>

        {!stories || stories.length === 0 ? (
          <GlassCard className="p-8 text-center mt-4">
            <p className="text-muted-foreground">No active stories. Be the first to share!</p>
          </GlassCard>
        ) : null}
      </div>

      <CreateStoryDialog open={showCreateStory} onOpenChange={setShowCreateStory} />
    </>
  );
}
