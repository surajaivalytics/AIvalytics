const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateRefreshToken,
  validateUUIDParam,
  validateProfileUpdate,
  sanitizeInput,
} = require("../middleware/validation");
const { ROLES, RATE_LIMITS } = require("../config/constants");

const router = express.Router();

/**
 * Rate limiting configurations
 */

// Strict rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for other endpoints
const generalRateLimit = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public Routes (No authentication required)
 */

// Health check
router.get("/health", authController.healthCheck);

// User registration
router.post(
  "/register",
  authRateLimit,
  sanitizeInput,
  validateUserRegistration,
  authController.register,
);

// User login
router.post(
  "/login",
  authRateLimit,
  sanitizeInput,
  validateUserLogin,
  authController.login,
);

// Refresh token
router.post(
  "/refresh",
  generalRateLimit,
  sanitizeInput,
  validateRefreshToken,
  authController.refreshToken,
);

// Request password reset
router.post(
  "/forgot-password",
  authRateLimit,
  sanitizeInput,
  validatePasswordResetRequest,
  authController.forgotPassword,
);

// Reset password with token
router.post(
  "/reset-password",
  authRateLimit,
  sanitizeInput,
  validatePasswordReset,
  authController.resetPassword,
);

/**
 * Protected Routes (Authentication required)
 */

// Verify token
router.get(
  "/verify",
  generalRateLimit,
  authenticateToken,
  authController.verifyToken,
);

// Get current user profile
router.get(
  "/profile",
  generalRateLimit,
  authenticateToken,
  authController.getProfile,
);

// Update current user profile
router.put(
  "/profile",
  generalRateLimit,
  authenticateToken,
  sanitizeInput,
  validateProfileUpdate,
  authController.updateProfile,
);

// Change password (authenticated user)
router.post(
  "/change-password",
  authRateLimit,
  authenticateToken,
  sanitizeInput,
  validatePasswordChange,
  authController.changePassword,
);

// Logout
router.post(
  "/logout",
  generalRateLimit,
  authenticateToken,
  authController.logout,
);

/**
 * Admin Routes (Role-based access)
 */

// Get user by ID (HOD and Principal only)
router.get(
  "/users/:userId",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.HOD, ROLES.PRINCIPAL]),
  validateUUIDParam("userId"),
  authController.getUserById,
);

/**
 * Role-specific dashboard routes
 */

// Student dashboard access
router.get(
  "/dashboard/student",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.STUDENT]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Student Dashboard",
      user: req.user,
      dashboardType: "student",
    });
  },
);

// Teacher dashboard access
router.get(
  "/dashboard/teacher",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.TEACHER]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Teacher Dashboard",
      user: req.user,
      dashboardType: "teacher",
    });
  },
);

// HOD dashboard access
router.get(
  "/dashboard/hod",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.HOD]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to HOD Dashboard",
      user: req.user,
      dashboardType: "hod",
    });
  },
);

// Principal dashboard access
router.get(
  "/dashboard/principal",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.PRINCIPAL]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Principal Dashboard",
      user: req.user,
      dashboardType: "principal",
    });
  },
);

/**
 * Multi-role access examples
 */

// Teachers and above can access this
router.get(
  "/teacher-resources",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.TEACHER, ROLES.HOD, ROLES.PRINCIPAL]),
  (req, res) => {
    res.json({
      success: true,
      message: "Teacher resources accessed",
      user: req.user,
    });
  },
);

// HOD and Principal only
router.get(
  "/admin-panel",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.HOD, ROLES.PRINCIPAL]),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin panel accessed",
      user: req.user,
    });
  },
);

// Principal only
router.get(
  "/principal-settings",
  generalRateLimit,
  authenticateToken,
  authorizeRoles([ROLES.PRINCIPAL]),
  (req, res) => {
    res.json({
      success: true,
      message: "Principal settings accessed",
      user: req.user,
    });
  },
);

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error("Auth route error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error in authentication service",
  });
});

module.exports = router;
