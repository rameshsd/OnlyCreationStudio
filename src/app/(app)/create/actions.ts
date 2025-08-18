
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

    // Get the default bucket from the initialized admin app
    const bucket = adminStorage.bucket();
    
    // Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const fileName = `posts/${userId}/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(fileName);

    // Upload the file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Get the public URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // A long time in the future
    });

    return { url };
  } catch (e: any) {
    console.error('Upload failed with error:', e);
    // Attempt to return a more structured error message
    const errorMessage = e.response?.data?.error?.message || e.message || 'An unknown error occurred during upload.';
    return { error: errorMessage };
  }
}
