'use server';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { randomUUID } from 'crypto';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

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
