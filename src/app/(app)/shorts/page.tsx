
"use client";

import { useState, useRef, useEffect } from 'react';
import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/useMemoFirebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Short } from '@/lib/types';
import { Card } from '@/components/ui/card';

export default function ShortsPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const shortsQuery = useMemoFirebase(query(collection(db, "shorts"), orderBy("createdAt", "desc")), []);
  const { data: shorts, isLoading } = useCollection<Short>(shortsQuery);

  const scrollToVideo = (index: number) => {
    containerRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleNextVideo = () => {
    if (!shorts) return;
    if (currentVideoIndex < shorts.length - 1) {
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
    if (!shorts || shorts.length === 0) return;
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
        observer.observe(video);
      });
    }

    return () => {
      if (videos) {
        Array.from(videos).forEach((video) => {
          observer.unobserve(video);
        });
      }
    };
  }, [shorts]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center bg-black">
      <div className="relative h-full w-full max-w-full lg:max-w-sm aspect-[9/16] bg-black">
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth rounded-lg"
        >
          {shorts && shorts.length > 0 ? shorts.map((video, index) => (
            <div
              key={video.id}
              data-index={index}
              className="h-full w-full snap-start flex-shrink-0"
            >
              <VideoCard video={video} isActive={index === currentVideoIndex} />
            </div>
          )) : (
            <div className="h-full w-full snap-start flex items-center justify-center">
               <Card className="text-center p-12 bg-black/50 text-white">
                  <p>No shorts yet. Be the first to upload one!</p>
               </Card>
            </div>
          )}
        </div>
        {shorts && shorts.length > 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
              <Button size="icon" variant="ghost" onClick={handlePrevVideo} disabled={currentVideoIndex === 0} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
              <ChevronUp />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleNextVideo} disabled={currentVideoIndex === shorts.length - 1} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
              <ChevronDown />
              </Button>
          </div>
        )}
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Shorts</h1>
        </div>
      </div>
    </div>
  );
}
