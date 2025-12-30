
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

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
    const currentUserRef = adminDb.doc(`user_profiles/${currentUserId}`);
    const targetUserRef = adminDb.doc(`user_profiles/${targetUserId}`);

    const batch = adminDb.batch();

    batch.update(currentUserRef, { following: FieldValue.arrayUnion(targetUserId) });
    batch.update(targetUserRef, { followers: FieldValue.arrayUnion(currentUserId) });

    await batch.commit();

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
    const currentUserRef = adminDb.doc(`user_profiles/${currentUserId}`);
    const targetUserRef = adminDb.doc(`user_profiles/${targetUserId}`);

    const batch = adminDb.batch();

    batch.update(currentUserRef, { following: FieldValue.arrayRemove(targetUserId) });
    batch.update(targetUserRef, { followers: FieldValue.arrayRemove(currentUserId) });

    await batch.commit();

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${currentUserId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in unfollowUserAction:', error);
    return { error: error.message || 'Failed to unfollow user.' };
  }
}
