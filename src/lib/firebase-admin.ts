'use server';
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function initializeAdmin() {
  if (getApps().length > 0) {
    return admin.app();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env file');
  }

  let serviceAccount;
  try {
    const keyObject = JSON.parse(serviceAccountString);
    // The private_key in the JSON from the .env file has literal '\n' characters.
    // These need to be replaced with actual newline characters for the SDK to work.
    keyObject.private_key = keyObject.private_key.replace(/\\n/g, '\n');
    serviceAccount = keyObject;
  } catch (e: any) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Error: ${e.message}`);
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = initializeAdmin();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminDb, adminStorage };
