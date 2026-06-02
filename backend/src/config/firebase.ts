import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const normalizePrivateKey = (key?: string) => {
  if (!key) return undefined;

  return key
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');
};

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
} as admin.ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth: Auth = admin.auth();
export default admin;
