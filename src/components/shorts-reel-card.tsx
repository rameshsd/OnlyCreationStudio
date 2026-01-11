
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/useMemoFirebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
<<<<<<< HEAD
import { type Short } from "@/lib/shorts-data";
=======
import type { Short } from "@/lib/types";
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
import { Skeleton } from "./ui/skeleton";
import Image from 'next/image';

const ShortSkeleton = () => (
  <div className="group relative h-64 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
    <Skeleton className="h-full w-full" />
    <div className="absolute bottom-0 left-0 p-3 w-full">
<<<<<<< HEAD
      <Skeleton className="h-4 w-3/4 rounded-md" />
    </div>
  </div>
)

export function ShortsReelCard() {
  const shortsQuery = useMemoFirebase(
    query(collection(db, "shorts"), orderBy("createdAt", "desc"), limit(10)),
    []
  );
  const { data: shortsData, isLoading } = useCollection<Short>(shortsQuery);
=======
        <Skeleton className="h-4 w-2/3 rounded-md" />
    </div>
  </div>
);

export function ShortsReelCard() {
  const shortsQuery = useMemoFirebase(query(collection(db, "shorts"), orderBy("createdAt", "desc"), limit(5)), []);
  const { data: shorts, isLoading } = useCollection<Short>(shortsQuery);
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Featured Shorts</CardTitle>
        <Button variant="ghost" asChild>
          <Link href="/shorts">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => <ShortSkeleton key={i} />)
<<<<<<< HEAD
          ) : shortsData && shortsData.length > 0 ? (
            shortsData.map((short) => (
=======
          ) : shorts && shorts.length > 0 ? (
            shorts.map((short) => (
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
              <Link href="/shorts" key={short.id}>
                <div className="group relative h-64 w-40 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={getThumbnailUrl(short.videoUrl)}
                    alt={short.caption || short.username}
                    fill
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    muted
                    playsInline
<<<<<<< HEAD
                    preload="metadata"
=======
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="h-12 w-12 text-white/80" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-3 text-white">
<<<<<<< HEAD
                    <p className="font-bold text-sm truncate">{short.user.name}</p>
=======
                    <p className="font-bold text-sm truncate">{short.username}</p>
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
                  </div>
                </div>
              </Link>
            ))
          ) : (
<<<<<<< HEAD
             <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                <p>No shorts to feature yet.</p>
             </div>
=======
            <div className="flex items-center justify-center h-64 w-full text-muted-foreground">
                <p>No shorts available yet.</p>
            </div>
>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
          )}
        </div>
      </CardContent>
    </Card>
  );
}

<<<<<<< HEAD
=======
export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  following?: string[];
  // Add other profile fields as needed
}

export interface UserProfileWithStories extends UserProfile {
  stories: Status[];
  hasUnseen: boolean;
}

export interface Short {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Timestamp;
}

>>>>>>> 0781c7f (I should be able to upload Shorts and displayed shorts should be dynamic)
    