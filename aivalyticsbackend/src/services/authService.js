const { auth, db, admin } = require("../config/firebaseAdmin");
const logger = require("../config/logger");
const { formatFirestoreTimestamp } = require("../utils/firebaseUtils");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Authentication Service
 * Refactored for Firebase integration
 */
class AuthService {
  /**
   * Verify Firebase ID Token
   * @param {string} idToken - Firebase ID token from frontend
   * @returns {Object} Decoded token
   */
  async verifyIdToken(idToken) {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Sync or create user profile in Firestore
   * @param {Object} userData - User data from Firebase Auth or Registration
   * @returns {Object} Result
   */
  async syncUserProfile(userData) {
    try {
      const { uid, email, username, rollNumber, role, firstName, lastName, profilePic } = userData;
      
      const userRef = db.collection(TABLES.USERS).doc(uid);
      const userDoc = await userRef.get();

      const profileData = {
        username: username || (email ? email.split('@')[0] : "user"),
        email: email || "",
        rollNumber: rollNumber || "",
        firstName: firstName || "",
        lastName: lastName || "",
        profilePic: profilePic || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (role) {
        profileData.role = role;
      }

      if (!userDoc.exists) {
        profileData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await userRef.set(profileData);
        logger.info(`New user profile created in Firestore: ${uid}`);
      } else {
        await userRef.update(profileData);
        logger.info(`User profile updated in Firestore: ${uid}`);
      }

      return { 
        success: true, 
        user: { 
          id: uid, 
          ...profileData,
          createdAt: formatFirestoreTimestamp(profileData.createdAt),
          updatedAt: formatFirestoreTimestamp(profileData.updatedAt)
        } 
      };
    } catch (error) {
      logger.error(`Error syncing user profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register a new user (usually handled by frontend, but useful for admin/manual creation)
   */
  async registerUser(userData) {
    try {
      const { email, password, username, rollNumber, role } = userData;

      const userRecord = await auth.createUser({
        email,
        password,
        displayName: username,
      });

      const profileResult = await this.syncUserProfile({
        uid: userRecord.uid,
        email,
        username,
        rollNumber,
        role
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        user: profileResult.user
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login user (verifying token from frontend)
   */
  async loginUser(credentials) {
    // In Firebase flow, the frontend performs login and sends the ID token to the backend
    // If this method is called, it might be for a custom login flow or verification
    const { idToken } = credentials;
    if (!idToken) throw new Error("ID Token is required");

    try {
      const decodedToken = await this.verifyIdToken(idToken);
      const profile = await this.getUserProfile(decodedToken.uid);

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: profile.user,
        tokens: { accessToken: idToken } // Firebase manages refresh tokens on client
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const userDoc = await db.collection(TABLES.USERS).doc(userId).get();

      if (!userDoc.exists) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const userData = userDoc.data();
      return {
        success: true,
        user: {
          id: userId,
          ...userData,
          createdAt: formatFirestoreTimestamp(userData.createdAt),
          updatedAt: formatFirestoreTimestamp(userData.updatedAt)
        }
      };
    } catch (error) {
      logger.error(`Get user profile error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      const userRef = db.collection(TABLES.USERS).doc(userId);
      const updateFields = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.update(updateFields);
      const updatedProfile = await this.getUserProfile(userId);

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedProfile.user
      };
    } catch (error) {
      logger.error(`Update user profile error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logoutUser(userId) {
    try {
      // Firebase handles logout on the client side
      // Server-side we can revoke tokens if needed
      await auth.revokeRefreshTokens(userId);
      logger.info(`Tokens revoked for user: ${userId}`);
      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      };
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }
}

const authService = new AuthService();
module.exports = authService;
