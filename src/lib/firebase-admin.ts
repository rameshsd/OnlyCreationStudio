
import admin from 'firebase-admin';
import { App, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { firebaseConfig } from '@/firebase/config';

function createAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // for authentication, which is the standard for server environments.
  return initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

const adminApp = createAdminApp();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDb, adminStorage };
