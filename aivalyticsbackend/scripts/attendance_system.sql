-- Attendance System Database Schema
-- This script creates a comprehensive attendance system that integrates with existing schema
-- Safe to run - uses IF NOT EXISTS and preserves all existing data

-- ========================================
-- ATTENDANCE CORE TABLES
-- ========================================

-- 1. Attendance Sessions Table (Class Sessions)
CREATE TABLE IF NOT EXISTS attendance_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  class_id UUID REFERENCES class(id) ON DELETE SET NULL,
  teacher_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_time TIME NOT NULL DEFAULT CURRENT_TIME,
  session_duration INTEGER DEFAULT 60, -- Duration in minutes
  session_type VARCHAR(20) DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'lab', 'tutorial', 'exam', 'other')),
  location VARCHAR(100),
  topic VARCHAR(200),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  attendance_marked BOOLEAN DEFAULT FALSE,
  total_students INTEGER DEFAULT 0,
  present_students INTEGER DEFAULT 0,
  absent_students INTEGER DEFAULT 0,
  late_students INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES "user"(id),
  updated_by UUID REFERENCES "user"(id),
  
  -- Constraints
  CONSTRAINT unique_session_per_course_datetime UNIQUE(course_id, session_date, session_time),
  CONSTRAINT valid_duration CHECK (session_duration > 0 AND session_duration <= 480), -- Max 8 hours
  CONSTRAINT valid_student_counts CHECK (
    total_students >= 0 AND 
    present_students >= 0 AND 
    absent_students >= 0 AND 
    late_students >= 0 AND
    (present_students + absent_students + late_students) <= total_students
  )
);

-- 2. Attendance Records Table (Individual Student Attendance)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES attendance_session(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  attendance_status VARCHAR(20) NOT NULL DEFAULT 'absent' CHECK (
    attendance_status IN ('present', 'absent', 'late', 'excused', 'medical_leave')
  ),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marked_by UUID NOT NULL REFERENCES "user"(id), -- Teacher who marked attendance
  arrival_time TIME,
  departure_time TIME,
  location_verified BOOLEAN DEFAULT FALSE,
  ip_address INET,
  device_info JSONB,
  notes TEXT,
  excuse_reason TEXT,
  excuse_document_url TEXT,
  excuse_approved BOOLEAN DEFAULT NULL,
  excuse_approved_by UUID REFERENCES "user"(id),
  excuse_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_student_session_attendance UNIQUE(session_id, student_id),
  CONSTRAINT valid_times CHECK (
    (arrival_time IS NULL OR departure_time IS NULL) OR 
    (departure_time >= arrival_time)
  ),
  CONSTRAINT excuse_logic CHECK (
    (attendance_status NOT IN ('excused', 'medical_leave')) OR 
    (excuse_reason IS NOT NULL)
  )
);

-- 3. Attendance Settings Table (Institution/Course Policies)
CREATE TABLE IF NOT EXISTS attendance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(20) NOT NULL CHECK (scope IN ('institution', 'course', 'class')),
  scope_id UUID, -- course_id or class_id, NULL for institution-wide
  minimum_attendance_percentage NUMERIC(5,2) DEFAULT 75.00,
  grace_period_minutes INTEGER DEFAULT 15, -- Late arrival grace period
  auto_mark_absent_after_minutes INTEGER DEFAULT 30,
  allow_excuse_requests BOOLEAN DEFAULT TRUE,
  require_excuse_approval BOOLEAN DEFAULT TRUE,
  excuse_deadline_hours INTEGER DEFAULT 24, -- Hours after session to submit excuse
  notification_enabled BOOLEAN DEFAULT TRUE,
  low_attendance_threshold NUMERIC(5,2) DEFAULT 80.00, -- When to send warnings
  warning_notification_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (
    warning_notification_frequency IN ('daily', 'weekly', 'monthly')
  ),
  academic_year VARCHAR(10),
  semester VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES "user"(id),
  updated_by UUID REFERENCES "user"(id),
  
  -- Constraints
  CONSTRAINT valid_percentages CHECK (
    minimum_attendance_percentage >= 0 AND minimum_attendance_percentage <= 100 AND
    low_attendance_threshold >= 0 AND low_attendance_threshold <= 100
  ),
  CONSTRAINT valid_scope_reference CHECK (
    (scope = 'institution' AND scope_id IS NULL) OR
    (scope = 'course' AND scope_id IS NOT NULL) OR
    (scope = 'class' AND scope_id IS NOT NULL)
  )
);

-- 4. Attendance Summary Table (Calculated Statistics)
CREATE TABLE IF NOT EXISTS attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  academic_year VARCHAR(10),
  semester VARCHAR(20),
  total_sessions INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  absent_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  medical_leave_count INTEGER DEFAULT 0,
  attendance_percentage NUMERIC(5,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'good' CHECK (status IN ('excellent', 'good', 'warning', 'critical')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_student_course_period UNIQUE(student_id, course_id, academic_year, semester),
  CONSTRAINT valid_counts CHECK (
    total_sessions >= 0 AND present_count >= 0 AND absent_count >= 0 AND
    late_count >= 0 AND excused_count >= 0 AND medical_leave_count >= 0 AND
    (present_count + absent_count + late_count + excused_count + medical_leave_count) <= total_sessions
  ),
  CONSTRAINT valid_percentage CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100)
);

-- ========================================
-- ADD ATTENDANCE FIELDS TO EXISTING TABLES
-- ========================================

-- Add attendance-related fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS overall_attendance_percentage NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(20) DEFAULT 'good' CHECK (
  attendance_status IN ('excellent', 'good', 'warning', 'critical')
);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_attendance_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add attendance tracking to course table
ALTER TABLE course ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE course ADD COLUMN IF NOT EXISTS attendance_tracking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE course ADD COLUMN IF NOT EXISTS minimum_attendance_required NUMERIC(5,2) DEFAULT 75.00;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Attendance Session Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_session_course_date ON attendance_session(course_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_session_teacher ON attendance_session(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session_status ON attendance_session(status);
CREATE INDEX IF NOT EXISTS idx_attendance_session_date_range ON attendance_session(session_date, session_time);

-- Attendance Records Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_course ON attendance(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session_status ON attendance(session_id, attendance_status);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_date ON attendance(marked_at);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, created_at);

-- Attendance Summary Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_summary_student ON attendance_summary(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_course ON attendance_summary(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_percentage ON attendance_summary(attendance_percentage);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_status ON attendance_summary(status);

-- User table attendance indexes
CREATE INDEX IF NOT EXISTS idx_user_attendance_percentage ON "user"(overall_attendance_percentage);
CREATE INDEX IF NOT EXISTS idx_user_attendance_status ON "user"(attendance_status);

-- ========================================
-- FUNCTIONS FOR ATTENDANCE CALCULATIONS
-- ========================================

-- Function to calculate attendance percentage for a student in a course
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  p_student_id UUID,
  p_course_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  total_sessions INTEGER;
  present_sessions INTEGER;
  attendance_percentage NUMERIC(5,2);
BEGIN
  -- Count total sessions for the course
  SELECT COUNT(*)
  INTO total_sessions
  FROM attendance_session ass
  WHERE ass.course_id = p_course_id AND ass.status = 'completed';
  
  -- Count sessions where student was present or late (counted as present)
  SELECT COUNT(*)
  INTO present_sessions
  FROM attendance a
  JOIN attendance_session ass ON a.session_id = ass.id
  WHERE a.student_id = p_student_id
    AND a.course_id = p_course_id
    AND a.attendance_status IN ('present', 'late', 'excused')
    AND ass.status = 'completed';
  
  -- Calculate percentage
  IF total_sessions > 0 THEN
    attendance_percentage = (present_sessions::NUMERIC / total_sessions::NUMERIC) * 100;
  ELSE
    attendance_percentage = 0;
  END IF;
  
  RETURN ROUND(attendance_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update attendance summary for a student
CREATE OR REPLACE FUNCTION update_attendance_summary(
  p_student_id UUID,
  p_course_id UUID
) RETURNS VOID AS $$
DECLARE
  current_year VARCHAR(10);
  current_semester VARCHAR(20);
  calculated_percentage NUMERIC(5,2);
  calculated_status VARCHAR(20);
  session_counts RECORD;
BEGIN
  -- Get current academic year and semester (simplified)
  current_year = EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  current_semester = CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 6 THEN 'Spring'
    ELSE 'Fall'
  END;
  
  -- Calculate attendance percentage
  calculated_percentage = calculate_attendance_percentage(p_student_id, p_course_id);
  
  -- Determine status based on percentage
  calculated_status = CASE
    WHEN calculated_percentage >= 90 THEN 'excellent'
    WHEN calculated_percentage >= 80 THEN 'good'
    WHEN calculated_percentage >= 60 THEN 'warning'
    ELSE 'critical'
  END;
  
  -- Get detailed counts
  SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN a.attendance_status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.attendance_status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.attendance_status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.attendance_status = 'excused' THEN 1 END) as excused_count,
    COUNT(CASE WHEN a.attendance_status = 'medical_leave' THEN 1 END) as medical_leave_count
  INTO 
    session_counts.total_sessions,
    session_counts.present_count,
    session_counts.absent_count,
    session_counts.late_count,
    session_counts.excused_count,
    session_counts.medical_leave_count
  FROM attendance_session ass
  LEFT JOIN attendance a ON ass.id = a.session_id AND a.student_id = p_student_id
  WHERE ass.course_id = p_course_id
    AND ass.status = 'completed'
    AND EXTRACT(YEAR FROM ass.session_date)::VARCHAR = current_year;
  
  -- Upsert attendance summary
  INSERT INTO attendance_summary (
    student_id, course_id, academic_year, semester,
    total_sessions, present_count, absent_count, late_count, 
    excused_count, medical_leave_count, attendance_percentage, status
  ) VALUES (
    p_student_id, p_course_id, current_year, current_semester,
    session_counts.total_sessions, session_counts.present_count, 
    session_counts.absent_count, session_counts.late_count,
    session_counts.excused_count, session_counts.medical_leave_count,
    calculated_percentage, calculated_status
  )
  ON CONFLICT (student_id, course_id, academic_year, semester)
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    present_count = EXCLUDED.present_count,
    absent_count = EXCLUDED.absent_count,
    late_count = EXCLUDED.late_count,
    excused_count = EXCLUDED.excused_count,
    medical_leave_count = EXCLUDED.medical_leave_count,
    attendance_percentage = EXCLUDED.attendance_percentage,
    status = EXCLUDED.status,
    last_updated = NOW();
    
  -- Update overall attendance in user table
  UPDATE "user"
  SET 
    overall_attendance_percentage = (
      SELECT AVG(attendance_percentage)
      FROM attendance_summary
      WHERE student_id = p_student_id
        AND academic_year = current_year
    ),
    attendance_status = calculated_status,
    last_attendance_update = NOW()
  WHERE id = p_student_id;
  
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Trigger function to update attendance summary when attendance is marked
CREATE OR REPLACE FUNCTION trigger_update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update summary for the affected student
  IF TG_OP = 'DELETE' THEN
    PERFORM update_attendance_summary(OLD.student_id, OLD.course_id);
    RETURN OLD;
  ELSE
    PERFORM update_attendance_summary(NEW.student_id, NEW.course_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_attendance_summary_update ON attendance;
CREATE TRIGGER trigger_attendance_summary_update
  AFTER INSERT OR UPDATE OR DELETE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_attendance_summary();

-- Trigger to update session statistics
CREATE OR REPLACE FUNCTION trigger_update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update attendance session statistics
  UPDATE attendance_session
  SET 
    present_students = (
      SELECT COUNT(*) FROM attendance 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
        AND attendance_status IN ('present', 'late')
    ),
    absent_students = (
      SELECT COUNT(*) FROM attendance 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
        AND attendance_status = 'absent'
    ),
    late_students = (
      SELECT COUNT(*) FROM attendance 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
        AND attendance_status = 'late'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create session stats trigger
DROP TRIGGER IF EXISTS trigger_session_stats_update ON attendance;
CREATE TRIGGER trigger_session_stats_update
  AFTER INSERT OR UPDATE OR DELETE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_session_stats();

-- ========================================
-- DEFAULT SETTINGS AND SAMPLE DATA
-- ========================================

-- Insert default institution-wide attendance settings
INSERT INTO attendance_settings (
  scope, scope_id, minimum_attendance_percentage, grace_period_minutes,
  auto_mark_absent_after_minutes, allow_excuse_requests, require_excuse_approval,
  excuse_deadline_hours, notification_enabled, low_attendance_threshold,
  warning_notification_frequency, academic_year, semester, is_active
) VALUES (
  'institution', NULL, 75.00, 15, 30, TRUE, TRUE, 24, TRUE, 80.00, 'weekly',
  EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR, 'Fall', TRUE
) ON CONFLICT DO NOTHING;

-- ========================================
-- VIEWS FOR EASY QUERYING
-- ========================================

-- View for attendance overview
CREATE OR REPLACE VIEW attendance_overview AS
SELECT 
  a.id,
  a.student_id,
  u.username as student_name,
  u.roll_number,
  a.course_id,
  c.name as course_name,
  a.session_id,
  ass.session_date,
  ass.session_time,
  ass.topic,
  a.attendance_status,
  a.marked_at,
  a.marked_by,
  teacher.username as marked_by_name,
  a.arrival_time,
  a.notes,
  a.excuse_reason,
  a.excuse_approved
FROM attendance a
JOIN "user" u ON a.student_id = u.id
JOIN course c ON a.course_id = c.id
JOIN attendance_session ass ON a.session_id = ass.id
JOIN "user" teacher ON a.marked_by = teacher.id;

-- View for student attendance statistics
CREATE OR REPLACE VIEW student_attendance_stats AS
SELECT 
  s.student_id,
  u.username,
  u.roll_number,
  s.course_id,
  c.name as course_name,
  s.academic_year,
  s.semester,
  s.total_sessions,
  s.present_count,
  s.absent_count,
  s.late_count,
  s.excused_count,
  s.attendance_percentage,
  s.status,
  CASE 
    WHEN s.attendance_percentage >= 90 THEN '🟢 Excellent'
    WHEN s.attendance_percentage >= 80 THEN '🟡 Good'
    WHEN s.attendance_percentage >= 60 THEN '🟠 Warning'
    ELSE '🔴 Critical'
  END as status_display
FROM attendance_summary s
JOIN "user" u ON s.student_id = u.id
JOIN course c ON s.course_id = c.id;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE attendance_session IS 'Class sessions for which attendance is tracked';
COMMENT ON TABLE attendance IS 'Individual student attendance records for each session';
COMMENT ON TABLE attendance_settings IS 'Attendance policies and configuration settings';
COMMENT ON TABLE attendance_summary IS 'Calculated attendance statistics for students';

COMMENT ON COLUMN attendance.attendance_status IS 'present, absent, late, excused, medical_leave';
COMMENT ON COLUMN attendance_session.session_type IS 'lecture, lab, tutorial, exam, other';
COMMENT ON COLUMN attendance_settings.scope IS 'institution, course, or class level settings';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Attendance System Database Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: attendance_session, attendance, attendance_settings, attendance_summary';
  RAISE NOTICE '🔄 Triggers: Automatic attendance calculations and statistics updates';
  RAISE NOTICE '📈 Views: attendance_overview, student_attendance_stats';
  RAISE NOTICE '⚡ Functions: calculate_attendance_percentage, update_attendance_summary';
  RAISE NOTICE '🚀 System ready for attendance tracking implementation';
END $$; 