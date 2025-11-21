
import admin from 'firebase-admin';
import { App, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from '@/firebase/config';

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // When deployed, this will use the GOOGLE_APPLICATION_CREDENTIALS env var.
  // In local dev, it will use the service account file.
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : {};

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (e: any) {
    // If GOOGLE_APPLICATION_CREDENTIALS_JSON is not set, we can ignore the error in dev
    if (process.env.NODE_ENV !== 'development' || Object.keys(serviceAccount).length > 0) {
        console.error('Failed to initialize Firebase Admin automatically:', e);
        throw new Error(`Failed to initialize Firebase Admin: ${e.message}`);
    }
    // In dev, with no credentials, we might not need admin sdk, so don't throw
    console.warn("Firebase Admin SDK not initialized. This is expected in local development without service account credentials.")
    return {} as App; // Return a dummy app object
  }
}

const adminApp = initializeAdmin();
const adminDb = getApps().length > 0 ? getFirestore(adminApp) : null;
const adminStorage = getApps().length > 0 ? getStorage(adminApp) : null;

export { adminDb, adminStorage };
