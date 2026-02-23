const express = require("express");
const departmentController = require("../controllers/departmentController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
  validateDepartmentCreation,
  validateDepartmentUpdate,
  validateDepartmentQuery,
  validateUUIDParam,
  sanitizeInput,
} = require("../middleware/validation");
const { ROLES } = require("../config/constants");

const router = express.Router();

/**
 * Department Routes
 * All routes require Principal role
 */

// Apply authentication and principal role requirement to all routes
router.use(authenticateToken);
router.use(authorizeRoles([ROLES.PRINCIPAL]));
router.use(sanitizeInput);

/**
 * @route   GET /api/departments/stats
 * @desc    Get department statistics
 * @access  Principal only
 */
router.get("/stats", departmentController.getDepartmentStats);

/**
 * @route   GET /api/departments
 * @desc    Get all departments with pagination and search
 * @access  Principal only
 */
router.get(
  "/",
  validateDepartmentQuery,
  departmentController.getAllDepartments,
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Principal only
 */
router.get(
  "/:id",
  validateUUIDParam("id"),
  departmentController.getDepartmentById,
);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Principal only
 */
router.post(
  "/",
  validateDepartmentCreation,
  departmentController.createDepartment,
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Principal only
 */
router.put(
  "/:id",
  validateUUIDParam("id"),
  validateDepartmentUpdate,
  departmentController.updateDepartment,
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Principal only
 */
router.delete(
  "/:id",
  validateUUIDParam("id"),
  departmentController.deleteDepartment,
);

module.exports = router;
