-- Insert Test Attendance Data
-- This script creates test attendance sessions and records for demonstration

-- First, let's create some test attendance sessions
INSERT INTO attendance_session (
  id,
  course_id,
  teacher_id,
  session_date,
  session_time,
  session_duration,
  session_type,
  location,
  topic,
  status,
  attendance_marked,
  total_students,
  present_students,
  absent_students,
  late_students,
  created_at,
  updated_at
) VALUES 
-- Python Programming Sessions
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Python Programming' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '7 days',
  '09:00:00',
  90,
  'lecture',
  'Room 101',
  'Introduction to Python Basics',
  'completed',
  true,
  25,
  22,
  2,
  1,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Python Programming' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '5 days',
  '09:00:00',
  90,
  'lecture',
  'Room 101',
  'Variables and Data Types',
  'completed',
  true,
  25,
  24,
  1,
  0,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Python Programming' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '3 days',
  '09:00:00',
  90,
  'lecture',
  'Room 101',
  'Control Structures',
  'completed',
  true,
  25,
  23,
  1,
  1,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Python Programming' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '1 day',
  '09:00:00',
  90,
  'lecture',
  'Room 101',
  'Functions and Modules',
  'completed',
  true,
  25,
  25,
  0,
  0,
  NOW(),
  NOW()
),
-- Computer Fundamentals Sessions
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Computer Fundamentals' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '6 days',
  '10:30:00',
  90,
  'lecture',
  'Room 102',
  'Computer Hardware Basics',
  'completed',
  true,
  20,
  18,
  1,
  1,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Computer Fundamentals' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '4 days',
  '10:30:00',
  90,
  'lecture',
  'Room 102',
  'Operating Systems',
  'completed',
  true,
  20,
  19,
  1,
  0,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM course WHERE name = 'Computer Fundamentals' LIMIT 1),
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1),
  CURRENT_DATE - INTERVAL '2 days',
  '10:30:00',
  90,
  'lecture',
  'Room 102',
  'Networking Basics',
  'completed',
  true,
  20,
  20,
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Now let's get the session IDs we just created
WITH session_data AS (
  SELECT 
    s.id as session_id,
    s.course_id,
    s.session_date,
    s.session_time,
    c.name as course_name
  FROM attendance_session s
  JOIN course c ON s.course_id = c.id
  WHERE s.session_date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY s.session_date DESC
),
student_data AS (
  SELECT 
    u.id as student_id,
    u.name as student_name
  FROM "user" u
  WHERE u.role = 'student'
  LIMIT 5
)
-- Insert attendance records for students
INSERT INTO attendance (
  session_id,
  student_id,
  course_id,
  attendance_status,
  marked_at,
  marked_by,
  created_at,
  updated_at
)
SELECT 
  sd.session_id,
  std.student_id,
  sd.course_id,
  CASE 
    -- Simulate different attendance patterns
    WHEN std.student_id = (SELECT id FROM "user" WHERE role = 'student' LIMIT 1) THEN
      CASE 
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '7 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '5 days' THEN 'late'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '3 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '1 day' THEN 'present'
        ELSE 'present'
      END
    WHEN std.student_id = (SELECT id FROM "user" WHERE role = 'student' LIMIT 1 OFFSET 1) THEN
      CASE 
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '7 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '5 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '3 days' THEN 'absent'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '1 day' THEN 'present'
        ELSE 'present'
      END
    WHEN std.student_id = (SELECT id FROM "user" WHERE role = 'student' LIMIT 1 OFFSET 2) THEN
      CASE 
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '7 days' THEN 'late'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '5 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '3 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '1 day' THEN 'excused'
        ELSE 'present'
      END
    WHEN std.student_id = (SELECT id FROM "user" WHERE role = 'student' LIMIT 1 OFFSET 3) THEN
      CASE 
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '7 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '5 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '3 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '1 day' THEN 'present'
        ELSE 'present'
      END
    WHEN std.student_id = (SELECT id FROM "user" WHERE role = 'student' LIMIT 1 OFFSET 4) THEN
      CASE 
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '7 days' THEN 'absent'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '5 days' THEN 'present'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '3 days' THEN 'late'
        WHEN sd.session_date = CURRENT_DATE - INTERVAL '1 day' THEN 'present'
        ELSE 'present'
      END
    ELSE 'present'
  END as attendance_status,
  NOW() as marked_at,
  (SELECT id FROM "user" WHERE role = 'teacher' LIMIT 1) as marked_by,
  NOW() as created_at,
  NOW() as updated_at
FROM session_data sd
CROSS JOIN student_data std
ON CONFLICT (session_id, student_id) DO NOTHING;

-- Update attendance summary for students
SELECT update_attendance_summary(
  std.student_id,
  sd.course_id
)
FROM (
  SELECT DISTINCT student_id, course_id 
  FROM attendance 
  WHERE created_at >= NOW() - INTERVAL '1 hour'
) recent_attendance
JOIN "user" std ON recent_attendance.student_id = std.id
JOIN course sd ON recent_attendance.course_id = sd.id
WHERE std.role = 'student'; 