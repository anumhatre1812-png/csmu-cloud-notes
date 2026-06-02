import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const loginWithGoogle = async () => {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
  }
  throw new Error('No ID token from native plugin');
};

export const logout = async () => {
  try {
    await FirebaseAuthentication.signOut();
  } catch {}
  return firebaseSignOut(auth);
};
