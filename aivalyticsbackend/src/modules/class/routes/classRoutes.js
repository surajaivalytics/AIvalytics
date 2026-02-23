const express = require("express");
const classController = require("../controllers/classController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateClass } = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Apply HOD role authorization to all routes
router.use(authorizeRoles(["hod"]));

/**
 * @route   GET /api/classes
 * @desc    Get all classes with pagination and search
 * @access  Private (HOD only)
 */
router.get("/", classController.getAllClasses);

/**
 * @route   GET /api/classes/stats
 * @desc    Get class statistics
 * @access  Private (HOD only)
 */
router.get("/stats", classController.getClassStats);

/**
 * @route   GET /api/classes/departments
 * @desc    Get all departments for dropdown
 * @access  Private (HOD only)
 */
router.get("/departments", classController.getDepartments);

/**
 * @route   GET /api/classes/students/available
 * @desc    Get available students (not enrolled in any class)
 * @access  Private (HOD only)
 */
router.get("/students/available", classController.getAvailableStudents);

/**
 * @route   GET /api/classes/:id
 * @desc    Get class by ID with details
 * @access  Private (HOD only)
 */
router.get("/:id", classController.getClassById);

/**
 * @route   POST /api/classes
 * @desc    Create new class
 * @access  Private (HOD only)
 */
router.post("/", validateClass, classController.createClass);

/**
 * @route   PUT /api/classes/:id
 * @desc    Update class
 * @access  Private (HOD only)
 */
router.put("/:id", classController.updateClass);

/**
 * @route   DELETE /api/classes/:id
 * @desc    Delete class
 * @access  Private (HOD only)
 */
router.delete("/:id", classController.deleteClass);

/**
 * @route   POST /api/classes/:id/students
 * @desc    Add student to class
 * @access  Private (HOD only)
 */
router.post("/:id/students", classController.addStudentToClass);

/**
 * @route   DELETE /api/classes/:id/students/:student_id
 * @desc    Remove student from class
 * @access  Private (HOD only)
 */
router.delete(
  "/:id/students/:student_id",
  classController.removeStudentFromClass,
);

module.exports = router;
