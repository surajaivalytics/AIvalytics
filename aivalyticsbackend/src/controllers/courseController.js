const courseService = require("../services/courseService");
const { HTTP_STATUS } = require("../config/constants");
const logger = require("../config/logger");

/**
 * Course Controller
 * Handles all course-related HTTP requests
 */
class CourseController {
  /**
   * Get all courses with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCourses(req, res) {
    try {
      const {
        page, limit, search, status,
      } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || "",
        status: status || "all",
      };

      const result = await courseService.getAllCourses(options, req.user);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get all courses error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get course by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      const result = await courseService.getCourseById(id, user);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get course by ID error: ${error.message}`);
      const statusCode = error.message === "Course not found"
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create new course (Teachers only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCourse(req, res) {
    try {
      const {
        name, about, duration_months, start_date,
      } = req.body;
      const createdBy = req.user.id;

      // Validation
      if (!name || !about) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Course name and about are required",
        });
      }

      // Validate duration_months
      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Duration must be between 1 and 24 months",
        });
      }

      // Validate start_date
      if (start_date && new Date(start_date) < new Date()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Start date cannot be in the past",
        });
      }

      const courseData = {
        name,
        about,
        duration_months: duration_months || 6, // Default 6 months
        start_date: start_date || new Date(), // Default to now
      };

      const result = await courseService.createCourse(courseData, createdBy);

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      logger.error(`Create course error: ${error.message}`);
      const statusCode = error.message.includes("already exists")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update course (Teachers can only update their own courses)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const {
        name, about, duration_months, start_date,
      } = req.body;
      const updatedBy = req.user.id;
      const userRole = req.user.role;

      // Validation
      if (!name && !about && !duration_months && !start_date) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message:
            "At least one field (name, about, duration_months, or start_date) is required",
        });
      }

      // Validate duration_months
      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Duration must be between 1 and 24 months",
        });
      }

      // Validate start_date
      if (start_date && new Date(start_date) < new Date()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Start date cannot be in the past",
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (about) updateData.about = about;
      if (duration_months) updateData.duration_months = duration_months;
      if (start_date) updateData.start_date = start_date;

      const result = await courseService.updateCourse(
        id,
        updateData,
        updatedBy,
        userRole,
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Update course error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("already exists")
        || error.message.includes("can only update")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete course (Teachers can only delete their own courses)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user.id;
      const userRole = req.user.role;

      const result = await courseService.deleteCourse(id, deletedBy, userRole);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Delete course error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("can only delete")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Enroll in course (Students only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async enrollInCourse(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      const result = await courseService.enrollInCourse(id, studentId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Enroll in course error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("Already enrolled")
        || error.message.includes("enrollment deadline")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Unenroll from course (Students only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async unenrollFromCourse(req, res) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      const result = await courseService.unenrollFromCourse(id, studentId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Unenroll from course error: ${error.message}`);
      const statusCode = error.message.includes("not found")
        || error.message.includes("Not enrolled")
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get teacher's courses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTeacherCourses(req, res) {
    try {
      const { page, limit, search } = req.query;
      const teacherId = req.user.id;
      const userRole = req.user.role;

      const result = await courseService.getTeacherCourses(
        teacherId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || "",
        },
        userRole,
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get teacher courses error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get course statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCourseStats(req, res) {
    try {
      const { user } = req;

      const result = await courseService.getCourseStats(user);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get course stats error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get course timeline analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCourseTimelineAnalytics(req, res) {
    try {
      const result = await courseService.getCourseTimelineAnalytics(req.user);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get timeline analytics error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Extend course duration (Teachers only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async extendCourseDuration(req, res) {
    try {
      const { id } = req.params;
      const { additional_months } = req.body;
      const userRole = req.user.role;

      // Validation
      if (
        !additional_months
        || additional_months < 1
        || additional_months > 12
      ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Additional months must be between 1 and 12",
        });
      }

      const result = await courseService.extendCourseDuration(id, additional_months);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Extend course duration error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get courses by status (active, completed, etc.)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCoursesByStatus(req, res) {
    try {
      const { status } = req.query; // all, active, not_started, in_progress, completed, enrollment_open
      const { user } = req;

      const result = await courseService.getCoursesByStatus(
        status || "all",
        user,
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error(`Get courses by status error: ${error.message}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// Create singleton instance
const courseController = new CourseController();

module.exports = courseController;
