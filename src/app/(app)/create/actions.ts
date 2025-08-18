'use server';

import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { randomUUID } from 'crypto';

export async function uploadPhoto(formData: FormData) {
  const file = formData.get('imageFile') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split('.').pop();
  const fileName = `${randomUUID()}.${fileExtension}`;
  const storageRef = ref(storage, `posts/${fileName}`);

  // Upload file
  await uploadBytes(storageRef, fileBuffer, {
    contentType: file.type,
  });

  // Get download URL
  const url = await getDownloadURL(storageRef);

  return url;
}
