
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
  following?: string[];
  // Add other profile fields as needed
}

export interface UserProfileWithStories extends UserProfile {
  stories: Status[];
  hasUnseen: boolean;
}

export interface Short {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Timestamp;
  user: {
      name: string;
      avatar: string;
  }
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantInfo: {
    userId: string;
    username: string;
    avatarUrl: string;
  }[];
  lastMessageText?: string;
  lastMessageSentAt?: Timestamp;
  lastMessageReadBy?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

    