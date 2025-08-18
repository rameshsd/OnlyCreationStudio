
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminApp: admin.app.App;

if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = admin.app();
}


const adminDb = admin.firestore(adminApp);
const adminAuth = admin.auth(adminApp);
const adminStorage = admin.storage(adminApp);

export { adminDb, adminAuth, adminStorage };
