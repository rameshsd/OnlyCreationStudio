
'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { Buffer } from 'buffer';

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('imageFile') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return { error: 'No file provided.' };
    }
     if (file.size === 0) {
      return { error: 'Cannot upload an empty file.' };
    }
    if (!userId) {
      return { error: 'No user ID provided.' };
    }

    const bucket = adminStorage.bucket();
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `posts/${userId}/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', 
    });

    return { url };
  } catch (e: any) {
    console.error('Upload failed with error:', JSON.stringify(e, null, 2));
    const errorMessage = e.message || 'An unknown error occurred during upload.';
    return { error: `Server failed with: ${errorMessage}` };
  }
}
