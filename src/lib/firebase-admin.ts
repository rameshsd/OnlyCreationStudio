
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }
  
  const serviceAccount = JSON.parse(serviceAccountString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminDb, adminStorage };
