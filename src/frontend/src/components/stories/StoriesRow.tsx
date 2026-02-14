import { useState } from 'react';
import { useGetActiveStories, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import CreateStoryDialog from './CreateStoryDialog';
import RoleBadge from '../system/RoleBadge';
import { UserRole } from '../../backend';

export default function StoriesRow() {
  const { data: stories, isLoading } = useGetActiveStories();
  const { data: userProfile } = useGetCallerUserProfile();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="h-24 w-24 rounded-full bg-white/10 animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Group stories by author
  const storyMap = new Map();
  stories?.forEach((story) => {
    const authorId = story.author.toString();
    if (!storyMap.has(authorId)) {
      storyMap.set(authorId, []);
    }
    storyMap.get(authorId).push(story);
  });

  const uniqueAuthors = Array.from(storyMap.keys());

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Create Story Bubble - Premium Gradient */}
        <button
          onClick={() => setShowCreateStory(true)}
          className="flex-shrink-0 group press-feedback"
        >
          <div className="relative">
            <div className="h-24 w-24 rounded-full create-story-gradient flex items-center justify-center shadow-glow-blue transition-all group-hover:shadow-glow-purple group-hover:scale-105">
              <Plus className="h-10 w-10 text-white animate-pulse-glow" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xs text-center mt-2 font-medium">Create</p>
        </button>

        {/* Story Bubbles */}
        {uniqueAuthors.map((authorId) => {
          const authorStories = storyMap.get(authorId);
          const firstStory = authorStories[0];

          return (
            <button
              key={authorId}
              onClick={() => navigate({ to: `/stories/${firstStory.id.toString()}` })}
              className="flex-shrink-0 group"
            >
              <div className="relative story-bubble">
                <Avatar className="h-24 w-24 border-4 border-transparent">
                  <AvatarImage src={firstStory.image?.getDirectURL()} />
                  <AvatarFallback className="bg-accent-gradient text-white text-2xl font-bold">
                    {authorId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {authorStories.length > 1 && (
                  <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-accent-gradient border-2 border-background flex items-center justify-center shadow-glow-blue">
                    <span className="text-xs font-bold text-white">{authorStories.length}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-2 font-medium truncate w-24">
                {authorId === userProfile?.id.toString() ? 'You' : 'User'}
              </p>
            </button>
          );
        })}
      </div>

      <CreateStoryDialog open={showCreateStory} onOpenChange={setShowCreateStory} />
    </>
  );
}
