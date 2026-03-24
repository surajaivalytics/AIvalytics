import api from './api';

export interface InstitutionType {
 id: string;
 name: string;
 description?: string;
 created_at: string;
 updated_at: string;
}

export interface Program {
 id: string;
 name: string;
 code: string;
 institution_type_id: string;
 duration_years: number;
 total_credits: number;
 description?: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface ProgramEducationalObjective {
 id: string;
 program_id: string;
 objective_number: number;
 title: string;
 description: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface ProgramLearningOutcome {
 id: string;
 program_id: string;
 outcome_number: number;
 title: string;
 description: string;
 bloom_level: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface CourseLearningOutcome {
 id: string;
 course_id: string;
 outcome_number: number;
 title: string;
 description: string;
 bloom_level: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface AssessmentType {
 id: string;
 name: string;
 description?: string;
 weight_percentage: number;
 created_at: string;
 updated_at: string;
}

export interface CourseOutcomeMapping {
 id: string;
 clo_id: string;
 assessment_type_id: string;
 coverage_level: number;
 weight_percentage: number;
 created_at: string;
 updated_at: string;
}

export interface AssessmentRecord {
 id: string;
 course_id: string;
 assessment_type_id: string;
 title: string;
 description?: string;
 max_marks: number;
 weight_percentage: number;
 assessment_date: string;
 due_date?: string;
 created_by: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface StudentAssessmentScore {
 id: string;
 student_id: string;
 assessment_record_id: string;
 marks_obtained: number;
 created_at: string;
 updated_at: string;
}

export interface StudentOutcomeAchievement {
 id: string;
 student_id: string;
 clo_id: string;
 achievement_level: number;
 created_at: string;
 updated_at: string;
}

export interface OBEReport {
 id: string;
 course_id: string;
 report_type: string;
 report_data: any;
 generated_by: string;
 generated_at: string;
 created_at: string;
 updated_at: string;
}

// API Service
export const obeApi = {
 // Institution Types
 getInstitutionTypes: async () => {
 const response = await api.get('/obe/institution-types');
 return response.data;
 },

 createInstitutionType: async (data: Omit<InstitutionType, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/institution-types', data);
 return response.data;
 },

 updateInstitutionType: async (id: string, data: Partial<InstitutionType>) => {
 const response = await api.put(`/obe/institution-types/${id}`, data);
 return response.data;
 },

 deleteInstitutionType: async (id: string) => {
 const response = await api.delete(`/obe/institution-types/${id}`);
 return response.data;
 },

 // Programs
 getPrograms: async () => {
 const response = await api.get('/obe/programs');
 return response.data;
 },

 createProgram: async (data: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/programs', data);
 return response.data;
 },

 updateProgram: async (id: string, data: Partial<Program>) => {
 const response = await api.put(`/obe/programs/${id}`, data);
 return response.data;
 },

 deleteProgram: async (id: string) => {
 const response = await api.delete(`/obe/programs/${id}`);
 return response.data;
 },

 // Program Educational Objectives (PEOs)
 getPEOs: async () => {
 const response = await api.get('/obe/peos');
 return response.data;
 },

 createPEO: async (data: Omit<ProgramEducationalObjective, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/peos', data);
 return response.data;
 },

 updatePEO: async (id: string, data: Partial<ProgramEducationalObjective>) => {
 const response = await api.put(`/obe/peos/${id}`, data);
 return response.data;
 },

 deletePEO: async (id: string) => {
 const response = await api.delete(`/obe/peos/${id}`);
 return response.data;
 },

 // Program Learning Outcomes (PLOs)
 getPLOs: async () => {
 const response = await api.get('/obe/plos');
 return response.data;
 },

 createPLO: async (data: Omit<ProgramLearningOutcome, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/plos', data);
 return response.data;
 },

 updatePLO: async (id: string, data: Partial<ProgramLearningOutcome>) => {
 const response = await api.put(`/obe/plos/${id}`, data);
 return response.data;
 },

 deletePLO: async (id: string) => {
 const response = await api.delete(`/obe/plos/${id}`);
 return response.data;
 },

 // Course Learning Outcomes (CLOs)
 getCLOs: async () => {
 const response = await api.get('/obe/clos');
 return response.data;
 },

 createCLO: async (data: Omit<CourseLearningOutcome, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/clos', data);
 return response.data;
 },

 updateCLO: async (id: string, data: Partial<CourseLearningOutcome>) => {
 const response = await api.put(`/obe/clos/${id}`, data);
 return response.data;
 },

 deleteCLO: async (id: string) => {
 const response = await api.delete(`/obe/clos/${id}`);
 return response.data;
 },

 // Assessment Types
 getAssessmentTypes: async () => {
 const response = await api.get('/obe/assessment-types');
 return response.data;
 },

 createAssessmentType: async (data: Omit<AssessmentType, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/assessment-types', data);
 return response.data;
 },

 updateAssessmentType: async (id: string, data: Partial<AssessmentType>) => {
 const response = await api.put(`/obe/assessment-types/${id}`, data);
 return response.data;
 },

 deleteAssessmentType: async (id: string) => {
 const response = await api.delete(`/obe/assessment-types/${id}`);
 return response.data;
 },

 // Course Outcome Mapping
 getCourseMappings: async () => {
 const response = await api.get('/obe/course-mappings');
 return response.data;
 },

 createCourseMapping: async (data: Omit<CourseOutcomeMapping, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/course-mappings', data);
 return response.data;
 },

 updateCourseMapping: async (id: string, data: Partial<CourseOutcomeMapping>) => {
 const response = await api.put(`/obe/course-mappings/${id}`, data);
 return response.data;
 },

 deleteCourseMapping: async (id: string) => {
 const response = await api.delete(`/obe/course-mappings/${id}`);
 return response.data;
 },

 // Assessment Records
 getAssessmentRecords: async () => {
 const response = await api.get('/obe/assessment-records');
 return response.data;
 },

 createAssessmentRecord: async (data: Omit<AssessmentRecord, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/assessment-records', data);
 return response.data;
 },

 updateAssessmentRecord: async (id: string, data: Partial<AssessmentRecord>) => {
 const response = await api.put(`/obe/assessment-records/${id}`, data);
 return response.data;
 },

 deleteAssessmentRecord: async (id: string) => {
 const response = await api.delete(`/obe/assessment-records/${id}`);
 return response.data;
 },

 // Student Assessment Scores
 getStudentAssessmentScores: async () => {
 const response = await api.get('/obe/student-assessment-scores');
 return response.data;
 },

 createStudentAssessmentScore: async (data: Omit<StudentAssessmentScore, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/student-assessment-scores', data);
 return response.data;
 },

 updateStudentAssessmentScore: async (id: string, data: Partial<StudentAssessmentScore>) => {
 const response = await api.put(`/obe/student-assessment-scores/${id}`, data);
 return response.data;
 },

 deleteStudentAssessmentScore: async (id: string) => {
 const response = await api.delete(`/obe/student-assessment-scores/${id}`);
 return response.data;
 },

 // Student Outcome Achievement
 getStudentOutcomeAchievement: async () => {
 const response = await api.get('/obe/student-outcome-achievement');
 return response.data;
 },

 createStudentOutcomeAchievement: async (data: Omit<StudentOutcomeAchievement, 'id' | 'created_at' | 'updated_at'>) => {
 const response = await api.post('/obe/student-outcome-achievement', data);
 return response.data;
 },

 updateStudentOutcomeAchievement: async (id: string, data: Partial<StudentOutcomeAchievement>) => {
 const response = await api.put(`/obe/student-outcome-achievement/${id}`, data);
 return response.data;
 },

 deleteStudentOutcomeAchievement: async (id: string) => {
 const response = await api.delete(`/obe/student-outcome-achievement/${id}`);
 return response.data;
 },

 // OBE Reports
 getOBEReports: async () => {
 const response = await api.get('/obe/reports');
 return response.data;
 },

 generateOBEReport: async (data: { course_id: string; report_type: string; generated_by: string }) => {
 const response = await api.post('/obe/reports/generate', data);
 return response.data;
 },

 getOBEReport: async (id: string) => {
 const response = await api.get(`/obe/reports/${id}`);
 return response.data;
 },

 deleteOBEReport: async (id: string) => {
 const response = await api.delete(`/obe/reports/${id}`);
 return response.data;
 },

 // Views and Analytics
 getCourseOutcomeMappingView: async () => {
 const response = await api.get('/obe/views/course-outcome-mapping');
 return response.data;
 },

 getStudentProgressView: async () => {
 const response = await api.get('/obe/views/student-progress');
 return response.data;
 },

 getStudentAssessmentScoresView: async () => {
 const response = await api.get('/obe/views/student-assessment-scores');
 return response.data;
 },

 getOBEDashboardStats: async () => {
 const response = await api.get('/obe/dashboard/stats');
 return response.data;
 }
};

