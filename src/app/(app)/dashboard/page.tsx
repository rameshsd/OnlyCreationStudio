
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stories = [
    { name: "My Story", avatar: null, isSelf: true },
    { name: "Sullyon", avatar: "https://placehold.co/100x100.png" },
    { name: "Wendy", avatar: "https://placehold.co/100x100.png" },
    { name: "Gaeul", avatar: "https://placehold.co/100x100.png" },
    { name: "Karina", avatar: "https://placehold.co/100x100.png" },
    { name: "Yuna", avatar: "https://placehold.co/100x100.png" },
];

const posts = [
    {
        id: 1,
        author: {
            name: "Kang Seulgi",
            avatar: "https://placehold.co/100x100.png",
        },
        time: "45 min ago",
        image: "https://placehold.co/600x800.png",
        hint: "fashion portrait",
    },
    {
        id: 2,
        author: {
            name: "Irene Bae",
            avatar: "https://placehold.co/100x100.png",
        },
        time: "2 hours ago",
        image: "https://placehold.co/600x800.png",
        hint: "urban cityscape",
    }
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 text-foreground">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Creator Canvas</h1>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
            </div>
        </header>

        <div className="flex space-x-4 overflow-x-auto pb-4">
            {stories.map(story => (
                <Link href="#" key={story.name} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Avatar className="h-16 w-16 border-2 border-primary relative">
                        {story.avatar && <AvatarImage src={story.avatar} alt={story.name} data-ai-hint="portrait" />}
                        <AvatarFallback>{story.name.substring(0,2)}</AvatarFallback>
                        {story.isSelf && (
                            <div className="absolute bottom-0 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                                <Plus className="h-4 w-4" />
                            </div>
                        )}
                    </Avatar>
                    <span className="text-xs font-medium">{story.name}</span>
                </Link>
            ))}
        </div>

        <main className="space-y-6">
            {posts.map(post => (
                 <Card key={post.id} className="bg-card border-none rounded-2xl overflow-hidden">
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} data-ai-hint="user avatar" />
                                <AvatarFallback>{post.author.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{post.time}</p>
                            </div>
                        </div>
                        <Button size="sm">Follow</Button>
                    </div>
                    <div className="relative aspect-[3/4]">
                        <Image src={post.image} alt="Post image" fill className="object-cover" data-ai-hint={post.hint} />
                    </div>
                 </Card>
            ))}
        </main>
    </div>
  );
}
