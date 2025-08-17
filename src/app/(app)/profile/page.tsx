import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Heart, Mail, MessageCircle, PenSquare, Rss, Star, UserPlus, Users, Video } from "lucide-react";

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


export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="overflow-hidden">
                <div className="relative h-48 w-full md:h-64">
                    <Image
                        src={user.coverUrl}
                        alt="Cover photo"
                        layout="fill"
                        objectFit="cover"
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
                            <div className="flex gap-2">
                                <Button variant="outline"><UserPlus /> Follow</Button>
                                <Button variant="outline"><Heart /> Favorite</Button>
                                <Button><Mail /> Message</Button>
                                <Button variant="secondary"><Briefcase /> Collab Request</Button>
                                <Button variant="ghost" size="icon"><PenSquare /></Button>
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
                    <TabsTrigger value="stats"><Users className="mr-2 h-4 w-4" /> Stats</TabsTrigger>
                    <TabsTrigger value="reviews"><MessageCircle className="mr-2 h-4 w-4" /> Reviews</TabsTrigger>
                    <TabsTrigger value="opportunities"><Briefcase className="mr-2 h-4 w-4" /> Opportunities</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    <Card>
                        <CardHeader>Posts</CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                            Content coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="portfolio">
                    <Card>
                        <CardHeader>Portfolio</CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                            Content coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="stats">
                    <Card>
                        <CardHeader>Stats</CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                           Content coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reviews">
                    <Card>
                        <CardHeader>Reviews</CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                            Content coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="opportunities">
                    <Card>
                        <CardHeader>Opportunities</CardHeader>
                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                            Content coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
