
import admin from 'firebase-admin';
import { App, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function initializeAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !projectId || !clientEmail) {
    throw new Error('Missing Firebase Admin environment variables.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: 'creator-canvas-w47i3.appspot.com',
    });
  } catch (e: any) {
    console.error('Failed to initialize Firebase Admin:', e);
    throw new Error(`Failed to initialize Firebase Admin: ${e.message}`);
  }
}

const adminApp = initializeAdmin();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };
