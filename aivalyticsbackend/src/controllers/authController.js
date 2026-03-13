const authService = require("../services/authService");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  COOKIE_CONFIG,
} = require("../config/constants");

/**
 * Authentication Controller
 * Enterprise-grade authentication endpoints
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: result.success,
      message: result.message,
      user: result.user
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode = error.message.includes("already exists")
      ? HTTP_STATUS.CONFLICT
      : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Expecting { idToken } from frontend
    const result = await authService.loginUser(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.tokens.refreshToken, COOKIE_CONFIG);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      tokens: result.tokens,
    });
  } catch (error) {
    logger.logError(error, req);

    // Clear invalid refresh token cookie
    res.clearCookie("refreshToken");

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      // Remove resetToken in production
      ...(process.env.NODE_ENV === "development" && {
        resetToken: result.resetToken,
      }),
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode =
      error.message.includes("expired") || error.message.includes("invalid")
        ? HTTP_STATUS.UNAUTHORIZED
        : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Change password (authenticated)
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode = error.message.includes("incorrect")
      ? HTTP_STATUS.UNAUTHORIZED
      : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.getUserProfile(userId);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      user: result.user,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode =
      error.message === ERROR_MESSAGES.USER_NOT_FOUND
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Update current user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, rollNumber } = req.body;

    const result = await authService.updateUserProfile(userId, {
      username,
      rollNumber,
    });

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode =
      error.message === ERROR_MESSAGES.USER_NOT_FOUND
        ? HTTP_STATUS.NOT_FOUND
        : error.message.includes("already exists") ||
          error.message.includes("duplicate")
          ? HTTP_STATUS.CONFLICT
          : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.logoutUser(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    logger.logError(error, req);

    // Clear cookie even if logout fails
    res.clearCookie("refreshToken");

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Verify token (for frontend to check if user is authenticated)
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware already verified it)
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Token is valid",
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

/**
 * Get user by ID (admin only)
 * GET /api/auth/users/:userId
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await authService.getUserProfile(userId);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      user: result.user,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode =
      error.message === ERROR_MESSAGES.USER_NOT_FOUND
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Health check endpoint
 * GET /api/auth/health
 */
const healthCheck = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Authentication service is healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Authentication service is unhealthy",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  logout,
  verifyToken,
  getUserById,
  healthCheck,
};
