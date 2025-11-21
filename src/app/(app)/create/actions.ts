
'use server';

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { Buffer } from 'buffer';

cloudinary.config({ 
  cloud_name: 'dkmgby1tc', 
  api_key: '866268445612429', 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; resource_type?: string; error?: string }> {
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

    const isVideo = file.type.startsWith('video/');
    const resource_type = isVideo ? 'video' : 'image';

    const uploadOptions: any = {
      folder: `posts/${userId}`,
      public_id: `${Date.now()}-${file.name}`,
      resource_type: resource_type,
    };

    if (isVideo) {
      // For videos, Cloudinary automatically handles compression.
      // We can specify quality settings if needed, but 'auto' is a good default.
      uploadOptions.quality = 'auto';
    } else {
      // For images, we can apply auto format and quality.
      uploadOptions.fetch_format = 'auto';
      uploadOptions.quality = 'auto';
    }


    const uploadPromise = new Promise<{ url?: string; resource_type?: string; error?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failed:', error);
            reject({ error: `Upload failed: ${error.message}` });
          } else if (result) {
            resolve({ url: result.secure_url, resource_type: result.resource_type });
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
    const errorMessage = e.error || e.message || 'An unknown server error occurred during upload.';
    return { error: `Server error: ${errorMessage}` };
  }
}
