
"use client";

import { useState, useMemo, useEffect } from 'react';
import { collection, query, where, Timestamp, orderBy, collectionGroup, doc, getDoc } from 'firebase/firestore';
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
  const { user, userData } = useAuth();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const storyUserIdsFromStatuses = useMemo(() => {
    // This will be used later to fetch profiles
    return [];
  }, []);

  const statusesQuery = useMemoFirebase(() => {
    // A broader query to get stories from followed users + self
    const allRelevantUserIds = [...new Set([user?.uid, ...(userData?.following || [])])].filter(Boolean);
    if (allRelevantUserIds.length === 0) return null;
    return query(
      collectionGroup(db, 'statuses'),
      where('userId', 'in', allRelevantUserIds),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc')
    );
  }, [user, userData?.following]);
  
  const { data: statuses, isLoading: statusesLoading } = useCollection<Status>(statusesQuery);
  
  const uniqueUserIdsFromStories = useMemo(() => {
    if (!statuses) return [];
    const ids = new Set(statuses.map(s => s.userId));
    if(user) ids.add(user.uid); // Always ensure current user is in the list for their avatar
    return Array.from(ids);
  }, [statuses, user]);


  useEffect(() => {
    if (uniqueUserIdsFromStories.length === 0) {
      setProfilesLoading(false);
      setProfiles(user && userData ? [userData as UserProfile] : []);
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
        
        // Ensure current user's profile is included if they have no stories
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
  }, [uniqueUserIdsFromStories, user, userData]);


  const usersWithStories = useMemo<UserProfileWithStories[]>(() => {
    if (!statuses || !profiles || !user) return [];
    
    const profileMap: { [id: string]: UserProfile } = {};
    profiles.forEach(p => {
        if(p) profileMap[p.id] = p;
    });

    const userStoryMap: { [key: string]: UserProfileWithStories } = {};

    statuses.forEach(status => {
        const profile = profileMap[status.userId];
        if (profile) {
            if (!userStoryMap[status.userId]) {
                userStoryMap[status.userId] = {
                    ...profile,
                    stories: [],
                    hasUnseen: false,
                };
            }
            userStoryMap[status.userId].stories.push(status);
            // Story is unseen if the current user's ID is not in the viewers list
            if (!status.viewers.includes(user.uid)) {
                userStoryMap[status.userId].hasUnseen = true;
            }
        }
    });

    const filteredUsers = Object.values(userStoryMap);
    
    // Sort logic
    return filteredUsers.sort((a, b) => {
        // Current user's stories always first if they exist
        if (a.id === user.uid) return -1;
        if (b.id === user.uid) return 1;

        // Users with unseen stories next
        if (a.hasUnseen && !b.hasUnseen) return -1;
        if (!a.hasUnseen && b.hasUnseen) return 1;
        
        // Finally, sort by most recent story
        const lastStoryA = a.stories[0]?.createdAt.seconds || 0;
        const lastStoryB = b.stories[0]?.createdAt.seconds || 0;
        return lastStoryB - lastStoryA;
    });

  }, [statuses, profiles, user]);

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
    setIsViewerOpen(true);
  };
  
  if (statusesLoading || profilesLoading) {
      return <StoryReelSkeleton />;
  }

  const currentUserHasStory = usersWithStories.some(u => u.id === user?.uid);

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {/* Your Story button - shows if you have a story or not */}
        {user && userData && (
            currentUserHasStory ? (
                // Find own user in the sorted list to open it
                <div onClick={() => handleStoryClick(usersWithStories.findIndex(u=>u.id === user.uid))} className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer">
                     <div className={`h-20 w-20 rounded-full p-0.5 ${usersWithStories.find(u=>u.id === user.uid)?.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-300'}`}>
                        <div className="bg-background rounded-full p-1 w-full h-full">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={userData.avatarUrl} alt={userData.username} data-ai-hint="user avatar" />
                                <AvatarFallback>{userData.username.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center">Your Story</span>
                </div>
            ) : (
                // If no story, show the "Add" button
                <div onClick={() => setIsAddDialogOpen(true)} className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer">
                    <div className="h-20 w-20 rounded-full p-1 relative">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={userData.avatarUrl} alt="Your story" data-ai-hint="user avatar" />
                            <AvatarFallback>{userData.username?.substring(0, 2) || 'Me'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                            <Plus className="h-4 w-4" />
                        </div>
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center">Your Story</span>
                </div>
            )
        )}
        
        {/* Other users' stories */}
        {usersWithStories.filter(storyUser => storyUser.id !== user?.uid).map((storyUser, index) => {
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
