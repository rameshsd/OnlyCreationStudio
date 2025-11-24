
"use client";

import { useState, useMemo } from 'react';
import { collection, collectionGroup, query, where, Timestamp, orderBy } from 'firebase/firestore';
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

  const statusesQuery = useMemoFirebase(() =>
    query(
      collectionGroup(db, 'statuses'),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'desc')
    ),
    []
  );
  const { data: statuses, isLoading: statusesLoading } = useCollection<Status>(statusesQuery);
  
  const profilesQuery = useMemoFirebase(() => query(collection(db, 'user_profiles')), []);
  const { data: profiles, isLoading: profilesLoading } = useCollection<UserProfile>(profilesQuery);

  const usersWithStories = useMemo<UserProfileWithStories[]>(() => {
    if (!statuses || !profiles) return [];
    
    const userStoryMap: { [key: string]: UserProfileWithStories } = {};

    profiles.forEach(profile => {
        userStoryMap[profile.id] = {
            ...profile,
            stories: [],
            hasUnseen: false,
        };
    });

    statuses.forEach(status => {
      if (userStoryMap[status.userId]) {
        userStoryMap[status.userId].stories.push(status);
        if (!status.viewers.includes(user?.uid ?? '')) {
            userStoryMap[status.userId].hasUnseen = true;
        }
      }
    });

    const filteredUsers = Object.values(userStoryMap).filter(u => u.stories.length > 0);
    
    // Sort logic: current user first, then users with unseen stories, then by latest story
    return filteredUsers.sort((a, b) => {
        if (a.id === user?.uid) return -1;
        if (b.id === user?.uid) return 1;
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
  
  if (statusesLoading || profilesLoading) {
      return <StoryReelSkeleton />;
  }

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {/* Add Your Story */}
        <div 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
        >
          <div className="h-20 w-20 rounded-full p-1 relative">
            <Avatar className="h-full w-full">
              <AvatarImage src={userData?.avatarUrl} alt="Your story" data-ai-hint="user avatar" />
              <AvatarFallback>{userData?.username?.substring(0, 2) || 'Me'}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
              <Plus className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xs font-medium truncate w-full text-center">Your Story</span>
        </div>

        {/* Other users' stories */}
        {usersWithStories.map((storyUser, index) => (
          <div 
            onClick={() => handleStoryClick(index)} 
            key={storyUser.id} 
            className="flex flex-col items-center gap-2 flex-shrink-0 w-20 cursor-pointer"
          >
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
        ))}
      </div>
      
      {isViewerOpen && (
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
