
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Loader2 } from "lucide-react";
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface UserSearchResult {
    id: string;
    username: string;
    avatarUrl: string;
    bio: string;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

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
        where("username", ">=", searchQuery.toLowerCase()),
        where("username", "<=", searchQuery.toLowerCase() + '\uf8ff'),
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

  return (
    <div className="flex flex-col gap-6 text-foreground">
        <form onSubmit={handleSearch}>
          <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search for creators by username" 
                  className="bg-secondary border-none rounded-full pl-12 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </form>

        <div className="min-h-[50vh]">
          {loading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(user => (
                    <Link href={`/profile/${user.id}`} key={user.id}>
                        <Card className="p-4 hover:bg-accent transition-colors flex items-center gap-4">
                            <Avatar className="h-16 w-16">
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
            <div className="text-center text-muted-foreground py-12">
              <Search className="mx-auto h-12 w-12" />
              <p className="mt-4">Search for creators, brands, and more.</p>
            </div>
          )}
        </div>
    </div>
  );
}
