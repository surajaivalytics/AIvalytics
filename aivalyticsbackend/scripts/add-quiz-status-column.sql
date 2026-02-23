-- Add status column to quiz table
-- This migration adds a status field to track quiz states: draft, active, inactive

-- Add status column with default value 'draft'
ALTER TABLE quiz 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive'));

-- Add comment for documentation
COMMENT ON COLUMN quiz.status IS 'Quiz status: draft (not yet activated), active (available to students), inactive (disabled)';

-- Create index for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_quiz_status ON quiz (status);

-- Update existing quizzes to have 'active' status (assuming they were already active)
UPDATE quiz SET status = 'active' WHERE status IS NULL OR status = 'draft'; 