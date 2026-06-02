import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const loginWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, credential);
    }
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = async () => {
  if (Capacitor.isNativePlatform()) {
    try { await FirebaseAuthentication.signOut(); } catch {}
  }
  return firebaseSignOut(auth);
};
