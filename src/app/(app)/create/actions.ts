'use server';

import { v2 as cloudinary } from 'cloudinary';
import streamifier from "streamifier";
import { Buffer } from "buffer";

cloudinary.config({
  cloud_name: 'dkmgby1tc',
  api_key: '866268445612429',
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; resource_type?: string; error?: string }> {
  try {
    const file = formData.get("imageFile") as File;
    const userId = formData.get("userId") as string;

    if (!file) return { error: "No file provided." };
    if (!userId) return { error: "No user ID provided." };

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🚀 UPLOAD EVERYTHING THROUGH VIDEO ENDPOINT
    const uploadOptions: any = {
      folder: `posts/${userId}`,
      public_id: `${Date.now()}-${file.name}`,
      resource_type: "video",   // <-- THE KEY FIX
      chunk_size: 20_000_000,
      quality: "auto",
      fetch_format: "auto"
    };

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (err, result) => {
          if (err) {
            console.error('Cloudinary upload failed:', err);
            reject(new Error(`Upload failed: ${err.message}`));
          }
          else if (result) {
            resolve(result);
          } else {
             reject(new Error('Cloudinary returned no result.'));
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    return {
      url: (result as any).secure_url,
      resource_type: (result as any).resource_type
    };

  } catch (e: any) {
    console.error("Upload action failed with error:", e);
    const errorMessage = e.message || 'An unknown server error occurred during upload.';
    return { error: `Server error: ${errorMessage}` };
  }
}