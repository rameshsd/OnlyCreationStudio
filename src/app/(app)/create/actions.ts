
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

    const buffer = Buffer.from(await file.arrayBuffer());

    // --------- IMPORTANT TRICK ----------
    // Uploading with fake mime to force RAW upload
    const base64Data = `data:application/octet-stream;base64,${buffer.toString("base64")}`;
    // ------------------------------------

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `posts/${userId}`,
      public_id: `${Date.now()}-${file.name}`,
      resource_type: "raw",     // force RAW endpoint
      chunk_size: 20_000_000
    });

    return {
      url: result.secure_url,
      resource_type: result.resource_type
    };

  } catch (error: any) {
    console.error("Cloudinary RAW upload error:", error);
    return { error: `Server error: ${error.message}` };
  }
}
