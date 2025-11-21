
'use server';

import { cloudinary } from '@/lib/cloudinary';
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

    const uploadPromise = new Promise<{ url?: string; error?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `posts/${userId}`,
          public_id: `${Date.now()}-${file.name}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failed:', error);
            reject({ error: `Cloudinary upload failed: ${error.message}` });
          } else if (result) {
            resolve({ url: result.secure_url });
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    return await uploadPromise;

  } catch (e: any) {
    console.error('Upload failed with error:', JSON.stringify(e, null, 2));
    const errorMessage = e.message || 'An unknown error occurred during upload.';
    return { error: `Server failed with: ${errorMessage}` };
  }
}
