-- Add Report Storage Functionality and Fix Attendance Session Constraint
-- This script adds report storage capabilities and fixes the attendance system

-- ========================================
-- FIX ATTENDANCE SESSION CONSTRAINT
-- ========================================

-- Drop the existing constraint if it exists
ALTER TABLE attendance_session DROP CONSTRAINT IF EXISTS valid_student_counts;

-- Add the corrected constraint
ALTER TABLE attendance_session ADD CONSTRAINT valid_student_counts CHECK (
  total_students >= 0 AND 
  present_students >= 0 AND 
  absent_students >= 0 AND 
  late_students >= 0 AND
  (present_students + absent_students + late_students) <= total_students
);

-- ========================================
-- ENHANCE REPORT TABLE STRUCTURE
-- ========================================

-- Add missing columns to the report table
ALTER TABLE report ADD COLUMN IF NOT EXISTS report_type VARCHAR(50) DEFAULT 'performance' CHECK (
  report_type IN ('performance', 'attendance', 'comprehensive', 'custom', 'all')
);

ALTER TABLE report ADD COLUMN IF NOT EXISTS report_data JSONB;
ALTER TABLE report ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (
  status IN ('pending', 'processing', 'completed', 'failed')
);

ALTER TABLE report ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE report ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES "user"(id);
ALTER TABLE report ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES course(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_user_id ON report(user_id);
CREATE INDEX IF NOT EXISTS idx_report_date_created ON report(date_created);
CREATE INDEX IF NOT EXISTS idx_report_type ON report(report_type);
CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_course_id ON report(course_id);

-- ========================================
-- FUNCTIONS FOR REPORT GENERATION
-- ========================================

-- Function to calculate student performance metrics
CREATE OR REPLACE FUNCTION calculate_student_performance(
  p_student_id UUID,
  p_course_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  performance_data JSONB;
  total_quizzes INTEGER;
  average_score NUMERIC;
  highest_score INTEGER;
  total_marks INTEGER;
  total_possible_marks INTEGER;
  pass_rate NUMERIC;
BEGIN
  -- Calculate performance metrics
  SELECT 
    COUNT(*),
    AVG(marks),
    MAX(marks),
    SUM(marks),
    SUM(CASE WHEN quiz.max_score > 0 THEN quiz.max_score ELSE 0 END),
    (COUNT(CASE WHEN (marks::NUMERIC / NULLIF(quiz.max_score, 0)) >= 0.6 THEN 1 END)::NUMERIC / COUNT(*)) * 100
  INTO 
    total_quizzes,
    average_score,
    highest_score,
    total_marks,
    total_possible_marks,
    pass_rate
  FROM score s
  JOIN quiz q ON s.quiz_id = q.id
  WHERE s.user_id = p_student_id
    AND s.deleted_at IS NULL
    AND q.deleted_at IS NULL
    AND (p_course_id IS NULL OR q.course_id = p_course_id);

  -- Build performance data
  performance_data = jsonb_build_object(
    'total_quizzes', COALESCE(total_quizzes, 0),
    'average_score', COALESCE(average_score, 0),
    'highest_score', COALESCE(highest_score, 0),
    'total_marks', COALESCE(total_marks, 0),
    'total_possible_marks', COALESCE(total_possible_marks, 0),
    'pass_rate', COALESCE(pass_rate, 0),
    'overall_percentage', CASE 
      WHEN total_possible_marks > 0 THEN (total_marks::NUMERIC / total_possible_marks) * 100
      ELSE 0
    END
  );

  RETURN performance_data;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate student attendance metrics
CREATE OR REPLACE FUNCTION calculate_student_attendance(
  p_student_id UUID,
  p_course_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  attendance_data JSONB;
  total_sessions INTEGER;
  present_sessions INTEGER;
  absent_sessions INTEGER;
  late_sessions INTEGER;
  excused_sessions INTEGER;
  attendance_percentage NUMERIC;
BEGIN
  -- Calculate attendance metrics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN a.attendance_status IN ('present', 'excused') THEN 1 END),
    COUNT(CASE WHEN a.attendance_status = 'absent' THEN 1 END),
    COUNT(CASE WHEN a.attendance_status = 'late' THEN 1 END),
    COUNT(CASE WHEN a.attendance_status = 'excused' THEN 1 END)
  INTO 
    total_sessions,
    present_sessions,
    absent_sessions,
    late_sessions,
    excused_sessions
  FROM attendance a
  JOIN attendance_session ass ON a.session_id = ass.id
  WHERE a.student_id = p_student_id
    AND ass.status = 'completed'
    AND (p_course_id IS NULL OR ass.course_id = p_course_id);

  -- Calculate attendance percentage
  attendance_percentage = CASE 
    WHEN total_sessions > 0 THEN ((present_sessions + late_sessions)::NUMERIC / total_sessions) * 100
    ELSE 0
  END;

  -- Build attendance data
  attendance_data = jsonb_build_object(
    'total_sessions', COALESCE(total_sessions, 0),
    'present_sessions', COALESCE(present_sessions, 0),
    'absent_sessions', COALESCE(absent_sessions, 0),
    'late_sessions', COALESCE(late_sessions, 0),
    'excused_sessions', COALESCE(excused_sessions, 0),
    'attendance_percentage', COALESCE(attendance_percentage, 0)
  );

  RETURN attendance_data;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS FOR AUTOMATIC REPORT UPDATES
-- ========================================

-- Function to update user performance metrics when scores change
CREATE OR REPLACE FUNCTION update_user_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user performance metrics
  UPDATE "user" SET
    total_score = (
      SELECT COALESCE(SUM(marks), 0)
      FROM score
      WHERE user_id = NEW.user_id AND deleted_at IS NULL
    ),
    total_quizzes_taken = (
      SELECT COUNT(*)
      FROM score
      WHERE user_id = NEW.user_id AND deleted_at IS NULL
    ),
    average_score = (
      SELECT COALESCE(AVG(marks), 0)
      FROM score
      WHERE user_id = NEW.user_id AND deleted_at IS NULL
    ),
    highest_score = (
      SELECT COALESCE(MAX(marks), 0)
      FROM score
      WHERE user_id = NEW.user_id AND deleted_at IS NULL
    ),
    total_possible_score = (
      SELECT COALESCE(SUM(q.max_score), 0)
      FROM score s
      JOIN quiz q ON s.quiz_id = q.id
      WHERE s.user_id = NEW.user_id AND s.deleted_at IS NULL AND q.deleted_at IS NULL
    ),
    overall_percentage = (
      SELECT CASE 
        WHEN SUM(q.max_score) > 0 THEN (SUM(s.marks)::NUMERIC / SUM(q.max_score)) * 100
        ELSE 0
      END
      FROM score s
      JOIN quiz q ON s.quiz_id = q.id
      WHERE s.user_id = NEW.user_id AND s.deleted_at IS NULL AND q.deleted_at IS NULL
    ),
    last_quiz_date = NOW(),
    score_updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for score updates
DROP TRIGGER IF EXISTS trigger_update_user_performance ON score;
CREATE TRIGGER trigger_update_user_performance
  AFTER INSERT OR UPDATE OR DELETE ON score
  FOR EACH ROW
  EXECUTE FUNCTION update_user_performance_metrics();

-- ========================================
-- VIEWS FOR REPORT DATA
-- ========================================

-- View for comprehensive student performance data
CREATE OR REPLACE VIEW student_performance_view AS
SELECT 
  u.id as student_id,
  u.username,
  u.roll_number,
  u.email,
  u.total_score,
  u.total_quizzes_taken,
  u.average_score,
  u.highest_score,
  u.overall_percentage,
  u.last_quiz_date,
  u.overall_attendance_percentage,
  u.attendance_status,
  u.created_at as member_since,
  jsonb_build_object(
    'performance', calculate_student_performance(u.id),
    'attendance', calculate_student_attendance(u.id)
  ) as metrics
FROM "user" u
WHERE u.deleted_at IS NULL;

-- ========================================
-- SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample report (optional - for testing)
-- INSERT INTO report (user_id, name, report_type, report_data, status, generated_by, date_created)
-- VALUES (
--   (SELECT id FROM "user" WHERE role = 'student' LIMIT 1),
--   'Sample Performance Report',
--   'performance',
--   '{"sample": "data"}'::jsonb,
--   'completed',
--   (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
--   CURRENT_DATE
-- );

COMMIT; 