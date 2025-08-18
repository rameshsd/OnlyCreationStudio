
import admin from 'firebase-admin';
import { getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { serviceAccount } from './service-account';

const getAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // The private_key in the service account needs to have its escaped newlines replaced
  // with actual newline characters to be parsed correctly by the SDK.
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
        ...serviceAccount,
        private_key: privateKey,
    }),
    storageBucket: 'creator-canvas-w47i3.appspot.com',
  });
};

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminDb, adminStorage };
