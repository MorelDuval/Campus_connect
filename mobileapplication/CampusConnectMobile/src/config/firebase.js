import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGKIJ9PrjuMbQutYtTZRL2g-scrsegbhs",
  authDomain: "campus-connect-7f6db.firebaseapp.com",
  databaseURL: "https://campus-connect-7f6db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "campus-connect-7f6db",
  storageBucket: "campus-connect-7f6db.appspot.com",
  messagingSenderId: "614427518149",
  appId: "1:614427518149:web:b8ba0c6ba3be4e52fcfcac",
  measurementId: "G-6H4MT552M4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const userCreationApp = initializeApp(firebaseConfig, 'userCreation');
const userCreationAuth = getAuth(userCreationApp);

// Enable offline persistence for Firestore
if (Platform.OS !== 'web') {
  try {
    const { getReactNativePersistence } = require('firebase/auth/react-native');
    auth.setPersistence(getReactNativePersistence(AsyncStorage));
  } catch (e) {
    console.warn('Auth persistence fallback');
    auth.setPersistence(inMemoryPersistence);
  }
} else {
  auth.setPersistence(browserLocalPersistence);
}

// Firestore offline persistence (web only)
if (Platform.OS === 'web') {
  try {
    enableIndexedDbPersistence(db, { cacheSizeBytes: CACHE_SIZE_UNLIMITED });
    console.log('Firestore offline persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence limited');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support persistence');
    }
  }
}

export { app, auth, db, userCreationAuth };