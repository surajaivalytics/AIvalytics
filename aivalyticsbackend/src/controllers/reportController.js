const reportService = require("../services/reportService");
const logger = require("../config/logger");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../config/constants");

/**
 * Report Controller
 * Handles student performance report generation using ReportService
 */

/**
 * Generate comprehensive student performance report with AI suggestions
 */
const generateStudentReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;

    if (studentRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can generate performance reports",
      });
    }

    const report = await reportService.generateComprehensiveReport(studentId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Error generating student report: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to generate performance report",
      error: error.message,
    });
  }
};

/**
 * Get all reports for a student
 */
const getStudentReports = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;

    if (studentRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can view their reports",
      });
    }

    const { report_type, course_id, limit = 10, offset = 0 } = req.query;
    const result = await reportService.getStudentReports(studentId, {
      report_type,
      course_id,
      limit,
      offset
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error getting student reports: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * Get a specific report by ID
 */
const getReportById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { reportId } = req.params;

    const report = await reportService.getReportById(reportId, studentId);

    if (!report) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Report not found or access denied",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Error getting report by ID: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

/**
 * Generate and store comprehensive student performance report
 */
const generateAndStoreStudentReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;
    let { course_id, report_type = "performance" } = req.body;

    if (report_type === "all") report_type = "comprehensive";

    if (studentRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can generate performance reports",
      });
    }

    const reportData = await reportService.generateComprehensiveReport(studentId, course_id);
    
    // Store the report
    const storedReport = await reportService.saveReport({
      user_id: studentId,
      name: `${report_type.charAt(0).toUpperCase() + report_type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      report_type,
      report_data: reportData,
      status: "completed",
      generated_by: studentId,
      course_id: course_id,
      date_created: new Date().toISOString().split("T")[0],
      accuracy: reportData.performance?.overallStats?.passRate || 0,
      suggestions: reportData.aiSuggestions?.overallAssessment || null,
    });

    res.json({
      success: true,
      message: "Report generated and stored successfully",
      data: {
        report: storedReport,
        reportData: reportData,
      },
    });
  } catch (error) {
    logger.error(`Error generating and storing student report: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to generate and store performance report",
      error: error.message,
    });
  }
};

module.exports = {
  generateStudentReport,
  generateAndStoreStudentReport,
  getStudentReports,
  getReportById,
};
