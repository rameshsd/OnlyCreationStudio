
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayCircle, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Media {
    type: 'image' | 'video';
    url: string;
    hint?: string;
}

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    userIsVerified: boolean;
    caption: string;
    media: Media[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: FirestoreTimestamp;
}

const MediaContent = ({ mediaItem }: { mediaItem: Media }) => {
    if (mediaItem.type === 'video') {
        return (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video src={mediaItem.url} className="w-full h-full object-contain" controls />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="w-16 h-16 text-white/70" />
                </div>
            </div>
        )
    }
    return <Image src={mediaItem.url} alt="Post media" width={600} height={400} className="rounded-lg object-cover w-full h-auto" data-ai-hint={mediaItem.hint} />;
}

export function PostCard({ post }: { post: Post }) {

    const formatTimestamp = (timestamp: FirestoreTimestamp) => {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-11 w-11">
                    <AvatarImage src={post.userAvatar} alt={post.username} data-ai-hint="user avatar" />
                    <AvatarFallback>{post.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="font-bold">{post.username}</p>
                        {post.userIsVerified && <Star className="h-4 w-4 text-blue-500 fill-current" />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{post.username} &middot; {formatTimestamp(post.createdAt)}</p>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
                {post.caption && <p className="text-sm whitespace-pre-line">{post.caption}</p>}
                
                {post.media && post.media.length > 0 && (
                    <div className="relative">
                        <MediaContent mediaItem={post.media[0]} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
