
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// NOTE: This server-side logic is being deprecated in favor of client-side mutations
// to enable better security rule debugging. It's kept here as a reference but is no longer called by the UI.

export async function followUserAction(
  currentUserId: string,
  targetUserId: string
) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { error: 'Invalid user IDs provided.' };
  }

  try {
    const currentUserRef = adminDb.doc(`user_profiles/${currentUserId}`);
    const targetUserRef = adminDb.doc(`user_profiles/${targetUserId}`);

    const batch = adminDb.batch();
    // Use FieldValue.arrayUnion for admin SDK
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

  try {
    const currentUserRef = adminDb.doc(`user_profiles/${currentUserId}`);
    const targetUserRef = adminDb.doc(`user_profiles/${targetUserId}`);

    const batch = adminDb.batch();
     // Use FieldValue.arrayRemove for admin SDK
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
