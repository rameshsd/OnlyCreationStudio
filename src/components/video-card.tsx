"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { type Short } from '@/lib/shorts-data';

export function VideoCard({ video, isActive }: { video: Short, isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current?.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-full object-cover"
        onClick={togglePlay}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="absolute bottom-0 left-0 p-4 text-white w-full">
        <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={video.user.avatar} alt={video.user.name} data-ai-hint="creator avatar" />
                <AvatarFallback>{video.user.name.slice(0,2)}</AvatarFallback>
            </Avatar>
            <p className="font-bold">{video.user.name}</p>
        </div>
        <p className="mt-2 text-sm">{video.caption}</p>
      </div>

      <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white">
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full flex-col gap-1 text-white hover:text-white hover:bg-white/20">
          <Heart className="h-7 w-7" />
          <span className="text-xs font-bold">{video.likes}</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full flex-col gap-1 text-white hover:text-white hover:bg-white/20">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs font-bold">{video.comments}</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full flex-col gap-1 text-white hover:text-white hover:bg-white/20">
          <Share2 className="h-7 w-7" />
          <span className="text-xs font-bold">{video.shares}</span>
        </Button>
      </div>
      
      {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <Play className="h-20 w-20 text-white/70" />
          </div>
      )}

      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
