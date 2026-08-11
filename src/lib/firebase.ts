import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_o90cvK5_G6-j829hMUDm6Fi0dB0HcaA",
  authDomain: "koffie-rakjat.firebaseapp.com",
  projectId: "koffie-rakjat",
  storageBucket: "koffie-rakjat.firebasestorage.app",
  messagingSenderId: "760633816926",
  appId: "1:760633816926:web:5ea0ebb738b054951dc1cf",
  measurementId: "G-D7E5JLX587"
};

// Prevent re-initialization during Next.js HMR (Hot Module Replacement)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
