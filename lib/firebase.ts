import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBHMtDdJ-ldzQrgfku7HbPOSO0-JlV9pUw",
  authDomain: "cosavu-oauth.firebaseapp.com",
  projectId: "cosavu-oauth",
  storageBucket: "cosavu-oauth.firebasestorage.app",
  messagingSenderId: "826505234397",
  appId: "1:826505234397:web:01f06268495f6476905834",
  measurementId: "G-BQZQZP1YR2"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Analytics conditionally (it only works in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);
}

export { app, auth, analytics };
