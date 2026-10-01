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

// Setup Firebase invisible reCAPTCHA for Phone SMS OTP
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (!authInstance) return null;
  
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Recaptcha clear notice:', e);
    }
    window.recaptchaVerifier = null;
  }

  // Ensure element exists in DOM and is empty
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  } else {
    container.innerHTML = '';
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired, resetting...');
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = null;
        }
      }
    });
  } catch (err) {
    console.error('Error creating RecaptchaVerifier:', err);
  }

  return window.recaptchaVerifier;
};

// Send real SMS OTP to phone in international E.164 format (+91...)
export const sendFirebasePhoneSMS = async (formattedPhone) => {
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured. Check VITE_FIREBASE_API_KEY in .env');
  }
  const appVerifier = setupRecaptcha('recaptcha-container');
  if (!appVerifier) {
    throw new Error('Could not initialize reCAPTCHA verifier for SMS.');
  }
  return await signInWithPhoneNumber(authInstance, formattedPhone, appVerifier);
};

// Format phone to international E.164 format
export const formatToInternationalE164 = (phone, countryCode = '+91') => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Remove leading 0 if present
  cleaned = cleaned.replace(/^0+/, '');
  const cleanCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cleanCode}${cleaned}`;
};
