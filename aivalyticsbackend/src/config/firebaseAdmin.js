const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
    // 1. Remove potential double quotes at start/end
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    // 2. Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // 3. Ensure it starts with the correct header if it reached here
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error("❌ Invalid Firebase Private Key format in environment variables");
    }
}

if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com` // Optional, needed for Realtime Database
    });
    console.log("🔥 Firebase Admin initialized successfully with Service Account");
} else if (projectId) {
    console.warn("⚠️  Firebase Admin credentials missing. Initializing with project ID only (limited mode). ID token verification will work.");
    admin.initializeApp({ projectId });
} else {
    // Fallback if even projectId is missing
    console.warn("⚠️  Firebase Admin credentials and Project ID missing. Falling back to default.");
    try {
        admin.initializeApp();
    } catch (error) {
        console.warn("⚠️  Failed to initialize Firebase Admin.");
    }
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };
