const { auth, db } = require("../config/database");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  ROLES,
  ROLE_HIERARCHY,
  TABLES,
} = require("../config/constants");

/**
 * Authentication Middleware
 * Enterprise-grade authentication and authorization
 */

/**
 * Verify Firebase ID token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(
        `Authentication failed: No token provided | IP: ${req.ip} | Route: ${req.originalUrl}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user details from Firestore
    const userDoc = await db.collection(TABLES.USERS).doc(uid).get();

    if (!userDoc.exists) {
      logger.warn(
        `Authentication failed: User profile not found in Firestore | UID: ${uid} | IP: ${req.ip}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Profile not found. Please complete registration.",
        code: "PROFILE_NOT_FOUND",
      });
    }

    const userData = userDoc.data();

    // Check if user is active/not deleted
    if (userData.deleted_at) {
      logger.warn(
        `Authentication failed: Account deactivated | User: ${userData.username} | IP: ${req.ip}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Attach user information to request
    req.user = {
      id: uid,
      username: userData.username,
      email: userData.email,
      role: userData.role || ROLES.TEACHER, // Default to teacher if no role found
      roleId: userData.role_id,
      course_ids: userData.course_ids || [],
    };

    logger.logAuth(
      "TOKEN_VERIFICATION",
      userData.username,
      true,
      `Role: ${req.user.role} | Route: ${req.originalUrl}`
    );
    next();
  } catch (error) {
    logger.logAuth("TOKEN_VERIFICATION", "unknown", false, error.message);

    if (error.code === "auth/id-token-expired") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
      details: error.message,
    });
  }
};

/**
 * Authorize user based on required roles
 * @param {string|string[]} requiredRoles - Required role(s) for access
 * @returns {Function} Middleware function
 */
const authorizeRoles = (requiredRoles) => (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn(
        `Authorization failed: No user in request | IP: ${req.ip} | Route: ${req.originalUrl}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    // Check if user has any of the required roles
    const hasRequiredRole = rolesArray.includes(userRole);

    if (!hasRequiredRole) {
      logger.logAuth(
        "ROLE_AUTHORIZATION",
        req.user.username,
        false,
        `Required: ${rolesArray.join(", ")} | User Role: ${userRole} | Route: ${req.originalUrl
        }`
      );

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        details: {
          userRole,
          requiredRoles: rolesArray,
          route: req.originalUrl,
        },
      });
    }

    logger.logAuth(
      "ROLE_AUTHORIZATION",
      req.user.username,
      true,
      `Role: ${userRole} | Required: ${rolesArray.join(", ")} | Route: ${req.originalUrl
      }`
    );

    next();
  } catch (error) {
    logger.error("Error in role authorization:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Authorize user based on role hierarchy (minimum role level)
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Middleware function
 */
const authorizeMinimumRole = (minimumRole) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    const userRole = req.user.role;
    const userRoleLevel = ROLE_HIERARCHY[userRole];
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole];

    if (!userRoleLevel || !minimumRoleLevel) {
      logger.error(
        `Invalid role in hierarchy check: User Role: ${userRole}, Minimum Role: ${minimumRole}`
      );
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
    }

    if (userRoleLevel < minimumRoleLevel) {
      logger.logAuth(
        "HIERARCHY_AUTHORIZATION",
        req.user.username,
        false,
        `User Level: ${userRoleLevel} | Required Level: ${minimumRoleLevel}`
      );

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
    }

    logger.logAuth(
      "HIERARCHY_AUTHORIZATION",
      req.user.username,
      true,
      `User Level: ${userRoleLevel} | Required Level: ${minimumRoleLevel}`
    );

    next();
  } catch (error) {
    logger.error("Error in hierarchy authorization:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Try to verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user details from Firestore
    const userDoc = await db.collection(TABLES.USERS).doc(uid).get();

    if (!userDoc.exists || userDoc.data().deleted_at) {
      req.user = null;
      return next();
    }

    const userData = userDoc.data();

    // Valid token and existing user, attach to request
    req.user = {
      id: uid,
      username: userData.username,
      email: userData.email,
      role: userData.role || ROLES.TEACHER,
      roleId: userData.role_id,
      course_ids: userData.course_ids || [],
    };

    next();
  } catch (error) {
    // Token verification failed or user not found, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Check if user can access their own resource or has admin privileges
 * @param {string} userIdParam - Parameter name containing user ID
 * @returns {Function} Middleware function
 */
const authorizeOwnerOrAdmin =
  (userIdParam = "userId") =>
    (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        }

        const targetUserId = req.params[userIdParam] || req.body[userIdParam];
        const currentUserId = req.user.id;
        const userRole = req.user.role;

        // Allow if user is accessing their own resource
        if (targetUserId === currentUserId) {
          return next();
        }

        // Allow if user has admin privileges (HOD or Principal)
        if (userRole === ROLES.HOD || userRole === ROLES.PRINCIPAL) {
          return next();
        }

        logger.logAuth(
          "OWNER_OR_ADMIN_CHECK",
          req.user.username,
          false,
          `Target User: ${targetUserId} | Current User: ${currentUserId} | Role: ${userRole}`
        );

        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        });
      } catch (error) {
        logger.error("Error in owner/admin authorization:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    };

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeMinimumRole,
  optionalAuth,
  authorizeOwnerOrAdmin,
  authRateLimit,
};
