import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

function isCapacitor(): boolean {
  try {
    return typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export const loginWithGoogle = async () => {
  if (isCapacitor()) {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        return signInWithCredential(auth, credential);
      }
    } catch (e) {
      console.error('Native Google sign-in failed, falling back to web:', e);
    }
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = async () => {
  if (isCapacitor()) {
    try { await FirebaseAuthentication.signOut(); } catch {}
  }
  return firebaseSignOut(auth);
};
