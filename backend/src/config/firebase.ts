import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const parseJson = (value?: string) => {
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseBase64Json = (value?: string) => {
  if (!value) return undefined;

  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
  } catch {
    return undefined;
  }
};

const normalizePrivateKey = (value?: string) => {
  if (!value) return undefined;

  const trimmedValue = value.trim();
  const jsonValue = parseJson(trimmedValue) || parseBase64Json(trimmedValue);
  const key = typeof jsonValue?.private_key === 'string' ? jsonValue.private_key : trimmedValue;

  const normalizedKey = key
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');

  if (!normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('FIREBASE_PRIVATE_KEY must be the private_key from a Firebase service account JSON file.');
  }

  return normalizedKey;
};

const serviceAccountJson =
  parseJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) ||
  parseBase64Json(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

const serviceAccount = {
  projectId: serviceAccountJson?.project_id || process.env.FIREBASE_PROJECT_ID,
  clientEmail: serviceAccountJson?.client_email || process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: normalizePrivateKey(
    serviceAccountJson?.private_key || process.env.FIREBASE_PRIVATE_KEY
  ),
} as admin.ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth: Auth = admin.auth();
export default admin;
