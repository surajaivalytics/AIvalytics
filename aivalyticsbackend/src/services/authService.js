const crypto = require("crypto");
const { db } = require("../config/database");
const jwtUtils = require("../utils/jwt");
const passwordUtils = require("../utils/password");
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
 * Firebase Firestore-backed authentication business logic
 */
class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    try {
      const { username, email, password, rollNumber, role, age, classId } =
        userData;

      // Validate role
      const validRoles = Object.values(ROLES);
      if (!validRoles.includes(role)) {
        throw new Error(ERROR_MESSAGES.INVALID_ROLE);
      }

      // Check if username already exists
      const usernameSnap = await db
        .collection(TABLES.USERS)
        .where("username", "==", username)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!usernameSnap.empty) {
        logger.warn(
          `Registration failed: Username already exists | Username: ${username}`
        );
        throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }

      // Check if email already exists (if provided)
      if (email) {
        const emailSnap = await db
          .collection(TABLES.USERS)
          .where("email", "==", email)
          .where("deleted_at", "==", null)
          .limit(1)
          .get();

        if (!emailSnap.empty) {
          logger.warn(
            `Registration failed: Email already exists | Email: ${email}`
          );
          throw new Error("Email already exists");
        }
      }

      // Check if roll number already exists
      const rollSnap = await db
        .collection(TABLES.USERS)
        .where("roll_number", "==", rollNumber)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!rollSnap.empty) {
        logger.warn(
          `Registration failed: Roll number already exists | Roll Number: ${rollNumber}`
        );
        throw new Error("Roll number already exists");
      }

      // Hash password
      const hashedPassword = await passwordUtils.hashPassword(password);

      // Generate unique ID
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newUser = {
        id: userId,
        auth_id: userId,
        username,
        email: email || null,
        password_hash: hashedPassword,
        roll_number: rollNumber,
        role,
        age: age || null,
        class_id: classId || null,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      };

      // Create user document with our own ID
      await db.collection(TABLES.USERS).doc(userId).set(newUser);

      // Generate tokens
      const userForToken = {
        id: userId,
        username,
        role,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth(
        "USER_REGISTRATION",
        username,
        true,
        `Role: ${role}`
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        user: {
          id: userId,
          username,
          email: email || null,
          rollNumber,
          role,
          age: age || null,
          classId: classId || null,
        },
        tokens,
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(credentials) {
    try {
      const { username, password } = credentials;

      // Find user by username
      const snap = await db
        .collection(TABLES.USERS)
        .where("username", "==", username)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (snap.empty) {
        logger.logAuth("USER_LOGIN", username, false, "User not found");
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      const userDoc = snap.docs[0];
      const user = userDoc.data();

      // Verify password
      const isPasswordValid = await passwordUtils.verifyPassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        logger.logAuth("USER_LOGIN", username, false, "Invalid password");
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if password needs rehashing
      if (passwordUtils.needsRehashing(user.password_hash)) {
        const newHashedPassword = await passwordUtils.hashPassword(password);
        await db
          .collection(TABLES.USERS)
          .doc(userDoc.id)
          .update({ password_hash: newHashedPassword, updated_at: new Date().toISOString() });
        logger.info(`Password rehashed for user: ${user.username}`);
      }

      // Generate tokens
      const userForToken = {
        id: userDoc.id,
        username: user.username,
        role: user.role,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth("USER_LOGIN", user.username, true, `Role: ${user.role}`);

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: {
          id: userDoc.id,
          username: user.username,
          email: user.email,
          rollNumber: user.roll_number,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Refresh access token
   */
  async syncUserProfile(userData) {
    try {
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);

      // Get current user data
      const userDoc = await db
        .collection(TABLES.USERS)
        .doc(decoded.userId)
        .get();

      if (!userDoc.exists) {
        logger.logAuth(
          "TOKEN_REFRESH",
          decoded.username,
          false,
          "User not found or inactive"
        );
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      }

      const user = userDoc.data();

      if (user.deleted_at !== null && user.deleted_at !== undefined) {
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      }

      const userForToken = {
        id: userDoc.id,
        username: user.username,
        role: user.role,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth(
        "TOKEN_REFRESH",
        user.username,
        true,
        `Role: ${user.role}`
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        tokens,
      };
    } catch (error) {
      logger.error(`Error syncing user profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async registerUser(userData) {
    try {
      const snap = await db
        .collection(TABLES.USERS)
        .where("email", "==", email)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (snap.empty) {
        logger.logAuth("PASSWORD_RESET_REQUEST", email, false, "User not found");
        return {
          success: true,
          message:
            "If an account with that email exists, password reset instructions have been sent.",
        };
      }

      const userDoc = snap.docs[0];
      const user = userDoc.data();

      if (!user.email) {
        return {
          success: false,
          message:
            "No email address associated with this account. Please contact support.",
        };
      }

      const resetToken = jwtUtils.generatePasswordResetToken(user);

      logger.info(
        `Password reset token for ${user.username} (${user.email}): ${resetToken}`
      );
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
        message:
          "If an account with that email exists, password reset instructions have been sent.",
        resetToken,
        email: user.email,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        user: profileResult.user
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwtUtils.verifyPasswordResetToken(token);

      const userDoc = await db
        .collection(TABLES.USERS)
        .doc(decoded.userId)
        .get();

      if (!userDoc.exists) {
        logger.logAuth("PASSWORD_RESET", decoded.username, false, "User not found");
        throw new Error(ERROR_MESSAGES.INVALID_RESET_TOKEN);
      }

      const user = userDoc.data();
      const hashedPassword = await passwordUtils.hashPassword(newPassword);

      await db
        .collection(TABLES.USERS)
        .doc(userDoc.id)
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        });

      logger.logAuth("PASSWORD_RESET", user.username, true, "Password reset successfully");

      return {
        success: true,
        message: ERROR_MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    } catch (error) {
      logger.error(`Password reset error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const userDoc = await db.collection(TABLES.USERS).doc(userId).get();

      if (!userDoc.exists) {
        logger.logAuth("PASSWORD_CHANGE", "unknown", false, "User not found");
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const user = userDoc.data();

      const isCurrentPasswordValid = await passwordUtils.verifyPassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        logger.logAuth("PASSWORD_CHANGE", user.username, false, "Invalid current password");
        throw new Error("Current password is incorrect");
      }

      const hashedPassword = await passwordUtils.hashPassword(newPassword);

      await db
        .collection(TABLES.USERS)
        .doc(userId)
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        });

      logger.logAuth("PASSWORD_CHANGE", user.username, true, "Password changed successfully");
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

      const user = userDoc.data();

      return {
        success: true,
        user: {
          id: userDoc.id,
          username: user.username,
          email: user.email,
          rollNumber: user.roll_number,
          role: user.role,
          age: user.age,
          classId: user.class_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
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
      const { username, rollNumber } = updateData;

      const userDoc = await db.collection(TABLES.USERS).doc(userId).get();

      if (!userDoc.exists) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const currentUser = userDoc.data();

      // Check if username is being changed and if it already exists
      if (username && username !== currentUser.username) {
        const existingSnap = await db
          .collection(TABLES.USERS)
          .where("username", "==", username)
          .limit(1)
          .get();

        const conflict = existingSnap.docs.find((d) => d.id !== userId);
        if (conflict) {
          throw new Error("Username already exists");
        }
      }

      // Check if roll number is being changed and if it already exists
      if (rollNumber && rollNumber !== currentUser.roll_number) {
        const existingRollSnap = await db
          .collection(TABLES.USERS)
          .where("roll_number", "==", rollNumber)
          .limit(1)
          .get();

        const conflict = existingRollSnap.docs.find((d) => d.id !== userId);
        if (conflict) {
          throw new Error("Roll number already exists");
        }
      }

      const updateFields = { updated_at: new Date().toISOString() };
      if (username) updateFields.username = username;
      if (rollNumber) updateFields.roll_number = rollNumber;

      await db.collection(TABLES.USERS).doc(userId).update(updateFields);

      // Fetch updated user
      const updatedDoc = await db.collection(TABLES.USERS).doc(userId).get();
      const updatedUser = updatedDoc.data();

      logger.logAuth("PROFILE_UPDATE", updatedUser.username, true, "Profile updated successfully");
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
        user: {
          id: updatedDoc.id,
          username: updatedUser.username,
          email: updatedUser.email,
          rollNumber: updatedUser.roll_number,
          role: updatedUser.role,
          age: updatedUser.age,
          classId: updatedUser.class_id,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at,
        },
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
      const userDoc = await db.collection(TABLES.USERS).doc(userId).get();
      const username = userDoc.exists ? userDoc.data().username : "unknown";

      logger.logAuth("USER_LOGOUT", username, true, "User logged out");

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
