-- Complete Database Schema for Education Platform
-- Includes email field in user table
-- Compatible with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  hierarchy_level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, hierarchy_level) VALUES
  ('student', 'Student role with access to courses and assignments', 1),
  ('teacher', 'Teacher role with course management capabilities', 2),
  ('hod', 'Head of Department with administrative privileges', 3),
  ('principal', 'Principal with full administrative access', 4)
ON CONFLICT (name) DO NOTHING;

-- Departments table
CREATE TABLE IF NOT EXISTS department (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  head_of_department VARCHAR(100),
  established_year INTEGER,
  budget INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS class (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  department_id UUID REFERENCES department(id) ON DELETE SET NULL,
  year INTEGER,
  semester INTEGER,
  capacity INTEGER DEFAULT 50,
  current_enrollment INTEGER DEFAULT 0,
  class_teacher VARCHAR(100),
  room_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (with email field)
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  roll_number VARCHAR(20) NOT NULL UNIQUE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  age INTEGER,
  class_id UUID REFERENCES class(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT age_check CHECK (age >= 16 AND age <= 100),
  CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Courses table
CREATE TABLE IF NOT EXISTS course (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES department(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  credits INTEGER DEFAULT 3,
  semester INTEGER,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Course relationship table
CREATE TABLE IF NOT EXISTS user_course (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  grade VARCHAR(5),
  
  UNIQUE(user_id, course_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quiz (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  total_marks INTEGER DEFAULT 100,
  duration_minutes INTEGER DEFAULT 60,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table
CREATE TABLE IF NOT EXISTS score (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks_obtained::DECIMAL / total_marks::DECIMAL) * 100) STORED,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, quiz_id),
  CONSTRAINT marks_check CHECK (marks_obtained >= 0 AND marks_obtained <= total_marks)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  course_id UUID REFERENCES course(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS report (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  generated_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_username ON "user" (username);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);
CREATE INDEX IF NOT EXISTS idx_user_roll_number ON "user" (roll_number);
CREATE INDEX IF NOT EXISTS idx_user_role_id ON "user" (role_id);
CREATE INDEX IF NOT EXISTS idx_user_class_id ON "user" (class_id);
CREATE INDEX IF NOT EXISTS idx_user_deleted_at ON "user" (deleted_at);
CREATE INDEX IF NOT EXISTS idx_course_department_id ON course (department_id);
CREATE INDEX IF NOT EXISTS idx_course_teacher_id ON course (teacher_id);
CREATE INDEX IF NOT EXISTS idx_user_course_user_id ON user_course (user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_course_id ON user_course (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_course_id ON quiz (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_teacher_id ON quiz (teacher_id);
CREATE INDEX IF NOT EXISTS idx_score_user_id ON score (user_id);
CREATE INDEX IF NOT EXISTS idx_score_quiz_id ON score (quiz_id);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE score ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE report ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
CREATE POLICY "Users can view their own profile" ON "user"
  FOR SELECT USING (auth.uid()::text = auth_id::text);

CREATE POLICY "Users can update their own profile" ON "user"
  FOR UPDATE USING (auth.uid()::text = auth_id::text);

-- Comments for documentation
COMMENT ON TABLE "user" IS 'Main users table storing student, teacher, HOD, and principal information';
COMMENT ON COLUMN "user".email IS 'User email address - unique and optional';
COMMENT ON COLUMN "user".auth_id IS 'UUID for Supabase auth compatibility';
COMMENT ON COLUMN "user".roll_number IS 'Unique student/staff identification number';
COMMENT ON TABLE roles IS 'User roles with hierarchy levels';
COMMENT ON TABLE department IS 'Academic departments';
COMMENT ON TABLE class IS 'Academic classes/sections';
COMMENT ON TABLE course IS 'Academic courses offered by departments';
COMMENT ON TABLE user_course IS 'Many-to-many relationship between users and courses';
COMMENT ON TABLE quiz IS 'Quizzes/exams created by teachers';
COMMENT ON TABLE score IS 'Student scores/grades for quizzes';
COMMENT ON TABLE resources IS 'Educational resources and files';
COMMENT ON TABLE report IS 'System-generated reports and analytics'; 