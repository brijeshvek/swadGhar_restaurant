import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

let app;
let authInstance = null;
let googleProvider = null;

try {
  if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } else {
    console.warn('Firebase API key is missing. Please set VITE_FIREBASE_API_KEY in .env');
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
}

export const auth = authInstance;
export { googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };

export const signInWithGooglePopup = async () => {
  if (!authInstance || !googleProvider) {
    throw new Error('Firebase Auth is not configured. Please add your Firebase credentials to .env file.');
  }
  return await signInWithPopup(authInstance, googleProvider);
};
