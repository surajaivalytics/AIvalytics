const admin = require("firebase-admin");
const logger = require("./logger");

/**
 * Firebase Admin Database Configuration
 * Enterprise-grade Firestore connection with proper error handling
 */

let db = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  if (isInitialized) return;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase credentials: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY are required"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    db = admin.firestore();

    // Firestore settings
    db.settings({ ignoreUndefinedProperties: true });

    isInitialized = true;
    logger.info("Firebase Admin SDK initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin SDK:", error.message);
    throw error;
  }
}

/**
 * Get Firestore database instance
 */
function getDb() {
  if (!db) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  }
  return db;
}

/**
 * Test Firestore connection
 */
async function testConnection() {
  try {
    // Simple ping: list collections (returns empty if none, not an error)
    await db.listCollections();
    logger.info("Database connection test successful");
    return true;
  } catch (error) {
    logger.error("Database connection test failed:", error.message);
    return false;
  }
}

// Initialize on module load
initializeFirebase();

module.exports = {
  db: getDb(),
  getDb,
  testConnection,
  admin,
  /**
   * Test database connection
   */
  async testConnection() {
    try {
      // Since we are using firebase-admin, we can just check if db is initialized
      if (this.db) {
        logger.info("Firebase Firestore initialized");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Firebase connection test error:", error);
      return false;
    }
  }
}

const databaseConfig = new DatabaseConfig();

module.exports = {
  db: databaseConfig.db,
  auth: databaseConfig.auth,
  admin,
  testConnection: () => databaseConfig.testConnection(),
};
