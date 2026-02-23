const departmentService = require("../services/departmentService");
const logger = require("../config/logger");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../config/constants");

/**
 * Department Controller
 * CRUD operations for department management (Principal only)
 */

/**
 * Get all departments
 * GET /api/departments
 */
const getAllDepartments = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await departmentService.getAllDepartments({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
    });

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      departments: result.departments,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Get department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await departmentService.getDepartmentById(id);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      department: result.department,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode = error.message === "Department not found"
      ? HTTP_STATUS.NOT_FOUND
      : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Create new department
 * POST /api/departments
 */
const createDepartment = async (req, res) => {
  try {
    const result = await departmentService.createDepartment(
      req.body,
      req.user.id,
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: result.success,
      message: result.message,
      department: result.department,
    });
  } catch (error) {
    logger.logError(error, req);

    const statusCode = error.message.includes("already exists")
      ? HTTP_STATUS.CONFLICT
      : HTTP_STATUS.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Update department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await departmentService.updateDepartment(
      id,
      req.body,
      req.user.id,
    );

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      department: result.department,
    });
  } catch (error) {
    logger.logError(error, req);

    let statusCode = HTTP_STATUS.BAD_REQUEST;
    if (error.message === "Department not found") {
      statusCode = HTTP_STATUS.NOT_FOUND;
    } else if (error.message.includes("already exists")) {
      statusCode = HTTP_STATUS.CONFLICT;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Delete department
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await departmentService.deleteDepartment(id, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    logger.logError(error, req);

    let statusCode = HTTP_STATUS.BAD_REQUEST;
    if (error.message === "Department not found") {
      statusCode = HTTP_STATUS.NOT_FOUND;
    } else if (error.message.includes("Cannot delete")) {
      statusCode = HTTP_STATUS.CONFLICT;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

/**
 * Get department statistics
 * GET /api/departments/stats
 */
const getDepartmentStats = async (req, res) => {
  try {
    const result = await departmentService.getDepartmentStats();

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      stats: result.stats,
    });
  } catch (error) {
    logger.logError(error, req);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
};
