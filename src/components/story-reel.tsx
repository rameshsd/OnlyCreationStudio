
"use client";

import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, Timestamp, orderBy, collectionGroup, getDocs, doc } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { StoryViewer } from '@/components/story-viewer';
import { AddStoryDialog } from '@/components/add-story-dialog';
import type { Status, UserProfile, UserProfileWithStories } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const StoryReelSkeleton = () => (
    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-md" />
            </div>
        ))}
    </div>
)

export function StoryReel() {
  const { user, userData, loading: authLoading } = useAuth();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  
  const allRelevantUserIds = useMemo(() => {
    return [...new Set([user?.uid, ...(userData?.following || [])])].filter(Boolean) as string[];
  }, [user, userData?.following]);


  const statusesQuery = useMemoFirebase(() => {
    if (allRelevantUserIds.length === 0) return null;
    return query(
      collectionGroup(db, 'statuses'),
      where('userId', 'in', allRelevantUserIds),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc')
    );
  }, [allRelevantUserIds]);
  
  const { data: statuses, isLoading: statusesLoading } = useCollection<Status>(statusesQuery);
  
  const uniqueUserIdsFromStories = useMemo(() => {
    const ids = new Set(statuses?.map(s => s.userId) || []);
    if(user) ids.add(user.uid); // Always ensure current user is in the list for their avatar
    return Array.from(ids);
  }, [statuses, user]);


  useEffect(() => {
    if (authLoading) return;
    if (uniqueUserIdsFromStories.length === 0) {
      setProfilesLoading(false);
      if (user && userData) {
        setProfiles([userData as UserProfile]);
      } else {
        setProfiles([]);
      }
      return;
    }

    setProfilesLoading(true);
    const fetchProfiles = async () => {
      try {
        const profilePromises = uniqueUserIdsFromStories.map(id => getDoc(doc(db, "user_profiles", id)));
        const profileDocs = await Promise.all(profilePromises);
        const fetchedProfiles = profileDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserProfile));
        
        if (user && userData && !fetchedProfiles.some(p => p.id === user.uid)) {
            fetchedProfiles.push(userData as UserProfile);
        }

        setProfiles(fetchedProfiles);
      } catch (error) {
        console.error("Error fetching user profiles for stories:", error);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [uniqueUserIdsFromStories, user, userData, authLoading]);


  const usersWithStories = useMemo<UserProfileWithStories[]>(() => {
    if (!profiles || !user) return [];
    
    const profileMap: { [id: string]: UserProfile } = {};
    profiles.forEach(p => {
        if(p) profileMap[p.id] = p;
    });

    const userStoryMap: { [key: string]: UserProfileWithStories } = {};
    
    // Prime the map with all relevant profiles
    for (const profile of profiles) {
        if(profile) {
            userStoryMap[profile.id] = {
                ...profile,
                stories: [],
                hasUnseen: false,
            };
        }
    }

    (statuses || []).forEach(status => {
        const profile = profileMap[status.userId];
        if (profile) {
            if (!userStoryMap[status.userId].stories) {
                userStoryMap[status.userId].stories = [];
            }
            userStoryMap[status.userId].stories.push(status);
            if (user && !status.viewers.includes(user.uid)) {
                userStoryMap[status.userId].hasUnseen = true;
            }
        }
    });

    const filteredUsers = Object.values(userStoryMap).filter(u => u.stories.length > 0 || u.id === user.uid);
    
    return filteredUsers.sort((a, b) => {
        const aHasStories = a.stories.length > 0;
        const bHasStories = b.stories.length > 0;

        if (a.id === user.uid && aHasStories) return -1;
        if (b.id === user.uid && bHasStories) return 1;
        if (a.id === user.uid) return -1;
        if (b.id === user.uid) return 1;

        if (a.hasUnseen && !b.hasUnseen) return -1;
        if (!a.hasUnseen && b.hasUnseen) return 1;
        
        const lastStoryA = a.stories[0]?.createdAt.seconds || 0;
        const lastStoryB = b.stories[0]?.createdAt.seconds || 0;
        return lastStoryB - lastStoryA;
    });

  }, [statuses, profiles, user]);

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
    setIsViewerOpen(true);
  };
  
  const loading = authLoading || statusesLoading || profilesLoading;
  if (loading) {
      return <StoryReelSkeleton />;
  }

  const currentUserInList = usersWithStories.find(u => u.id === user?.uid);
  const currentUserHasStory = !!currentUserInList && currentUserInList.stories.length > 0;

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {user && userData && (
            <div 
              onClick={() => currentUserHasStory ? handleStoryClick(usersWithStories.findIndex(u=>u.id === user.uid)) : setIsAddDialogOpen(true)} 
              className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
            >
              <div className="h-20 w-20 rounded-full p-1 relative">
                  <Avatar className="h-full w-full">
                      <AvatarImage src={userData.avatarUrl} alt="Your story" data-ai-hint="user avatar" />
                      <AvatarFallback>{userData.username?.substring(0, 2) || 'Me'}</AvatarFallback>
                  </Avatar>
                  {!currentUserHasStory && (
                      <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                          <Plus className="h-4 w-4" />
                      </div>
                  )}
                  {currentUserHasStory && (
                       <div className={`absolute inset-0 rounded-full p-0.5 border-2 ${currentUserInList?.hasUnseen ? 'border-primary' : 'border-muted'}`} />
                  )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">Your Story</span>
            </div>
        )}
        
        {usersWithStories.filter(storyUser => storyUser.id !== user?.uid).map((storyUser) => {
            const overallIndex = usersWithStories.findIndex(u => u.id === storyUser.id);
            return (
              <div onClick={() => handleStoryClick(overallIndex)} key={storyUser.id} className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer">
                <div className={`h-20 w-20 rounded-full p-0.5 ${storyUser.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-300'}`}>
                  <div className="bg-background rounded-full p-1 w-full h-full">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={storyUser.avatarUrl} alt={storyUser.username} data-ai-hint="user avatar" />
                      <AvatarFallback>{storyUser.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{storyUser.username}</span>
              </div>
            )
        })}
      </div>
      
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
