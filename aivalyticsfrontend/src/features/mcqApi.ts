import axios from 'axios';

export interface MCQQuestion {
 id: number;
 question: string;
 options: string[];
 correct_answer: number;
 explanation?: string;
 difficulty?: string;
 topic?: string;
}

export interface Question {
 id: number;
 question: string;
 options: string[];
 correct_answer: number;
 explanation?: string;
 difficulty?: string;
 topic?: string;
}

export interface QuizAnswer {
 question_id: number;
 question: string;
 selected_answer: number;
 correct_answer: number;
 is_correct: boolean;
 explanation?: string;
}

export interface QuizResult {
 quiz_name: string;
 total_questions: number;
 correct_answers: number;
 score_percentage: number;
 final_score: number;
 max_score: number;
 results: QuizAnswer[];
}

export interface Quiz {
 id: string;
 name: string;
 course_id: string;
 created_by: string;
 updated_by: string;
 question_json: MCQQuestion[];
 max_score: number;
 created_at: string;
 updated_at: string;
 deleted_at?: string;
 status?: 'draft' | 'active' | 'inactive';
 course?: {
 id: string;
 name: string;
 code: string;
 };
 question_count?: number;
}

export interface GenerateMCQRequest {
 course_id: string;
 quiz_name: string;
 num_questions?: number;
 max_score?: number;
 topics?: string;
 file: File;
}

export interface GenerateMCQResponse {
 success: boolean;
 message: string;
 data: {
 quiz_id: string;
 quiz_name: string;
 total_questions: number;
 total_marks: number;
 duration_minutes: number;
 course_name: string;
 };
}

export interface GetQuizzesResponse {
 success: boolean;
 data: {
 quizzes: Quiz[];
 pagination: {
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 };
 };
}

export interface QuizSubmission {
 id: string;
 student: {
 id: string;
 name: string;
 email: string;
 };
 marks: number;
 max_score: number;
 percentage: number;
 submitted_at: string;
 response: {
 answers: QuizAnswer[];
 total_questions: number;
 correct_answers: number;
 score_percentage: number;
 submitted_at: string;
 };
}

export interface QuizSubmissionsResponse {
 quiz: {
 id: string;
 name: string;
 max_score: number;
 course: {
 id: string;
 name: string;
 };
 total_questions: number;
 };
 submissions: QuizSubmission[];
 statistics: {
 total_submissions: number;
 average_score: number;
 highest_score: number;
 lowest_score: number;
 pass_rate: number;
 };
 pagination: {
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 };
}

export interface StudentQuizResult {
 quiz: {
 id: string;
 name: string;
 max_score: number;
 question_json: Question[];
 course: {
 id: string;
 name: string;
 };
 };
 score: number;
 max_score: number;
 submitted_at: string;
 response: {
 answers: QuizAnswer[];
 total_questions: number;
 correct_answers: number;
 score_percentage: number;
 submitted_at: string;
 };
 percentage: number;
}

export interface UpdateQuizRequest {
 quiz_id: string;
 name?: string;
 max_score?: number;
 question_json?: MCQQuestion[];
 status?: 'draft' | 'active' | 'inactive';
}

export interface ActivateQuizRequest {
 quiz_id: string;
}

export interface GetExplanationRequest {
 text: string;
 context?: string;
}

class MCQService {
 private baseURL: string;

 constructor() {
 this.baseURL = process.env.REACT_APP_API_BASE_URL || (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api';
 }

 private getAuthHeaders() {
 const token = localStorage.getItem('accessToken');
 return {
 'Authorization': `Bearer ${token}`,
 };
 }

 /**
 * Generate MCQ from uploaded file
 */
 async generateMCQ(data: GenerateMCQRequest): Promise<GenerateMCQResponse> {
 const formData = new FormData();
 formData.append('course_id', data.course_id);
 formData.append('quiz_name', data.quiz_name);
 formData.append('file', data.file);
 
 if (data.num_questions) {
 formData.append('num_questions', data.num_questions.toString());
 }
 
 if (data.max_score) {
 formData.append('max_score', data.max_score.toString());
 }

 if (data.topics) {
 formData.append('topics', data.topics);
 }

 const response = await fetch(`${this.baseURL}/mcq/generate`, {
 method: 'POST',
 headers: {
 ...this.getAuthHeaders(),
 },
 body: formData,
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.message || 'Failed to generate MCQ');
 }

 return response.json();
 }

 /**
 * Get teacher's quizzes with pagination
 */
 async getTeacherQuizzes(params?: {
 page?: number;
 limit?: number;
 course_id?: string;
 }): Promise<GetQuizzesResponse> {
 const queryParams = new URLSearchParams();
 
 if (params?.page) queryParams.append('page', params.page.toString());
 if (params?.limit) queryParams.append('limit', params.limit.toString());
 if (params?.course_id) queryParams.append('course_id', params.course_id);

 const response = await axios.get(`${this.baseURL}/mcq/quizzes?${queryParams.toString()}`, {
 headers: this.getAuthHeaders(),
 });

 return response.data;
 }

 /**
 * Delete a quiz
 */
 async deleteQuiz(quizId: string): Promise<{ success: boolean; message: string }> {
 const response = await axios.delete(`${this.baseURL}/mcq/quiz/${quizId}`, {
 headers: this.getAuthHeaders(),
 });

 return response.data;
 }

 /**
 * Get quiz details by ID
 */
 async getQuizById(quizId: string): Promise<{ success: boolean; data: Quiz }> {
 const response = await axios.get(`${this.baseURL}/mcq/quiz/${quizId}`, {
 headers: this.getAuthHeaders(),
 });

 return response.data;
 }

 // Submit quiz answers (for students)
 async submitQuizAnswers(quizId: string, answers: Array<{ question_id: number; selected_answer: number }>): Promise<any> {
 const response = await axios.post(`${this.baseURL}/mcq/quiz/${quizId}/submit`, { answers }, {
 headers: this.getAuthHeaders(),
 });
 return response.data;
 }

 // Get student scores and results
 async getStudentScores(page: number = 1, limit: number = 10, courseId?: string): Promise<{
 scores: any[];
 pagination: {
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 };
 }> {
 const params = new URLSearchParams({
 page: page.toString(),
 limit: limit.toString(),
 });
 
 if (courseId) {
 params.append('course_id', courseId);
 }

 const response = await fetch(`${this.baseURL}/mcq/scores?${params}`, {
 headers: this.getAuthHeaders(),
 });

 if (!response.ok) {
 throw new Error('Failed to fetch student scores');
 }

 const data = await response.json();
 return data.data;
 }

 async getStudentQuizResult(quizId: string): Promise<StudentQuizResult> {
 const response = await fetch(`${this.baseURL}/mcq/quiz/${quizId}/result`, {
 headers: this.getAuthHeaders(),
 });

 if (!response.ok) {
 throw new Error('Failed to fetch quiz result');
 }

 const data = await response.json();
 return data.data;
 }

 async getQuizSubmissions(quizId: string, page: number = 1, limit: number = 20): Promise<QuizSubmissionsResponse> {
 const params = new URLSearchParams({
 page: page.toString(),
 limit: limit.toString(),
 });

 const url = `${this.baseURL}/mcq/quiz/${quizId}/submissions?${params}`;

 const response = await fetch(url, {
 headers: this.getAuthHeaders(),
 });

 if (!response.ok) {
 const errorText = await response.text();
 
 try {
 const errorData = JSON.parse(errorText);
 throw new Error(errorData.message || 'Failed to fetch quiz submissions');
 } catch (parseError) {
 throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch quiz submissions'}`);
 }
 }

 const data = await response.json();
 return data.data;
 }

 /**
 * Get quizzes for a specific course (for students)
 */
 async getCourseQuizzes(courseId: string): Promise<{
 success: boolean;
 data: {
 quizzes: Quiz[];
 };
 }> {
 const response = await fetch(`${this.baseURL}/mcq/course/${courseId}/quizzes`, {
 headers: this.getAuthHeaders(),
 });

 if (!response.ok) {
 const errorText = await response.text();
 try {
 const errorData = JSON.parse(errorText);
 throw new Error(errorData.message || 'Failed to fetch course quizzes');
 } catch (parseError) {
 throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch course quizzes'}`);
 }
 }

 return response.json();
 }

 /**
 * Get quiz for taking (with questions but no correct answers)
 */
 async getQuizForTaking(quizId: string): Promise<{
 success: boolean;
 data: {
 quiz: {
 id: string;
 name: string;
 course: {
 id: string;
 name: string;
 };
 max_score: number;
 total_questions: number;
 };
 questions: MCQQuestion[];
 };
 }> {
 const response = await fetch(`${this.baseURL}/mcq/quiz/${quizId}/take`, {
 headers: this.getAuthHeaders(),
 });

 if (!response.ok) {
 const errorText = await response.text();
 try {
 const errorData = JSON.parse(errorText);
 throw new Error(errorData.message || 'Failed to load quiz for taking');
 } catch (parseError) {
 throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load quiz for taking'}`);
 }
 }

 return response.json();
 }

 /**
 * Get comprehensive quiz analytics for teachers
 */
 async getQuizAnalytics(): Promise<{
 success: boolean;
 data: {
 totalQuizzes: number;
 totalSubmissions: number;
 averageScore: number;
 highestScore: number;
 lowestScore: number;
 passRate: number;
 recentQuizzes: any[];
 quizPerformance: any[];
 monthlyStats: any[];
 topPerformingQuizzes: any[];
 };
 }> {
 try {
 const response = await axios.get(`${this.baseURL}/mcq/analytics`, {
 headers: this.getAuthHeaders(),
 });
 return response.data;
 } catch (error: any) {
 const errorText = error.response?.data?.message || error.message;
 throw new Error(`HTTP ${error.response?.status}: ${errorText || 'Failed to fetch quiz analytics'}`);
 }
 }

 /**
 * Update quiz details and questions
 */
 async updateQuiz(
 data: UpdateQuizRequest
 ): Promise<{ success: boolean; message: string; data: Quiz }> {
 const { quiz_id, ...updateData } = data;
 try {
 const response = await axios.put(
 `${this.baseURL}/mcq/quiz/${quiz_id}`,
 updateData,
 {
 headers: this.getAuthHeaders(),
 }
 );
 return response.data;
 } catch (error: any) {
 const errorText = error.response?.data?.message || error.message;
 throw new Error(`HTTP ${error.response?.status}: ${errorText || 'Failed to update quiz'}`);
 }
 }

 /**
 * Activate a quiz
 */
 async activateQuiz(quizId: string): Promise<{ success: boolean; message: string; data: Quiz }> {
 try {
 const response = await axios.post(`${this.baseURL}/mcq/quiz/${quizId}/activate`, {}, {
 headers: this.getAuthHeaders(),
 });
 return response.data;
 } catch (error: any) {
 const errorText = error.response?.data?.message || error.message;
 throw new Error(`HTTP ${error.response?.status}: ${errorText || 'Failed to activate quiz'}`);
 }
 }

 /**
 * Get detailed AI-powered explanation
 */
 async getDetailedExplanation(
 data: GetExplanationRequest
 ): Promise<{ success: true; explanation: string }> {
 try {
 const response = await axios.post(
 `${this.baseURL}/mcq/explain`,
 data,
 {
 headers: this.getAuthHeaders(),
 }
 );
 return response.data;
 } catch (error: any) {
 const errorText = error.response?.data?.message || error.message;
 throw new Error(
 `HTTP ${error.response?.status}: ${
 errorText || "Failed to get detailed explanation"
 }`
 );
 }
 }
}

export const getDetailedExplanation = async (
 explanation: string
): Promise<{ explanation: string }> => {
 const token = localStorage.getItem("accessToken");
 const response = await axios.post(
 `${process.env.REACT_APP_API_BASE_URL || (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_BASE_URL) || "http://localhost:5000/api"}/mcq/explain`,
 { explanation },
 {
 headers: {
 Authorization: `Bearer ${token}`,
 },
 }
 );
 return response.data;
};

export const mcqService = new MCQService();
export default mcqService; 