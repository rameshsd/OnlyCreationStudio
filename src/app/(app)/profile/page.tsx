
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Heart, Mail, MessageCircle, PenSquare, Rss, Star, UserPlus, Users, Video, UserCheck, BarChart2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";

const user = {
    name: "Alexa Rodriguez",
    username: "@alexa_creates",
    avatarUrl: "https://placehold.co/150x150.png",
    coverUrl: "https://placehold.co/1200x400.png",
    bio: "Digital storyteller & brand strategist. I help brands build authentic connections with their audience. Passionate about sustainable fashion and minimalist design. Let's create something beautiful together!",
    isVerified: true,
    stats: [
        { label: "Followers", value: "1.2M" },
        { label: "Following", value: "834" },
        { label: "Likes", value: "12.8M" },
    ],
    skills: ["Brand Strategy", "Content Creation", "Social Media Marketing", "UI/UX Design", "Fashion Styling"],
};

const posts = [
  { id: 1, content: "Just dropped a new video on my channel! Check it out and let me know what you think. #newvideo #creatorlife", likes: 1200, comments: 88 },
  { id: 2, content: "So excited to announce my collaboration with @BrandX! We've been working on something special for you all. ✨", likes: 3500, comments: 241 },
  { id: 3, content: "My thoughts on the latest design trends. A thread... 🧵", likes: 890, comments: 56 },
];

const portfolioItems = [
    { id: 1, type: 'image', url: 'https://placehold.co/600x400.png', title: 'Project Alpha', hint: 'portfolio project' },
    { id: 2, type: 'video', url: 'https://placehold.co/600x400.png', title: 'Project Beta', hint: 'portfolio project' },
    { id: 3, type: 'image', url: 'https://placehold.co/600x400.png', title: 'Project Gamma', hint: 'portfolio project' },
    { id: 4, type: 'image', url: 'https://placehold.co/600x400.png', title: 'Project Delta', hint: 'portfolio project' },
];

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


export default function ProfilePage() {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        toast({
            title: isFollowing ? "Unfollowed" : "Followed",
            description: isFollowing ? `You are no longer following ${user.name}.` : `You are now following ${user.name}.`,
        });
    };

    const handleFavorite = () => {
        setIsFavorited(!isFavorited);
        toast({
            title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
            description: isFavorited ? `${user.name} has been removed from your favorites.` : `${user.name} has been added to your favorites.`,
        });
    };

    const handleComingSoon = (feature: string) => {
        toast({
            title: "Coming Soon!",
            description: `${feature} functionality is not yet implemented.`,
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <Card className="overflow-hidden">
                <div className="relative h-48 w-full md:h-64">
                    <Image
                        src={user.coverUrl}
                        alt="Cover photo"
                        fill
                        className="object-cover"
                        data-ai-hint="cover photo abstract"
                    />
                </div>
                <div className="p-4 sm:p-6">
                    <div className="relative -mt-20 flex w-full flex-col items-center gap-4 sm:-mt-24 sm:flex-row sm:items-end">
                        <Avatar className="h-32 w-32 border-4 border-background">
                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="mt-4 text-center sm:mt-0 sm:text-left">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    {user.isVerified && <Badge className="bg-primary hover:bg-primary text-primary-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Verified</Badge>}
                                </div>
                                <p className="text-muted-foreground">{user.username}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <Button variant="outline" onClick={handleFollow}>
                                    {isFollowing ? <UserCheck /> : <UserPlus />} {isFollowing ? "Following" : "Follow"}
                                </Button>
                                <Button variant={isFavorited ? 'default' : 'outline'} onClick={handleFavorite}>
                                    <Heart className={isFavorited ? 'fill-current' : ''} /> {isFavorited ? "Favorited" : "Favorite"}
                                </Button>
                                <Button onClick={() => handleComingSoon('Messaging')}><Mail /> Message</Button>
                                <Button variant="secondary" onClick={() => handleComingSoon('Collab Requests')}><Briefcase /> Collab Request</Button>
                                <Button variant="ghost" size="icon" onClick={() => handleComingSoon('Edit Profile')}><PenSquare /></Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-center sm:text-left text-muted-foreground">{user.bio}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2">
                        {user.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                    </div>

                     <div className="mt-6 grid grid-cols-3 divide-x rounded-lg border">
                        {user.stats.map(stat => (
                            <div key={stat.label} className="px-4 py-2 text-center">
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
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
                           {posts.map(post => (
                               <div key={post.id} className="rounded-lg border p-4">
                                   <p className="text-sm text-foreground">{post.content}</p>
                                   <div className="flex gap-4 text-muted-foreground text-xs mt-2">
                                       <span>{post.likes} Likes</span>
                                       <span>{post.comments} Comments</span>
                                   </div>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="portfolio">
                    <Card>
                        <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {portfolioItems.map(item => (
                               <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                   <Image src={item.url} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={item.hint}/>
                                   <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <p className="text-white text-sm font-bold">{item.title}</p>
                                   </div>
                               </div>
                           ))}
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

    