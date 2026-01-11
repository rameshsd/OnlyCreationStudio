
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
import { Loader2, Video } from 'lucide-react';
import { uploadPhoto } from '../actions';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function CreateShortPage() {
  const { user, userData } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive",
        });
        return;
      }
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      toast({
        title: "No video selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }
    if (!user || !userData) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a short.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('imageFile', mediaFile);
      formData.append('userId', user.uid);
      const result = await uploadPhoto(formData);

      if (result.error || !result.url) {
        throw new Error(result.error || "Media upload failed.");
      }
      
      const shortData = {
        userId: user.uid,
        username: userData.username,
        userAvatar: userData.avatarUrl || '',
        videoUrl: result.url,
        caption: caption,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'shorts'), shortData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'shorts',
            operation: 'create',
            requestResourceData: shortData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      toast({
        title: "Short Uploaded!",
        description: "Your short is now available.",
      });
      router.push('/shorts');
    } catch (error: any) {
      console.error("Error creating short:", error);
      if (!(error instanceof FirestorePermissionError)) {
          toast({
            title: "Error creating short",
            description: error.message || "Failed to create short. Please try again.",
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
            <CardTitle>Upload a New Short</CardTitle>
            <CardDescription>Share a short video with your followers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="video-file" className="block mb-2">Video File</Label>
              <Input id="video-file" type="file" onChange={handleFileChange} accept="video/*" disabled={loading} />
            </div>

            {previewUrl && (
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden border bg-black">
                    <video src={previewUrl} controls className="h-full w-full object-contain" />
                </div>
            )}
            
            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              disabled={loading}
            />

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading || !mediaFile}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Short
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    