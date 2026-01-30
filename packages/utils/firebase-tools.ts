import { getApps, initializeApp, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase v9+: pull from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;
let storage: ReturnType<typeof getStorage>;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  // Connect to Firebase auth emulator if the host is localhost
  if (location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
  }

  // Connect to Firestore emulator if the host is localhost
  if (location.hostname === 'localhost') {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }

  // Connect to Firebase storage emulator if the host is localhost
  if (location.hostname === 'localhost') {
    // Point to the emulators running on localhost.
    connectStorageEmulator(storage, 'localhost', 9199);
  }
} catch (error) {
  console.warn('Firebase services not available:', error);
  // Services will be undefined, consuming code should handle this
}

export { auth, db, storage };
