import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Capacitor } from '@capacitor/core';

export const loginWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    let result;
    try {
      result = await FirebaseAuthentication.signInWithGoogle();
    } catch {
      result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
    }
    const idToken = result.credential?.idToken;
    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, credential);
    }
    throw new Error('No ID token from native plugin');
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  try {
    await FirebaseAuthentication.signOut();
  } catch {}
  return firebaseSignOut(auth);
};
