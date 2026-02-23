-- OBE Mapping System for Indian Education Institutions
-- Supports: Medical Colleges, Engineering (B.Tech/B.E.), Business Colleges, IT Colleges
-- Created for modular integration with existing attendance and quiz system
-- COMPATIBLE WITH EXISTING DATABASE STRUCTURE

-- =====================================================
-- 1. OBE CORE TABLES
-- =====================================================

-- Institution/College Types
CREATE TABLE IF NOT EXISTS public.institution_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT institution_types_pkey PRIMARY KEY (id)
);

-- Insert default institution types for Indian education
INSERT INTO public.institution_types (name, description) VALUES
('Medical College', 'Medical education institutions offering MBBS, MD, MS programs'),
('Engineering College', 'Engineering institutions offering B.Tech, B.E. programs'),
('Business College', 'Business schools offering BBA, MBA programs'),
('IT College', 'Information Technology focused institutions'),
('General College', 'General education institutions')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. PROGRAM LEVEL TABLES
-- =====================================================

-- Programs (Degree Programs)
CREATE TABLE IF NOT EXISTS public.programs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    code character varying NOT NULL UNIQUE,
    institution_type_id uuid NOT NULL,
    duration_years integer NOT NULL DEFAULT 4,
    total_credits integer NOT NULL DEFAULT 160,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT programs_pkey PRIMARY KEY (id),
    CONSTRAINT programs_institution_type_id_fkey FOREIGN KEY (institution_type_id) REFERENCES public.institution_types(id)
);

-- Program Educational Objectives (PEOs) - Maximum 7
CREATE TABLE IF NOT EXISTS public.program_educational_objectives (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    program_id uuid NOT NULL,
    objective_number integer NOT NULL CHECK (objective_number >= 1 AND objective_number <= 7),
    title character varying NOT NULL,
    description text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT program_educational_objectives_pkey PRIMARY KEY (id),
    CONSTRAINT program_educational_objectives_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
    CONSTRAINT program_educational_objectives_unique UNIQUE (program_id, objective_number)
);

-- Program Learning Outcomes (PLOs) - Maximum 12
CREATE TABLE IF NOT EXISTS public.program_learning_outcomes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    program_id uuid NOT NULL,
    outcome_number integer NOT NULL CHECK (outcome_number >= 1 AND outcome_number <= 12),
    title character varying NOT NULL,
    description text NOT NULL,
    bloom_level character varying NOT NULL CHECK (bloom_level IN ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT program_learning_outcomes_pkey PRIMARY KEY (id),
    CONSTRAINT program_learning_outcomes_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
    CONSTRAINT program_learning_outcomes_unique UNIQUE (program_id, outcome_number)
);

-- =====================================================
-- 3. COURSE LEVEL TABLES
-- =====================================================

-- Course Learning Outcomes (CLOs) - Maximum 20 per course
CREATE TABLE IF NOT EXISTS public.course_learning_outcomes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    outcome_number integer NOT NULL CHECK (outcome_number >= 1 AND outcome_number <= 20),
    title character varying NOT NULL,
    description text NOT NULL,
    bloom_level character varying NOT NULL CHECK (bloom_level IN ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_learning_outcomes_pkey PRIMARY KEY (id),
    CONSTRAINT course_learning_outcomes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
    CONSTRAINT course_learning_outcomes_unique UNIQUE (course_id, outcome_number)
);

-- =====================================================
-- 4. ASSESSMENT MAPPING TABLES
-- =====================================================

-- Assessment Types for Indian Education
CREATE TABLE IF NOT EXISTS public.assessment_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    description text,
    weight_percentage numeric DEFAULT 0 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assessment_types_pkey PRIMARY KEY (id)
);

-- Insert standard Indian assessment types
INSERT INTO public.assessment_types (name, description, weight_percentage) VALUES
('Internal Assessment', 'Regular internal assessments and assignments', 30),
('Mid Semester Exam', 'Mid-semester examination', 20),
('End Semester Exam', 'Final semester examination', 50),
('Laboratory Work', 'Practical laboratory assessments', 25),
('Project Work', 'Project-based assessments', 30),
('Viva Voce', 'Oral examination and defense', 15),
('Continuous Evaluation', 'Continuous evaluation throughout semester', 40),
('Seminar Presentation', 'Seminar and presentation assessments', 10),
('Case Study', 'Case study analysis and presentation', 20),
('Research Paper', 'Research paper writing and presentation', 25)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 5. MAPPING MATRIX TABLES
-- =====================================================

-- Course-Outcome Mapping Matrix
CREATE TABLE IF NOT EXISTS public.course_outcome_mapping (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    clo_id uuid NOT NULL,
    assessment_type_id uuid NOT NULL,
    coverage_level integer NOT NULL CHECK (coverage_level >= 1 AND coverage_level <= 5),
    -- 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High
    weight_percentage numeric DEFAULT 0 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_outcome_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT course_outcome_mapping_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
    CONSTRAINT course_outcome_mapping_clo_id_fkey FOREIGN KEY (clo_id) REFERENCES public.course_learning_outcomes(id),
    CONSTRAINT course_outcome_mapping_assessment_type_id_fkey FOREIGN KEY (assessment_type_id) REFERENCES public.assessment_types(id),
    CONSTRAINT course_outcome_mapping_unique UNIQUE (course_id, clo_id, assessment_type_id)
);

-- Program-Course Mapping Matrix
CREATE TABLE IF NOT EXISTS public.program_course_mapping (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    program_id uuid NOT NULL,
    course_id uuid NOT NULL,
    plo_id uuid NOT NULL,
    contribution_level integer NOT NULL CHECK (contribution_level >= 1 AND contribution_level <= 5),
    -- 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT program_course_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT program_course_mapping_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
    CONSTRAINT program_course_mapping_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
    CONSTRAINT program_course_mapping_plo_id_fkey FOREIGN KEY (plo_id) REFERENCES public.program_learning_outcomes(id),
    CONSTRAINT program_course_mapping_unique UNIQUE (program_id, course_id, plo_id)
);

-- =====================================================
-- 6. ASSESSMENT TRACKING TABLES
-- =====================================================

-- Assessment Records
CREATE TABLE IF NOT EXISTS public.assessment_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    assessment_type_id uuid NOT NULL,
    title character varying NOT NULL,
    description text,
    max_marks integer NOT NULL DEFAULT 100,
    weight_percentage numeric DEFAULT 0 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    assessment_date date NOT NULL,
    due_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT assessment_records_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_records_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
    CONSTRAINT assessment_records_assessment_type_id_fkey FOREIGN KEY (assessment_type_id) REFERENCES public.assessment_types(id),
    CONSTRAINT assessment_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id)
);

-- Student Assessment Scores
CREATE TABLE IF NOT EXISTS public.student_assessment_scores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    assessment_record_id uuid NOT NULL,
    marks_obtained numeric NOT NULL DEFAULT 0 CHECK (marks_obtained >= 0),
    submitted_at timestamp with time zone DEFAULT now(),
    evaluated_at timestamp with time zone,
    evaluated_by uuid,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_assessment_scores_pkey PRIMARY KEY (id),
    CONSTRAINT student_assessment_scores_student_id_fkey FOREIGN KEY (student_id) REFERENCES public."user"(id),
    CONSTRAINT student_assessment_scores_assessment_record_id_fkey FOREIGN KEY (assessment_record_id) REFERENCES public.assessment_records(id),
    CONSTRAINT student_assessment_scores_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES public."user"(id),
    CONSTRAINT student_assessment_scores_unique UNIQUE (student_id, assessment_record_id)
);

-- =====================================================
-- 7. OUTCOME ACHIEVEMENT TRACKING
-- =====================================================

-- Student Outcome Achievement
CREATE TABLE IF NOT EXISTS public.student_outcome_achievement (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    clo_id uuid NOT NULL,
    assessment_type_id uuid NOT NULL,
    achievement_level integer NOT NULL CHECK (achievement_level >= 1 AND achievement_level <= 5),
    -- 1=Not Achieved, 2=Partially Achieved, 3=Achieved, 4=Well Achieved, 5=Excellently Achieved
    marks_obtained numeric DEFAULT 0,
    max_marks numeric DEFAULT 100,
    semester character varying,
    academic_year character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_outcome_achievement_pkey PRIMARY KEY (id),
    CONSTRAINT student_outcome_achievement_student_id_fkey FOREIGN KEY (student_id) REFERENCES public."user"(id),
    CONSTRAINT student_outcome_achievement_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
    CONSTRAINT student_outcome_achievement_clo_id_fkey FOREIGN KEY (clo_id) REFERENCES public.course_learning_outcomes(id),
    CONSTRAINT student_outcome_achievement_assessment_type_id_fkey FOREIGN KEY (assessment_type_id) REFERENCES public.assessment_types(id)
);

-- =====================================================
-- 8. REPORTING AND ANALYTICS TABLES
-- =====================================================

-- OBE Reports
CREATE TABLE IF NOT EXISTS public.obe_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    report_type character varying NOT NULL CHECK (report_type IN ('course_outcome', 'program_outcome', 'assessment_analysis', 'student_progress', 'comprehensive')),
    scope_id uuid NOT NULL, -- course_id or program_id
    scope_type character varying NOT NULL CHECK (scope_type IN ('course', 'program')),
    report_data jsonb NOT NULL,
    generated_at timestamp with time zone DEFAULT now(),
    generated_by uuid NOT NULL,
    status character varying DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT obe_reports_pkey PRIMARY KEY (id),
    CONSTRAINT obe_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public."user"(id)
);

-- =====================================================
-- 9. MODIFY EXISTING TABLES
-- =====================================================

-- Add OBE-related columns to existing course table
ALTER TABLE public.course ADD COLUMN IF NOT EXISTS program_id uuid;
ALTER TABLE public.course ADD COLUMN IF NOT EXISTS academic_year character varying;
ALTER TABLE public.course ADD COLUMN IF NOT EXISTS course_type character varying DEFAULT 'theory' CHECK (course_type IN ('theory', 'lab', 'project', 'seminar', 'viva'));
ALTER TABLE public.course ADD COLUMN IF NOT EXISTS obe_enabled boolean DEFAULT false;
ALTER TABLE public.course ADD COLUMN IF NOT EXISTS about text;

-- Add OBE-related columns to existing user table
ALTER TABLE public."user" ADD COLUMN IF NOT EXISTS program_id uuid;
ALTER TABLE public."user" ADD COLUMN IF NOT EXISTS enrollment_year integer;
ALTER TABLE public."user" ADD COLUMN IF NOT EXISTS current_semester integer CHECK (current_semester >= 1 AND current_semester <= 8);

-- Add foreign key constraints after columns are added
DO $$
BEGIN
    -- Add foreign key for course.program_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_program_id_fkey' 
        AND table_name = 'course'
    ) THEN
        ALTER TABLE public.course ADD CONSTRAINT course_program_id_fkey 
        FOREIGN KEY (program_id) REFERENCES public.programs(id);
    END IF;
    
    -- Add foreign key for user.program_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_program_id_fkey' 
        AND table_name = 'user'
    ) THEN
        ALTER TABLE public."user" ADD CONSTRAINT user_program_id_fkey 
        FOREIGN KEY (program_id) REFERENCES public.programs(id);
    END IF;
END $$;

-- =====================================================
-- 10. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_learning_outcomes_course_id ON public.course_learning_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_program_learning_outcomes_program_id ON public.program_learning_outcomes(program_id);
CREATE INDEX IF NOT EXISTS idx_course_outcome_mapping_course_id ON public.course_outcome_mapping(course_id);
CREATE INDEX IF NOT EXISTS idx_program_course_mapping_program_id ON public.program_course_mapping(program_id);
CREATE INDEX IF NOT EXISTS idx_student_assessment_scores_student_id ON public.student_assessment_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_student_outcome_achievement_student_id ON public.student_outcome_achievement(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_records_course_id ON public.assessment_records(course_id);

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample programs for different institution types
INSERT INTO public.programs (name, code, institution_type_id, duration_years, total_credits) VALUES
('Bachelor of Technology in Computer Science', 'B.Tech-CSE', (SELECT id FROM public.institution_types WHERE name = 'Engineering College'), 4, 160),
('Bachelor of Medicine and Bachelor of Surgery', 'MBBS', (SELECT id FROM public.institution_types WHERE name = 'Medical College'), 5, 200),
('Bachelor of Business Administration', 'BBA', (SELECT id FROM public.institution_types WHERE name = 'Business College'), 3, 120),
('Bachelor of Technology in Information Technology', 'B.Tech-IT', (SELECT id FROM public.institution_types WHERE name = 'IT College'), 4, 160)
ON CONFLICT (code) DO NOTHING;

-- Insert sample PEOs for B.Tech-CSE
INSERT INTO public.program_educational_objectives (program_id, objective_number, title, description) VALUES
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 1, 'Technical Excellence', 'Graduates will demonstrate technical excellence in computer science and engineering'),
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 2, 'Professional Development', 'Graduates will engage in professional development and lifelong learning'),
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 3, 'Leadership and Ethics', 'Graduates will demonstrate leadership and ethical responsibility in their profession')
ON CONFLICT DO NOTHING;

-- Insert sample PLOs for B.Tech-CSE
INSERT INTO public.program_learning_outcomes (program_id, outcome_number, title, description, bloom_level) VALUES
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 1, 'Engineering Knowledge', 'Apply knowledge of mathematics, science, engineering fundamentals', 'Apply'),
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 2, 'Problem Analysis', 'Identify, formulate, research literature, and analyze complex engineering problems', 'Analyze'),
((SELECT id FROM public.programs WHERE code = 'B.Tech-CSE'), 3, 'Design Solutions', 'Design solutions for complex engineering problems', 'Create')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. VIEWS FOR EASY REPORTING
-- =====================================================

-- Course Outcome Mapping View (Basic)
CREATE OR REPLACE VIEW public.course_outcome_mapping_view AS
SELECT 
    c.name as course_name,
    c.id as course_id,
    COALESCE(clo.outcome_number, 0) as outcome_number,
    COALESCE(clo.title, 'No Outcome Defined') as outcome_title,
    COALESCE(clo.description, 'No description available') as outcome_description,
    COALESCE(clo.bloom_level, 'Not Set') as bloom_level,
    'Not Mapped' as assessment_type,
    0 as coverage_level,
    0 as weight_percentage
FROM public.course c
LEFT JOIN public.course_learning_outcomes clo ON c.id = clo.course_id AND clo.is_active = true;

-- Course Outcome Mapping View (With Assessment Mapping)
CREATE OR REPLACE VIEW public.course_outcome_mapping_detailed_view AS
SELECT 
    c.name as course_name,
    c.id as course_id,
    clo.outcome_number,
    clo.title as outcome_title,
    clo.description as outcome_description,
    clo.bloom_level,
    at.name as assessment_type,
    com.coverage_level,
    com.weight_percentage
FROM public.course c
JOIN public.course_learning_outcomes clo ON c.id = clo.course_id
JOIN public.course_outcome_mapping com ON clo.id = com.clo_id
JOIN public.assessment_types at ON com.assessment_type_id = at.id
WHERE clo.is_active = true AND com.coverage_level > 0;

-- Simple Course View (Fallback)
CREATE OR REPLACE VIEW public.course_basic_view AS
SELECT 
    id,
    name,
    about,
    duration_months,
    start_date,
    end_date,
    is_active,
    progress_percentage,
    created_at
FROM public.course;

-- Student Assessment Scores View with Percentage
CREATE OR REPLACE VIEW public.student_assessment_scores_view AS
SELECT 
    sas.*,
    ar.max_marks,
    CASE 
        WHEN ar.max_marks > 0 THEN (sas.marks_obtained / ar.max_marks) * 100
        ELSE 0 
    END as percentage
FROM public.student_assessment_scores sas
JOIN public.assessment_records ar ON sas.assessment_record_id = ar.id;

-- Student Outcome Achievement View with Percentage
CREATE OR REPLACE VIEW public.student_outcome_achievement_view AS
SELECT 
    soa.*,
    CASE 
        WHEN soa.max_marks > 0 THEN (soa.marks_obtained / soa.max_marks) * 100
        ELSE 0 
    END as percentage
FROM public.student_outcome_achievement soa;

-- Student Progress View
CREATE OR REPLACE VIEW public.student_progress_view AS
SELECT 
    u.username,
    u.roll_number,
    c.name as course_name,
    COALESCE(clo.outcome_number, 0) as outcome_number,
    COALESCE(clo.title, 'No Outcome') as outcome_title,
    COALESCE(soa.achievement_level, 0) as achievement_level,
    COALESCE(soa.percentage, 0) as percentage,
    COALESCE(soa.semester, 'Not Set') as semester,
    COALESCE(soa.academic_year, 'Not Set') as academic_year
FROM public."user" u
LEFT JOIN public.student_outcome_achievement_view soa ON u.id = soa.student_id
LEFT JOIN public.course c ON soa.course_id = c.id
LEFT JOIN public.course_learning_outcomes clo ON soa.clo_id = clo.id
WHERE u.role_id = (SELECT id FROM public.roles WHERE name = 'student');

-- =====================================================
-- 13. FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to calculate student outcome achievement
CREATE OR REPLACE FUNCTION calculate_student_outcome_achievement(
    p_student_id uuid,
    p_course_id uuid,
    p_clo_id uuid
) RETURNS numeric AS $$
DECLARE
    total_marks numeric := 0;
    max_marks numeric := 0;
    achievement_percentage numeric := 0;
BEGIN
    -- Calculate total marks and max marks for the student in this outcome
    SELECT 
        COALESCE(SUM(sas.marks_obtained), 0),
        COALESCE(SUM(ar.max_marks), 0)
    INTO total_marks, max_marks
    FROM public.student_assessment_scores sas
    JOIN public.assessment_records ar ON sas.assessment_record_id = ar.id
    JOIN public.course_outcome_mapping com ON ar.course_id = com.course_id
    WHERE sas.student_id = p_student_id 
    AND ar.course_id = p_course_id
    AND com.clo_id = p_clo_id;
    
    -- Calculate percentage
    IF max_marks > 0 THEN
        achievement_percentage := (total_marks / max_marks) * 100;
    END IF;
    
    RETURN achievement_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to generate OBE report
CREATE OR REPLACE FUNCTION generate_obe_report(
    p_report_type character varying,
    p_scope_id uuid,
    p_scope_type character varying,
    p_generated_by uuid
) RETURNS uuid AS $$
DECLARE
    report_id uuid;
    report_data jsonb;
BEGIN
    -- Generate report data based on type
    CASE p_report_type
        WHEN 'course_outcome' THEN
            SELECT jsonb_build_object(
                'course_name', c.name,
                'outcomes', jsonb_agg(
                    jsonb_build_object(
                        'outcome_number', clo.outcome_number,
                        'title', clo.title,
                        'description', clo.description,
                        'bloom_level', clo.bloom_level
                    )
                )
            ) INTO report_data
            FROM public.course c
            LEFT JOIN public.course_learning_outcomes clo ON c.id = clo.course_id
            WHERE c.id = p_scope_id
            GROUP BY c.id, c.name;
            
        WHEN 'student_progress' THEN
            SELECT jsonb_build_object(
                'student_id', u.id,
                'student_name', u.username,
                'course_progress', jsonb_agg(
                    jsonb_build_object(
                        'course_name', c.name,
                        'achievement_level', soa.achievement_level,
                        'percentage', soa.percentage
                    )
                )
            ) INTO report_data
            FROM public."user" u
            LEFT JOIN public.student_outcome_achievement soa ON u.id = soa.student_id
            LEFT JOIN public.course c ON soa.course_id = c.id
            WHERE u.id = p_scope_id
            GROUP BY u.id, u.username;
    END CASE;
    
    -- Insert report record
    INSERT INTO public.obe_reports (report_type, scope_id, scope_type, report_data, generated_by)
    VALUES (p_report_type, p_scope_id, p_scope_type, report_data, p_generated_by)
    RETURNING id INTO report_id;
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger to update student outcome achievement when assessment scores change
CREATE OR REPLACE FUNCTION update_student_outcome_achievement()
RETURNS TRIGGER AS $$
DECLARE
    calculated_percentage numeric;
BEGIN
    -- Calculate percentage
    SELECT 
        CASE 
            WHEN ar.max_marks > 0 THEN (NEW.marks_obtained / ar.max_marks) * 100
            ELSE 0 
        END INTO calculated_percentage
    FROM public.assessment_records ar
    WHERE ar.id = NEW.assessment_record_id;
    
    -- Update or insert student outcome achievement record
    INSERT INTO public.student_outcome_achievement (
        student_id, course_id, clo_id, assessment_type_id, 
        achievement_level, marks_obtained, max_marks
    )
    SELECT 
        NEW.student_id,
        ar.course_id,
        com.clo_id,
        ar.assessment_type_id,
        CASE 
            WHEN calculated_percentage >= 90 THEN 5
            WHEN calculated_percentage >= 80 THEN 4
            WHEN calculated_percentage >= 70 THEN 3
            WHEN calculated_percentage >= 60 THEN 2
            ELSE 1
        END,
        NEW.marks_obtained,
        ar.max_marks
    FROM public.assessment_records ar
    JOIN public.course_outcome_mapping com ON ar.course_id = com.course_id
    WHERE ar.id = NEW.assessment_record_id
    ON CONFLICT (student_id, assessment_record_id) DO UPDATE SET
        achievement_level = EXCLUDED.achievement_level,
        marks_obtained = EXCLUDED.marks_obtained,
        max_marks = EXCLUDED.max_marks,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_outcome_achievement
    AFTER INSERT OR UPDATE ON public.student_assessment_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_student_outcome_achievement();

-- =====================================================
-- 15. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.programs IS 'Degree programs offered by the institution (e.g., B.Tech, MBBS, BBA)';
COMMENT ON TABLE public.program_educational_objectives IS 'Program Educational Objectives (PEOs) - what graduates should achieve 3-5 years after graduation';
COMMENT ON TABLE public.program_learning_outcomes IS 'Program Learning Outcomes (PLOs) - what students should know and be able to do at graduation';
COMMENT ON TABLE public.course_learning_outcomes IS 'Course Learning Outcomes (CLOs) - specific outcomes for each course';
COMMENT ON TABLE public.course_outcome_mapping IS 'Mapping matrix showing how assessments measure course outcomes';
COMMENT ON TABLE public.program_course_mapping IS 'Mapping matrix showing how courses contribute to program outcomes';
COMMENT ON TABLE public.student_outcome_achievement IS 'Tracks individual student achievement of learning outcomes';

-- =====================================================
-- END OF OBE MAPPING SYSTEM
-- ===================================================== 