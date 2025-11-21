
import admin from 'firebase-admin';
import { App, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if the required environment variables are set.
  // In a Firebase/Google Cloud environment, these are often set automatically.
  if (!process.env.GCLOUD_PROJECT && !process.env.FIREBASE_PROJECT_ID) {
    throw new Error(`
      Failed to initialize Firebase Admin: The GCLOUD_PROJECT or FIREBASE_PROJECT_ID environment variable is not set.
      This is required for the Admin SDK to authenticate.
      If running locally, ensure you have authenticated with the Google Cloud CLI ('gcloud auth application-default login').
    `);
  }
  
  try {
    // When deployed in a Google Cloud environment (like Cloud Run, Cloud Functions, App Engine),
    // or when using 'gcloud auth application-default login' locally,
    // the Admin SDK can automatically find the credentials.
    return admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
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
