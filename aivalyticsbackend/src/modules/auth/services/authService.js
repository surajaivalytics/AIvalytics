const crypto = require("crypto");
const { db } = require("../config/database");
const jwtUtils = require("../utils/jwt");
const passwordUtils = require("../utils/password");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
  ROLES,
} = require("../config/constants");

/**
 * Authentication Service
 * Enterprise-grade authentication business logic
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registration result
   */
  async registerUser(userData) {
    try {
      const { username, email, password, rollNumber, role, age, classId } =
        userData;

      // Check if username already exists
      const { data: existingUser } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id")
        .eq("username", username)
        .is("deleted_at", null)
        .single();

      if (existingUser) {
        logger.warn(
          `Registration failed: Username already exists | Username: ${username}`
        );
        throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }

      // Check if email already exists (if provided)
      if (email) {
        const { data: existingEmail } = await supabaseAdmin
          .from(TABLES.USERS)
          .select("id")
          .eq("email", email)
          .is("deleted_at", null)
          .single();

        if (existingEmail) {
          logger.warn(
            `Registration failed: Email already exists | Email: ${email}`
          );
          throw new Error("Email already exists");
        }
      }

      // Check if roll number already exists
      const { data: existingRollNumber } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id")
        .eq("roll_number", rollNumber)
        .is("deleted_at", null)
        .single();

      if (existingRollNumber) {
        logger.warn(
          `Registration failed: Roll number already exists | Roll Number: ${rollNumber}`
        );
        throw new Error("Roll number already exists");
      }

      // Get role ID
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from(TABLES.ROLES)
        .select("id")
        .eq("name", role)
        .single();

      if (roleError || !roleData) {
        logger.error(`Registration failed: Invalid role | Role: ${role}`);
        throw new Error(ERROR_MESSAGES.INVALID_ROLE);
      }

      // Hash password
      const hashedPassword = await passwordUtils.hashPassword(password);

      // Generate auth_id (UUID for Supabase auth compatibility)
      const authId = crypto.randomUUID();

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from(TABLES.USERS)
        .insert({
          auth_id: authId,
          username,
          email: email || null,
          password_hash: hashedPassword,
          roll_number: rollNumber,
          role_id: roleData.id,
          age: age || null,
          class_id: classId || null,
        })
        .select(
          `
          id,
          username,
          email,
          roll_number,
          age,
          class_id,
          role_id,
          roles!inner(name)
        `
        )
        .single();

      if (createError) {
        logger.error(
          `Registration failed: Database error | Error: ${createError.message}`
        );
        throw new Error("Failed to create user account");
      }

      // Generate tokens
      const userForToken = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.roles.name,
        role_id: newUser.role_id,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth(
        "USER_REGISTRATION",
        newUser.username,
        true,
        `Role: ${newUser.roles.name}`
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          rollNumber: newUser.roll_number,
          role: newUser.roles.name,
          age: newUser.age,
          classId: newUser.class_id,
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
   * @param {Object} credentials - Login credentials
   * @returns {Object} Login result
   */
  async loginUser(credentials) {
    try {
      const { username, password } = credentials;

      // Build query to find user by username
      let query = supabaseAdmin
        .from(TABLES.USERS)
        .select(
          `
          id,
          username,
          email,
          roll_number,
          password_hash,
          role_id,
          deleted_at,
          roles!inner(name)
        `
        )
        .is("deleted_at", null)
        .eq("username", username);

      const { data: user, error } = await query.single();

      if (error || !user) {
        logger.logAuth("USER_LOGIN", username, false, "User not found");
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Verify password
      const isPasswordValid = await passwordUtils.verifyPassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        logger.logAuth("USER_LOGIN", username, false, "Invalid password");
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if password needs rehashing (security upgrade)
      if (passwordUtils.needsRehashing(user.password_hash)) {
        const newHashedPassword = await passwordUtils.hashPassword(password);
        await supabaseAdmin
          .from(TABLES.USERS)
          .update({ password_hash: newHashedPassword })
          .eq("id", user.id);

        logger.info(`Password rehashed for user: ${user.username}`);
      }

      // Generate tokens
      const userForToken = {
        id: user.id,
        username: user.username,
        role: user.roles.name,
        role_id: user.role_id,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth(
        "USER_LOGIN",
        user.username,
        true,
        `Role: ${user.roles.name}`
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rollNumber: user.roll_number,
          role: user.roles.name,
        },
        tokens,
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);

      // Get current user data
      const { data: user, error } = await supabaseAdmin
        .from(TABLES.USERS)
        .select(
          `
          id,
          username,
          role_id,
          deleted_at,
          roles!inner(name)
        `
        )
        .eq("id", decoded.userId)
        .is("deleted_at", null)
        .single();

      if (error || !user) {
        logger.logAuth(
          "TOKEN_REFRESH",
          decoded.username,
          false,
          "User not found or inactive"
        );
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      }

      // Generate new tokens
      const userForToken = {
        id: user.id,
        username: user.username,
        role: user.roles.name,
        role_id: user.role_id,
      };

      const tokens = jwtUtils.generateTokenPair(userForToken);

      logger.logAuth(
        "TOKEN_REFRESH",
        user.username,
        true,
        `Role: ${user.roles.name}`
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        tokens,
      };
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Object} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      // Build query to find user by email
      const { data: user, error } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, email")
        .eq("email", email)
        .is("deleted_at", null)
        .single();

      if (error || !user) {
        // Don't reveal if user exists or not for security
        logger.logAuth(
          "PASSWORD_RESET_REQUEST",
          email,
          false,
          "User not found"
        );
        return {
          success: true,
          message:
            "If an account with that email exists, password reset instructions have been sent.",
        };
      }

      // Check if user has an email for password reset
      if (!user.email) {
        logger.logAuth(
          "PASSWORD_RESET_REQUEST",
          email,
          false,
          "User has no email address"
        );
        return {
          success: false,
          message:
            "No email address associated with this account. Please contact support.",
        };
      }

      // Generate password reset token
      const resetToken = jwtUtils.generatePasswordResetToken(user);

      // In a real application, you would send this token via email
      // For now, we'll log it (remove in production)
      logger.info(
        `Password reset token for ${user.username} (${user.email}): ${resetToken}`
      );

      logger.logAuth(
        "PASSWORD_RESET_REQUEST",
        user.username,
        true,
        `Reset token generated for email: ${user.email}`
      );

      return {
        success: true,
        message:
          "If an account with that email exists, password reset instructions have been sent.",
        // Remove this in production - only for development
        resetToken,
        email: user.email, // For development purposes
      };
    } catch (error) {
      logger.error(`Password reset request error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Object} Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify reset token
      const decoded = jwtUtils.verifyPasswordResetToken(token);

      // Get user
      const { data: user, error } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username")
        .eq("id", decoded.userId)
        .is("deleted_at", null)
        .single();

      if (error || !user) {
        logger.logAuth(
          "PASSWORD_RESET",
          decoded.username,
          false,
          "User not found"
        );
        throw new Error(ERROR_MESSAGES.INVALID_RESET_TOKEN);
      }

      // Hash new password
      const hashedPassword = await passwordUtils.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        logger.error(
          `Password reset failed: Database error | Error: ${updateError.message}`
        );
        throw new Error("Failed to reset password");
      }

      logger.logAuth(
        "PASSWORD_RESET",
        user.username,
        true,
        "Password reset successfully"
      );

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
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with current password
      const { data: user, error } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, password_hash")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      if (error || !user) {
        logger.logAuth("PASSWORD_CHANGE", "unknown", false, "User not found");
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await passwordUtils.verifyPassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        logger.logAuth(
          "PASSWORD_CHANGE",
          user.username,
          false,
          "Invalid current password"
        );
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await passwordUtils.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        logger.error(
          `Password change failed: Database error | Error: ${updateError.message}`
        );
        throw new Error("Failed to change password");
      }

      logger.logAuth(
        "PASSWORD_CHANGE",
        user.username,
        true,
        "Password changed successfully"
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
      };
    } catch (error) {
      logger.error(`Password change error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  async getUserProfile(userId) {
    try {
      console.log(`Getting profile for user ID: ${userId}`);

      // First, check if user exists with a simple query
      const { data: simpleUser, error: simpleError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, role_id")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      console.log("Simple user check:", { simpleUser, simpleError });

      // If simple query fails, try without deleted_at check (in case it's a mock DB)
      if (simpleError || !simpleUser) {
        console.log("Trying without deleted_at filter...");
        const { data: userWithoutFilter, error: errorWithoutFilter } =
          await supabaseAdmin
            .from(TABLES.USERS)
            .select("id, username, role_id")
            .eq("id", userId)
            .single();

        console.log("User without filter:", {
          userWithoutFilter,
          errorWithoutFilter,
        });
      }

      // Try a simplified query without complex joins
      const { data: user, error } = await supabaseAdmin
        .from(TABLES.USERS)
        .select(
          `
          id,
          username,
          email,
          roll_number,
          age,
          class_id,
          created_at,
          updated_at,
          role_id
        `
        )
        .eq("id", userId)
        .single();

      console.log("Simplified query result:", { user, error });

      if (error || !user) {
        console.log("User not found or error:", { error, user });
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Get role name separately
      let roleName = "unknown";
      if (user.role_id) {
        const { data: role } = await supabaseAdmin
          .from(TABLES.ROLES)
          .select("name")
          .eq("id", user.role_id)
          .single();
        roleName = role?.name || "unknown";
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rollNumber: user.roll_number,
          role: roleName,
          age: user.age,
          classId: user.class_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      logger.error(`Get user profile error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Update result
   */
  async updateUserProfile(userId, updateData) {
    try {
      const { username, rollNumber } = updateData;
      console.log(`Updating profile for user ID: ${userId}`, {
        username,
        rollNumber,
      });

      // Get current user data with simplified query
      const { data: currentUser, error: getUserError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, roll_number")
        .eq("id", userId)
        .single();

      console.log("Current user data:", { currentUser, getUserError });

      if (getUserError || !currentUser) {
        console.log("User not found during update:", {
          getUserError,
          currentUser,
        });
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Check if username is being changed and if it already exists
      if (username && username !== currentUser.username) {
        const { data: existingUser } = await supabaseAdmin
          .from(TABLES.USERS)
          .select("id")
          .eq("username", username)
          .neq("id", userId)
          .single();

        if (existingUser) {
          throw new Error("Username already exists");
        }
      }

      // Check if roll number is being changed and if it already exists
      if (rollNumber && rollNumber !== currentUser.roll_number) {
        const { data: existingRollNumber } = await supabaseAdmin
          .from(TABLES.USERS)
          .select("id")
          .eq("roll_number", rollNumber)
          .neq("id", userId)
          .single();

        if (existingRollNumber) {
          throw new Error("Roll number already exists");
        }
      }

      // Prepare update data
      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (username) updateFields.username = username;
      if (rollNumber) updateFields.roll_number = rollNumber;

      console.log("Update fields:", updateFields);

      // Update user profile with simplified query
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update(updateFields)
        .eq("id", userId)
        .select(
          `
          id,
          username,
          email,
          roll_number,
          age,
          class_id,
          created_at,
          updated_at,
          role_id
        `
        )
        .single();

      console.log("Update result:", { updatedUser, updateError });

      if (updateError) {
        logger.error(
          `Profile update failed: Database error | Error: ${updateError.message}`
        );
        throw new Error("Failed to update profile");
      }

      // Get role name separately
      let roleName = "unknown";
      if (updatedUser.role_id) {
        const { data: role } = await supabaseAdmin
          .from(TABLES.ROLES)
          .select("name")
          .eq("id", updatedUser.role_id)
          .single();
        roleName = role?.name || "unknown";
      }

      logger.logAuth(
        "PROFILE_UPDATE",
        updatedUser.username,
        true,
        "Profile updated successfully"
      );

      return {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          rollNumber: updatedUser.roll_number,
          role: roleName,
          age: updatedUser.age,
          classId: updatedUser.class_id,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at,
        },
      };
    } catch (error) {
      logger.error(`Update user profile error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout user (invalidate tokens - in a real app, you'd maintain a blacklist)
   * @param {string} userId - User ID
   * @returns {Object} Logout result
   */
  async logoutUser(userId) {
    try {
      // In a production app, you would:
      // 1. Add the token to a blacklist/redis cache
      // 2. Or maintain active sessions in database
      // For now, we'll just log the logout

      const { data: user } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("username")
        .eq("id", userId)
        .single();

      logger.logAuth(
        "USER_LOGOUT",
        user?.username || "unknown",
        true,
        "User logged out"
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      };
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

module.exports = authService;
