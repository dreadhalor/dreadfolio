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

  // Only connect to emulators if explicitly enabled
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

  // Connect to Firebase emulators if enabled and on localhost
  if (location.hostname === 'localhost' && useEmulators) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Firebase emulators');
    } catch (emulatorError) {
      console.warn(
        'Failed to connect to Firebase emulators (they may not be running):',
        emulatorError,
      );
      console.log('Continuing with production Firebase...');
    }
  }
} catch (error) {
  console.warn('Firebase services not available:', error);
  // Services will be undefined, consuming code should handle this
}

export { auth, db, storage };
