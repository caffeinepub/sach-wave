import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetActiveStories, useGetUserProfile } from '../../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTimestamp } from '../../utils/time';
import RoleBadge from '../../components/system/RoleBadge';
import { UserRole } from '../../backend';

export default function StoryViewerPage() {
  const navigate = useNavigate();
  const { storyId } = useParams({ from: '/authenticated/stories/$storyId' });
  const { data: stories } = useGetActiveStories();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories?.find(s => s.id.toString() === storyId);
  const { data: authorProfile } = useGetUserProfile(currentStory?.author.toString() || '');

  useEffect(() => {
    if (stories && storyId) {
      const index = stories.findIndex(s => s.id.toString() === storyId);
      if (index !== -1) {
        setCurrentIndex(index);
        setProgress(0);
      }
    }
  }, [stories, storyId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, stories]);

  const handleNext = () => {
    if (!stories) return;
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      navigate({ to: `/stories/${nextStory.id}` });
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (!stories) return;
    if (currentIndex > 0) {
      const prevStory = stories[currentIndex - 1];
      navigate({ to: `/stories/${prevStory.id}` });
    }
  };

  const handleClose = () => {
    navigate({ to: '/' });
  };

  if (!currentStory || !stories) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 story-enter">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                boxShadow: '0 0 8px oklch(0.80 0.22 195 / 0.6)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10 mt-4">
        <div className="flex items-center gap-3 glass-surface px-4 py-2 rounded-full">
          <Avatar className="h-10 w-10 ring-2 ring-neon-cyan/50">
            <AvatarImage src={authorProfile?.profilePicture?.getDirectURL()} />
            <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white">
              {authorProfile?.name.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{authorProfile?.name || 'Loading...'}</p>
              {authorProfile?.role && (authorProfile.role === UserRole.owner || authorProfile.role === UserRole.admin) && (
                <RoleBadge role={authorProfile.role === UserRole.owner ? 'owner' : 'admin'} className="scale-75" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatTimestamp(currentStory.timestamp)}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="glass-surface rounded-full h-10 w-10 hover:bg-white/10 press-feedback"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </Button>
      </div>

      {/* Story content */}
      <div className="h-full flex items-center justify-center p-4">
        {currentStory.image ? (
          <img
            src={currentStory.image.getDirectURL()}
            alt="Story"
            className="max-h-full max-w-full object-contain rounded-2xl shadow-glass story-transition"
          />
        ) : (
          <div className="glass-card p-8 max-w-md text-center story-transition">
            <p className="text-lg leading-relaxed">{currentStory.content}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="glass-surface rounded-full h-12 w-12 hover:bg-white/10 pointer-events-auto press-feedback"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </Button>
        )}
        <div className="flex-1" />
        {currentIndex < stories.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="glass-surface rounded-full h-12 w-12 hover:bg-white/10 pointer-events-auto press-feedback"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}
