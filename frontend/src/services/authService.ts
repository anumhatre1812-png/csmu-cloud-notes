import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const loginWithGoogle = async () => {
  try {
    console.log('[Auth] Attempting native Google sign-in via Capacitor plugin');
    const result = await FirebaseAuthentication.signInWithGoogle();
    console.log('[Auth] Native sign-in result:', result);
    const idToken = result.credential?.idToken;
    if (idToken) {
      console.log('[Auth] Got ID token, signing in with credential');
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, credential);
    }
    console.log('[Auth] No ID token, falling back to popup');
  } catch (e) {
    console.error('[Auth] Native sign-in failed:', e);
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = async () => {
  try {
    await FirebaseAuthentication.signOut();
  } catch {}
  return firebaseSignOut(auth);
};
