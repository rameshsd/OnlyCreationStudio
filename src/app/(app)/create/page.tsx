
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Film, ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { uploadPhoto } from '@/app/(app)/create/actions';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
  
  const removeMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('media-input') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

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
    <div className="mx-auto max-w-2xl px-2 sm:px-0">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader className="p-4">
             <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={userData?.avatarUrl} alt={userData?.username} />
                    <AvatarFallback>{userData?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{userData?.username || "User"}</p>
                    <p className="text-xs text-muted-foreground">Share with your followers</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Textarea
              placeholder={`What's on your mind, ${userData?.username || 'User'}?`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              disabled={isFormDisabled}
              className="border-0 border-y text-base focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-none"
            />
            {previewUrl && (
                <div className="p-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                        {isImage ? (
                            <Image src={previewUrl} alt="Image preview" fill className="object-contain" />
                        ) : (
                            <video src={previewUrl} controls className="h-full w-full object-contain" />
                        )}
                        <Button 
                            variant="destructive" size="icon" 
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={removeMedia}
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}
            
            <div className="p-4 flex items-center justify-around border-t">
                <Input id="media-input" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" disabled={isFormDisabled} />
                <label htmlFor="media-input" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 rounded-md">
                     <ImageIcon className="h-6 w-6 text-green-500" />
                     <span className="font-medium text-sm">Photo</span>
                </label>
                <label htmlFor="media-input" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 rounded-md">
                    <Film className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-sm">Video</span>
                </label>
            </div>
          </CardContent>
          <CardFooter className="p-4">
            <Button type="submit" disabled={isFormDisabled || (!caption.trim() && !mediaFile)} className="w-full">
              {(loading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authLoading ? 'Verifying...' : (loading ? 'Posting...' : 'Post')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    