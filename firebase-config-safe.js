// Firebase Configuration
// Environment variables should be provided by build system
// For development, these are loaded from .env file

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Get config from environment variables
// These should be set by your build tool (Vite, webpack, etc.)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase configuration is not properly loaded. ' +
    'Please ensure environment variables are set correctly.'
  );
}

const app = initializeApp(firebaseConfig);
const dbCloud = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
  app,
  dbCloud,
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
};
