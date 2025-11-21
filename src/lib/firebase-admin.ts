
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
    console.error('Failed to initialize Firebase Admin automatically:', e);
    throw new Error(`Failed to initialize Firebase Admin: ${e.message}`);
  }
}

const adminApp = initializeAdmin();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };
