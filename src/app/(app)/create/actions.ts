
'use server';

import { adminStorage } from '@/lib/firebase-admin';

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('imageFile') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      throw new Error('No file provided.');
    }
    if (!userId) {
      throw new Error('No user ID provided.');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
    
    // Construct a user-specific path
    const fileName = `posts/${userId}/${Date.now()}_${cleanFileName}.${fileExtension}`;
    
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('Firebase Storage bucket name is not configured.');
    }

    // Explicitly specify the bucket name
    const bucket = adminStorage.bucket(bucketName);
    const fileRef = bucket.file(fileName);

    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Get public URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // A long time in the future
    });

    return { url };
  } catch (e: any) {
    console.error('Upload failed:', e);
    // Return the actual error message to the client for better debugging
    // Stringify the error object to get more details in the client console
    return { error: JSON.stringify(e, Object.getOwnPropertyNames(e)) };
  }
}
