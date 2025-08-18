
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountString) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

const serviceAccount = JSON.parse(serviceAccountString);
// The private_key in the JSON from the .env file has literal '\n' characters.
// These need to be replaced with actual newline characters for the SDK to work.
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminDb, adminStorage };
