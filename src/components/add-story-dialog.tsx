
"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { uploadPhoto } from '@/app/(app)/create/actions';
import { Loader2, UploadCloud } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AddStoryDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddStoryDialog({ open, onOpenChange }: AddStoryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setMediaFile(null);
    setPreviewUrl(null);
    setLoading(false);
    if(onOpenChange) {
      onOpenChange(false);
    }
  }

  const handleSubmit = async () => {
    if (!mediaFile || !user) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload.",
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

      const mediaType = result.resource_type === 'video' ? 'video' : 'image';
      const createdAt = Timestamp.now();
      const expiresAt = new Timestamp(createdAt.seconds + 24 * 60 * 60, createdAt.nanoseconds);

      const storyData = {
        userId: user.uid,
        mediaUrl: result.url,
        mediaType: mediaType,
        createdAt: createdAt,
        expiresAt: expiresAt,
      };

      const storiesCollectionRef = collection(db, "user_profiles", user.uid, "stories");
      await addDoc(storiesCollectionRef, storyData).catch(serverError => {
         const permissionError = new FirestorePermissionError({
            path: storiesCollectionRef.path,
            operation: 'create',
            requestResourceData: storyData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      toast({
        title: "Story Posted!",
        description: "Your story is now live for 24 hours.",
      });
      handleClose();

    } catch (error: any) {
        toast({
            title: "Error posting story",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive"
        });
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Your Story</DialogTitle>
          <DialogDescription>
            Upload an image or video. Your story will be visible for 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label
            htmlFor="story-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary relative"
          >
            {previewUrl ? (
              mediaFile?.type.startsWith('image/') ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover rounded-lg" />
              ) : (
                <video src={previewUrl} className="object-cover h-full w-full rounded-lg" controls />
              )
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Image or Video</p>
              </div>
            )}
            <Input id="story-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" disabled={loading}/>
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!mediaFile || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
