// Firebase initialization for ResQLink mobile.
//
// Live backend only — no demo/offline fallback. Auth uses React Native
// AsyncStorage persistence so the user stays signed in across app restarts.
// (The default Firebase JS SDK keeps auth in memory only, which logs the user
// out every cold start and emits a warning on React Native.)

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { Platform } from 'react-native';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  // @ts-ignore - getReactNativePersistence is exported by firebase/auth but
  // missing from some bundled type definitions.
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBJLFqo5w9DY7G7ba2EQQirWK2Mg8G3rPA',
  authDomain: 'resqlink-862d5.firebaseapp.com',
  databaseURL:
    'https://resqlink-862d5-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'resqlink-862d5',
  storageBucket: 'resqlink-862d5.firebasestorage.app',
  messagingSenderId: '63732427730',
  appId: '1:63732427730:web:7df3dd00433d6133e8760b',
  measurementId: 'G-K7N5HGGGD0',
};

// Initialize the app once (guards against Fast Refresh re-initializing).
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);

// Initialize auth with persistent storage. initializeAuth must run only once;
// on a hot reload it will already exist, so fall back to getAuth.
// On web (Vercel / browser) getReactNativePersistence does not exist, so use
// the browser's IndexedDB/localStorage persistence instead.
let auth: Auth;
try {
  auth =
    Platform.OS === 'web'
      ? initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] })
      : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}

const db: Database = getDatabase(app);

export { app, auth, db };
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
};
