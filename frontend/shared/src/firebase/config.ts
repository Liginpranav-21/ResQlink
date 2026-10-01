import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase web config is public by design (security comes from the database
// rules). .env files are git-ignored, so these fallbacks are what a Vercel
// build from GitHub uses unless VITE_FIREBASE_* env vars are set in Vercel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBJLFqo5w9DY7G7ba2EQQirWK2Mg8G3rPA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resqlink-862d5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resqlink-862d5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resqlink-862d5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '63732427730',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:63732427730:web:7df3dd00433d6133e8760b',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://resqlink-862d5-default-rtdb.asia-southeast1.firebasedatabase.app',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export default app;
