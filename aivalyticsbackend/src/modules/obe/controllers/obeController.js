const { pool } = require("../config/database");
const logger = require("../config/logger");

/**
 * OBE Controller - Handles Outcome-Based Education operations
 * Supports Indian education institutions (Medical, Engineering, Business, IT)
 */

// =====================================================
// PROGRAM MANAGEMENT
// =====================================================

/**
 * Get all institution types
 */
const getInstitutionTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.institution_types ORDER BY name"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching institution types:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all programs with optional filtering
 */
const getPrograms = async (req, res) => {
  try {
    const queryParams = req.query || {};
    const { institution_type_id, is_active } = queryParams;
    
    let query = "SELECT * FROM public.programs";
    const params = [];
    const conditions = [];

    if (institution_type_id) {
      conditions.push(`institution_type_id = $${params.length + 1}`);
      params.push(institution_type_id);
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(is_active === "true");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY name";
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching programs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new program
 */
const createProgram = async (req, res) => {
  try {
    const { name, code, institution_type_id, duration_years, total_credits } = req.body;

    // Validate required fields
    if (!name || !code || !institution_type_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, code, and institution_type_id are required"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.programs (name, code, institution_type_id, duration_years, total_credits) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, code, institution_type_id, duration_years || 4, total_credits || 160]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating program:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// PEO MANAGEMENT
// =====================================================

/**
 * Get PEOs for a program
 */
const getPEOs = async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.program_educational_objectives WHERE program_id = $1 ORDER BY objective_number",
      [programId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching PEOs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new PEO
 */
const createPEO = async (req, res) => {
  try {
    const { program_id, objective_number, title, description } = req.body;

    // Validate required fields
    if (!program_id || !objective_number || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: program_id, objective_number, title, and description are required"
      });
    }

    // Validate objective number range (1-7)
    if (objective_number < 1 || objective_number > 7) {
      return res.status(400).json({
        success: false,
        message: "Objective number must be between 1 and 7"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.program_educational_objectives (program_id, objective_number, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [program_id, objective_number, title, description]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating PEO:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// PLO MANAGEMENT
// =====================================================

/**
 * Get PLOs for a program
 */
const getPLOs = async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.program_learning_outcomes WHERE program_id = $1 ORDER BY outcome_number",
      [programId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching PLOs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new PLO
 */
const createPLO = async (req, res) => {
  try {
    const { program_id, outcome_number, title, description, bloom_level } = req.body;

    // Validate required fields
    if (!program_id || !outcome_number || !title || !description || !bloom_level) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: program_id, outcome_number, title, description, and bloom_level are required"
      });
    }

    // Validate outcome number range (1-12)
    if (outcome_number < 1 || outcome_number > 12) {
      return res.status(400).json({
        success: false,
        message: "Outcome number must be between 1 and 12"
      });
    }

    // Validate bloom level
    const validBloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    if (!validBloomLevels.includes(bloom_level)) {
      return res.status(400).json({
        success: false,
        message: "Bloom level must be one of: Remember, Understand, Apply, Analyze, Evaluate, Create"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.program_learning_outcomes (program_id, outcome_number, title, description, bloom_level) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [program_id, outcome_number, title, description, bloom_level]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating PLO:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// CLO MANAGEMENT
// =====================================================

/**
 * Get CLOs for a course
 */
const getCLOs = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.course_learning_outcomes WHERE course_id = $1 ORDER BY outcome_number",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching CLOs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all CLOs with optional filtering
 */
const getAllCLOs = async (req, res) => {
  try {
    const queryParams = req.query || {};
    const { course_id } = queryParams;

    let query = "SELECT * FROM public.course_learning_outcomes";
    const params = [];
    const conditions = [];

    if (course_id) {
      conditions.push(`course_id = $${params.length + 1}`);
      params.push(course_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY course_id, outcome_number";
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching CLOs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new CLO
 */
const createCLO = async (req, res) => {
  try {
    const { course_id, outcome_number, title, description, bloom_level } = req.body;

    // Validate required fields
    if (!course_id || !outcome_number || !title || !description || !bloom_level) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: course_id, outcome_number, title, description, and bloom_level are required"
      });
    }

    // Validate outcome number range (1-20)
    if (outcome_number < 1 || outcome_number > 20) {
      return res.status(400).json({
        success: false,
        message: "Outcome number must be between 1 and 20"
      });
    }

    // Validate bloom level
    const validBloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    if (!validBloomLevels.includes(bloom_level)) {
      return res.status(400).json({
        success: false,
        message: "Bloom level must be one of: Remember, Understand, Apply, Analyze, Evaluate, Create"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.course_learning_outcomes (course_id, outcome_number, title, description, bloom_level) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [course_id, outcome_number, title, description, bloom_level]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating CLO:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update a CLO
 */
const updateCLO = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome_number, title, description, bloom_level } = req.body;

    // Validate bloom level if provided
    if (bloom_level) {
      const validBloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
      if (!validBloomLevels.includes(bloom_level)) {
        return res.status(400).json({
          success: false,
          message: "Bloom level must be one of: Remember, Understand, Apply, Analyze, Evaluate, Create"
        });
      }
    }

    const result = await pool.query(
      "UPDATE public.course_learning_outcomes SET outcome_number = $1, title = $2, description = $3, bloom_level = $4, updated_at = NOW() WHERE id = $5 RETURNING *",
      [outcome_number, title, description, bloom_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "CLO not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error updating CLO:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete a CLO
 */
const deleteCLO = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM public.course_learning_outcomes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "CLO not found" });
    }

    res.json({ success: true, message: "CLO deleted successfully" });
  } catch (error) {
    logger.error("Error deleting CLO:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// ASSESSMENT MAPPING
// =====================================================

/**
 * Get assessment types
 */
const getAssessmentTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.assessment_types ORDER BY name"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching assessment types:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get course outcome mappings
 */
const getCourseOutcomeMappings = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.course_outcome_mapping WHERE course_id = $1",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching course outcome mappings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new course outcome mapping
 */
const createCourseOutcomeMapping = async (req, res) => {
  try {
    const { course_id, clo_id, assessment_type_id, coverage_level, weight_percentage } = req.body;

    // Validate required fields
    if (!course_id || !clo_id || !assessment_type_id || !coverage_level || !weight_percentage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: course_id, clo_id, assessment_type_id, coverage_level, and weight_percentage are required"
      });
    }

    // Validate coverage level
    const validCoverageLevels = ['Low', 'Medium', 'High'];
    if (!validCoverageLevels.includes(coverage_level)) {
      return res.status(400).json({
        success: false,
        message: "Coverage level must be one of: Low, Medium, High"
      });
    }

    // Validate weight percentage (0-100)
    if (weight_percentage < 0 || weight_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Weight percentage must be between 0 and 100"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.course_outcome_mapping (course_id, clo_id, assessment_type_id, coverage_level, weight_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [course_id, clo_id, assessment_type_id, coverage_level, weight_percentage]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating course outcome mapping:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete a course outcome mapping
 */
const deleteCourseOutcomeMapping = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM public.course_outcome_mapping WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    res.json({ success: true, message: "Mapping deleted successfully" });
  } catch (error) {
    logger.error("Error deleting course outcome mapping:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// ASSESSMENT RECORDS
// =====================================================

/**
 * Get assessment records for a course
 */
const getAssessmentRecords = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.assessment_records WHERE course_id = $1 ORDER BY assessment_date DESC",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching assessment records:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new assessment record
 */
const createAssessmentRecord = async (req, res) => {
  try {
    const {
      course_id,
      assessment_type_id,
      title,
      description,
      max_marks,
      weight_percentage,
      assessment_date,
      due_date,
      created_by,
    } = req.body;

    // Validate required fields
    if (!course_id || !assessment_type_id || !title || !max_marks || !weight_percentage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: course_id, assessment_type_id, title, max_marks, and weight_percentage are required"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.assessment_records (course_id, assessment_type_id, title, description, max_marks, weight_percentage, assessment_date, due_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        course_id,
        assessment_type_id,
        title,
        description,
        max_marks,
        weight_percentage,
        assessment_date,
        due_date,
        created_by,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating assessment record:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete an assessment record
 */
const deleteAssessmentRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM public.assessment_records WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Assessment record not found" });
    }

    res.json({ success: true, message: "Assessment record deleted successfully" });
  } catch (error) {
    logger.error("Error deleting assessment record:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// STUDENT ASSESSMENT SCORES
// =====================================================

/**
 * Get student assessment scores for an assessment record
 */
const getStudentAssessmentScores = async (req, res) => {
  try {
    const { assessmentRecordId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.student_assessment_scores WHERE assessment_record_id = $1",
      [assessmentRecordId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching student assessment scores:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new student assessment score
 */
const createStudentAssessmentScore = async (req, res) => {
  try {
    const { student_id, assessment_record_id, marks_obtained, remarks, evaluated_by } = req.body;

    // Validate required fields
    if (!student_id || !assessment_record_id || !marks_obtained) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: student_id, assessment_record_id, and marks_obtained are required"
      });
    }

    const result = await pool.query(
      "INSERT INTO public.student_assessment_scores (student_id, assessment_record_id, marks_obtained, remarks, evaluated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [student_id, assessment_record_id, marks_obtained, remarks, evaluated_by]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating student assessment score:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// OUTCOME ACHIEVEMENT TRACKING
// =====================================================

/**
 * Get student outcome achievements for a course
 */
const getStudentOutcomeAchievements = async (req, res) => {
  try {
    const { courseId } = req.params;
    const queryParams = req.query || {};
    const { student_id } = queryParams;

    let query = "SELECT * FROM public.student_outcome_achievement WHERE course_id = $1";
    const params = [courseId];

    if (student_id) {
      query += " AND student_id = $2";
      params.push(student_id);
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching student outcome achievements:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// REPORTING
// =====================================================

/**
 * Generate OBE report
 */
const generateOBEReport = async (req, res) => {
  try {
    const { report_type, scope_id, scope_type } = req.body;
    const generated_by = req.user.id;

    // Call the database function to generate the report
    const result = await pool.query(
      "SELECT generate_obe_report($1, $2, $3, $4) as report_id",
      [report_type, scope_id, scope_type, generated_by]
    );

    const reportId = result.rows[0].report_id;
    res.json({ success: true, data: { report_id: reportId } });
  } catch (error) {
    logger.error("Error generating OBE report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get OBE reports
 */
const getOBEReports = async (req, res) => {
  try {
    const queryParams = req.query || {};
    const { report_type, scope_id } = queryParams;

    let query = "SELECT * FROM public.obe_reports";
    const params = [];
    const conditions = [];

    if (report_type) {
      conditions.push(`report_type = $${params.length + 1}`);
      params.push(report_type);
    }

    if (scope_id) {
      conditions.push(`scope_id = $${params.length + 1}`);
      params.push(scope_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching OBE reports:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a specific OBE report
 */
const getOBEReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.obe_reports WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error fetching OBE report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// VIEWS AND ANALYTICS
// =====================================================

/**
 * Get course outcome mapping view
 */
const getCourseOutcomeMappingView = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.course_outcome_mapping_view WHERE course_id = $1",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching course outcome mapping view:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get student progress view
 */
const getStudentProgressView = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.student_progress_view WHERE course_id = $1",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching student progress view:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get student assessment scores view
 */
const getStudentAssessmentScoresView = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.student_assessment_scores_view WHERE course_id = $1",
      [courseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching student assessment scores view:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get OBE dashboard stats
 */
const getOBEDashboardStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get CLO count
    const cloResult = await pool.query(
      "SELECT COUNT(*) as total_clos FROM public.course_learning_outcomes WHERE course_id = $1",
      [courseId]
    );

    // Get mapping count
    const mappingResult = await pool.query(
      "SELECT COUNT(*) as total_mappings FROM public.course_outcome_mapping WHERE course_id = $1",
      [courseId]
    );

    // Get assessment count
    const assessmentResult = await pool.query(
      "SELECT COUNT(*) as total_assessments FROM public.assessment_records WHERE course_id = $1",
      [courseId]
    );

    const stats = {
      totalCLOs: parseInt(cloResult.rows[0].total_clos),
      mappedCLOs: parseInt(mappingResult.rows[0].total_mappings),
      totalAssessments: parseInt(assessmentResult.rows[0].total_assessments),
      averageAchievement: 0, // Will be calculated from student data
      studentsWithOutcomes: 0, // Will be calculated from student data
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error("Error fetching OBE dashboard stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  // Program Management
  getInstitutionTypes,
  getPrograms,
  createProgram,
  
  // PEO Management
  getPEOs,
  createPEO,
  
  // PLO Management
  getPLOs,
  createPLO,
  
  // CLO Management
  getCLOs,
  getAllCLOs,
  createCLO,
  updateCLO,
  deleteCLO,
  
  // Assessment Mapping
  getAssessmentTypes,
  getCourseOutcomeMappings,
  createCourseOutcomeMapping,
  deleteCourseOutcomeMapping,
  
  // Assessment Records
  getAssessmentRecords,
  createAssessmentRecord,
  deleteAssessmentRecord,
  
  // Student Assessment Scores
  getStudentAssessmentScores,
  createStudentAssessmentScore,
  
  // Outcome Achievement Tracking
  getStudentOutcomeAchievements,
  
  // Reporting
  generateOBEReport,
  getOBEReports,
  getOBEReport,
  
  // Views and Analytics
  getCourseOutcomeMappingView,
  getStudentProgressView,
  getStudentAssessmentScoresView,
  getOBEDashboardStats,
}; 