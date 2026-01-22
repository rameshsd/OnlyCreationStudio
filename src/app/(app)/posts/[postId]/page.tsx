
'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { db } from '@/lib/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { PostCard } from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Post, Comment } from '@/lib/types';


const PostPageSkeleton = () => (
    <div>
        <Skeleton className="h-[500px] w-full" />
        <Card className="mt-4">
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);


export default function PostPage() {
    const params = useParams();
    const postId = params.postId as string;
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const postRef = useMemo(() => postId ? doc(db, 'posts', postId) : null, [postId]);
    const { data: post, isLoading: postLoading } = useDoc<Post>(postRef);

    const commentsQuery = useMemo(() => postId ? query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'desc')) : null, [postId]);
    const { data: comments, isLoading: commentsLoading } = useCollection<Comment>(commentsQuery);

    const handleAddComment = async () => {
        if (!user || !userData || !newComment.trim()) return;
        setIsSubmitting(true);
        
        const commentData = {
            userId: user.uid,
            username: userData.username,
            userAvatar: userData.avatarUrl || '',
            text: newComment.trim(),
            createdAt: serverTimestamp(),
        };

        const postDocRef = doc(db, 'posts', postId);
        const commentsColRef = collection(db, 'posts', postId, 'comments');
        
        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postDocRef);
                if (!postDoc.exists()) {
                    throw "Post does not exist!";
                }
                
                const newCommentCount = (postDoc.data().comments || 0) + 1;
                transaction.update(postDocRef, { comments: newCommentCount });

                const newCommentRef = doc(commentsColRef); // auto-generate ID
                transaction.set(newCommentRef, commentData);
            });
            setNewComment('');
        } catch (error: any) {
            console.error("Error adding comment:", error);
            toast({
                title: 'Error',
                description: "Could not post your comment. Please try again.",
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (postLoading) {
        return <PostPageSkeleton />;
    }

    if (!post) {
        return <div className="text-center py-10">Post not found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <PostCard post={post} />
            
            <Card>
                <CardHeader>
                    <CardTitle>Comments ({comments?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {user && (
                        <div className="flex gap-3">
                            <Avatar>
                                <AvatarImage src={userData?.avatarUrl} />
                                <AvatarFallback>{userData?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea 
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Post Comment
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {commentsLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.userAvatar} />
                                    <AvatarFallback>{comment.username.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{comment.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
