"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  collectionGroup,
  query,
  where,
  Timestamp,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";

import { useCollection, useMemoFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer } from "@/components/story-viewer";
import { AddStoryDialog } from "@/components/add-story-dialog";

import type { Status, UserProfile, UserProfileWithStories } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

// Skeleton Loader
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

  // Current user + following
  const allRelevantUserIds = useMemo(() => {
    return [...new Set([user?.uid, ...(userData?.following || [])])].filter(
      Boolean
    ) as string[];
  }, [user, userData?.following]);

  // SAFE STATUSES QUERY — no IN operator
  const statusesQuery = useMemoFirebase(() => {
    return query(
      collectionGroup(db, "statuses"),
      where("expiresAt", ">", Timestamp.now()),
      orderBy("expiresAt", "desc")
    );
  }, []);

  const { data: allStatuses, isLoading: statusesLoading } =
    useCollection<Status>(statusesQuery);

  // Filter only stories from users relevant to current user
  const statuses = useMemo(() => {
    if (!allStatuses) return [];
    return allStatuses.filter((s) =>
      allRelevantUserIds.includes(s.userId)
    );
  }, [allStatuses, allRelevantUserIds]);

  // Extract all unique user IDs from statuses
  const uniqueUserIdsFromStories = useMemo(() => {
    const ids = new Set(statuses.map((s) => s.userId));
    if (user) ids.add(user.uid);
    return Array.from(ids);
  }, [statuses, user]);

  // Fetch user profiles manually
  useEffect(() => {
    if (authLoading) return;

    if (uniqueUserIdsFromStories.length === 0) {
      setProfilesLoading(false);
      if (user && userData) setProfiles([userData as UserProfile]);
      return;
    }

    setProfilesLoading(true);

    const fetchProfiles = async () => {
      try {
        const promises = uniqueUserIdsFromStories.map((id) =>
          getDoc(doc(db, "user_profiles", id))
        );

        const result = await Promise.all(promises);

        let fetched = result
          .filter((snap) => snap.exists())
          .map(
            (snap) =>
              ({
                id: snap.id,
                ...snap.data(),
              } as UserProfile)
          );

        if (user && userData && !fetched.some((p) => p.id === user.uid)) {
          fetched.push(userData as UserProfile);
        }

        setProfiles(fetched);
      } catch (e) {
        console.error("Profile fetch error:", e);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [uniqueUserIdsFromStories, user, userData, authLoading]);

  // Combine profiles + statuses
  const usersWithStories = useMemo<UserProfileWithStories[]>(() => {
    if (!profiles || !user) return [];

    const map: Record<string, UserProfileWithStories> = {};

    // Prime each profile
    profiles.forEach((p) => {
      map[p.id] = { ...p, stories: [], hasUnseen: false };
    });

    // Add statuses
    statuses.forEach((st) => {
      if (map[st.userId]) {
        map[st.userId].stories.push(st);
        if (!st.viewers.includes(user.uid)) {
          map[st.userId].hasUnseen = true;
        }
      }
    });

    const arr = Object.values(map).filter(
      (u) => u.stories.length > 0 || u.id === user.uid
    );

    // Sorting: user's story first, then unseen, then newest
    return arr.sort((a, b) => {
      const aIsUser = a.id === user.uid;
      const bIsUser = b.id === user.uid;

      if (aIsUser && bIsUser) return 0;
      if (aIsUser) return -1;
      if (bIsUser) return 1;

      if (a.hasUnseen && !b.hasUnseen) return -1;
      if (!a.hasUnseen && b.hasUnseen) return 1;

      const aT = a.stories[0]?.createdAt?.seconds || 0;
      const bT = b.stories[0]?.createdAt?.seconds || 0;
      return bT - aT;
    });
  }, [profiles, statuses, user]);

  const handleStoryClick = (idx: number) => {
    setSelectedUserIndex(idx);
    setIsViewerOpen(true);
  };

  const loading = authLoading || statusesLoading || profilesLoading;
  if (loading) return <StoryReelSkeleton />;

  const currentUser = usersWithStories.find((u) => u.id === user?.uid);
  const hasMyStory = currentUser && currentUser.stories.length > 0;

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {/* Current User */}
        {user && userData && (
          <div
            onClick={() =>
              hasMyStory
                ? handleStoryClick(
                    usersWithStories.findIndex((u) => u.id === user.uid)
                  )
                : setIsAddDialogOpen(true)
            }
            className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
          >
            <div className="h-20 w-20 rounded-full p-1 relative">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={userData.avatarUrl}
                  alt="Your story"
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>
                  {userData.username?.substring(0, 2) || "Me"}
                </AvatarFallback>
              </Avatar>

              {!hasMyStory ? (
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                  <Plus className="h-4 w-4" />
                </div>
              ) : (
                <div
                  className={`absolute inset-0 rounded-full p-0.5 border-2 ${
                    currentUser?.hasUnseen ? "border-primary" : "border-muted"
                  }`}
                />
              )}
            </div>
            <span className="text-xs font-medium truncate w-full text-center">
              Your Story
            </span>
          </div>
        )}

        {/* Other users */}
        {usersWithStories
          .filter((u) => u.id !== user?.uid)
          .map((storyUser) => {
            const index = usersWithStories.findIndex(
              (u) => u.id === storyUser.id
            );

            return (
              <div
                key={storyUser.id}
                onClick={() => handleStoryClick(index)}
                className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
              >
                <div
                  className={`h-20 w-20 rounded-full p-0.5 ${
                    storyUser.hasUnseen
                      ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                      : "bg-gray-300"
                  }`}
                >
                  <div className="bg-background rounded-full p-1 w-full h-full">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={storyUser.avatarUrl}
                        alt={storyUser.username}
                      />
                      <AvatarFallback>
                        {storyUser.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <span className="text-xs font-medium truncate w-full text-center">
                  {storyUser.username}
                </span>
              </div>
            );
          })}
      </div>

      {/* Story viewer */}
      {isViewerOpen && usersWithStories.length > 0 && (
        <StoryViewer
          users={usersWithStories}
          initialUserIndex={selectedUserIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <AddStoryDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
