
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { type Short } from '@/lib/shorts-data';

export default function ShortsPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const shortsQuery = useMemo(() => query(collection(db, "shorts"), orderBy("createdAt", "desc")), []);
  const { data: shortsData, isLoading } = useCollection<Short>(shortsQuery);

  const scrollToVideo = (index: number) => {
    containerRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleNextVideo = () => {
    if (shortsData && currentVideoIndex < shortsData.length - 1) {
      const newIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(newIndex);
      scrollToVideo(newIndex);
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      const newIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(newIndex);
      scrollToVideo(newIndex);
    }
  };

  useEffect(() => {
    if (!shortsData || shortsData.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setCurrentVideoIndex(index);
          }
        });
      },
      { threshold: 0.7 }
    );

    const videos = containerRef.current?.children;
    if (videos) {
      Array.from(videos).forEach((video) => {
        if(video.getAttribute('data-index')) { // only observe video elements
          observer.observe(video);
        }
      });
    }

    return () => {
      if (videos) {
        Array.from(videos).forEach((video) => {
          if(video.getAttribute('data-index')) {
            observer.unobserve(video);
          }
        });
      }
    };
  }, [shortsData]);

  if (isLoading) {
    return (
      <div className="relative h-full w-full max-w-full lg:max-w-sm lg:mx-auto flex items-center justify-center bg-black rounded-lg">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full max-w-full lg:max-w-sm lg:mx-auto">
       <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Shorts</h1>
      </div>
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth rounded-lg bg-black"
      >
        {shortsData && shortsData.length > 0 ? shortsData.map((video, index) => (
          <div
            key={video.id}
            data-index={index}
            className="h-full w-full snap-start flex-shrink-0"
          >
            <VideoCard video={video} isActive={index === currentVideoIndex} />
          </div>
        )) : (
          <div className="h-full w-full snap-start flex-shrink-0 flex items-center justify-center text-white">
            <p>No shorts yet. Be the first to post one!</p>
          </div>
        )}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <Button size="icon" variant="ghost" onClick={handlePrevVideo} disabled={currentVideoIndex === 0} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
          <ChevronUp />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleNextVideo} disabled={!shortsData || currentVideoIndex === shortsData.length - 1} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
}

    