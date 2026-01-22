
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer } from "@/components/story-viewer";
import { AddStoryDialog } from "@/components/add-story-dialog";

import type { Status, UserProfile, UserProfileWithStories } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

// Skeleton UI
const StoryReelSkeleton = () => (
  <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex flex-col items-center gap-2 flex-shrink-0 w-20"
      >
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    ))}
  </div>
);

export function StoryReel() {
  const { user, userData, loading: authLoading } = useAuth();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(true);

  const [relevantUserIds, setRelevantUserIds] = useState<string[]>([]);

  // Step 1: Determine relevant user IDs (self + following)
  useEffect(() => {
    if (!user) {
      setRelevantUserIds([]);
      return;
    }
    const fetchFollowing = async () => {
      try {
        const followsQuery = query(collection(db, 'follows'), where('followerId', '==', user.uid));
        const followsSnapshot = await getDocs(followsQuery);
        const followingIds = followsSnapshot.docs.map(d => d.data().followingId);
        setRelevantUserIds([user.uid, ...followingIds]);
      } catch (error) {
        console.error("Error fetching following list:", error);
        setRelevantUserIds([user.uid]); // Fallback to just the user
      }
    };
    fetchFollowing();
  }, [user]);

  // Step 2: Fetch statuses for relevant users
  useEffect(() => {
    if (relevantUserIds.length === 0) {
      setAllStatuses([]);
      setStatusesLoading(false);
      return;
    }

    setStatusesLoading(true);
    
    const fetchAllStatuses = async () => {
      try {
        const promises = relevantUserIds.map(userId => {
          const statusesRef = collection(db, `user_profiles/${userId}/statuses`);
          return getDocs(statusesRef);
        });

        const snapshots = await Promise.all(promises);
        const statusesData: Status[] = [];
        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            statusesData.push({ id: doc.id, ...doc.data() } as Status);
          });
        });
        setAllStatuses(statusesData);
      } catch (err) {
        console.error("Error fetching statuses:", err);
      } finally {
        setStatusesLoading(false);
      }
    };
    
    fetchAllStatuses();

  }, [relevantUserIds]);


  // Filter by expiration on the client
  const statuses = useMemo(() => {
    const now = Timestamp.now();
    return allStatuses.filter(s => s.expiresAt > now);
  }, [allStatuses]);

  const uniqueStoryUserIds = useMemo(() => {
    const ids = new Set(statuses.map((s) => s.userId));
    if (user) ids.add(user.uid);
    return Array.from(ids);
  }, [statuses, user]);

  // Fetch user profiles
  useEffect(() => {
    if (authLoading) return;

    if (uniqueStoryUserIds.length === 0) {
      setProfilesLoading(false);
      setProfiles(user && userData ? [userData as UserProfile] : []);
      return;
    }

    setProfilesLoading(true);

    const fetchProfiles = async () => {
      try {
        const idsToFetch = uniqueStoryUserIds;

        if (idsToFetch.length === 0) {
          setProfiles([]);
          setProfilesLoading(false);
          return;
        }
        
        // Firestore 'in' queries are limited to 30 items.
        // We need to chunk the requests if there are more.
        const promises = [];
        for (let i = 0; i < idsToFetch.length; i += 30) {
            const chunk = idsToFetch.slice(i, i + 30);
            const q = query(collection(db, "user_profiles"), where('__name__', 'in', chunk));
            promises.push(getDocs(q));
        }
        
        const snapshots = await Promise.all(promises);
        const list: UserProfile[] = [];
        snapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                if(doc.exists()) {
                    list.push({ id: doc.id, ...doc.data()} as UserProfile);
                }
            })
        });

        setProfiles(list);
      } catch(e) {
        console.error("Error fetching user profiles for stories", e);
      }
      finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [uniqueStoryUserIds, authLoading, user, userData]);

  // Combine users + stories
  const usersWithStories = useMemo<UserProfileWithStories[]>(() => {
    if (!profiles || !user) return [];

    const map: Record<string, UserProfileWithStories> = {};

    profiles.forEach((p) => {
      map[p.id] = { ...p, stories: [], hasUnseen: false };
    });

    statuses.forEach((st) => {
      if (map[st.userId]) {
        map[st.userId].stories.push(st);
        if (!st.viewers.includes(user.uid)) {
          map[st.userId].hasUnseen = true;
        }
      }
    });

    const list = Object.values(map).filter(
      (x) => x.stories.length > 0 || x.id === user.uid
    );

    return list.sort((a, b) => {
      if (a.id === user.uid) return -1;
      if (b.id === user.uid) return 1;

      if (a.hasUnseen && !b.hasUnseen) return -1;
      if (!a.hasUnseen && b.hasUnseen) return 1;

      return (
        (b.stories[0]?.createdAt?.seconds || 0) -
        (a.stories[0]?.createdAt?.seconds || 0)
      );
    });
  }, [profiles, statuses, user]);

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
    setIsViewerOpen(true);
  };
  
  const loading = authLoading || statusesLoading || profilesLoading;

  if (loading) return <StoryReelSkeleton />;

  const myEntry = usersWithStories.find((u) => u.id === user?.uid);
  const hasMyStory = !!myEntry && myEntry.stories.length > 0;

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {/* My Story */}
        {user && userData && (
          <div
            onClick={() => {
              const myIndex = usersWithStories.findIndex(u => u.id === user.uid);
              if (hasMyStory && myIndex !== -1) {
                handleStoryClick(myIndex);
              } else {
                setIsAddDialogOpen(true);
              }
            }}
            className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
          >
            <div className="h-20 w-20 rounded-full p-1 relative">
              <Avatar className="h-full w-full">
                <AvatarImage src={userData.avatarUrl} alt="Your Story" />
                <AvatarFallback>
                  {userData.username?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              {!hasMyStory ? (
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                  <Plus className="h-4 w-4" />
                </div>
              ) : (
                 <div
                  className={`absolute inset-0 rounded-full border-2 ${
                    myEntry?.hasUnseen ? "border-primary" : "border-muted"
                  }`}
                />
              )}
            </div>
            <span className="text-xs font-medium truncate w-full text-center">Your Story</span>
          </div>
        )}

        {/* Other users */}
        {usersWithStories
          .filter((u) => u.id !== user?.uid)
          .map((u, i) => {
            const index = usersWithStories.findIndex(user => user.id === u.id);
            if (index === -1) return null;
            return (
            <div
              key={u.id}
              onClick={() => {
                handleStoryClick(index);
              }}
              className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
            >
              <div
                className={`h-20 w-20 rounded-full p-0.5 ${
                  u.hasUnseen
                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                    : "bg-gray-300"
                }`}
              >
                <div className="p-1 bg-background rounded-full h-full w-full">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={u.avatarUrl} alt={u.username} />
                    <AvatarFallback>
                      {u.username.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-medium truncate w-full text-center">{u.username}</span>
            </div>
          )})}
      </div>

      {isViewerOpen && (
        <StoryViewer
          users={usersWithStories}
          initialUserIndex={selectedUserIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <AddStoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
