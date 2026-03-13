/**
 * Application Constants
 * Centralized configuration for roles, error messages, and other constants
 */

// User Roles
const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  HOD: "hod",
  PRINCIPAL: "principal",
};

// Role Hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 1,
  [ROLES.TEACHER]: 2,
  [ROLES.HOD]: 3,
  [ROLES.PRINCIPAL]: 4,
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Invalid username or password",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_REQUIRED: "Access token is required",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this action",

  // Validation
  VALIDATION_ERROR: "Validation error",
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters long",
  INVALID_ROLE: "Invalid role specified",
  INVALID_USERNAME: "Username must be 3-50 characters long",

  // General
  INTERNAL_ERROR: "Internal server error",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",

  // Password Reset
  INVALID_RESET_TOKEN: "Invalid or expired reset token",
  PASSWORD_RESET_SENT: "Password reset instructions sent to your email",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTRATION_SUCCESS: "User registered successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",
};

// Validation Rules
const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  ROLL_NUMBER: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9]+$/,
  },
  AGE: {
    MIN: 16,
    MAX: 100,
  },
};

// JWT Configuration
const JWT_CONFIG = {
  ALGORITHM: "HS256",
  ISSUER: "education-platform",
  AUDIENCE: "education-platform-users",
};

// Rate Limiting
const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // 5 attempts per window
  },
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
  },
};

// Database Table Names
const TABLES = {
  USERS: "users",
  ROLES: "roles",
  CLASSES: "class",
  DEPARTMENTS: "department",
  COURSES: "course",
  USER_COURSES: "user_course",
  QUIZZES: "quiz",
  SCORES: "score",
  RESOURCES: "resources",
  REPORTS: "report",
  ATTENDANCE_SESSIONS: "attendance_session",
  ATTENDANCE: "attendance",
  ATTENDANCE_OVERVIEW: "attendance_overview",
  ATTENDANCE_SUMMARY: "attendance_summary",
};

// Cookie Configuration
const COOKIE_CONFIG = {
  HTTP_ONLY: true,
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "strict",
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  JWT_CONFIG,
  RATE_LIMITS,
  TABLES,
  COOKIE_CONFIG,
};
