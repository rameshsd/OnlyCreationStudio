
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Heart, Mail, MessageCircle, PenSquare, Rss, Star, UserPlus, Users, Video, UserCheck, BarChart2, Loader2 } from "lucide-react";
import { useState, useMemo, useTransition, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { PostCard, Post } from "@/components/post-card";
import { collection, query, doc, updateDoc, arrayUnion, arrayRemove, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useParams } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemoFirebase } from "@/firebase/useMemoFirebase";

const statsData = [
  { month: "Jan", followers: 400 },
  { month: "Feb", followers: 300 },
  { month: "Mar", followers: 500 },
  { month: "Apr", followers: 700 },
  { month: "May", followers: 600 },
  { month: "Jun", followers: 800 },
];

const reviews = [
  { id: 1, author: "BrandCorp", rating: 5, text: "Alexa was a pleasure to work with. Highly professional and delivered amazing content!" },
  { id: 2, author: "StyleHub", rating: 5, text: "Incredibly talented and has a great eye for detail. Our campaign was a huge success." },
  { id: 3, author: "AnotherCreator", rating: 4, text: "Great collaborator, very responsive and creative." },
];

interface PortfolioItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    title: string;
    hint: string;
}

interface UserProfileData {
    id: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    followers?: string[];
    following?: string[];
    isVerified?: boolean;
    skills?: string[];
}


export default function ProfilePage() {
    const { user, loading: authLoading, userData: currentUserData } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const profileUserId = params.userId as string;
    const [isPending, startTransition] = useTransition();

    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        if (!profileUserId) return;
        setProfileLoading(true);

        const docRef = doc(db, "user_profiles", profileUserId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfileData({ id: docSnap.id, ...docSnap.data() } as UserProfileData);
            } else {
                setProfileData(null);
            }
            setProfileLoading(false);
        }, (error) => {
            console.error("Error fetching profile:", error);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: docRef.path,
                operation: 'get'
            }));
            setProfileData(null);
            setProfileLoading(false);
        });

        return () => unsubscribe();
    }, [profileUserId]);

    
    const isOwnProfile = user?.uid === profileUserId;

    const isFollowing = useMemo(() => {
        return currentUserData?.following?.includes(profileUserId);
    }, [currentUserData?.following, profileUserId]);

    const handleFollowToggle = async () => {
        if (isOwnProfile || !profileUserId || !user) return;
        
        startTransition(async () => {
            const currentUserRef = doc(db, "user_profiles", user.uid);
            const targetUserRef = doc(db, "user_profiles", profileUserId);

            try {
                if (isFollowing) {
                    // Unfollow logic
                    await updateDoc(currentUserRef, { following: arrayRemove(profileUserId) }).catch(err => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: currentUserRef.path,
                            operation: 'update',
                            requestResourceData: { following: arrayRemove(profileUserId) }
                        }));
                        throw err;
                    });
                    await updateDoc(targetUserRef, { followers: arrayRemove(user.uid) }).catch(err => {
                         errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: targetUserRef.path,
                            operation: 'update',
                            requestResourceData: { followers: arrayRemove(user.uid) }
                        }));
                        throw err;
                    });
                    toast({ title: "Unfollowed", description: `You are no longer following ${profileData?.username}.` });
                } else {
                    // Follow logic
                    await updateDoc(currentUserRef, { following: arrayUnion(profileUserId) }).catch(err => {
                         errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: currentUserRef.path,
                            operation: 'update',
                            requestResourceData: { following: arrayUnion(profileUserId) }
                        }));
                        throw err;
                    });
                    await updateDoc(targetUserRef, { followers: arrayUnion(user.uid) }).catch(err => {
                         errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: targetUserRef.path,
                            operation: 'update',
                            requestResourceData: { followers: arrayUnion(user.uid) }
                        }));
                        throw err;
                    });
                    toast({ title: "Followed", description: `You are now following ${profileData?.username}.` });
                }
            } catch (error) {
                // The error is already emitted, so we don't need to toast it here.
                // The FirebaseErrorListener will handle it.
                console.error("Follow/Unfollow action failed:", error);
            }
        });
    };


    const [isFavorited, setIsFavorited] = useState(false);

    const allPostsQuery = useMemoFirebase(
      query(collection(db, "posts")),
      []
    );

    const { data: allPosts, isLoading: postsLoading } = useCollection<Post>(allPostsQuery);

    const userPosts = useMemo(() => {
        if (!allPosts || !profileUserId) return [];
        return allPosts
            .filter(post => post.userId === profileUserId)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [allPosts, profileUserId]);


    const userPortfolioQuery = useMemoFirebase(
        profileUserId ? query(collection(db, "user_profiles", profileUserId, "portfolio_items")) : null,
        [profileUserId]
    );
    const { data: portfolioItems, isLoading: portfolioLoading } = useCollection<PortfolioItem>(userPortfolioQuery);
    

    const handleFavorite = () => {
        setIsFavorited(!isFavorited);
        toast({
            title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
            description: isFavorited ? `${profileData?.username} has been removed from your favorites.` : `${profileData?.username} has been added to your favorites.`,
        });
    };

    const handleComingSoon = (feature: string) => {
        toast({
            title: "Coming Soon!",
            description: `${feature} functionality is not yet implemented.`,
        });
    };

    if (authLoading || profileLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
    }

    if (!profileData) {
      return (
          <div className="flex h-screen items-center justify-center text-center">
              <div>
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-muted-foreground">This user profile does not exist or could not be loaded.</p>
              </div>
          </div>
      );
    }

    return (
        <div className="flex flex-col gap-8">
            <Card className="overflow-hidden">
                <div className="relative h-48 w-full md:h-64 bg-secondary">
                    {profileData.coverUrl && (
                        <Image
                            src={profileData.coverUrl}
                            alt="Cover photo"
                            fill
                            className="object-cover"
                            data-ai-hint="cover photo abstract"
                        />
                    )}
                </div>
                <div className="p-4 sm:p-6">
                    <div className="relative -mt-20 flex w-full flex-col items-center gap-4 sm:-mt-24 sm:flex-row sm:items-end">
                        <Avatar className="h-32 w-32 border-4 border-background">
                            <AvatarImage src={profileData.avatarUrl} alt={profileData.username} data-ai-hint="user avatar" />
                            <AvatarFallback>{profileData.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="mt-4 text-center sm:mt-0 sm:text-left">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{profileData.username}</h1>
                                    {profileData.isVerified && <Badge className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Verified</Badge>}
                                </div>
                                <p className="text-muted-foreground">@{profileData.username}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {isOwnProfile ? (
                                     <Button variant="outline" onClick={() => handleComingSoon('Edit Profile')}><PenSquare /> Edit Profile</Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={handleFollowToggle} disabled={isPending}>
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />} 
                                            {isFollowing ? "Following" : "Follow"}
                                        </Button>
                                        <Button variant={isFavorited ? 'default' : 'outline'} onClick={handleFavorite}>
                                            <Heart className={isFavorited ? 'fill-current' : ''} /> {isFavorited ? "Favorited" : "Favorite"}
                                        </Button>
                                        <Button onClick={() => handleComingSoon('Messaging')}><Mail /> Message</Button>
                                        <Button variant="secondary" onClick={() => handleComingSoon('Collab Requests')}><Briefcase /> Collab Request</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-center sm:text-left text-muted-foreground">{profileData.bio || "No bio yet."}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2">
                        {(profileData.skills || ["Brand Strategy", "Content Creation"]).map((skill: string) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                    </div>

                     <div className="mt-6 grid grid-cols-3 divide-x rounded-lg border">
                        <div className="px-4 py-2 text-center">
                            <p className="text-xl font-bold">{profileData.followers?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <div className="px-4 py-2 text-center">
                            <p className="text-xl font-bold">{profileData.following?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Following</p>
                        </div>
                         <div className="px-4 py-2 text-center">
                            <p className="text-xl font-bold">{userPosts?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Posts</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="posts"><Rss className="mr-2 h-4 w-4" /> Posts</TabsTrigger>
                    <TabsTrigger value="portfolio"><Video className="mr-2 h-4 w-4" /> Portfolio</TabsTrigger>
                    <TabsTrigger value="stats"><BarChart2 className="mr-2 h-4 w-4" /> Stats</TabsTrigger>
                    <TabsTrigger value="reviews"><MessageCircle className="mr-2 h-4 w-4" /> Reviews</TabsTrigger>
                    <TabsTrigger value="opportunities"><Briefcase className="mr-2 h-4 w-4" /> Opportunities</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <Card>
                        <CardHeader><CardTitle>Recent Posts</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           {postsLoading ? (
                               <p>Loading posts...</p>
                           ) : userPosts && userPosts.length > 0 ? (
                               userPosts.map(post => <PostCard key={post.id} post={post} />)
                           ) : (
                               <p className="text-muted-foreground">No posts yet.</p>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="portfolio">
                    <Card>
                        <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {portfolioLoading ? (
                                <p>Loading portfolio...</p>
                           ): portfolioItems && portfolioItems.length > 0 ? (
                               portfolioItems.map(item => (
                               <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                   <Image src={item.url} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={item.hint}/>
                                   <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <p className="text-white text-sm font-bold">{item.title}</p>
                                   </div>
                               </div>
                           ))
                           ) : (
                                <p className="text-muted-foreground col-span-full">No portfolio items yet.</p>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="stats">
                    <Card>
                        <CardHeader><CardTitle>Follower Growth</CardTitle></CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statsData}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                                    <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reviews">
                    <Card>
                        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           {reviews.map(review => (
                               <div key={review.id} className="rounded-lg border p-4">
                                   <div className="flex justify-between items-center">
                                       <p className="font-bold">{review.author}</p>
                                       <div className="flex items-center gap-1">
                                           {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-primary fill-primary" />)}
                                           {[...Array(5 - review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-muted-foreground/50" />)}
                                       </div>
                                   </div>
                                   <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="opportunities">
                    <Card>
                        <CardHeader><CardTitle>Available for Collaboration</CardTitle></CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Briefcase className="mx-auto h-12 w-12" />
                                <p className="mt-2">This creator is open to new opportunities.</p>
                                <Button className="mt-4">Send Collaboration Request</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
