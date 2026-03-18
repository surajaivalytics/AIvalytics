const jwtUtils = require("../utils/jwt");
const logger = require("../config/logger");
const { db } = require("../config/database");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  ROLES,
  ROLE_HIERARCHY,
  TABLES,
} = require("../config/constants");

/**
 * Authentication Middleware
 * Firebase Firestore-backed authentication and authorization
 */

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn(
        `Authentication failed: No token provided | IP: ${req.ip} | Route: ${req.originalUrl}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
      });
    }

    // Verify the token
    const decoded = jwtUtils.verifyAccessToken(token);

    // Fetch user from Firestore to ensure they still exist and are active
    const userDoc = await db.collection(TABLES.USERS).doc(decoded.userId).get();

    if (!userDoc.exists) {
      logger.warn(
        `Authentication failed: User not found or inactive | User ID: ${decoded.userId} | IP: ${req.ip}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    const user = userDoc.data();

    // Check if user is soft-deleted
    if (user.deleted_at) {
      logger.warn(
        `Authentication failed: User is inactive | User ID: ${decoded.userId} | IP: ${req.ip}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    // Check if user role matches token role (prevent role escalation)
    if (user.role !== decoded.role) {
      logger.warn(
        `Authentication failed: Role mismatch | User: ${user.username} | Token Role: ${decoded.role} | DB Role: ${user.role} | Route: ${req.originalUrl}`
      );
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        details: "Role mismatch detected",
      });
    }

    // Attach user information to request
    req.user = {
      id: userDoc.id,
      username: user.username,
      role: user.role,
      roleId: user.role,
      course_ids: user.course_ids || [],
    };

    logger.logAuth(
      "TOKEN_VERIFICATION",
      user.username,
      true,
      `Role: ${user.role} | Route: ${req.originalUrl}`
    );
    next();
  } catch (error) {
    logger.logAuth("TOKEN_VERIFICATION", "unknown", false, error.message);

    if (error.message === "Token expired") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

/**
 * Authorize user based on required roles
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

    const hasRequiredRole = rolesArray.includes(userRole);

    if (!hasRequiredRole) {
      logger.logAuth(
        "ROLE_AUTHORIZATION",
        req.user.username,
        false,
        `Required: ${rolesArray.join(", ")} | User Role: ${userRole} | Route: ${req.originalUrl}`
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
      `Role: ${userRole} | Required: ${rolesArray.join(", ")} | Route: ${req.originalUrl}`
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
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    const userDoc = await db.collection(TABLES.USERS).doc(decoded.userId).get();

    if (!userDoc.exists) {
      req.user = null;
      return next();
    }

    const user = userDoc.data();

    if (user.deleted_at || user.role !== decoded.role) {
      req.user = null;
      return next();
    }

    req.user = {
      id: userDoc.id,
      username: user.username,
      role: user.role,
      roleId: user.role,
      course_ids: user.course_ids || [],
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Check if user can access their own resource or has admin privileges
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

      if (targetUserId === currentUserId) {
        return next();
      }

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
  windowMs: 15 * 60 * 1000,
  max: 5,
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
