-- Add course_ids array column to user table
-- This allows users to be enrolled in multiple courses (optional)

-- Add the course_ids column as an array of UUIDs (nullable)
ALTER TABLE "user" 
ADD COLUMN course_ids UUID[] DEFAULT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN "user".course_ids IS 'Array of course IDs that the user is enrolled in (optional)';

-- Create an index on course_ids for better query performance
CREATE INDEX idx_user_course_ids ON "user" USING GIN (course_ids);

-- Optional: Add a check constraint to ensure the array is not empty if it exists
ALTER TABLE "user" 
ADD CONSTRAINT chk_course_ids_not_empty 
CHECK (course_ids IS NULL OR array_length(course_ids, 1) > 0);

-- Example queries after adding the column:

-- 1. Add courses to a user
-- UPDATE "user" 
-- SET course_ids = ARRAY['course-uuid-1', 'course-uuid-2', 'course-uuid-3']::UUID[]
-- WHERE id = 'user-uuid';

-- 2. Add a single course to existing courses
-- UPDATE "user" 
-- SET course_ids = array_append(COALESCE(course_ids, ARRAY[]::UUID[]), 'new-course-uuid'::UUID)
-- WHERE id = 'user-uuid';

-- 3. Remove a course from user's courses
-- UPDATE "user" 
-- SET course_ids = array_remove(course_ids, 'course-uuid-to-remove'::UUID)
-- WHERE id = 'user-uuid';

-- 4. Find users enrolled in a specific course
-- SELECT * FROM "user" 
-- WHERE 'specific-course-uuid'::UUID = ANY(course_ids);

-- 5. Find users enrolled in multiple specific courses
-- SELECT * FROM "user" 
-- WHERE course_ids @> ARRAY['course-uuid-1', 'course-uuid-2']::UUID[];

-- 6. Count courses per user
-- SELECT id, username, array_length(course_ids, 1) as course_count
-- FROM "user" 
-- WHERE course_ids IS NOT NULL;

-- 7. Get all unique course IDs from all users
-- SELECT DISTINCT unnest(course_ids) as course_id
-- FROM "user" 
-- WHERE course_ids IS NOT NULL; 