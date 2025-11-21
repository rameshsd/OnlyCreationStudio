
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Film, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { uploadPhoto } from './actions';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function CreatePostPage() {
  const { user, userData } = useAuth();
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
    if (!user || !userData) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let mediaUrl = '';
      let resourceType = 'image';

      if (mediaFile) {
        resourceType = mediaFile.type.startsWith('video') ? 'video' : 'image';
        const formData = new FormData();
        formData.append('imageFile', mediaFile);
        formData.append('userId', user.uid);
        const result = await uploadPhoto(formData);
        if (result.error || !result.url) {
          throw new Error(result.error || "Media upload failed.");
        }
        mediaUrl = result.url;
      }

      const postData = {
        userId: user.uid,
        username: userData.username,
        userAvatar: userData.avatarUrl || '',
        userIsVerified: userData.isVerified || false,
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
        // Re-throw the original error if you want to see it in the console as well
        throw serverError;
      });

      toast({
        title: "Post Created!",
        description: "Your post is now live.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error creating post:", error);
      // Avoid showing a toast if it's a permission error that's already handled globally
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

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
            <CardDescription>Share what's on your mind with your followers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="What's happening?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              disabled={loading}
            />
            {previewUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                    {isImage ? (
                        <Image src={previewUrl} alt="Image preview" fill className="object-contain" />
                    ) : (
                        <video src={previewUrl} controls className="h-full w-full object-contain" />
                    )}
                </div>
            )}
            <div>
              <Label htmlFor="picture" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                <ImageIcon className="h-5 w-5" />
                <Film className="h-5 w-5" />
                <span>Add a photo or video</span>
              </Label>
              <Input id="picture" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
