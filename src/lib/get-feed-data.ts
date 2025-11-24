
import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { cache } from 'react';

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    userIsVerified: boolean;
    caption: string;
    media: { type: 'image' | 'video', url: string, hint?: string }[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date; 
}

export interface StudioProfile {
    id: string;
    studioName: string;
    location: string;
    description: string;
    type: string;
    amenities: string[];
    rentableGear: string[];
    price: number;
    priceUnit: string;
    contactNumber: string;
    isDiscounted: boolean;
    discountPercentage: number;
    photos: string[];
    size: string;
    qualityGrade: string;
    services: string[];
    createdAt: Date; 
    rating?: number;
    reviewCount?: number;
}

export type FeedItem = (Omit<Post, 'createdAt'> & { type: 'post', createdAt: Date }) | (Omit<StudioProfile, 'createdAt'> & { type: 'studio', createdAt: Date });

export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: { seconds: number; nanoseconds: number; }; 
}

export interface UserProfileWithStories {
  id: string;
  username: string;
  avatarUrl: string;
  stories: Story[];
  isSelf?: boolean;
}

export interface CurrentUser {
    uid: string;
    avatarUrl: string;
}

const toDate = (timestamp: FirestoreTimestamp): Date => {
  if (!timestamp || typeof timestamp._seconds !== 'number' || typeof timestamp._nanoseconds !== 'number') {
    return new Date(); // Fallback for invalid timestamp
  }
  return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
};

const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
        const userProfileSnap = await adminDb.collection('user_profiles').doc(decodedClaims.uid).get();

        if (userProfileSnap.exists()) {
            return {
                uid: decodedClaims.uid,
                avatarUrl: userProfileSnap.data()?.avatarUrl || ''
            };
        }
        // If user profile doesn't exist, still return basic user info
        return { uid: decodedClaims.uid, avatarUrl: '' };
    } catch (error) {
        console.error("[ Server ] Error verifying session cookie:", error);
        return null;
    }
});


export const getFeedData = cache(async () => {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
       return { feedItems: [], stories: [], currentUser: null };
    }

    const postsPromise = adminDb.collection('posts').orderBy('createdAt', 'desc').limit(20).get();
    const studiosPromise = adminDb.collection('studio_profiles').orderBy('createdAt', 'desc').limit(10).get();
    const storiesPromise = adminDb.collectionGroup('stories').where('expiresAt', '>', new Date()).orderBy('expiresAt', 'desc').get();
    
    const [postsSnapshot, studiosSnapshot, storiesSnapshot] = await Promise.all([
        postsPromise,
        studiosPromise,
        storiesSnapshot
    ]);

    const feedItems: FeedItem[] = [];
    postsSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({ ...data, id: doc.id, type: 'post', createdAt: toDate(data.createdAt) } as FeedItem);
    });
    studiosSnapshot.forEach(doc => {
        const data = doc.data();
        feedItems.push({ ...data, id: doc.id, type: 'studio', createdAt: toDate(data.createdAt) } as FeedItem);
    });

    feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const storiesByUserId: Record<string, Story[]> = {};
    storiesSnapshot.forEach(doc => {
      const story = { id: doc.id, ...doc.data() } as Story & { userId: string };
      if (!storiesByUserId[story.userId]) {
        storiesByUserId[story.userId] = [];
      }
      storiesByUserId[story.userId].push(story);
    });

    const userIdsWithStories = Object.keys(storiesByUserId);
    const userProfiles: Record<string, {username: string; avatarUrl: string}> = {};

    if (userIdsWithStories.length > 0) {
        const userProfilesSnapshot = await adminDb.collection('user_profiles').where(auth.FieldPath.documentId(), 'in', userIdsWithStories).get();
        userProfilesSnapshot.forEach(doc => {
            const data = doc.data();
            userProfiles[doc.id] = { username: data.username, avatarUrl: data.avatarUrl };
        });
    }

    const finalStories: UserProfileWithStories[] = [];
    const myStories = storiesByUserId[currentUser.uid] || [];

    finalStories.push({
        id: currentUser.uid,
        username: 'My Story',
        avatarUrl: currentUser.avatarUrl,
        stories: myStories,
        isSelf: true
    });
    
    for (const userId of userIdsWithStories) {
        if (userId !== currentUser.uid && userProfiles[userId]) {
            finalStories.push({
                id: userId,
                username: userProfiles[userId].username,
                avatarUrl: userProfiles[userId].avatarUrl,
                stories: storiesByUserId[userId]
            });
        }
    }

    return { feedItems, stories: finalStories, currentUser };
});
