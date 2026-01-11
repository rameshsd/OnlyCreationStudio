
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// This is a placeholder function. In a real app, you'd fetch this from a DB.
const getFollowDocRef = (followerId: string, followingId: string) => {
    return adminDb.collection('follows').doc(`${followerId}_${followingId}`);
}

export async function followUserAction(
  currentUserId: string,
  targetUserId: string
) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { error: 'Invalid user IDs provided.' };
  }
   if (!currentUserId) {
    return { error: "You must be logged in to follow a user." };
  }

  try {
    const followDocRef = getFollowDocRef(currentUserId, targetUserId);
    
    await followDocRef.set({
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: FieldValue.serverTimestamp()
    });

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${currentUserId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in followUserAction:', error);
    return { error: error.message || 'Failed to follow user.' };
  }
}

export async function unfollowUserAction(
  currentUserId: string,
  targetUserId: string
) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { error: 'Invalid user IDs provided.' };
  }
   if (!currentUserId) {
    return { error: "You must be logged in to unfollow a user." };
  }

  try {
    const followDocRef = getFollowDocRef(currentUserId, targetUserId);
    await followDocRef.delete();

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${currentUserId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in unfollowUserAction:', error);
    return { error: error.message || 'Failed to unfollow user.' };
  }
}
