const { body, query, param, validationResult } = require("express-validator");

/**
 * Validation middleware for creating attendance sessions
 */
const validateCreateSession = [
  body("course_id")
    .notEmpty()
    .withMessage("Course ID is required")
    .isUUID()
    .withMessage("Course ID must be a valid UUID"),

  body("session_date")
    .notEmpty()
    .withMessage("Session date is required")
    .isDate()
    .withMessage("Session date must be a valid date"),

  body("session_time")
    .notEmpty()
    .withMessage("Session time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Session time must be in HH:MM:SS format"),

  body("session_duration")
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage("Session duration must be between 1 and 480 minutes"),

  body("session_type")
    .optional()
    .isIn(["lecture", "lab", "tutorial", "exam", "other"])
    .withMessage(
      "Session type must be one of: lecture, lab, tutorial, exam, other"
    ),

  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),

  body("topic")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Topic must be less than 200 characters"),
];

/**
 * Validation middleware for marking attendance
 */
const validateMarkAttendance = [
  body("session_id")
    .notEmpty()
    .withMessage("Session ID is required")
    .isUUID()
    .withMessage("Session ID must be a valid UUID"),

  body("attendance_records")
    .isArray({ min: 1 })
    .withMessage("Attendance records must be a non-empty array"),

  body("attendance_records.*.student_id")
    .notEmpty()
    .withMessage("Student ID is required for each record")
    .isUUID()
    .withMessage("Student ID must be a valid UUID"),

  body("attendance_records.*.attendance_status")
    .isIn(["present", "absent", "late", "excused"])
    .withMessage(
      "Attendance status must be one of: present, absent, late, excused"
    ),

  body("attendance_records.*.notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),

  body("attendance_records.*.arrival_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Arrival time must be in HH:MM:SS format"),
];

/**
 * Validation middleware for getting student attendance
 */
const validateGetStudentAttendance = [
  query("student_id")
    .optional()
    .isUUID()
    .withMessage("Student ID must be a valid UUID"),

  query("course_id")
    .optional()
    .isUUID()
    .withMessage("Course ID must be a valid UUID"),

  query("start_date")
    .optional()
    .isDate()
    .withMessage("Start date must be a valid date"),

  query("end_date")
    .optional()
    .isDate()
    .withMessage("End date must be a valid date"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
];

/**
 * Validation middleware for attendance analytics
 */
const validateGetAnalytics = [
  query("course_id")
    .optional()
    .isUUID()
    .withMessage("Course ID must be a valid UUID"),

  query("class_id")
    .optional()
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),

  query("start_date")
    .optional()
    .isDate()
    .withMessage("Start date must be a valid date"),

  query("end_date")
    .optional()
    .isDate()
    .withMessage("End date must be a valid date"),
];

/**
 * Validation middleware for updating attendance
 */
const validateUpdateAttendance = [
  param("attendance_id")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isUUID()
    .withMessage("Attendance ID must be a valid UUID"),

  body("attendance_status")
    .optional()
    .isIn(["present", "absent", "late", "excused"])
    .withMessage(
      "Attendance status must be one of: present, absent, late, excused"
    ),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),

  body("excuse_approved")
    .optional()
    .isBoolean()
    .withMessage("Excuse approved must be a boolean"),
];

/**
 * Validation middleware for excuse requests
 */
const validateExcuseRequest = [
  body("attendance_id")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isUUID()
    .withMessage("Attendance ID must be a valid UUID"),

  body("excuse_reason")
    .notEmpty()
    .withMessage("Excuse reason is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Excuse reason must be between 10 and 1000 characters"),

  body("excuse_document_url")
    .optional()
    .isURL()
    .withMessage("Excuse document URL must be a valid URL"),
];

/**
 * Error handling middleware for validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Rate limiting configuration for attendance operations
 */
const attendanceRateLimit = {
  // Allow 10 attendance marking operations per minute per user
  markAttendance: {
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
      success: false,
      message: "Too many attendance marking attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Allow 100 read operations per minute per user
  readOperations: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Allow 5 session creation operations per minute per teacher
  createSession: {
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
      success: false,
      message: "Too many session creation attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**
 * Audit logging middleware for attendance operations
 */
const auditLogger = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log the operation
      const auditLog = {
        timestamp: new Date().toISOString(),
        action,
        user_id: req.user?.id,
        user_role: req.user?.role,
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
        request_body: req.body,
        request_params: req.params,
        request_query: req.query,
        response_status: res.statusCode,
        success: res.statusCode < 400,
      };

      // In production, you would send this to a logging service
      console.log("ATTENDANCE_AUDIT:", JSON.stringify(auditLog));

      // Call the original send method
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  validateCreateSession,
  validateMarkAttendance,
  validateGetStudentAttendance,
  validateGetAnalytics,
  validateUpdateAttendance,
  validateExcuseRequest,
  handleValidationErrors,
  attendanceRateLimit,
  auditLogger,
};
