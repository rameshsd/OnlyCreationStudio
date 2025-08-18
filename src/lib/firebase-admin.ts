import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please check your .env file.');
}

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e: any) {
  throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON. Error: ${e.message}`);
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
