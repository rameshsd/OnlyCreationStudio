'use server';

import { v2 as cloudinary } from 'cloudinary';
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

    if (!file) return { error: 'No file provided.' };
    if (file.size === 0) return { error: 'Cannot upload an empty file.' };
    if (!userId) return { error: 'No user ID provided.' };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isVideo = file.type.startsWith('video/');
    let resource_type: 'image' | 'video' | 'raw' = isVideo ? 'video' : 'image';

    // Convert large images to raw to bypass 10MB limit
    if (!isVideo && file.size > 9_000_000) {
      resource_type = 'raw';
    }

    const uploadOptions: any = {
      folder: `posts/${userId}`,
      public_id: `${Date.now()}-${file.name}`,
      resource_type,
      chunk_size: 20000000
    };

    if (resource_type === 'video') {
      uploadOptions.quality = 'auto';
    }
    if (resource_type === 'image') {
      uploadOptions.fetch_format = 'auto';
      uploadOptions.quality = 'auto';
    }

    // Use direct base64 upload to bypass stream-related issues
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

    return { url: result.secure_url, resource_type: result.resource_type };

  } catch (e: any) {
    console.error('Upload error:', e);
    return { error: `Server error: ${e.message}` };
  }
}
