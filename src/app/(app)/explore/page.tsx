
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Loader2 } from "lucide-react";
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Post } from '@/components/post-card';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle } from 'lucide-react';

interface UserSearchResult {
    id: string;
    username: string;
    avatarUrl: string;
    bio: string;
}

const ExploreGridSkeleton = () => (
    <div className="grid grid-cols-3 gap-1">
        {[...Array(12)].map((_, i) => (
            <div key={i} className="relative aspect-square">
                <Skeleton className="h-full w-full" />
            </div>
        ))}
    </div>
);

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const postsQuery = useMemo(() => query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30)), []);
  const { data: explorePosts, isLoading: exploreLoading } = useCollection<Post>(postsQuery);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
      const usersRef = collection(db, "user_profiles");
      const q = query(
        usersRef,
        where("username_lowercase", ">=", searchQuery.toLowerCase()),
        where("username_lowercase", "<=", searchQuery.toLowerCase() + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const users: UserSearchResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          username: data.username,
          avatarUrl: data.avatarUrl,
          bio: data.bio || 'No bio available.',
        });
      });
      setSearchResults(users);
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast({
        title: "Search Error",
        description: "Could not perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
        setHasSearched(false);
        setSearchResults([]);
    }
  }

  return (
    <div className="flex flex-col gap-6 text-foreground">
        <form onSubmit={handleSearch}>
          <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search for creators..." 
                  className="bg-secondary border-none rounded-full pl-12 h-12"
                  value={searchQuery}
                  onChange={handleSearchChange}
              />
          </div>
        </form>

        <div className="min-h-[50vh]">
          {hasSearched ? (
              loading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map(user => (
                    <Link href={`/profile/${user.id}`} key={user.id}>
                        <Card className="p-3 hover:bg-accent transition-colors flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={user.avatarUrl} alt={user.username} data-ai-hint="user avatar" />
                                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-bold">{user.username}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                            </div>
                        </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <User className="mx-auto h-12 w-12" />
                  <p className="mt-4">No users found for "{searchQuery}".</p>
                </div>
              )
          ) : (
            exploreLoading ? (
                <ExploreGridSkeleton />
            ) : (
                <div className="grid grid-cols-3 gap-1">
                    {explorePosts?.map(post => (
                        post.media[0] && (
                            <div key={post.id} className="relative aspect-square group">
                                <Image src={post.media[0].url} alt={post.caption || 'Explore post'} fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-white flex items-center gap-4 text-sm font-bold">
                                        <span className="flex items-center gap-1"><Heart className="h-4 w-4"/> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4"/> {post.comments}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )
          )}
        </div>
    </div>
  );
}
