const bcrypt = require("bcryptjs");
const logger = require("../config/logger");
const { VALIDATION_RULES, ERROR_MESSAGES } = require("../config/constants");

/**
 * Password Utility Functions
 * Enterprise-grade password management with secure hashing and validation
 */
class PasswordUtils {
  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.validateSaltRounds();
  }

  /**
   * Validate salt rounds configuration
   */
  validateSaltRounds() {
    if (this.saltRounds < 10) {
      logger.warn("Salt rounds should be at least 10 for security");
      this.saltRounds = 12;
    }
  }

  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    try {
      if (!password) {
        throw new Error("Password is required");
      }

      // Validate password strength before hashing
      this.validatePasswordStrength(password);

      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      logger.info("Password hashed successfully");
      return hashedPassword;
    } catch (error) {
      logger.error("Error hashing password:", error.message);
      throw error;
    }
  }

  /**
   * Verify a password against its hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(password, hashedPassword) {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (isMatch) {
        logger.info("Password verification successful");
      } else {
        logger.warn("Password verification failed");
      }

      return isMatch;
    } catch (error) {
      logger.error("Error verifying password:", error.message);
      return false;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} True if password is valid
   * @throws {Error} If password doesn't meet requirements
   */
  validatePasswordStrength(password) {
    if (!password) {
      throw new Error(ERROR_MESSAGES.REQUIRED_FIELD);
    }

    // Check minimum length
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      throw new Error(
        `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`,
      );
    }

    // Check maximum length
    if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
      throw new Error(
        `Password must not exceed ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`,
      );
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter");
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter");
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
      throw new Error("Password must contain at least one number");
    }

    // Check for at least one special character
    if (!/[@$!%*?&]/.test(password)) {
      throw new Error(
        "Password must contain at least one special character (@$!%*?&)",
      );
    }

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "password123",
      "123456789",
      "qwerty123",
      "admin123",
      "welcome123",
      "letmein123",
      "password1",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new Error(
        "Password is too common. Please choose a stronger password",
      );
    }

    return true;
  }

  /**
   * Generate a secure random password
   * @param {number} length - Password length (default: 12)
   * @returns {string} Generated password
   */
  generateSecurePassword(length = 12) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "@$!%*?&";

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = "";

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * Check if password needs rehashing (for security upgrades)
   * @param {string} hashedPassword - Current hashed password
   * @returns {boolean} True if password needs rehashing
   */
  needsRehashing(hashedPassword) {
    try {
      // Extract current salt rounds from hash
      const currentRounds = bcrypt.getRounds(hashedPassword);
      return currentRounds < this.saltRounds;
    } catch (error) {
      logger.error(
        "Error checking if password needs rehashing:",
        error.message,
      );
      return true; // If we can't determine, assume it needs rehashing
    }
  }

  /**
   * Validate password complexity score
   * @param {string} password - Password to score
   * @returns {Object} Score and feedback
   */
  getPasswordStrengthScore(password) {
    let score = 0;
    const feedback = [];

    if (!password) {
      return {
        score: 0,
        strength: "Very Weak",
        feedback: ["Password is required"],
      };
    }

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push("Use at least 8 characters");

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push("Consider using 12+ characters for better security");

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Add uppercase letters");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Add numbers");

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push("Add special characters (@$!%*?&)");

    // Bonus points
    if (password.length >= 16) score += 1;
    if (/[^a-zA-Z0-9@$!%*?&]/.test(password)) score += 1; // Other special chars

    // Determine strength level
    let strength;
    if (score <= 2) strength = "Very Weak";
    else if (score <= 4) strength = "Weak";
    else if (score <= 6) strength = "Fair";
    else if (score <= 7) strength = "Good";
    else strength = "Strong";

    return {
      score,
      strength,
      feedback:
        feedback.length > 0
          ? feedback
          : ["Password meets security requirements"],
    };
  }

  /**
   * Check if password contains user information
   * @param {string} password - Password to check
   * @param {Object} userInfo - User information (username, email, etc.)
   * @returns {boolean} True if password contains user info
   */
  containsUserInfo(password, userInfo) {
    if (!password || !userInfo) return false;

    const lowerPassword = password.toLowerCase();
    const checks = [
      userInfo.username?.toLowerCase(),
      userInfo.email?.toLowerCase().split("@")[0],
      userInfo.firstName?.toLowerCase(),
      userInfo.lastName?.toLowerCase(),
    ].filter(Boolean);

    return checks.some(
      (info) => info.length >= 3 && lowerPassword.includes(info),
    );
  }
}

// Create singleton instance
const passwordUtils = new PasswordUtils();

module.exports = passwordUtils;
