
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Plus, Search, Bell, Rss, TrendingUp, Users, Video, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo, useTransition, useEffect } from "react";
import { PostCard, type Post } from "@/components/post-card";
import { ShortsReelCard } from "@/components/shorts-reel-card";
import { db } from "@/lib/firebase";
import { collection, orderBy, query, limit, getDocs, doc, setDoc, deleteDoc, serverTimestamp, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMockTrendingTopics } from "@/lib/mock-data";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/useMemoFirebase";
import { StudioPostCard } from "@/components/studio-post-card";
import type { FeedItem, StudioProfile } from "@/lib/get-feed-data";
import { StoryReel } from "@/components/story-reel";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const feedFilters = [
    { label: "All", icon: Rss },
    { label: "Following", icon: Users },
    { label: "Trending", icon: TrendingUp },
    { label: "Short Videos", icon: Video },
]

const trendingTopics = generateMockTrendingTopics(20);


interface Suggestion {
    id: string;
    username: string;
    avatarUrl: string;
}

const SuggestionsCard = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Memoize the query for currently followed users
    const followingQuery = useMemoFirebase(
      user ? query(collection(db, "follows"), where("followerId", "==", user.uid)) : null,
      [user]
    );
    const { data: followingDocs } = useCollection(followingQuery);
    const followingIds = useMemo(() => followingDocs?.map(doc => doc.followingId) || [], [followingDocs]);

    useEffect(() => {
        if (!user) return;

        const fetchSuggestions = async () => {
            try {
                setLoading(true);
                const usersToExclude = [user.uid, ...followingIds];
                
                const q = query(collection(db, "user_profiles"), limit(20));
                const querySnapshot = await getDocs(q);
                
                const fetchedUsers: Suggestion[] = [];
                querySnapshot.forEach(doc => {
                    if (!usersToExclude.includes(doc.id)) {
                        const data = doc.data();
                        fetchedUsers.push({
                            id: doc.id,
                            username: data.username,
                            avatarUrl: data.avatarUrl,
                        });
                    }
                });
                setSuggestions(fetchedUsers.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch suggestions:", e);
            } finally {
                setLoading(false);
            }
        };

        if (followingIds) {
            fetchSuggestions();
        }
    }, [user, followingIds]);

    const handleFollow = (targetUserId: string) => {
        if (!user) return;

        startTransition(async () => {
            const followDocRef = doc(db, "follows", `${user.uid}_${targetUserId}`);
            
            try {
                setFollowing(prev => [...prev, targetUserId]); // Optimistic update

                await setDoc(followDocRef, {
                  followerId: user.uid,
                  followingId: targetUserId,
                  createdAt: serverTimestamp()
                }).catch(err => {
                     errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: followDocRef.path,
                        operation: 'create',
                        requestResourceData: { followerId: user.uid, followingId: targetUserId }
                    }));
                    throw err;
                });
                
                toast({ title: "Followed user" });
            } catch (error) {
                console.error("Failed to follow user:", error);
                 setFollowing(prev => prev.filter(id => id !== targetUserId)); // Revert on error
            }
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader><h3 className="font-bold">Suggested for you</h3></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }


    return (
        <Card>
            <CardHeader>
                <h3 className="font-bold">Suggested for you</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.map(suggestedUser => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/profile/${suggestedUser.id}`}>
                                <Avatar>
                                    <AvatarImage src={suggestedUser.avatarUrl} data-ai-hint="user avatar" />
                                    <AvatarFallback>{suggestedUser.username.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                 <Link href={`/profile/${suggestedUser.id}`}>
                                    <p className="font-semibold text-sm hover:underline">{suggestedUser.username}</p>
                                 </Link>
                                <p className="text-xs text-muted-foreground">@{suggestedUser.username.toLowerCase()}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm"
                            onClick={() => handleFollow(suggestedUser.id)}
                            disabled={isPending || following.includes(suggestedUser.id) || followingIds.includes(suggestedUser.id)}
                        >
                            {isPending && following.includes(suggestedUser.id) ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Follow'}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};


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

    const postsQuery = useMemoFirebase(
        () => query(collection(db, "posts"), orderBy("createdAt", "desc")),
        []
    );
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    const studiosQuery = useMemoFirebase(
        () => query(collection(db, "studio_profiles")),
        []
    );
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
                <StoryReel />
                
                <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
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
