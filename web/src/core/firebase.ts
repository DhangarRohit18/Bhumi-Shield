import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Production Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAEZ6Tiz3-6xZRAiBXj99dFgSxDGhXGDSw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dataaq-69662.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dataaq-69662",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dataaq-69662.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "740135530786",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:740135530786:web:e06c73696ce34abc92f57b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EGRLSRT6T8",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with robust multi-tab offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

// Connect emulators only if explicitly enabled
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (err) {
    console.warn('Firebase emulator connection skipped:', err);
  }
}

export default app;
