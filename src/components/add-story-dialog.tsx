
"use client";

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Loader2, Image as ImageIcon, Video, Type, Link, X } from 'lucide-react';
import Image from 'next/image';

interface AddStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StatusType = "image" | "video" | "text" | "link";

export function AddStoryDialog({ open, onOpenChange }: AddStoryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusType, setStatusType] = useState<StatusType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6');
  const [link, setLink] = useState('');

  const resetState = useCallback(() => {
    setStatusType(null);
    setFile(null);
    setPreview(null);
    setText('');
    setBackgroundColor('#3b82f6');
    setLink('');
    setLoading(false);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setStatusType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You need to be logged in to post a status.", variant: "destructive" });
      return;
    }
    if (!statusType) {
      toast({ title: "No Status Type", description: "Please select a type of status to post.", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    try {
      let mediaUrl = '';
      let mediaType: StatusType = statusType;

      if (file) {
        const statusId = `${user.uid}_${Date.now()}`;
        const storageRef = ref(storage, `status/${user.uid}/${statusId}`);
        const snapshot = await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(snapshot.ref);
      } else if (statusType === 'link') {
        mediaUrl = link;
      }
      
      const createdAt = Timestamp.now();
      const expiresAt = new Timestamp(createdAt.seconds + 24 * 60 * 60, createdAt.nanoseconds);

      const statusData = {
        userId: user.uid,
        mediaUrl,
        mediaType,
        text: text || '',
        backgroundColor: mediaType === 'text' ? backgroundColor : '',
        createdAt,
        expiresAt,
        viewers: [],
      };
      
      await addDoc(collection(db, `user_profiles/${user.uid}/statuses`), statusData);

      toast({ title: "Status Posted!", description: "Your status is now live for 24 hours." });
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Error posting status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = ['#3b82f6', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Status</DialogTitle>
          <DialogDescription>Share a photo, video, or text that will disappear in 24 hours.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!statusType ? (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => document.getElementById('image-upload')?.click()}><ImageIcon /> Image</Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => document.getElementById('video-upload')?.click()}><Video /> Video</Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setStatusType('text')}><Type /> Text</Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setStatusType('link')}><Link /> Link</Button>
              <Input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              <Input id="video-upload" type="file" accept="video/mp4" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="ghost" size="icon" className="absolute top-3 right-16" onClick={resetState}><X className="h-4 w-4" /></Button>
              {statusType === 'image' && preview && <Image src={preview} alt="Preview" width={400} height={400} className="rounded-md object-cover w-full aspect-square" />}
              {statusType === 'video' && preview && <video src={preview} controls className="rounded-md w-full" />}
              
              {(statusType === 'image' || statusType === 'video' || statusType === 'text') && (
                <Textarea placeholder="Add a caption..." value={text} onChange={(e) => setText(e.target.value)} />
              )}

              {statusType === 'text' && (
                <div className="p-4 rounded-md" style={{ backgroundColor }}>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-white/80 text-lg text-center h-48 resize-none focus-visible:ring-0"
                  />
                  <div className="flex justify-center gap-2 mt-2">
                    {colorOptions.map(color => (
                      <button key={color} onClick={() => setBackgroundColor(color)} style={{ backgroundColor: color }} className="h-8 w-8 rounded-full border-2 border-white" />
                    ))}
                  </div>
                </div>
              )}

              {statusType === 'link' && (
                 <div className="space-y-2">
                    <Label htmlFor="link-input">Website URL</Label>
                    <Input id="link-input" placeholder="https://example.com" value={link} onChange={e => setLink(e.target.value)} />
                 </div>
              )}

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Status
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
