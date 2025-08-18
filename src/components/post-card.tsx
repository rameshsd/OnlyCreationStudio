"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, PlayCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface Media {
    type: 'image' | 'video';
    url: string;
    hint?: string;
}

interface Author {
    name: string;
    avatar: string;
    username: string;
    isVerified: boolean;
}

interface Post {
    id: number;
    author: Author;
    time: string;
    caption: string;
    media: Media[];
    likes: number;
    comments: number;
    shares: number;
}

const ExpandableText = ({ text, maxLength = 100 }: { text: string, maxLength?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = text.length > maxLength;

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const displayedText = isLongText && !isExpanded ? `${text.slice(0, maxLength)}...` : text;

    return (
        <p className="text-sm whitespace-pre-line">
            {displayedText}
            {isLongText && (
                <Button variant="link" onClick={toggleExpand} className="p-0 h-auto ml-1 text-muted-foreground hover:text-primary">
                    {isExpanded ? 'Read less' : 'Read more'}
                </Button>
            )}
        </p>
    );
};

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
    return <Image src={mediaItem.url} alt="Post media" width={600} height={800} className="rounded-lg object-cover" data-ai-hint={mediaItem.hint} />;
}

export function PostCard({ post }: { post: Post }) {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const hasMultipleMedia = post.media.length > 1;

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="font-bold">{post.author.name}</p>
                            {post.author.isVerified && <Star className="h-4 w-4 text-blue-500 fill-current" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{post.author.username} &middot; {post.time}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="px-4 pb-2 space-y-3">
                <ExpandableText text={post.caption} />
                {post.media.length > 0 && (
                    <div className="relative -mx-4">
                        {hasMultipleMedia ? (
                             <Carousel className="w-full" opts={{ loop: true }}>
                                <CarouselContent>
                                {post.media.map((item, index) => (
                                    <CarouselItem key={index} className="pl-4">
                                        <div className="relative aspect-square md:aspect-video bg-secondary rounded-lg overflow-hidden">
                                           <MediaContent mediaItem={item} />
                                        </div>
                                    </CarouselItem>
                                ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-6" />
                                <CarouselNext className="right-6"/>
                            </Carousel>
                        ) : (
                             <div className="relative aspect-square md:aspect-[4/3] bg-secondary rounded-lg overflow-hidden mx-4">
                                <MediaContent mediaItem={post.media[0]} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-2 flex flex-col items-start gap-2">
                 <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{post.likes + (isLiked ? 1 : 0)} Likes</span>
                    &middot;
                    <span>{post.comments} Comments</span>
                    &middot;
                    <span>{post.shares} Shares</span>
                </div>
                <div className="w-full h-px bg-border my-1"></div>
                <div className="w-full grid grid-cols-4">
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => setIsLiked(!isLiked)}>
                        <Heart className={cn("mr-2", isLiked ? "text-red-500 fill-current" : "")} /> Like
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground">
                        <MessageCircle className="mr-2" /> Comment
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground">
                        <Share2 className="mr-2" /> Share
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => setIsSaved(!isSaved)}>
                        <Bookmark className={cn("mr-2", isSaved ? "text-yellow-500 fill-current" : "")} /> Save
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
