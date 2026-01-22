
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Bookmark, Clock, MapPin, Star } from 'lucide-react';
import type { StudioProfile } from '@/app/(app)/studios/[id]/page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, setDoc, deleteDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function StudioPostCard({ studio }: { studio: StudioProfile }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(studio.likes || 0);
    const [isLikePending, setIsLikePending] = useState(false);
    const [isSavePending, setIsSavePending] = useState(false);
    
    useEffect(() => {
        if (!user?.uid || !studio.id) return;

        const likeRef = doc(db, 'studio_profiles', studio.id, 'likes', user.uid);
        const unsubscribeLike = onSnapshot(likeRef, (doc) => setIsLiked(doc.exists()));

        const saveRef = doc(db, 'users', user.uid, 'saved_studios', studio.id);
        const unsubscribeSave = onSnapshot(saveRef, (doc) => setIsSaved(doc.exists()));

        return () => {
            unsubscribeLike();
            unsubscribeSave();
        };
    }, [user?.uid, studio.id]);

    const handleLikeToggle = async () => {
        if (!user || isLikePending) return;
        setIsLikePending(true);

        const studioRef = doc(db, 'studio_profiles', studio.id);
        const likeRef = doc(db, 'studio_profiles', studio.id, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const studioDoc = await transaction.get(studioRef);
                if (!studioDoc.exists()) throw "Studio does not exist!";
                
                const currentLikes = studioDoc.data().likes || 0;
                const likeDoc = await transaction.get(likeRef);

                if (likeDoc.exists()) {
                    transaction.update(studioRef, { likes: currentLikes - 1 });
                    transaction.delete(likeRef);
                } else {
                    transaction.update(studioRef, { likes: currentLikes + 1 });
                    transaction.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
                }
            });
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

        const saveRef = doc(db, 'users', user.uid, 'saved_studios', studio.id);

        try {
            if (isSaved) {
                await deleteDoc(saveRef);
                toast({ title: "Removed from Saved Studios" });
            } else {
                await setDoc(saveRef, { studioId: studio.id, userId: user.uid, createdAt: serverTimestamp() });
                toast({ title: "Added to Saved Studios" });
            }
        } catch (e: any) {
            console.error("Save failed: ", e);
            toast({
                title: "Error",
                description: "Could not update saved studios. Please try again.",
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
    
    const handleComment = () => toast({ title: "Coming Soon!", description: "Commenting on studios is under development." });
    const handleShare = () => toast({ title: "Coming Soon!", description: "Sharing functionality is under development." });

    const rating = studio.rating || 4.8;
    const reviewCount = studio.reviewCount || 24;

    return (
        <Card className="bg-card border-none rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 bg-primary/20 text-primary font-bold">
                             <AvatarFallback>{studio.studioName?.substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Link href={`/studios/${studio.id}`} className="font-bold hover:underline">{studio.studioName}</Link>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">{studio.location?.address}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                        <Badge variant="outline" className="font-normal">{studio.type || 'Photography Studio'}</Badge>
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Link href={`/studios/${studio.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-secondary">
                        {studio.photos?.[0] ? (
                            <Image src={studio.photos[0]} alt={studio.studioName} fill className="object-cover" data-ai-hint="studio interior" />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-purple-500">
                                <p className="text-white text-3xl font-bold">Studio Photo</p>
                            </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">
                            <Star className="h-3 w-3 mr-1.5 fill-yellow-400 text-yellow-400" />
                           {rating} ({reviewCount})
                        </Badge>
                    </div>
                </Link>
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-3">
                <div className="w-full flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLikeToggle} disabled={isLikePending} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
                            <span className="text-sm font-medium">{studio.likes || 0}</span>
                        </button>
                        <button onClick={handleComment} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">{studio.comments || 0}</span>
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
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{studio.location?.address}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                        ₹{studio.price}/hour
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}
