"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Bell, Rss, TrendingUp, Users, Video } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { PostCard } from "@/components/post-card";

const stories = [
    { name: "My Story", avatar: null, isSelf: true, hint: "add story" },
    { name: "Sullyon", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Wendy", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Gaeul", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Karina", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Yuna", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Minji", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
    { name: "Hanni", avatar: "https://placehold.co/100x100.png", hint: "portrait" },
];

const posts = [
    {
        id: 1,
        author: {
            name: "Kang Seulgi",
            avatar: "https://placehold.co/100x100.png",
            username: "@seulgi",
            isVerified: true,
        },
        time: "45 min ago",
        caption: "Loving the new collection from @StyleBrand! The quality is amazing and the design is so chic. ✨ #fashion #style #OOTD",
        media: [{ type: 'image', url: "https://placehold.co/600x800.png", hint: "fashion portrait" }],
        likes: 1245,
        comments: 83,
        shares: 22,
    },
    {
        id: 2,
        author: {
            name: "Irene Bae",
            avatar: "https://placehold.co/100x100.png",
            username: "@irene",
            isVerified: true,
        },
        time: "2 hours ago",
        caption: "A few shots from my recent trip to the city. The architecture was breathtaking! Which one is your favorite?",
        media: [
            { type: 'image', url: "https://placehold.co/600x800.png", hint: "urban cityscape" },
            { type: 'image', url: "https://placehold.co/600x800.png", hint: "architectural detail" },
            { type: 'image', url: "https://placehold.co/600x800.png", hint: "street photography" }
        ],
        likes: 3802,
        comments: 241,
        shares: 98,
    },
    {
      id: 3,
      author: {
          name: "TechExplorer",
          avatar: "https://placehold.co/100x100.png?text=TE",
          username: "@techexplorer",
          isVerified: false,
      },
      time: "5 hours ago",
      caption: "Check out this short video review of the new CreatorCam X. Is it the best vlogging camera out there? Let me know your thoughts!",
      media: [{ type: 'video', url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" }],
      likes: 893,
      comments: 152,
      shares: 45,
  }
]

const feedFilters = [
    { label: "All", icon: Rss },
    { label: "Following", icon: Users },
    { label: "Trending", icon: TrendingUp },
    { label: "Short Videos", icon: Video },
]

const trendingTopics = ["#AIinMarketing", "#SustainableFashion", "#CreatorEconomy", "#Web3", "#IndieDev"];
const suggestedUsers = [
  { name: "John Doe", username: "@johndoe", avatar: "https://placehold.co/100x100.png?text=JD", hint: "user avatar" },
  { name: "Jane Smith", username: "@janesmith", avatar: "https://placehold.co/100x100.png?text=JS", hint: "user avatar" },
];

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


export default function DashboardPage() {
    const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
            <div className="flex flex-col gap-8 text-foreground">
                <header className="flex justify-between items-center md:hidden">
                    <h1 className="text-2xl font-bold">Creator Canvas</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
                    </div>
                </header>

                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                    {stories.map(story => (
                        <Link href="#" key={story.name} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1">
                                <div className="bg-background rounded-full p-1 w-full h-full">
                                    <Avatar className="h-full w-full relative">
                                        {story.avatar && <AvatarImage src={story.avatar} alt={story.name} data-ai-hint={story.hint} />}
                                        <AvatarFallback className="text-xs">{story.name.substring(0,2)}</AvatarFallback>
                                        {story.isSelf && (
                                            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </Avatar>
                                </div>
                            </div>
                            <span className="text-xs font-medium truncate w-full text-center">{story.name}</span>
                        </Link>
                    ))}
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
                    {posts.map((post, index) => (
                        <React.Fragment key={post.id}>
                            <PostCard post={post} />
                             { (index + 1) % 3 === 0 && (
                                <div className="hidden lg:block">
                                    <SuggestionsCard/>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
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
     <Button className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-20 lg:hidden">
        <Plus className="h-6 w-6"/>
        <span className="sr-only">Create Post</span>
     </Button>
    </>
  );
}
