
import type { Timestamp } from 'firebase/firestore';

export interface Status {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "text" | "link";
  text?: string;
  backgroundColor?: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  viewers: string[];
  duration?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  // Add other profile fields as needed
}

export interface UserProfileWithStories extends UserProfile {
  stories: Status[];
  hasUnseen: boolean;
}
