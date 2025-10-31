
import admin from 'firebase-admin';
import { App, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { serviceAccount } from './service-account';

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // The serviceAccount object is imported from a git-ignored file.
    // This is a more robust way to handle credentials than env variables.
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin:', e);
    // In a real app, you might want to handle this more gracefully
    // For now, we'll re-throw, as the admin features won't work.
    throw new Error(`Failed to initialize Firebase Admin: ${e.message}`);
  }
}

const adminApp = initializeAdmin();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };
