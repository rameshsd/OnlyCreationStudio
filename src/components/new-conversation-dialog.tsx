'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile, Conversation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvoSelected: (convoId: string) => void;
  existingConversations: Conversation[];
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConvoSelected,
  existingConversations,
}: NewConversationDialogProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!user || !open) return;

    const searchProfiles = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const endQuery = lowerCaseQuery + '\uf8ff';
        const endQueryCaseSensitive = searchQuery + '\uf8ff';

        // Query user_profiles
        const usersRef = collection(db, 'user_profiles');
        const userQuery = query(
          usersRef,
          where('username', '>=', lowerCaseQuery),
          where('username', '<=', endQuery)
        );

        // Query studio_profiles
        const studiosRef = collection(db, 'studio_profiles');
        const studioQuery = query(
            studiosRef,
            where('studioName', '>=', searchQuery),
            where('studioName', '<=', endQueryCaseSensitive)
        );

        const [userSnap, studioSnap] = await Promise.all([
            getDocs(userQuery),
            getDocs(studioQuery)
        ]);

        const users = userSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as UserProfile) }));

        const studios = studioSnap.docs.map((doc) => {
            const data = doc.data();
            // Ensure we have a userProfileId to start a conversation
            if (!data.userProfileId) return null;
            return {
                id: data.userProfileId, // This is the user ID to chat with
                username: data.studioName,
                avatarUrl: data.photos?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${data.studioName}`,
                bio: data.description,
            } as UserProfile;
        }).filter((p): p is UserProfile => p !== null);

        const combinedResults = [...users, ...studios];

        // Remove duplicates (e.g., a user who is also a studio owner) and self
        const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values())
            .filter(profile => profile.id !== user.uid);
            
        setSearchResults(uniqueResults);

      } catch (error) {
        console.error('Error searching profiles:', error);
        toast({
          title: 'Search failed',
          description: 'Could not fetch profiles. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
        searchProfiles();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, open, user, toast]);

  const handleSelectUser = async (targetUser: UserProfile) => {
    if (!user || !userData) return;
    
    // Check if a conversation with this user already exists.
    const existingConvo = existingConversations.find(c => 
      c.participantIds.includes(targetUser.id)
    );

    if (existingConvo) {
      onConvoSelected(existingConvo.id);
      onOpenChange(false);
      return;
    }
    
    setIsCreating(true);

    try {
      const conversationData = {
        participantIds: [user.uid, targetUser.id],
        participantInfo: [
            { userId: user.uid, username: userData.username, avatarUrl: userData.avatarUrl || '' },
            { userId: targetUser.id, username: targetUser.username, avatarUrl: targetUser.avatarUrl || '' }
        ],
        lastMessageText: 'Started a new conversation.',
        lastMessageSentAt: serverTimestamp(),
        lastMessageReadBy: [user.uid]
      };

      const conversationsColRef = collection(db, 'conversations');
      const docRef = await addDoc(conversationsColRef, conversationData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: conversationsColRef.path,
            operation: 'create',
            requestResourceData: conversationData
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      onConvoSelected(docRef.id);
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating conversation:', error);
      if (!(error instanceof FirestorePermissionError)) {
        toast({
            title: 'Failed to start conversation',
            description: 'Please try again later.',
            variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for any user or studio to start a new chat.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or studio name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-4 max-h-60 min-h-[10rem] overflow-y-auto">
          {loading && (
              <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
              </div>
          )}
          {isCreating && (
              <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="ml-2">Starting conversation...</p>
              </div>
          )}
          {!loading && !isCreating && searchResults.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => handleSelectUser(profile)}
            >
              <Avatar>
                <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                <AvatarFallback>
                  {profile.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold">{profile.username}</p>
            </div>
          ))}
          {!loading && !isCreating && searchResults.length === 0 && searchQuery && (
              <p className="text-muted-foreground text-center text-sm p-4">No users found.</p>
          )}
           {!loading && !isCreating && searchResults.length === 0 && !searchQuery && (
              <p className="text-muted-foreground text-center text-sm p-4 pt-10">Start typing to search for users or studios.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
