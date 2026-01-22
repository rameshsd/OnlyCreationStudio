
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { CreatorCard } from "@/components/creator-card";
import { Star } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';


export default function FavouritesPage() {
  const { user } = useAuth();
  const [favoriteProfiles, setFavoriteProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!user) {
          setLoading(false);
          return;
      }
      setLoading(true);

      const favsColRef = collection(db, `user_favorites/${user.uid}/profiles`);
      const q = query(favsColRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
          if (snapshot.empty) {
              setFavoriteProfiles([]);
              setLoading(false);
              return;
          }

          const profileIds = snapshot.docs.map(doc => doc.data().profileId);

          if (profileIds.length === 0) {
              setFavoriteProfiles([]);
              setLoading(false);
              return;
          }

          const profilesRef = collection(db, 'user_profiles');
          const profiles: UserProfile[] = [];

          // Firestore 'in' query limit is 30. Chunking requests.
          for (let i = 0; i < profileIds.length; i += 30) {
              const chunk = profileIds.slice(i, i + 30);
              const profilesQuery = query(profilesRef, where('__name__', 'in', chunk));
              const profileSnapshots = await getDocs(profilesQuery);
              profileSnapshots.forEach(doc => {
                  profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
              });
          }

          const adaptedProfiles = profiles.map(p => ({
              creatorName: p.username,
              profilePicture: p.avatarUrl,
              professionalBio: p.bio,
              specialties: p.skills || [],
              primaryPlatformLink: `/profile/${p.id}`,
          }));

          setFavoriteProfiles(adaptedProfiles);
          setLoading(false);
      }, (error) => {
          console.error("Error fetching favorites: ", error);
          setLoading(false);
      });

      return () => unsubscribe();
  }, [user]);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorite Creators</h1>
        <p className="text-muted-foreground">Your curated list of top-tier talent.</p>
      </div>

       {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <CreatorCard key={i} loading />)}
            </div>
       ) : favoriteProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteProfiles.map((creator, index) => (
              <CreatorCard key={index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-muted-foreground">
            <Star className="h-12 w-12" />
            <p className="text-center">You haven't added any creators to your favorites yet.</p>
          </div>
        )}
    </div>
  );
}
