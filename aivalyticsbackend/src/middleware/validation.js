const { body, param, query, validationResult } = require("express-validator");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  ROLES,
} = require("../config/constants");

/**
 * Validation Middleware
 * Enterprise-grade input validation and sanitization
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    logger.warn(
      `Validation failed | Route: ${req.originalUrl} | Errors: ${JSON.stringify(
        errorMessages
      )} | IP: ${req.ip}`
    );

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: errorMessages,
    });
  }

  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body("username")
    .trim()
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`
    )
    .matches(VALIDATION_RULES.USERNAME.PATTERN)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .escape(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters"),

  body("password")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  body("rollNumber")
    .trim()
    .isLength({
      min: VALIDATION_RULES.ROLL_NUMBER.MIN_LENGTH,
      max: VALIDATION_RULES.ROLL_NUMBER.MAX_LENGTH,
    })
    .withMessage(
      `Roll number must be between ${VALIDATION_RULES.ROLL_NUMBER.MIN_LENGTH} and ${VALIDATION_RULES.ROLL_NUMBER.MAX_LENGTH} characters`
    )
    .matches(VALIDATION_RULES.ROLL_NUMBER.PATTERN)
    .withMessage("Roll number can only contain uppercase letters and numbers")
    .escape(),

  body("role")
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(", ")}`),

  body("age")
    .optional()
    .isInt({ min: VALIDATION_RULES.AGE.MIN, max: VALIDATION_RULES.AGE.MAX })
    .withMessage(
      `Age must be between ${VALIDATION_RULES.AGE.MIN} and ${VALIDATION_RULES.AGE.MAX}`
    )
    .toInt(),

  body("classId")
    .optional()
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * User login validation
 */
const validateUserLogin = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Username must be between 3 and 255 characters")
    .escape(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1, max: VALIDATION_RULES.PASSWORD.MAX_LENGTH })
    .withMessage("Password is required"),

  handleValidationErrors,
];

/**
 * Password reset request validation
 */
const validatePasswordResetRequest = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ min: 3, max: 255 })
    .withMessage("Email must be between 3 and 255 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Password reset validation
 */
const validatePasswordReset = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isJWT()
    .withMessage("Invalid reset token format"),

  body("newPassword")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  handleValidationErrors,
];

/**
 * Change password validation
 */
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({
      min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
    })
    .withMessage(
      `Password must be between ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} and ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),

  handleValidationErrors,
];

/**
 * Refresh token validation
 */
const validateRefreshToken = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isJWT()
    .withMessage("Invalid refresh token format"),

  handleValidationErrors,
];

/**
 * UUID parameter validation
 */
const validateUUIDParam = (paramName) => [
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`),

  handleValidationErrors,
];

/**
 * Profile update validation
 */
const validateProfileUpdate = [
  body("username")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME.MIN_LENGTH} and ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`
    )
    .matches(VALIDATION_RULES.USERNAME.PATTERN)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .escape(),

  body("rollNumber")
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_RULES.ROLL_NUMBER.MIN_LENGTH,
      max: VALIDATION_RULES.ROLL_NUMBER.MAX_LENGTH,
    })
    .withMessage(
      `Roll number must be between ${VALIDATION_RULES.ROLL_NUMBER.MIN_LENGTH} and ${VALIDATION_RULES.ROLL_NUMBER.MAX_LENGTH} characters`
    )
    .matches(VALIDATION_RULES.ROLL_NUMBER.PATTERN)
    .withMessage("Roll number can only contain uppercase letters and numbers")
    .escape(),

  body("age")
    .optional()
    .isInt({ min: VALIDATION_RULES.AGE.MIN, max: VALIDATION_RULES.AGE.MAX })
    .withMessage(
      `Age must be between ${VALIDATION_RULES.AGE.MIN} and ${VALIDATION_RULES.AGE.MAX}`
    )
    .toInt(),

  body("classId")
    .optional()
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * Pagination validation
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("sortBy")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Sort field must be between 1 and 50 characters")
    .escape(),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors,
];

/**
 * Search validation
 */
const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters")
    .escape(),

  query("filter")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Filter must be between 1 and 50 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Custom validation for role-based user creation
 */
const validateRoleBasedUserCreation = [
  body("role").custom((value, { req }) => {
    const creatorRole = req.user?.role;

    // Only HOD and Principal can create users
    if (creatorRole !== ROLES.HOD && creatorRole !== ROLES.PRINCIPAL) {
      throw new Error("Insufficient permissions to create users");
    }

    // HOD can only create students and teachers
    if (
      creatorRole === ROLES.HOD &&
      (value === ROLES.HOD || value === ROLES.PRINCIPAL)
    ) {
      throw new Error("HOD cannot create HOD or Principal accounts");
    }

    return true;
  }),

  handleValidationErrors,
];

/**
 * Department validation
 */
const validateDepartmentCreation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s&-]+$/)
    .withMessage("Department name can only contain letters, spaces, & and -")
    .escape(),

  handleValidationErrors,
];

const validateDepartmentUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s&-]+$/)
    .withMessage("Department name can only contain letters, spaces, & and -")
    .escape(),

  handleValidationErrors,
];

/**
 * Department query validation
 */
const validateDepartmentQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must be less than 100 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Class validation
 */
const validateClass = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Class name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Class name must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Class name can only contain letters, numbers, spaces, and hyphens"
    )
    .escape(),

  body("department_id")
    .notEmpty()
    .withMessage("Department is required")
    .isUUID()
    .withMessage("Department ID must be a valid UUID"),

  handleValidationErrors,
];

const validateClassUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Class name must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Class name can only contain letters, numbers, spaces, and hyphens"
    )
    .escape(),

  body("department_id")
    .optional()
    .isUUID()
    .withMessage("Department ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * Class query validation
 */
const validateClassQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must be less than 100 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Student to class validation
 */
const validateStudentToClass = [
  body("student_id")
    .notEmpty()
    .withMessage("Student ID is required")
    .isUUID()
    .withMessage("Student ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * Course validation
 */
const validateCourse = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Course name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Course name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage(
      "Course name can only contain letters, numbers, spaces, &, ., and -"
    )
    .escape(),

  body("about")
    .trim()
    .notEmpty()
    .withMessage("Course description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Course description must be between 10 and 1000 characters")
    .escape(),

  handleValidationErrors,
];

const validateCourseUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Course name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage(
      "Course name can only contain letters, numbers, spaces, &, ., and -"
    )
    .escape(),

  body("about")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Course description must be between 10 and 1000 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Course query validation
 */
const validateCourseQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must be less than 100 characters")
    .escape(),

  handleValidationErrors,
];

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  // Remove any null bytes
  const sanitizeValue = (value) => {
    if (typeof value === "string") {
      return value.replace(/\0/g, "");
    }
    return value;
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateRefreshToken,
  validateUUIDParam,
  validateProfileUpdate,
  validatePagination,
  validateSearch,
  validateRoleBasedUserCreation,
  validateDepartmentCreation,
  validateDepartmentUpdate,
  validateDepartmentQuery,
  validateClass,
  validateClassUpdate,
  validateClassQuery,
  validateStudentToClass,
  validateCourse,
  validateCourseUpdate,
  validateCourseQuery,
  sanitizeInput,
  handleValidationErrors,
};
