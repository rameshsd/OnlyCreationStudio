
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
import { Loader2, Video, UploadCloud, X } from 'lucide-react';
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
    if (file && file.type.startsWith('video/')) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
        toast({
            title: "Invalid file type",
            description: "Please select a video file.",
            variant: "destructive",
        })
    }
  };
  
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      toast({
        title: "Video required",
        description: "Please select a video to upload as a Short.",
        variant: "destructive",
      });
      return;
    }
    if (!user || !userData) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a Short.",
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
        caption,
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
        title: "Short Created!",
        description: "Your short is now live.",
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
            <CardTitle>Create a New Short</CardTitle>
            <CardDescription>Upload a short video to share with your followers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!previewUrl ? (
                 <Label htmlFor="short-video-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload a video</span></p>
                        <p className="text-xs text-muted-foreground">MP4, MOV, etc. (Max 100MB)</p>
                    </div>
                    <Input id="short-video-upload" type="file" className="sr-only" onChange={handleFileChange} accept="video/*" disabled={loading} />
                </Label>
            ) : (
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden border bg-black group mx-auto max-w-[300px]">
                    <video src={previewUrl} controls className="h-full w-full object-contain" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleRemoveMedia}>
                        <X className="h-4 w-4" />
                    </Button>
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
              Post Short
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
