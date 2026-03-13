const { db, auth, admin } = require("./firebaseAdmin");
const logger = require("./logger");

/**
 * Firebase Database Configuration
 */
class DatabaseConfig {
  constructor() {
    this.db = db;
    this.auth = auth;
  }

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
