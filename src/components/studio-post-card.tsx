
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Bookmark, Clock, MapPin, Star } from 'lucide-react';
import type { StudioProfile } from '@/app/(app)/studios/[id]/page';

export function StudioPostCard({ studio }: { studio: StudioProfile }) {
    
    const rating = studio.rating || 4.8;
    const reviewCount = studio.reviewCount || 24;

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 bg-primary/20 text-primary font-bold">
                             <AvatarFallback>{studio.studioName?.substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Link href={`/studios/${studio.id}`} className="font-bold hover:underline">{studio.studioName}</Link>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">{studio.location}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                        <Badge variant="outline" className="font-normal">{studio.type || 'Photography Studio'}</Badge>
                        <span>&middot;</span>
                        <Clock className="h-3 w-3" />
                        <span>Featured</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Link href={`/studios/${studio.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-secondary">
                        {studio.photos?.[0] ? (
                            <Image src={studio.photos[0]} alt={studio.studioName} fill className="object-cover" data-ai-hint="studio interior" />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-2xl font-bold">Studio Photo</p>
                            </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">
                            <Star className="h-3 w-3 mr-1.5 fill-yellow-400 text-yellow-400" />
                           {rating} ({reviewCount})
                        </Badge>
                    </div>
                </Link>
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-3">
                <div className="w-full flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Heart className="h-5 w-5" />
                            <span className="text-sm font-medium">324</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">24</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                </div>
                 <div className="w-full h-px bg-border"></div>
                 <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{studio.location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-primary font-bold text-lg">₹{studio.price}/hour</p>
                        <Button size="sm" asChild>
                           <Link href={`/studios/${studio.id}`}>Book Now</Link>
                        </Button>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}

    