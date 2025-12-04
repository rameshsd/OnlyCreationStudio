
"use client";

import { useState, useEffect } from 'react';
import { StudioCard } from "@/components/studio-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/useMemoFirebase';
import { collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface StudioProfile {
    id: string;
    studioName: string;
    location: string;
    price: number;
    photos: string[];
    // These are placeholders, adapt as needed from your actual data
    rating?: number;
    reviewCount?: number;
    amenities?: string[];
}

const StudioCardSkeleton = () => (
    <Card>
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-2/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
            </div>
        </CardContent>
    </Card>
);

export default function StudiosPage() {
    const studiosQuery = useMemoFirebase(query(collection(db, "studio_profiles")), []);
    const { data: studios, isLoading } = useCollection<StudioProfile>(studiosQuery);

    const adaptedStudios = studios?.map(studio => ({
        id: studio.id,
        name: studio.studioName,
        location: studio.location,
        price: studio.price || 0,
        imageUrl: studio.photos?.[0] || 'https://placehold.co/600x400',
        rating: studio.rating || 4.5,
        reviewCount: studio.reviewCount || 0,
        tags: studio.amenities?.slice(0, 3) || ["New Studio"],
    })) || [];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Find a Studio</h1>
                <p className="text-muted-foreground">Discover and book creative spaces near you.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search by name or location..." className="pl-10" />
                </div>
                <Select>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recommended">Recommended</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Search</Button>
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="group overflow-hidden transition-all">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4 space-y-3 bg-card border border-t-0 rounded-b-lg">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-6 w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adaptedStudios.map(studio => (
                        <StudioCard key={studio.id} studio={studio} />
                    ))}
                </div>
            )}
        </div>
    );
}

    