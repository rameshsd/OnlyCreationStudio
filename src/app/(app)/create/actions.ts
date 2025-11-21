
'use server';

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // The config is now handled in lib/cloudinary.ts which is loaded by Next.js
    // ensuring environment variables are present.

    const uploadPromise = new Promise<{ url?: string; error?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `posts/${userId}`,
          public_id: `${Date.now()}-${file.name}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failed:', error);
            // Reject with a more specific error from Cloudinary
            reject({ error: `Upload failed: ${error.message}` });
          } else if (result) {
            resolve({ url: result.secure_url });
          } else {
            reject({ error: 'Cloudinary returned no result.' });
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    return await uploadPromise;

  } catch (e: any) {
    console.error('Upload action failed with error:', JSON.stringify(e, null, 2));
    // Pass the specific error message from the promise rejection, or a fallback.
    const errorMessage = e.error || e.message || 'An unknown server error occurred during upload.';
    return { error: `Server error: ${errorMessage}` };
  }
}
