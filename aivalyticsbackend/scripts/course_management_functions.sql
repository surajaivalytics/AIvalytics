-- Course Management SQL Functions
-- These functions support the course management system

-- Function to remove a course from all users when course is deleted
CREATE OR REPLACE FUNCTION remove_course_from_all_users(course_id_to_remove UUID)
RETURNS void AS $$
BEGIN
  -- Update all users to remove the specified course from their course_ids array
  UPDATE "user" 
  SET course_ids = array_remove(course_ids, course_id_to_remove)
  WHERE course_ids @> ARRAY[course_id_to_remove];
  
  -- Set course_ids to NULL if the array becomes empty
  UPDATE "user" 
  SET course_ids = NULL 
  WHERE course_ids = ARRAY[]::UUID[];
END;
$$ LANGUAGE plpgsql;

-- Function to get course enrollment count
CREATE OR REPLACE FUNCTION get_course_enrollment_count(course_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  enrollment_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO enrollment_count
  FROM "user"
  WHERE course_ids @> ARRAY[course_id_param];
  
  RETURN COALESCE(enrollment_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's enrolled courses with details
CREATE OR REPLACE FUNCTION get_user_enrolled_courses(user_id_param UUID)
RETURNS TABLE(
  course_id UUID,
  course_name VARCHAR,
  course_about TEXT,
  created_by_username VARCHAR,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.about,
    u.username,
    c.created_at
  FROM "user" student
  CROSS JOIN LATERAL unnest(student.course_ids) AS course_id
  JOIN course c ON c.id = course_id AND c.deleted_at IS NULL
  JOIN "user" u ON u.id = c.created_by
  WHERE student.id = user_id_param
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can enroll in course (not already enrolled)
CREATE OR REPLACE FUNCTION can_user_enroll_in_course(user_id_param UUID, course_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_enrolled BOOLEAN;
  course_exists BOOLEAN;
BEGIN
  -- Check if course exists and is not deleted
  SELECT EXISTS(
    SELECT 1 FROM course 
    WHERE id = course_id_param AND deleted_at IS NULL
  ) INTO course_exists;
  
  IF NOT course_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is already enrolled
  SELECT EXISTS(
    SELECT 1 FROM "user" 
    WHERE id = user_id_param AND course_ids @> ARRAY[course_id_param]
  ) INTO is_enrolled;
  
  RETURN NOT is_enrolled;
END;
$$ LANGUAGE plpgsql;

-- Function to get teacher's course statistics
CREATE OR REPLACE FUNCTION get_teacher_course_stats(teacher_id_param UUID)
RETURNS TABLE(
  total_courses INTEGER,
  total_enrollments INTEGER,
  avg_enrollments_per_course NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH teacher_courses AS (
    SELECT id FROM course 
    WHERE created_by = teacher_id_param AND deleted_at IS NULL
  ),
  enrollment_counts AS (
    SELECT 
      tc.id,
      COALESCE(
        (SELECT COUNT(*) FROM "user" WHERE course_ids @> ARRAY[tc.id]), 
        0
      ) as enrollment_count
    FROM teacher_courses tc
  )
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM teacher_courses),
    COALESCE(SUM(ec.enrollment_count)::INTEGER, 0),
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND(AVG(ec.enrollment_count), 2)
      ELSE 0
    END
  FROM enrollment_counts ec;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT remove_course_from_all_users('course-uuid-here');
-- SELECT get_course_enrollment_count('course-uuid-here');
-- SELECT * FROM get_user_enrolled_courses('user-uuid-here');
-- SELECT can_user_enroll_in_course('user-uuid', 'course-uuid');
-- SELECT * FROM get_teacher_course_stats('teacher-uuid-here'); 