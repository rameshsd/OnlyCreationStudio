
import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { auth } from 'firebase-admin';
import { cache } from 'react';

// This file is now primarily for type definitions, 
// as data fetching has been moved client-side to the dashboard component.

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
    createdAt: { seconds: number; nanoseconds: number; }; 
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
    createdAt: { seconds: number; nanoseconds: number; }; 
    rating?: number;
    reviewCount?: number;
}

export type FeedItem = (Post & { type: 'post' }) | (StudioProfile & { type: 'studio' });

export interface Story {
  id: string;
  userId: string;
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
