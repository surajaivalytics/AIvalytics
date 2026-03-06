const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
  generateMCQ,
  generateMCQFromText,
  generateMCQFromFile,
  getTeacherQuizzes,
  deleteQuiz,
  getCourseQuizzes,
  getQuizForTaking,
  submitQuizAnswers,
  getStudentScores,
  getStudentQuizResult,
  getQuizSubmissions,
  getQuizAnalytics,
  updateQuiz,
  activateQuiz,
  getDetailedExplanation,
} = require("../controllers/mcqController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "text/plain",
    ];

    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
        ),
        false
      );
    }
  },
});

/**
 * @route POST /api/mcq/generate
 * @desc Generate MCQ quiz from uploaded file (OpenAI - legacy)
 * @access Private (Teachers only)
 */
router.post(
  "/generate",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  upload.single("file"),
  generateMCQ
);

/**
 * @route POST /api/mcq/generate-file
 * @desc Generate MCQ quiz from uploaded file using Google Gemini AI
 * @access Private (Teachers only)
 */
router.post(
  "/generate-file",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  upload.single("file"),
  generateMCQFromFile
);

/**
 * @route POST /api/mcq/generate-text
 * @desc Generate MCQ quiz from pasted lecture content using Google Gemini AI
 * @access Private (Teachers only)
 */
router.post(
  "/generate-text",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  generateMCQFromText
);

/**
 * @route GET /api/mcq/quizzes
 * @desc Get teacher's quizzes with pagination
 * @access Private (Teachers only)
 */
router.get(
  "/quizzes",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  getTeacherQuizzes
);

/**
 * @route DELETE /api/mcq/quiz/:quiz_id
 * @desc Delete a quiz
 * @access Private (Teachers only)
 */
router.delete(
  "/quiz/:quiz_id",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  deleteQuiz
);

/**
 * @route PUT /api/mcq/quiz/:quiz_id
 * @desc Update quiz questions and details
 * @access Private (Teachers only)
 */
router.put(
  "/quiz/:quiz_id",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  updateQuiz
);

/**
 * @route POST /api/mcq/quiz/:quiz_id/activate
 * @desc Activate a quiz (make it available to students)
 * @access Private (Teachers only)
 */
router.post(
  "/quiz/:quiz_id/activate",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  activateQuiz
);

// Student routes
router.get(
  "/course/:course_id/quizzes",
  authenticateToken,
  authorizeRoles(["student", "teacher", "hod", "principal"]),
  getCourseQuizzes
);

router.get(
  "/quiz/:quiz_id/take",
  authenticateToken,
  authorizeRoles(["student", "teacher", "hod", "principal"]),
  getQuizForTaking
);

router.post(
  "/quiz/:quiz_id/submit",
  authenticateToken,
  authorizeRoles(["student"]),
  submitQuizAnswers
);

/**
 * @route GET /api/mcq/scores
 * @desc Get student's quiz scores and results
 * @access Private (Students only)
 */
router.get(
  "/scores",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentScores
);

router.get("/quiz/:quiz_id/result", authenticateToken, getStudentQuizResult);

/**
 * @route GET /api/mcq/analytics
 * @desc Get comprehensive quiz analytics for teachers
 * @access Private (Teachers only)
 */
router.get(
  "/analytics",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  getQuizAnalytics
);

// Teacher routes for viewing quiz submissions
router.get(
  "/quiz/:quiz_id/submissions",
  authenticateToken,
  authorizeRoles(["teacher", "hod", "principal"]),
  getQuizSubmissions
);

/**
 * @route POST /api/mcq/explain
 * @desc Generate a detailed explanation for a concept using AI
 * @access Private (All authenticated users)
 */
router.post("/explain", authenticateToken, getDetailedExplanation);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
    });
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
