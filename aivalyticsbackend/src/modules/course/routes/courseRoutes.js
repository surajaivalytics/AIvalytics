const express = require("express");
const courseController = require("../controllers/courseController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateCourse } = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/courses
 * @desc    Get all courses with optional filters (search, status, pagination)
 * @access  Private
 */
router.get("/", courseController.getAllCourses);

/**
 * @route   GET /api/courses/stats
 * @desc    Get course statistics
 * @access  Private (All roles)
 */
router.get("/stats", courseController.getCourseStats);

/**
 * @route   GET /api/courses/timeline-analytics
 * @desc    Get course timeline analytics
 * @access  Private (Teachers, HOD, Principal)
 */
router.get(
  "/timeline-analytics",
  authorizeRoles(["teacher", "hod", "principal"]),
  courseController.getCourseTimelineAnalytics,
);

/**
 * @route   GET /api/courses/my-courses
 * @desc    Get teacher's own courses (or all courses for HOD/Principal)
 * @access  Private (Teachers, HOD, Principal)
 */
router.get(
  "/my-courses",
  authorizeRoles(["teacher", "hod", "principal"]),
  courseController.getTeacherCourses,
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID with details
 * @access  Private (All roles)
 */
router.get("/:id", courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Teachers only)
 */
router.post(
  "/",
  authorizeRoles(["teacher"]),
  validateCourse,
  courseController.createCourse,
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course (Teachers can only update their own courses)
 * @access  Private (Teachers only)
 */
router.put(
  "/:id",
  authorizeRoles(["teacher", "hod", "principal"]),
  courseController.updateCourse,
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course (Teachers can only delete their own courses)
 * @access  Private (Teachers only)
 */
router.delete(
  "/:id",
  authorizeRoles(["teacher", "hod", "principal"]),
  courseController.deleteCourse,
);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in course
 * @access  Private (Students only)
 */
router.post(
  "/:id/enroll",
  authorizeRoles(["student"]),
  courseController.enrollInCourse,
);

/**
 * @route   DELETE /api/courses/:id/enroll
 * @desc    Unenroll from course
 * @access  Private (Students only)
 */
router.delete(
  "/:id/enroll",
  authorizeRoles(["student"]),
  courseController.unenrollFromCourse,
);

/**
 * @route   PUT /api/courses/:id/extend-duration
 * @desc    Extend course duration
 * @access  Private (Teachers can extend their own courses, HOD/Principal can extend any)
 */
router.put(
  "/:id/extend-duration",
  authorizeRoles(["teacher", "hod", "principal"]),
  courseController.extendCourseDuration,
);

module.exports = router;
