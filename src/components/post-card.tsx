
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayCircle, Star, Heart, MessageCircle, Send, Bookmark, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';

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
            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video src={mediaItem.url} className="w-full h-full object-cover" controls />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="w-16 h-16 text-white/70" />
                </div>
            </div>
        )
    }
    return <Image src={mediaItem.url} alt="Post media" fill className="object-cover" data-ai-hint={mediaItem.hint} />;
}

export function PostCard({ post }: { post: Post }) {

    const formatTimestamp = (timestamp: FirestoreTimestamp) => {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
                 <div className="flex items-center gap-3">
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
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {post.caption && <p className="text-sm whitespace-pre-line px-4 mb-4">{post.caption}</p>}
                
                {post.media && post.media.length > 0 && (
                     <div className="relative aspect-[4/3] bg-secondary">
                        <MediaContent mediaItem={post.media[0]} />
                    </div>
                )}
            </CardContent>
             <CardFooter className="p-4 flex flex-col items-start gap-3">
                <div className="w-full flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Heart className="h-5 w-5" />
                            <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                </div>
                 <div className="w-full h-px bg-border my-1"></div>
                 <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       {/* Placeholder for location if available on post */}
                    </div>
                    <Button asChild>
                           <Link href={`/posts/${post.id}`}>View Post</Link>
                    </Button>
                 </div>
            </CardFooter>
        </Card>
    );
}
