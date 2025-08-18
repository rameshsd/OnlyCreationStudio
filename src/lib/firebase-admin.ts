
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { serviceAccount } from './service-account';

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminDb, adminStorage };
