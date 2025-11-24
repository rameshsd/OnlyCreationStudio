"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Plus, Search, Bell, Rss, TrendingUp, Users, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PostCard, type Post } from "@/components/post-card";
import { ShortsReelCard } from "@/components/shorts-reel-card";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, Timestamp, collectionGroup } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMockSuggestions, generateMockTrendingTopics } from "@/lib/mock-data";
import { useCollection, useMemoFirebase } from "@/firebase";
import type { StudioProfile } from "../studios/[id]/page";
import { StudioPostCard } from "@/components/studio-post-card";
import { useAuth } from "@/hooks/use-auth";
import { AddStoryDialog } from "@/components/add-story-dialog";
import { StoryViewer } from "@/components/story-viewer";
import { cn } from "@/lib/utils";

const feedFilters = [
    { label: "All", icon: Rss },
    { label: "Following", icon: Users },
    { label: "Trending", icon: TrendingUp },
    { label: "Short Videos", icon: Video },
]

const trendingTopics = generateMockTrendingTopics(20);
const suggestedUsers = generateMockSuggestions(5);

interface UserProfile {
    id: string;
    username: string;
    avatarUrl: string;
    stories?: Story[];
    isSelf?: boolean;
}

interface Story {
    id: string;
    userId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: Timestamp;
    expiresAt: Timestamp;
}

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
      <CardHeader className="p-4 flex flex-row items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
          </div>
      </CardHeader>
      <CardContent className="p-0">
          <div className="text-sm whitespace-pre-line px-4 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </div>
          <Skeleton className="relative aspect-[4/3] w-full" />
      </CardContent>
       <CardFooter className="p-4 flex flex-col items-start gap-3">
          <div className="w-full flex justify-between items-center text-muted-foreground">
              <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-5" />
              </div>
              <Skeleton className="h-8 w-8" />
          </div>
           <div className="w-full h-px bg-border my-1"></div>
           <div className="w-full flex justify-between items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-8 w-1/4" />
           </div>
      </CardFooter>
    </Card>
  )

type FeedItem = (Post & { type: 'post' }) | (StudioProfile & { type: 'studio' });

export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const [activeFilter, setActiveFilter] = useState("All");
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    
    const postsQuery = useMemoFirebase(() => query(collection(db, "posts"), orderBy("createdAt", "desc")), []);
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    const studiosQuery = useMemoFirebase(() => query(collection(db, "studio_profiles"), orderBy("createdAt", "desc")), []);
    const { data: studios, isLoading: studiosLoading } = useCollection<StudioProfile>(studiosQuery);
    
    const usersQuery = useMemoFirebase(() => query(collection(db, "user_profiles")), []);
    const { data: userProfiles, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

    const allStoriesCollectionQuery = useMemoFirebase(() => query(collectionGroup(db, 'stories'), orderBy('createdAt', 'asc')), []);
    const { data: allStories, isLoading: allStoriesLoading } = useCollection<Story>(allStoriesCollectionQuery);

    const stories = useMemo(() => {
        if (!userProfiles || !allStories || !userData) return [];
        
        const storiesByUserId = allStories.reduce((acc, story) => {
            if (!acc[story.userId]) {
                acc[story.userId] = [];
            }
            acc[story.userId].push(story);
            return acc;
        }, {} as Record<string, Story[]>);

        const usersWithStories = userProfiles.map(profile => ({
            ...profile,
            stories: storiesByUserId?.[profile.id] || []
        })).filter(p => p.stories.length > 0);

        const currentUserStoryData: UserProfile = {
             id: userData.userId, 
             username: "My Story", 
             avatarUrl: userData.avatarUrl, 
             isSelf: true, 
             stories: storiesByUserId?.[userData.userId] || []
        };
        
        return [
            currentUserStoryData,
            ...usersWithStories.filter(u => u.id !== userData.userId)
        ];
    }, [userProfiles, allStories, userData]);


    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyViewerStartIndex, setStoryViewerStartIndex] = useState(0);
    const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!postsLoading && !studiosLoading) {
            const combinedFeed: FeedItem[] = [];
            if (posts) {
                combinedFeed.push(...posts.map(p => ({ ...p, type: 'post' as const })));
            }
            if (studios) {
                combinedFeed.push(...studios.map(s => ({ ...s, type: 'studio' as const })));
            }

            combinedFeed.sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : 0;
                const dateB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : 0;
                return dateB - dateA;
            });

            setFeedItems(combinedFeed);
            setPageLoading(false);
        }
    }, [posts, studios, postsLoading, studiosLoading]);

    const handleStoryClick = (index: number) => {
        const clickedStory = stories[index];
        if (clickedStory.isSelf && (!clickedStory.stories || clickedStory.stories.length === 0)) {
            setIsAddStoryOpen(true);
        } else {
            setStoryViewerStartIndex(index);
            setStoryViewerOpen(true);
        }
    };
    
    const handleStoryViewed = useCallback((userId: string) => {
        setSeenStories(prev => new Set(prev).add(userId));
    }, []);
    
  if (authLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <>
    <AddStoryDialog open={isAddStoryOpen} onOpenChange={setIsAddStoryOpen} />
    {storyViewerOpen && (
        <StoryViewer
            stories={stories}
            startIndex={storyViewerStartIndex}
            onClose={() => setStoryViewerOpen(false)}
            onStoryViewed={handleStoryViewed}
        />
    )}
    <div className="space-y-8">
        <header className="flex justify-between items-center md:hidden">
            <h1 className="text-2xl font-bold">OnlyCreation</h1>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                <div className="flex flex-col gap-8 text-foreground">
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                        {usersLoading || allStoriesLoading ? (
                             [...Array(10)].map((_, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            ))
                        ) : (
                            stories.map((story, index) => {
                                const hasUnseenStories = story.stories && story.stories.length > 0 && !seenStories.has(story.id);
                                const isMyEmptyStory = story.isSelf && (!story.stories || story.stories.length === 0);

                                return (
                                    <button
                                        key={story.isSelf ? 'MyStory' : story.id}
                                        className="flex flex-col items-center gap-2 flex-shrink-0 w-20"
                                        onClick={() => handleStoryClick(index)}
                                    >
                                        <div className={cn("h-20 w-20 rounded-full p-1",
                                            hasUnseenStories ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" : "bg-gray-300 dark:bg-gray-600"
                                        )}>
                                            <div className="bg-background rounded-full p-1 w-full h-full">
                                                <Avatar className="h-full w-full relative">
                                                    {story.avatarUrl && <AvatarImage src={story.avatarUrl} alt={story.username} data-ai-hint="user avatar" />}
                                                    <AvatarFallback className="text-xs">{story.username?.substring(0,2)}</AvatarFallback>
                                                    {isMyEmptyStory && (
                                                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </Avatar>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center">{story.username}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

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
                        {pageLoading ? (
                            <>
                              <PostSkeleton />
                              <PostSkeleton />
                              <PostSkeleton />
                            </>
                        ) : feedItems && feedItems.length > 0 ? (
                            feedItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    {item.type === 'post' ? (
                                        <PostCard post={item as Post} />
                                    ) : (
                                        <StudioPostCard studio={item as StudioProfile} />
                                    )}
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
    </div>
    </>
  );
}
