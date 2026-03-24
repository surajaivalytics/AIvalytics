import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBbE6uAmhbC7gD7oU9qc34975qPy7kJYQs",
 authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "teacher-portal-5d124.firebaseapp.com",
 projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "teacher-portal-5d124",
 storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "teacher-portal-5d124.firebasestorage.app",
 messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "645158417003",
 appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:645158417003:web:b3fa14aeeb2f9ce8d0772e",
 measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-BFQ5XM0G0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
