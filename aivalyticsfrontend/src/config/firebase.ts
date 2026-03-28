import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBbE6uAmhbC7gD7oU9qc34975qPy7kJYQs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teacher-portal-5d124.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teacher-portal-5d124",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teacher-portal-5d124.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "645158417003",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:645158417003:web:b3fa14aeeb2f9ce8d0772e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BFQ5XM0G0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
