
import admin from 'firebase-admin';
import { App, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from '@/firebase/config';

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // Use the client-side config for server-side initialization details
    return admin.initializeApp({
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
