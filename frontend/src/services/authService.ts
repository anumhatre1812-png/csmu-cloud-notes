import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
};

export const handleRedirectResult = async () => {
  return getRedirectResult(auth);
};

export const logout = async () => {
  return firebaseSignOut(auth);
};
