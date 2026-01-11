
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import Link from 'next/link';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/useMemoFirebase';
import { Skeleton } from './ui/skeleton';

interface UserProfile {
    id: string;
    username: string;
    avatarUrl: string;
    bio?: string;
}

interface FollowListDialogProps {
    userId: string;
    type: 'followers' | 'following';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialCount: number;
}

const UserRowSkeleton = () => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
    </div>
);

export function FollowListDialog({ userId, type, open, onOpenChange, initialCount }: FollowListDialogProps) {
    const { user: currentUser, userData } = useAuth();
    const { toast } = useToast();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Memoize the list of users the current user is following
    const myFollowingQuery = useMemoFirebase(
        currentUser?.uid ? query(collection(db, "follows"), where("followerId", "==", currentUser.uid)) : null,
        [currentUser?.uid]
    );
    const { data: myFollowingDocs } = useCollection(myFollowingQuery);
    const myFollowingIds = useMemo(() => new Set(myFollowingDocs?.map(doc => doc.followingId) || []), [myFollowingDocs]);
    
    const [followingInProgress, setFollowingInProgress] = useState<string[]>([]);


    useEffect(() => {
        if (!open || !userId) return;

        const fetchFollows = async () => {
            setLoading(true);
            try {
                const fieldToQuery = type === 'followers' ? 'followingId' : 'followerId';
                const idToExtract = type === 'followers' ? 'followerId' : 'followingId';

                const followsQuery = query(collection(db, 'follows'), where(fieldToQuery, '==', userId));
                const followsSnapshot = await getDocs(followsQuery);
                const userIds = followsSnapshot.docs.map(d => d.data()[idToExtract]);

                if (userIds.length > 0) {
                    const profilesQuery = query(collection(db, 'user_profiles'), where('__name__', 'in', userIds));
                    const profilesSnapshot = await getDocs(profilesQuery);
                    const profilesData = profilesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
                    setProfiles(profilesData);
                } else {
                    setProfiles([]);
                }
            } catch (error) {
                console.error(`Error fetching ${type}:`, error);
                toast({ title: `Error fetching ${type}`, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchFollows();
    }, [open, userId, type, toast]);

    const handleFollowToggle = async (targetUserId: string) => {
        if (!currentUser) return;

        const isFollowing = myFollowingIds.has(targetUserId);
        const followDocRef = doc(db, "follows", `${currentUser.uid}_${targetUserId}`);

        setFollowingInProgress(prev => [...prev, targetUserId]);

        try {
            if (isFollowing) {
                await deleteDoc(followDocRef);
                toast({ title: "Unfollowed" });
            } else {
                await setDoc(followDocRef, {
                    followerId: currentUser.uid,
                    followingId: targetUserId,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Followed" });
            }
        } catch (error) {
            console.error("Follow/unfollow error:", error);
            toast({ title: "Something went wrong", variant: 'destructive' });
        } finally {
            setFollowingInProgress(prev => prev.filter(id => id !== targetUserId));
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="capitalize">{type}</DialogTitle>
                    <DialogDescription>{initialCount} {type}</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <UserRowSkeleton key={i} />)}
                        </div>
                    ) : profiles.length > 0 ? (
                        profiles.map((profile) => {
                            const isCurrentUserFollowing = myFollowingIds.has(profile.id);
                            const isSelf = currentUser?.uid === profile.id;
                             const isToggling = followingInProgress.includes(profile.id);
                            return (
                                <div key={profile.id} className="flex items-center justify-between py-2">
                                    <Link href={`/profile/${profile.id}`} className="flex items-center gap-3" onClick={() => onOpenChange(false)}>
                                        <Avatar>
                                            <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                                            <AvatarFallback>{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{profile.username}</p>
                                            <p className="text-sm text-muted-foreground truncate">{profile.bio}</p>
                                        </div>
                                    </Link>
                                    {!isSelf && (
                                        <Button
                                            variant={isCurrentUserFollowing ? 'outline' : 'default'}
                                            size="sm"
                                            onClick={() => handleFollowToggle(profile.id)}
                                            disabled={isToggling}
                                        >
                                            {isToggling ? <Loader2 className="h-4 w-4 animate-spin"/> : (isCurrentUserFollowing ? <UserCheck className="h-4 w-4"/> : <UserPlus className="h-4 w-4"/>)}
                                            <span className="ml-2 hidden sm:inline">{isCurrentUserFollowing ? 'Following' : 'Follow'}</span>
                                        </Button>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No {type} to show.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
