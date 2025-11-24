
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Play } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { type UserProfileWithStories, type Story } from '@/lib/get-feed-data';


interface StoryViewerProps {
  stories: UserProfileWithStories[];
  startIndex: number;
  onClose: () => void;
  onStoryViewed: (userId: string) => void;
}

export function StoryViewer({ stories, startIndex, onClose, onStoryViewed }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(startIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const storyStartTimeRef = useRef<number>(0);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories?.[currentStoryIndex];
  
  const storyDuration = 5000; // 5 seconds for images

  const goToNextUser = useCallback(() => {
    if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentUserIndex, stories.length, onClose]);

  const goToNextStory = useCallback(() => {
    if (currentUser?.stories && currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      goToNextUser();
    }
  }, [currentStoryIndex, currentUser, goToNextUser]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      if (currentUserIndex > 0) {
        const prevUserIndex = currentUserIndex - 1;
        const prevUser = stories[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex((prevUser.stories?.length || 1) - 1);
      }
    }
  }, [currentStoryIndex, currentUserIndex, stories]);

  // Handle side effect for marking story as viewed
  useEffect(() => {
    if (currentUser?.id) {
        onStoryViewed(currentUser.id);
    }
  }, [currentUser?.id, onStoryViewed]);

  // Main timer effect for progressing through stories
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    storyStartTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    if (!currentStory) return;

    if (currentStory.mediaType === 'image') {
      timerRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsedTime = Date.now() - storyStartTimeRef.current;
          const newProgress = (elapsedTime / storyDuration) * 100;
          setProgress(newProgress);
          if (newProgress >= 100) {
            goToNextStory();
          }
        }
      }, 50);
    }
    
    // For video, progress is handled by `onTimeUpdate`
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStory, isPaused, goToNextStory]);
  
  const handleVideoTimeUpdate = () => {
      if (videoRef.current) {
        const videoProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(videoProgress);
      }
  };

  const handleVideoEnded = () => {
      goToNextStory();
  };

  const handleVideoCanPlay = () => {
      setIsLoading(false);
      videoRef.current?.play().catch(e => console.error("Video play failed:", e));
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleInteractionStart = () => {
      setIsPaused(true);
      if(videoRef.current) videoRef.current.pause();
  };
  const handleInteractionEnd = () => {
      setIsPaused(false);
      if(videoRef.current) videoRef.current.play().catch(e => console.error("Video play failed:", e));
  };


  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative w-full max-w-sm h-[95vh] bg-neutral-900 rounded-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-1 w-full mb-2">
            {currentUser?.stories?.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${index < currentStoryIndex ? 100 : index === currentStoryIndex ? progress : 0}%`}}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser?.avatarUrl} />
                <AvatarFallback>{currentUser?.username?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white text-sm">{currentUser?.username}</p>
                 {currentStory?.createdAt && <p className="text-xs text-neutral-300">{formatDistanceToNow(new Date(currentStory.createdAt.seconds * 1000), { addSuffix: true })}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
            className="flex-1 relative"
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
            onMouseUp={handleInteractionEnd}
            onTouchEnd={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          )}
          {!currentStory && !isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-neutral-800">
                <AlertTriangle className="h-10 w-10 mb-2" />
                <p>No story to display.</p>
              </div>
          )}
          {currentStory?.mediaType === 'image' && (
            <Image
              key={currentStory.id}
              src={currentStory.mediaUrl}
              alt="Story content"
              fill
              className="object-contain"
              onLoad={handleImageLoad}
              onError={() => setIsLoading(false)}
              priority
            />
          )}
          {currentStory?.mediaType === 'video' && (
            <video
              key={currentStory.id}
              ref={videoRef}
              src={currentStory.mediaUrl}
              className={cn("w-full h-full object-contain", isLoading && "opacity-0")}
              onCanPlay={handleVideoCanPlay}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              playsInline
              autoPlay
              muted
            />
          )}
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={goToPrevStory} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={goToNextStory} />
        
        {/* Navigation Buttons */}
        <button onClick={goToPrevStory} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hover:bg-black/60 z-30 opacity-80 hover:opacity-100 transition-opacity">
          <ChevronLeft size={28} />
        </button>
        <button onClick={goToNextStory} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hover:bg-black/60 z-30 opacity-80 hover:opacity-100 transition-opacity">
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
