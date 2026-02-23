const classService = require("../services/classService");
const { HTTP_STATUS } = require("../config/constants");
const logger = require("../config/logger");

/**
 * Class Controller
 * Handles all class-related HTTP requests
 */
class ClassController {
  /**
   * Get all classes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllClasses(req, res) {
    try {
      const { page, limit, search } = req.query;

      const result = await classService.getAllClasses({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || "",
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get all classes error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get class by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getClassById(req, res) {
    try {
      const { id } = req.params;

      const result = await classService.getClassById(id);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get class by ID error: ${error.message}`);
      const statusCode = error.message === "Class not found"
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create new class
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createClass(req, res) {
    try {
      const { name, department_id } = req.body;
      const createdBy = req.user.id;

      // Validation
      if (!name || !department_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Class name and department are required",
        });
      }

      const result = await classService.createClass(
        { name, department_id },
        createdBy,
      );

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      logger.error(`Create class error: ${error.message}`);
      const statusCode = error.message.includes("already exists")
        || error.message.includes("not found")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update class
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const { name, department_id } = req.body;
      const updatedBy = req.user.id;

      // Validation
      if (!name && !department_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "At least one field (name or department) is required",
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (department_id) updateData.department_id = department_id;

      const result = await classService.updateClass(id, updateData, updatedBy);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Update class error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("already exists")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete class
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteClass(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user.id;

      const result = await classService.deleteClass(id, deletedBy);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Delete class error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("Cannot delete")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Add student to class
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addStudentToClass(req, res) {
    try {
      const { id } = req.params;
      const { student_id } = req.body;
      const addedBy = req.user.id;

      // Validation
      if (!student_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Student ID is required",
        });
      }

      const result = await classService.addStudentToClass(
        id,
        student_id,
        addedBy,
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Add student to class error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("already enrolled")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Remove student from class
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeStudentFromClass(req, res) {
    try {
      const { id, student_id } = req.params;
      const removedBy = req.user.id;

      const result = await classService.removeStudentFromClass(
        id,
        student_id,
        removedBy,
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Remove student from class error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get available students
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableStudents(req, res) {
    try {
      const { search } = req.query;

      const result = await classService.getAvailableStudents(search || "");

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get available students error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get departments for dropdown
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDepartments(req, res) {
    try {
      const result = await classService.getDepartments();

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get departments error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get class statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getClassStats(req, res) {
    try {
      const result = await classService.getClassStats();

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get class stats error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// Create singleton instance
const classController = new ClassController();

module.exports = classController;
