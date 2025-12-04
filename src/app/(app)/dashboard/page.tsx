
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Plus, Search, Bell, Rss, TrendingUp, Users, Video } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import { PostCard, type Post } from "@/components/post-card";
import { ShortsReelCard } from "@/components/shorts-reel-card";
import { db } from "@/lib/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMockSuggestions, generateMockTrendingTopics } from "@/lib/mock-data";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/useMemoFirebase";
import { StudioPostCard } from "@/components/studio-post-card";
import type { FeedItem, StudioProfile } from "@/lib/get-feed-data";
import { StoryReel } from "@/components/story-reel";


const feedFilters = [
    { label: "All", icon: Rss },
    { label: "Following", icon: Users },
    { label: "Trending", icon: TrendingUp },
    { label: "Short Videos", icon: Video },
]

const trendingTopics = generateMockTrendingTopics(20);
const suggestedUsers = generateMockSuggestions(5);


const SuggestionsCard = () => (
    <Card>
        <CardHeader>
            <h3 className="font-bold">Suggested for you</h3>
        </CardHeader>
        <CardContent className="space-y-4">
            {suggestedUsers.map(user => (
                <div key={user.username} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.avatar} data-ai-hint={user.hint} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.username}</p>
                        </div>
                    </div>
                    <Button size="sm">Follow</Button>
                </div>
            ))}
        </CardContent>
    </Card>
);

const PostSkeleton = () => (
  <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm">
    <CardHeader className="p-4 flex flex-row justify-between items-center">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-8" />
    </CardHeader>
    <CardContent className="px-4 pb-2 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="relative aspect-video w-full rounded-lg" />
    </CardContent>
    <CardFooter className="p-4 pt-2">
      <div className="w-full grid grid-cols-4 gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </CardFooter>
  </Card>
)


export default function DashboardPage() {
    const [activeFilter, setActiveFilter] = useState("All");

    const postsQuery = useMemoFirebase(query(collection(db, "posts"), orderBy("createdAt", "desc")), []);
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    const studiosQuery = useMemoFirebase(query(collection(db, "studio_profiles")), []);
    const { data: studios, isLoading: studiosLoading } = useCollection<StudioProfile>(studiosQuery);
    
    const feedItems = useMemo<FeedItem[]>(() => {
        const combined: FeedItem[] = [];
        if (posts) {
            combined.push(...posts.map(p => ({ ...p, type: 'post' as const })));
        }
        if (studios) {
            combined.push(...studios.map(s => ({ ...s, type: 'studio' as const })));
        }
        
        return combined.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.seconds * 1000 : 0;
            const dateB = b.createdAt ? b.createdAt.seconds * 1000 : 0;
            return dateB - dateA;
        });
    }, [posts, studios]);

    const loading = postsLoading || studiosLoading;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
            <div className="flex flex-col gap-8 text-foreground">
                <header className="flex justify-between items-center md:hidden">
                    <h1 className="text-2xl font-bold">OnlyCreation</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
                    </div>
                </header>

                <StoryReel />
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {feedFilters.map(filter => (
                        <Button
                            key={filter.label}
                            variant={activeFilter === filter.label ? "default" : "secondary"}
                            onClick={() => setActiveFilter(filter.label)}
                            className="rounded-full flex-shrink-0"
                        >
                            <filter.icon className="mr-2 h-4 w-4" />
                            {filter.label}
                        </Button>
                    ))}
                </div>

                <main className="space-y-6">
                    {loading ? (
                        <>
                          <PostSkeleton />
                          <PostSkeleton />
                          <PostSkeleton />
                        </>
                    ) : feedItems && feedItems.length > 0 ? (
                        feedItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {item.type === 'post' ? <PostCard post={item as Post} /> : <StudioPostCard studio={item as StudioProfile} />}
                                 { (index + 1) % 5 === 0 && (
                                    <ShortsReelCard />
                                )}
                                 { (index + 1) % 8 === 0 && (
                                    <div className="hidden lg:block">
                                        <SuggestionsCard/>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                      <Card className="text-center p-12">
                        <CardContent>
                          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                        </CardContent>
                      </Card>
                    )}
                </main>
            </div>
        </div>

        <aside className="hidden lg:block lg:col-span-4 space-y-6">
             <Card>
                <CardHeader>
                    <h3 className="font-bold">Trending Topics</h3>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {trendingTopics.map(topic => (
                           <li key={topic}>
                             <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">{topic}</Button>
                           </li>
                        ))}
                    </ul>
                </CardContent>
             </Card>
             <SuggestionsCard/>
        </aside>
    </div>
     <Button asChild className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-20 lg:hidden">
        <Link href="/create">
            <Plus className="h-6 w-6"/>
            <span className="sr-only">Create Post</span>
        </Link>
     </Button>
    </>
  );
}
