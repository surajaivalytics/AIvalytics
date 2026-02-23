const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/reports/student-performance
 * @desc    Generate comprehensive student performance report with AI suggestions
 * @access  Private (Students only)
 */
router.get(
  "/student-performance",
  authorizeRoles(["student"]),
  reportController.generateStudentReport
);

/**
 * @route   POST /api/reports/generate-and-store
 * @desc    Generate and store comprehensive student performance report with AI suggestions
 * @access  Private (Students only)
 */
router.post(
  "/generate-and-store",
  authorizeRoles(["student"]),
  reportController.generateAndStoreStudentReport
);

/**
 * @route   GET /api/reports/student-reports
 * @desc    Get all reports for a student with pagination and filtering
 * @access  Private (Students only)
 */
router.get(
  "/student-reports",
  authorizeRoles(["student"]),
  reportController.getStudentReports
);

/**
 * @route   GET /api/reports/:reportId
 * @desc    Get a specific report by ID
 * @access  Private (Students only)
 */
router.get(
  "/:reportId",
  authorizeRoles(["student"]),
  reportController.getReportById
);

module.exports = router;
