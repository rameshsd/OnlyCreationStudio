'use server';

import { adminStorage } from '@/lib/firebase-admin';

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('imageFile') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    // Using a timestamp and the original filename for uniqueness instead of crypto
    const fileName = `posts/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.${fileExtension}`;
    const bucket = adminStorage.bucket();
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
    return { error: e.message || 'An unknown error occurred during upload.' };
  }
}
