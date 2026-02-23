const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { authenticateToken } = require("../middleware/auth");

const {
  createAttendanceSession,
  markAttendance,
  getStudentAttendance,
  getAttendanceAnalytics,
  getAttendanceSessions,
  getSessionAttendance,
  getStudentAttendanceRecords,
} = require("../controllers/attendanceController");

const {
  validateCreateSession,
  validateMarkAttendance,
  validateGetStudentAttendance,
  validateGetAnalytics,
  handleValidationErrors,
  attendanceRateLimit,
  auditLogger,
} = require("../middleware/attendanceValidation");

// Middleware for all attendance routes
router.use(authenticateToken);

// ========================================
// ATTENDANCE SESSION ROUTES (Teachers)
// ========================================

/**
 * @route   POST /api/attendance/sessions
 * @desc    Create a new attendance session
 * @access  Teacher only
 */
router.post(
  "/sessions",
  rateLimit(attendanceRateLimit.createSession),
  validateCreateSession,
  handleValidationErrors,
  auditLogger("create_session"),
  createAttendanceSession
);

/**
 * @route   GET /api/attendance/sessions
 * @desc    Get attendance sessions for a course
 * @access  Teacher only
 */
router.get("/sessions", getAttendanceSessions);

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance for students in a session
 * @access  Teacher only
 */
router.post("/mark", markAttendance);

// ========================================
// STUDENT ATTENDANCE ROUTES
// ========================================

/**
 * @route   GET /api/attendance/student
 * @desc    Get attendance records for a student
 * @access  Student (own records), Teacher, HOD, Principal
 * @query   student_id, course_id, start_date, end_date, limit, offset
 */
router.get("/student", getStudentAttendance);

/**
 * @route   GET /api/attendance/student-records
 * @desc    Get student attendance records
 * @access  Student only
 */
router.get("/student-records", getStudentAttendanceRecords);

// ========================================
// ANALYTICS AND REPORTING ROUTES
// ========================================

/**
 * @route   GET /api/attendance/analytics
 * @desc    Get attendance analytics and statistics
 * @access  Teacher, HOD, Principal
 * @query   course_id, class_id, period
 */
router.get("/analytics", getAttendanceAnalytics);

/**
 * @route   GET /api/attendance/session-attendance
 * @desc    Get session attendance records
 * @access  Teacher only
 * @query   session_id
 */
router.get("/session-attendance", getSessionAttendance);

module.exports = router;
