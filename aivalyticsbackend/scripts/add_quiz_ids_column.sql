-- SQL Script to add quiz_ids column to course table
-- This will store an array of quiz IDs associated with each course

-- Add quiz_ids column as an array of UUIDs
ALTER TABLE course 
ADD COLUMN quiz_ids UUID[] DEFAULT '{}';

-- Add a comment to document the column
COMMENT ON COLUMN course.quiz_ids IS 'Array of quiz IDs associated with this course';

-- Create an index on quiz_ids for better query performance
CREATE INDEX idx_course_quiz_ids ON course USING GIN (quiz_ids);

-- Optional: Add a check constraint to ensure the array doesn't exceed a reasonable size
-- ALTER TABLE course ADD CONSTRAINT chk_quiz_ids_limit CHECK (array_length(quiz_ids, 1) <= 100);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'course' AND column_name = 'quiz_ids'; 