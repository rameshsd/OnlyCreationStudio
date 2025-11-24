
import 'server-only';

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
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
    createdAt: FirestoreTimestamp;
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
    createdAt?: FirestoreTimestamp;
    rating?: number;
    reviewCount?: number;
}

export type FeedItem = (Post & { type: 'post' }) | (StudioProfile & { type: 'studio' });
