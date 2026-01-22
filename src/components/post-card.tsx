
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayCircle, Star, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface Media {
    type: 'image' | 'video';
    url: string;
    hint?: string;
}

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
    media: Media[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: FirestoreTimestamp;
}

const MediaContent = ({ mediaItem }: { mediaItem: Media }) => {
    if (mediaItem.type === 'video') {
        return (
            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video src={mediaItem.url} className="w-full h-full object-cover" controls />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="w-16 h-16 text-white/70" />
                </div>
            </div>
        )
    }
    return <Image src={mediaItem.url} alt="Post media" fill className="object-cover" data-ai-hint={mediaItem.hint} />;
}

export function PostCard({ post }: { post: Post }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isLikePending, setIsLikePending] = useState(false);
    const [isSavePending, setIsSavePending] = useState(false);

    useEffect(() => {
        if (!user?.uid || !post.id) return;

        const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
        const unsubscribeLike = onSnapshot(likeRef, (doc) => setIsLiked(doc.exists()));

        const saveRef = doc(db, 'users', user.uid, 'bookmarks', post.id);
        const unsubscribeSave = onSnapshot(saveRef, (doc) => setIsSaved(doc.exists()));

        return () => {
            unsubscribeLike();
            unsubscribeSave();
        };
    }, [user?.uid, post.id]);

    const handleLikeToggle = async () => {
        if (!user || isLikePending) return;
        setIsLikePending(true);

        const postRef = doc(db, 'posts', post.id);
        const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                const likeDoc = await transaction.get(likeRef);
                if (!postDoc.exists()) throw "Post does not exist!";
                
                const currentLikes = postDoc.data().likes || 0;

                if (likeDoc.exists()) {
                    transaction.update(postRef, { likes: currentLikes - 1 });
                    transaction.delete(likeRef);
                } else {
                    transaction.update(postRef, { likes: currentLikes + 1 });
                    transaction.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
                }
            });
            // Optimistic update handled by local state, confirmed by onSnapshot
        } catch (e: any) {
            console.error("Like transaction failed: ", e);
            toast({
                title: "Error",
                description: "Could not update like. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLikePending(false);
        }
    };

    const handleSaveToggle = async () => {
        if (!user || isSavePending) return;
        setIsSavePending(true);

        const saveRef = doc(db, 'users', user.uid, 'bookmarks', post.id);

        try {
            if (isSaved) {
                await deleteDoc(saveRef);
                toast({ title: "Removed from Bookmarks" });
            } else {
                await setDoc(saveRef, { postId: post.id, userId: user.uid, createdAt: serverTimestamp() });
                toast({ title: "Added to Bookmarks" });
            }
        } catch (e: any) {
            console.error("Save failed: ", e);
            toast({
                title: "Error",
                description: "Could not update bookmarks. Please try again.",
                variant: "destructive",
            });
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: saveRef.path,
                operation: isSaved ? 'delete' : 'create',
            }));
        } finally {
            setIsSavePending(false);
        }
    };
    
    const handleComment = () => toast({ title: "Coming Soon!", description: "Commenting functionality is under development." });
    const handleShare = () => toast({ title: "Coming Soon!", description: "Sharing functionality is under development." });

    const formatTimestamp = (timestamp: FirestoreTimestamp) => {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
                 <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.userId}`}>
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={post.userAvatar} alt={post.username} data-ai-hint="user avatar" />
                            <AvatarFallback>{post.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href={`/profile/${post.userId}`} className="flex items-center gap-1.5 hover:underline">
                            <p className="font-bold">{post.username}</p>
                            {post.userIsVerified && <Star className="h-4 w-4 text-blue-500 fill-current" />}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{post.username} &middot; {formatTimestamp(post.createdAt)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {post.caption && <p className="text-sm whitespace-pre-line px-4 mb-4">{post.caption}</p>}
                
                {post.media && post.media.length > 0 && (
                     <div className="relative aspect-[4/3] bg-secondary">
                        <MediaContent mediaItem={post.media[0]} />
                    </div>
                )}
            </CardContent>
             <CardFooter className="p-4 flex flex-col items-start gap-3">
                <div className="w-full flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLikeToggle} disabled={isLikePending} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
                            <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button onClick={handleComment} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                    <Button onClick={handleSaveToggle} disabled={isSavePending} variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-primary", isSaved && "text-primary")}>
                        <Bookmark className={cn("h-5 w-5", isSaved && "fill-primary")} />
                    </Button>
                </div>
                 <div className="w-full h-px bg-border my-1"></div>
                 <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       {/* Placeholder for location if available on post */}
                    </div>
                    <Button asChild>
                           <Link href={`/posts/${post.id}`}>View Post</Link>
                    </Button>
                 </div>
            </CardFooter>
        </Card>
    );
}
