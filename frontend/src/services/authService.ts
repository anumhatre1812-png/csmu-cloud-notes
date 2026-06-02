import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

let nativeAuth: any = null;

async function getNativeAuth() {
  if (nativeAuth) return nativeAuth;
  try {
    const mod = await import('@capacitor-firebase/authentication');
    nativeAuth = mod.Authentication;
    return nativeAuth;
  } catch {
    return null;
  }
}

export const loginWithGoogle = async () => {
  const capAuth = await getNativeAuth();
  if (capAuth) {
    const result = await capAuth.signInWithGoogle();
    return result;
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = async () => {
  const capAuth = await getNativeAuth();
  if (capAuth) {
    await capAuth.signOut();
  }
  return firebaseSignOut(auth);
};
