-- ========================================
-- DATABASE UPDATES FOR REPORT SYSTEM
-- ========================================

-- 1. FIX REPORT TYPE CONSTRAINT
-- Drop the existing constraint
ALTER TABLE report DROP CONSTRAINT IF EXISTS report_report_type_check;

-- Add the updated constraint with 'all' included
ALTER TABLE report ADD CONSTRAINT report_report_type_check CHECK (
  report_type IN ('performance', 'attendance', 'comprehensive', 'custom', 'all')
);

-- 2. UPDATE EXISTING 'ALL' RECORDS
-- Convert any existing 'all' records to 'comprehensive'
UPDATE report SET report_type = 'comprehensive' WHERE report_type = 'all';

-- 3. ENSURE ALL REQUIRED COLUMNS EXIST
-- Add missing columns if they don't exist
ALTER TABLE report ADD COLUMN IF NOT EXISTS report_type VARCHAR(50) DEFAULT 'performance';
ALTER TABLE report ADD COLUMN IF NOT EXISTS report_data JSONB;
ALTER TABLE report ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (
  status IN ('pending', 'processing', 'completed', 'failed')
);
ALTER TABLE report ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE report ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES "user"(id);
ALTER TABLE report ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES course(id);

-- 4. ADD INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_report_user_id ON report(user_id);
CREATE INDEX IF NOT EXISTS idx_report_date_created ON report(date_created);
CREATE INDEX IF NOT EXISTS idx_report_type ON report(report_type);
CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_course_id ON report(course_id);

-- 5. FIX ATTENDANCE SESSION CONSTRAINT (if not already fixed)
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

-- 6. VERIFY CHANGES
-- Check the constraint was applied correctly
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'report_report_type_check';

-- Check indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'report' AND indexname LIKE 'idx_report_%';

-- 7. SAMPLE DATA FOR TESTING (OPTIONAL)
-- Insert a test report if needed
-- INSERT INTO report (user_id, name, report_type, report_data, status, generated_by, date_created)
-- VALUES (
--   (SELECT id FROM "user" WHERE role = 'student' LIMIT 1),
--   'Test Performance Report',
--   'performance',
--   '{"test": "data"}'::jsonb,
--   'completed',
--   (SELECT id FROM "user" WHERE role = 'student' LIMIT 1),
--   CURRENT_DATE
-- );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'report' 
ORDER BY ordinal_position;

-- Check constraints
SELECT tc.constraint_name, tc.constraint_type, cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'report';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'report'; 