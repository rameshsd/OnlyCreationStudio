
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Pause, Play, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { UserProfileWithStories, Status } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface StoryViewerProps {
  users: UserProfileWithStories[];
  initialUserIndex: number;
  onClose: () => void;
}

export function StoryViewer({ users, initialUserIndex, onClose }: StoryViewerProps) {
  const { user } = useAuth();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUser = users[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  useEffect(() => {
    if (!currentStory || isPaused) {
      return;
    }

    const DURATION = currentStory.mediaType === 'video' ? (currentStory.duration || 15000) : 5000;
    setProgress(0);

    // Mark as viewed
    if (user && !currentStory.viewers.includes(user.uid)) {
      const storyRef = doc(db, `user_profiles/${currentStory.userId}/statuses/${currentStory.id}`);
      updateDoc(storyRef, {
        viewers: arrayUnion(user.uid)
      }).catch(console.error);
    }
    
    timerRef.current = setTimeout(() => {
      goToNextStory();
    }, DURATION);
    
    let startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        setProgress((elapsedTime / DURATION) * 100);
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentStoryIndex, currentUserIndex, isPaused, user]);

  const goToNextStory = (manual = false) => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else if (manual) { // Only close on manual next at the very end
      onClose();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      const prevUser = users[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevUser.stories.length - 1);
    }
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    if(timerRef.current) clearTimeout(timerRef.current);
    if(progressTimerRef.current) clearInterval(progressTimerRef.current);
  };
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused) return;
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const position = (clientX - left) / width;
    if (position < 0.3) {
      goToPrevStory();
    } else {
      goToNextStory(true);
    }
  };

  if (!currentUser || !currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        className="relative h-full w-full max-w-lg aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden"
        onMouseDown={handlePause}
        onMouseUp={handlePlay}
        onMouseLeave={handlePlay}
        onTouchStart={(e) => { e.stopPropagation(); setIsPaused(true); }}
        onTouchEnd={(e) => { e.stopPropagation(); setIsPaused(false); }}
        onClick={handleClick}
      >
        {/* Story content */}
        {currentStory.mediaType === 'image' && <Image src={currentStory.mediaUrl} alt={currentStory.text || 'Status'} layout="fill" objectFit="cover" />}
        {currentStory.mediaType === 'video' && <video src={currentStory.mediaUrl} autoPlay className="h-full w-full object-cover" />}
        {currentStory.mediaType === 'text' && (
          <div className="h-full w-full flex items-center justify-center p-8" style={{ backgroundColor: currentStory.backgroundColor }}>
            <p className="text-white text-3xl font-bold text-center">{currentStory.text}</p>
          </div>
        )}
         {(currentStory.mediaType === 'image' && currentStory.text) && (
            <div className="absolute bottom-10 left-4 right-4 bg-black/50 p-2 rounded-md text-center">
                <p className="text-white">{currentStory.text}</p>
            </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-1 mb-2">
            {currentUser.stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white" 
                  style={{ width: `${i < currentStoryIndex ? 100 : (i === currentStoryIndex ? progress : 0)}%`}} 
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                <AvatarFallback>{currentUser.username.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white">{currentUser.username}</p>
                <p className="text-xs text-white/80">{formatDistanceToNow(new Date(currentStory.createdAt.seconds * 1000), { addSuffix: true })}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white"><X size={24} /></button>
          </div>
        </div>
        
        {/* Navigation */}
        <button onClick={(e) => {e.stopPropagation(); goToPrevStory()}} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/30 text-white rounded-full flex items-center justify-center">
            <ChevronLeft />
        </button>
        <button onClick={(e) => {e.stopPropagation(); goToNextStory(true)}} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/30 text-white rounded-full flex items-center justify-center">
            <ChevronRight />
        </button>

         {/* Paused Indicator */}
        {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Pause className="h-16 w-16 text-white/70" />
            </div>
        )}

        {/* Viewers for own story */}
        {user?.uid === currentUser.id && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white bg-black/40 px-3 py-1.5 rounded-lg">
                <Users size={16} />
                <span className="text-sm font-medium">{currentStory.viewers.length} views</span>
            </div>
        )}
      </div>
    </div>
  );
}
