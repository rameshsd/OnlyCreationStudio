
"use client";

import { useState, useRef, useEffect } from 'react';
import { VideoCard } from '@/components/video-card';
import { shortsData } from '@/lib/shorts-data';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ShortsPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = (index: number) => {
    containerRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < shortsData.length - 1) {
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
  }, []);

  return (
    <div className="relative h-full w-full max-w-full lg:max-w-sm lg:mx-auto">
       <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Shorts</h1>
      </div>
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth rounded-lg"
      >
        {shortsData.map((video, index) => (
          <div
            key={video.id}
            data-index={index}
            className="h-full w-full snap-start flex-shrink-0"
          >
            <VideoCard video={video} isActive={index === currentVideoIndex} />
          </div>
        ))}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <Button size="icon" variant="ghost" onClick={handlePrevVideo} disabled={currentVideoIndex === 0} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
          <ChevronUp />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleNextVideo} disabled={currentVideoIndex === shortsData.length - 1} className="bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full">
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
}
