-- ========================================
-- SIMPLE DATABASE UPDATE SCRIPT
-- Run each section separately if needed
-- ========================================

-- STEP 1: Fix Report Type Constraint
-- Drop the existing constraint
ALTER TABLE report DROP CONSTRAINT IF EXISTS report_report_type_check;

-- Add the updated constraint with 'all' included
ALTER TABLE report ADD CONSTRAINT report_report_type_check CHECK (
  report_type IN ('performance', 'attendance', 'comprehensive', 'custom', 'all')
);

-- STEP 2: Update existing 'all' records
UPDATE report SET report_type = 'comprehensive' WHERE report_type = 'all';

-- STEP 3: Add missing columns (if they don't exist)
ALTER TABLE report ADD COLUMN IF NOT EXISTS report_data JSONB;
ALTER TABLE report ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';
ALTER TABLE report ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE report ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES "user"(id);
ALTER TABLE report ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES course(id);

-- STEP 4: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_report_user_id ON report(user_id);
CREATE INDEX IF NOT EXISTS idx_report_date_created ON report(date_created);
CREATE INDEX IF NOT EXISTS idx_report_type ON report(report_type);
CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_course_id ON report(course_id);

-- STEP 5: Fix attendance session constraint
ALTER TABLE attendance_session DROP CONSTRAINT IF EXISTS valid_student_counts;
ALTER TABLE attendance_session ADD CONSTRAINT valid_student_counts CHECK (
  total_students >= 0 AND 
  present_students >= 0 AND 
  absent_students >= 0 AND 
  late_students >= 0 AND
  (present_students + absent_students + late_students) <= total_students
);

-- STEP 6: Verify the changes
-- Check if constraint was applied correctly
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'report_report_type_check';

-- Check if indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'report' AND indexname LIKE 'idx_report_%'; 