import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Declare type for import.meta.env to satisfy typescript compilers (like daemon)
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_API_KEY?: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
      readonly VITE_FIREBASE_PROJECT_ID?: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
      readonly VITE_FIREBASE_APP_ID?: string;
      readonly [key: string]: string | undefined;
    };
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigurationError =
  missingConfigKeys.length > 0
    ? `Firebase is not configured. Add ${missingConfigKeys.join(', ')} to .env.local.`
    : null;

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestore: Firestore | null = null;

if (!firebaseConfigurationError) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } catch (error) {
    console.error('Failed to initialize Firebase app:', error);
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    throw new Error(firebaseConfigurationError ?? 'Firebase is not initialized.');
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(firebaseConfigurationError ?? 'Firebase Authentication is unavailable.');
  }
  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    throw new Error(firebaseConfigurationError ?? 'Firestore is unavailable.');
  }
  return firestore;
}
