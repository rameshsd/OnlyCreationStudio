
import admin from 'firebase-admin';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccount } from './service-account';

const getAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
};

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };
