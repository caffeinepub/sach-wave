import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause } from 'lucide-react';

interface MediaPostProps {
  mediaUrl: string;
  isVideo?: boolean;
  alt?: string;
}

export default function MediaPost({ mediaUrl, isVideo = false, alt = 'Post media' }: MediaPostProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for auto-play
  useEffect(() => {
    if (!isVideo || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isVideo]);

  // Auto-play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;

    if (isInView && !isPlaying) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, user interaction required
      });
      setIsPlaying(true);
    } else if (!isInView && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isInView, isVideo, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (isVideo) {
    return (
      <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
        {isLoading && (
          <Skeleton className="absolute inset-0 bg-white/10 animate-shimmer" />
        )}
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full max-h-[500px] object-contain media-fade-in"
          onLoadedData={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted
          loop
          playsInline
        />
        {!isLoading && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity group"
          >
            <div className="h-16 w-16 rounded-full glass-surface-elevated flex items-center justify-center group-hover:scale-110 transition-transform press-feedback shadow-glow-blue">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" fill="white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              )}
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10">
      {isLoading && (
        <Skeleton className="absolute inset-0 bg-white/10 animate-shimmer" />
      )}
      <img
        src={mediaUrl}
        alt={alt}
        className="w-full max-h-[500px] object-cover media-fade-in"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
