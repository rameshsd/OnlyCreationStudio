import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { cache } from 'react';

// Define types for better type safety
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
    createdAt: Date; // Converted from Firestore Timestamp
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
    createdAt: Date; // Converted
    rating?: number;
    reviewCount?: number;
}

export type FeedItem = (Omit<Post, 'createdAt'> & { type: 'post', createdAt: Date }) | (Omit<StudioProfile, 'createdAt'> & { type: 'studio', createdAt: Date });


export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
}

export interface UserProfileWithStories {
  id: string;
  username: string;
  avatarUrl: string;
  stories: Story[];
}

export interface CurrentUser {
    uid: string;
    avatarUrl: string;
}


// Function to convert Firestore Timestamp to JS Date
const toDate = (timestamp: FirestoreTimestamp): Date => {
  return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
};

// Helper function to safely get the current user from the session cookie
const getCurrentUser = async (): Promise<{ uid: string; avatarUrl: string; } | null> => {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth().verifySessionCookie(sessionCookie, true);
        const userProfileSnap = await adminDb.collection('user_profiles').doc(decodedClaims.uid).get();
        if (userProfileSnap.exists()) {
            return {
                uid: decodedClaims.uid,
                avatarUrl: userProfileSnap.data()?.avatarUrl || ''
            };
        }
        return null;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return null;
    }
};

export const getFeedData = cache(async () => {
    if (!adminDb) {
        throw new Error("Firebase Admin SDK not initialized.");
    }
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
       return { feedItems: [], stories: [], currentUser: null };
    }

    // Fetch posts
    const postsPromise = adminDb.collection('posts').orderBy('createdAt', 'desc').limit(20).get();
    
    // Fetch studios
    const studiosPromise = adminDb.collection('studio_profiles').orderBy('createdAt', 'desc').limit(10).get();

    // Fetch user profiles and their stories
    const usersPromise = adminDb.collection('user_profiles').limit(50).get();
    
    const [postsSnapshot, studiosSnapshot, usersSnapshot] = await Promise.all([
        postsPromise,
        studiosPromise,
        usersPromise
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

    // Sort combined feed by date
    feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Process stories
    const stories: UserProfileWithStories[] = [];
    for (const userDoc of usersSnapshot.docs) {
        const userProfile = { id: userDoc.id, ...userDoc.data() };
        const storiesSnapshot = await adminDb.collection('user_profiles').doc(userDoc.id).collection('stories').where('expiresAt', '>', new Date()).orderBy('expiresAt', 'desc').get();
        
        if (!storiesSnapshot.empty) {
            stories.push({
                id: userProfile.id,
                username: userProfile.username,
                avatarUrl: userProfile.avatarUrl,
                stories: storiesSnapshot.docs.map(storyDoc => {
                    const storyData = storyDoc.data();
                    return {
                        id: storyDoc.id,
                        ...storyData,
                        createdAt: toDate(storyData.createdAt),
                        expiresAt: toDate(storyData.expiresAt),
                    } as Story;
                })
            });
        }
    }

    return { feedItems, stories, currentUser };
});
