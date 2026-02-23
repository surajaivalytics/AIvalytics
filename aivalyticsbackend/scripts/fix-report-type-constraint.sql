-- Fix Report Type Constraint
-- This script updates the report_type constraint to include 'all' as a valid type

-- Drop the existing constraint
ALTER TABLE report DROP CONSTRAINT IF EXISTS report_report_type_check;

-- Add the updated constraint with 'all' included
ALTER TABLE report ADD CONSTRAINT report_report_type_check CHECK (
  report_type IN ('performance', 'attendance', 'comprehensive', 'custom', 'all')
);

-- Update any existing 'all' records to 'comprehensive' if they exist
UPDATE report SET report_type = 'comprehensive' WHERE report_type = 'all';

-- Verify the constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'report_report_type_check'; 