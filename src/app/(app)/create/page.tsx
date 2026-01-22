
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Film, ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';
import { uploadPhoto } from '@/app/(app)/create/actions';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CreatePostPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsImage(file.type.startsWith('image/'));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaFile) {
      toast({
        title: "Nothing to post",
        description: "Please write a caption or select an image/video.",
        variant: "destructive",
      });
      return;
    }
    if (authLoading || !user) {
        toast({
            title: "Authentication Error",
            description: "Please wait for authentication to complete or log in.",
            variant: "destructive",
        });
        return;
    }

    setLoading(true);

    try {
      let mediaUrl = '';
      let resourceType = 'image';

      if (mediaFile) {
        const formData = new FormData();
        formData.append('imageFile', mediaFile);
        formData.append('userId', user.uid);
        const result = await uploadPhoto(formData);
        if (result.error || !result.url) {
          throw new Error(result.error || "Media upload failed.");
        }
        mediaUrl = result.url;
        resourceType = result.resource_type === 'video' ? 'video' : 'image';
      }

      const postData = {
        userId: user.uid,
        username: userData?.username || user.email?.split('@')[0] || 'Anonymous',
        userAvatar: userData?.avatarUrl || '',
        userIsVerified: userData?.isVerified || false,
        caption: caption,
        media: mediaUrl ? [{ type: resourceType, url: mediaUrl }] : [],
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts'), postData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'posts',
            operation: 'create',
            requestResourceData: postData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      toast({
        title: "Post Created!",
        description: "Your post is now live.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      // Avoid showing a toast if it's a permission error handled globally
      if (!(error instanceof FirestorePermissionError)) {
          toast({
            title: "Error creating post",
            description: error.message || "Failed to create post. Please try again.",
            variant: "destructive",
          });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || authLoading;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userData?.avatarUrl} alt={userData?.username} data-ai-hint="user avatar"/>
                <AvatarFallback>{userData?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{userData?.username}</p>
                <p className="text-sm text-muted-foreground">Share a post to your feed</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`What's on your mind, ${userData?.username}?`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              className="text-lg border-none focus-visible:ring-0 resize-none p-0"
              disabled={loading}
            />
            {previewUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-black group">
                    {isImage ? (
                        <Image src={previewUrl} alt="Image preview" fill className="object-contain" />
                    ) : (
                        <video src={previewUrl} controls className="h-full w-full object-contain" />
                    )}
                     <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleRemoveMedia}>
                        <Film className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </CardContent>
          <div className="p-4 border-t">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                      <Label htmlFor="picture-upload" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary p-2 rounded-md transition-colors">
                        <ImageIcon className="h-6 w-6 text-green-500" />
                        <span className="font-semibold hidden sm:inline">Photo</span>
                      </Label>
                      <Input id="picture-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={loading} />
                      
                       <Label htmlFor="video-upload" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary p-2 rounded-md transition-colors">
                        <Video className="h-6 w-6 text-blue-500" />
                         <span className="font-semibold hidden sm:inline">Video</span>
                      </Label>
                      <Input id="video-upload" type="file" className="sr-only" onChange={handleFileChange} accept="video/*" disabled={loading} />
                      
                      <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                        <Link href="/create/short" className="flex items-center gap-2 p-2">
                          <Film className="h-6 w-6 text-purple-500"/>
                          <span className="font-semibold ml-2 hidden sm:inline">Short</span>
                        </Link>
                      </Button>
                  </div>

                  <Button type="submit" disabled={loading || (!caption && !mediaFile)} className="w-full sm:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post
                  </Button>
              </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
