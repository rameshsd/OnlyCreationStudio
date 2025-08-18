'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

export async function uploadPhoto(formData: FormData): Promise<string> {
  const file = formData.get('imageFile') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split('.').pop();
  const fileName = `${randomUUID()}.${fileExtension}`;
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(`posts/${fileName}`);

  await fileRef.save(fileBuffer, {
    metadata: {
      contentType: file.type,
    },
  });
  
  // Get public URL
  const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // A long time in the future
  });

  return url;
}
