const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const { JWT_CONFIG, ERROR_MESSAGES } = require("../config/constants");

/**
 * JWT Utility Functions
 * Enterprise-grade JWT token management
 */
class JWTUtils {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || "7d";
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

    this.validateSecrets();
  }

  /**
   * Validate JWT secrets are configured
   */
  validateSecrets() {
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      const error = "JWT secrets are not configured";
      logger.error(error);
      throw new Error(error);
    }

    if (this.accessTokenSecret.length < 32) {
      const error = "JWT secret must be at least 32 characters long";
      logger.error(error);
      throw new Error(error);
    }
  }

  /**
   * Generate access token
   * @param {Object} payload - User data to include in token
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.id,
        username: payload.username,
        role: payload.role,
        roleId: payload.role_id,
        iat: Math.floor(Date.now() / 1000),
      };

      const options = {
        expiresIn: this.accessTokenExpiry,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: JWT_CONFIG.ALGORITHM,
      };

      const token = jwt.sign(tokenPayload, this.accessTokenSecret, options);

      logger.info(`Access token generated for user: ${payload.username}`);
      return token;
    } catch (error) {
      logger.error("Error generating access token:", error);
      throw new Error("Failed to generate access token");
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to include in token
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.id,
        username: payload.username,
        tokenType: "refresh",
        iat: Math.floor(Date.now() / 1000),
      };

      const options = {
        expiresIn: this.refreshTokenExpiry,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: JWT_CONFIG.ALGORITHM,
      };

      const token = jwt.sign(tokenPayload, this.refreshTokenSecret, options);

      logger.info(`Refresh token generated for user: ${payload.username}`);
      return token;
    } catch (error) {
      logger.error("Error generating refresh token:", error);
      throw new Error("Failed to generate refresh token");
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing both tokens
   */
  generateTokenPair(user) {
    try {
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.accessTokenExpiry,
      };
    } catch (error) {
      logger.error("Error generating token pair:", error);
      throw error;
    }
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      const options = {
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithms: [JWT_CONFIG.ALGORITHM],
      };

      const decoded = jwt.verify(token, this.accessTokenSecret, options);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn("Access token expired");
        throw new Error("Token expired");
      } else if (error.name === "JsonWebTokenError") {
        logger.warn("Invalid access token");
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      } else {
        logger.error("Error verifying access token:", error);
        throw new Error("Token verification failed");
      }
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      const options = {
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithms: [JWT_CONFIG.ALGORITHM],
      };

      const decoded = jwt.verify(token, this.refreshTokenSecret, options);

      if (decoded.tokenType !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn("Refresh token expired");
        throw new Error("Refresh token expired");
      } else if (error.name === "JsonWebTokenError") {
        logger.warn("Invalid refresh token");
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      } else {
        logger.error("Error verifying refresh token:", error);
        throw new Error("Refresh token verification failed");
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate password reset token
   * @param {Object} user - User object
   * @returns {string} Password reset token
   */
  generatePasswordResetToken(user) {
    try {
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        tokenType: "password_reset",
        iat: Math.floor(Date.now() / 1000),
      };

      const options = {
        expiresIn: "1h", // Password reset tokens expire in 1 hour
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithm: JWT_CONFIG.ALGORITHM,
      };

      const token = jwt.sign(tokenPayload, this.accessTokenSecret, options);

      logger.info(`Password reset token generated for user: ${user.username}`);
      return token;
    } catch (error) {
      logger.error("Error generating password reset token:", error);
      throw new Error("Failed to generate password reset token");
    }
  }

  /**
   * Verify password reset token
   * @param {string} token - Password reset token
   * @returns {Object} Decoded token payload
   */
  verifyPasswordResetToken(token) {
    try {
      const options = {
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        algorithms: [JWT_CONFIG.ALGORITHM],
      };

      const decoded = jwt.verify(token, this.accessTokenSecret, options);

      if (decoded.tokenType !== "password_reset") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn("Password reset token expired");
        throw new Error("Password reset token expired");
      } else if (error.name === "JsonWebTokenError") {
        logger.warn("Invalid password reset token");
        throw new Error(ERROR_MESSAGES.INVALID_RESET_TOKEN);
      } else {
        logger.error("Error verifying password reset token:", error);
        throw new Error("Password reset token verification failed");
      }
    }
  }
}

// Create singleton instance
const jwtUtils = new JWTUtils();

module.exports = jwtUtils;
