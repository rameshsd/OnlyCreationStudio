
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, Clock, MapPin, Star } from 'lucide-react';
import type { StudioProfile } from '@/app/(app)/studios/[id]/page';
import { cn } from '@/lib/utils';

export function StudioPostCard({ studio }: { studio: StudioProfile }) {
    
    const rating = studio.rating || 4.8;
    const reviewCount = studio.reviewCount || 24;

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 bg-primary/20 text-primary font-bold">
                        <AvatarFallback>{studio.studioName?.substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/studios/${studio.id}`} className="font-bold hover:underline">{studio.studioName}</Link>
                        <p className="text-xs text-muted-foreground">{studio.location}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Badge variant="outline">{studio.type || 'Photography Studio'}</Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative aspect-video bg-secondary">
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
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-2">
                 <div className="w-full grid grid-cols-12 gap-2 text-muted-foreground">
                    <div className="col-span-1 flex items-center gap-1.5">
                        <Heart className="h-5 w-5" />
                        <span className="text-sm font-medium">324</span>
                    </div>
                     <div className="col-span-1 flex items-center gap-1.5">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">24</span>
                    </div>
                     <div className="col-span-1 flex items-center gap-1.5">
                        <Share2 className="h-5 w-5" />
                    </div>
                    <div className="col-span-9 flex justify-end">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Bookmark className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                 <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{studio.location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-primary font-bold text-lg">₹{studio.price}/hour</p>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}
