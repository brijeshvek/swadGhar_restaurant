import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDwdqlDDlaEI8Ej6WHQfPQbkGbNs-ptYZo",
  authDomain: "swadghar-restuarant.firebaseapp.com",
  projectId: "swadghar-restuarant",
  storageBucket: "swadghar-restuarant.firebasestorage.app",
  messagingSenderId: "217743118110",
  appId: "1:217743118110:web:e205f3c263226c4310430f",
  measurementId: "G-1YJLTDCZDC"
};

let app;
let authInstance = null;
let googleProvider = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
}

export const auth = authInstance;
export { googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };

export const signInWithGooglePopup = async () => {
  if (!authInstance || !googleProvider) {
    throw new Error('Firebase Auth is not properly initialized.');
  }
  return await signInWithPopup(authInstance, googleProvider);
};
