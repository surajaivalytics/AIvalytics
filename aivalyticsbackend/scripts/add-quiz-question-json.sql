-- Migration: Add question_json field to quiz table and quiz_ids to course table
-- This migration adds support for AI-generated MCQ questions

-- Add question_json field to quiz table to store generated MCQ questions
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS question_json JSONB;

-- Add quiz_ids array field to course table to track quizzes for each course
ALTER TABLE course ADD COLUMN IF NOT EXISTS quiz_ids UUID[] DEFAULT '{}';

-- Add index for better performance on question_json queries
CREATE INDEX IF NOT EXISTS idx_quiz_question_json ON quiz USING GIN (question_json);

-- Add index for quiz_ids array in course table
CREATE INDEX IF NOT EXISTS idx_course_quiz_ids ON course USING GIN (quiz_ids);

-- Add comments for documentation
COMMENT ON COLUMN quiz.question_json IS 'JSON array containing AI-generated MCQ questions with options and correct answers';
COMMENT ON COLUMN course.quiz_ids IS 'Array of quiz IDs associated with this course';

-- Update existing quizzes to have empty question_json if null
UPDATE quiz SET question_json = '[]'::jsonb WHERE question_json IS NULL; 