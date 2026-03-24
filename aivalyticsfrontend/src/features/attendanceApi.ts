import apiService from './api';
import axios from 'axios';
import { API_BASE_URL } from './api';

// Types for attendance endpoints
export interface AttendanceQuery {
 student_id?: string;
 course_id?: string;
 start_date?: string;
 end_date?: string;
 limit?: number;
 offset?: number;
}

export interface AttendanceSessionData {
 course_id: string;
 class_id?: string;
 session_date?: string;
 session_time?: string;
 session_duration?: number;
 session_type?: string;
 location?: string;
 topic?: string;
}

export interface MarkAttendanceData {
 session_id: string;
 attendance_records: Array<{
 student_id: string;
 attendance_status: 'present' | 'absent' | 'late' | 'excused' | 'medical_leave';
 arrival_time?: string;
 excuse_reason?: string;
 }>;
}

// Add these types for use in TeacherAttendancePage
export interface AttendanceAnalytics {
 total_students: number;
 average_attendance: number;
 excellent_attendance: number;
 good_attendance: number;
 warning_attendance: number;
 critical_attendance: number;
 distribution: {
 excellent: number;
 good: number;
 average: number;
 poor: number;
 };
}

export interface AttendanceSession {
 id: string;
 course_id: string;
 course_name: string;
 teacher_id: string;
 class_id?: string;
 session_date: string;
 session_time: string;
 session_duration?: number;
 session_type?: string;
 location?: string;
 topic?: string;
 status: string;
 attendance_marked: boolean;
 total_students: number;
 present_students: number;
 absent_students: number;
 late_students: number;
 created_at: string;
 updated_at: string;
}

export interface StudentAttendanceSummary {
 total_sessions: number;
 present_count: number;
 absent_count: number;
 late_count: number;
 excused_count: number;
 medical_leave_count: number;
 attendance_percentage: number;
 status: 'excellent' | 'good' | 'warning' | 'critical';
 courses: Array<{
 course_id: string;
 course_name: string;
 attendance_percentage: number;
 status: 'excellent' | 'good' | 'warning' | 'critical';
 }>;
}

interface AttendanceParams {
 student_id?: string;
 course_id?: string;
 start_date?: string;
 end_date?: string;
 limit?: number;
}

interface AttendanceResponse {
 success: boolean;
 data: any;
 message: string;
}

interface StudentSummaryParams {
 studentId: string;
 courseId?: string;
}

// Student attendance records for dashboard
export interface AttendanceRecord {
 id: string;
 session_id: string;
 student_id: string;
 attendance_status: "present" | "absent" | "late" | "excused";
 created_at: string;
 session: {
 id: string;
 course_id: string;
 session_date: string;
 session_time: string;
 session_duration: number;
 status: string;
 course: {
 id: string;
 name: string;
 };
 };
}

export interface StudentAttendanceResponse {
 success: boolean;
 data: {
 records: AttendanceRecord[];
 totalRecords: number;
 message?: string;
 };
}

export const attendanceAPI = {
 // Student attendance records
 async getStudentAttendance(params: AttendanceQuery): Promise<AttendanceResponse> {
 try {
 const response = await apiService.get('/attendance/student', { params });
 
 return {
 success: true,
 data: response,
 message: 'Student attendance retrieved successfully'
 };
 } catch (error: any) {
 console.error('Error fetching student attendance:', error);
 return {
 success: false,
 data: null,
 message: error.response?.data?.message || 'Failed to fetch student attendance'
 };
 }
 },

 // Analytics (teacher/admin)
 async getAttendanceAnalytics(params: { course_id?: string }) {
 return apiService.get('/attendance/analytics', { params }).then((r: any) => r.data);
 },

 // Create a new attendance session (teacher)
 async createAttendanceSession(data: AttendanceSessionData) {
 return apiService.post('/attendance/sessions', data).then((r: any) => r.data);
 },

 // Mark attendance (teacher, bulk)
 async markAttendance(data: MarkAttendanceData) {
 return apiService.post('/attendance/mark', data).then((r: any) => r.data);
 },

 // (Optional) Export attendance data
 async exportAttendance(params: { course_id?: string; format?: string }) {
 return apiService.get('/attendance/export', { params }).then((r: any) => r.data);
 },

 // (Optional) Get attendance sessions (teacher)
 async getAttendanceSessions(params: { course_id?: string; date?: string }) {
 return apiService.get('/attendance/sessions', { params }).then((r: any) => r.data);
 },

 // (Optional) Update attendance record
 async updateAttendance(attendance_id: string, data: any) {
 return apiService.put(`/attendance/${attendance_id}`, data).then((r: any) => r.data);
 },

 // (Optional) Get attendance summary for admin
 async getAdminAttendanceSummary(params: { department_id?: string; date?: string }) {
 return apiService.get('/attendance/admin-summary', { params }).then((r: any) => r.data);
 },

 // Fetch all attendance records for a session
 async getSessionAttendance(session_id: string) {
 return apiService.get('/attendance/session-attendance', { params: { session_id } }).then((r: any) => r.data);
 },

 // Get student attendance summary
 async getStudentAttendanceSummary(params: {
 studentId?: string;
 course_id?: string;
 academic_year?: string;
 semester?: string;
 }): Promise<AttendanceResponse> {
 try {
 const { studentId, ...otherParams } = params;
 const response = await apiService.get('/attendance/student-summary', { 
 params: {
 student_id: studentId,
 ...otherParams
 } 
 });
 
 return {
 success: true,
 data: response,
 message: 'Student attendance summary retrieved successfully'
 };
 } catch (error: any) {
 console.error('Error fetching student attendance summary:', error);
 return {
 success: false,
 data: null,
 message: error.response?.data?.message || 'Failed to fetch student attendance summary'
 };
 }
 },

 // Fetch student attendance for calendar view
 async getStudentCalendarAttendance(params: AttendanceParams): Promise<AttendanceResponse> {
 try {
 const response = await axios.get(`${API_BASE_URL}/attendance/calendar`, {
 params,
 withCredentials: true
 });

 return {
 success: true,
 data: response.data,
 message: 'Attendance data retrieved successfully'
 };
 } catch (error: any) {
 console.error('Error fetching student attendance:', error);
 return {
 success: false,
 data: null,
 message: error.response?.data?.message || 'Failed to fetch attendance data'
 };
 }
 },

 // Fetch student course attendance
 getStudentCourseAttendance: async (studentId: string, courseId: string): Promise<AttendanceResponse> => {
 try {
 const response = await axios.get(`${API_BASE_URL}/attendance/student/${studentId}/course/${courseId}`, {
 withCredentials: true
 });

 return {
 success: true,
 data: response.data,
 message: 'Course attendance retrieved successfully'
 };
 } catch (error: any) {
 console.error('Error fetching course attendance:', error);
 return {
 success: false,
 data: null,
 message: error.response?.data?.message || 'Failed to fetch course attendance'
 };
 }
 },

 // Fetch student attendance summary
 getStudentSummary: (params: StudentSummaryParams) => {
 return apiService.get('/attendance/student-summary', { params }).then((r: any) => r.data);
 },

 // Add other attendance-related methods as needed
};

/**
 * Get student attendance records for dashboard
 */
export const getStudentAttendanceRecords = async (): Promise<StudentAttendanceResponse> => {
 try {
 console.log('🔍 Frontend: Calling getStudentAttendanceRecords API...');
 const response = await apiService.get('/attendance/student-records');
 console.log('✅ Frontend: API response received:', response);
 
 // Validate response structure
 if (!response || !response.data) {
 console.error('❌ Frontend: Invalid response structure:', response);
 return {
 success: false,
 data: {
 records: [],
 totalRecords: 0,
 message: 'Invalid response structure from server',
 },
 };
 }

 const { success, data, message } = response.data;
 
 if (!success) {
 console.error('❌ Frontend: API returned success: false:', message);
 return {
 success: false,
 data: {
 records: [],
 totalRecords: 0,
 message: message || 'Failed to load attendance data',
 },
 };
 }

 // Validate data structure
 if (!data || !Array.isArray(data.records)) {
 console.error('❌ Frontend: Invalid data structure:', data);
 return {
 success: false,
 data: {
 records: [],
 totalRecords: 0,
 message: 'Invalid data structure received from server',
 },
 };
 }

 // Validate each record
 const validRecords = data.records.filter((record: any) => {
 return record && 
 record.id && 
 record.session && 
 record.session.course && 
 record.session.course.name &&
 record.attendance_status;
 });

 console.log('✅ Frontend: Valid records found:', validRecords.length);
 
 return {
 success: true,
 data: {
 records: validRecords,
 totalRecords: validRecords.length,
 },
 };
 } catch (error: any) {
 console.error('❌ Frontend: Error fetching student attendance records:', error);
 console.error('❌ Frontend: Error response:', error.response?.data);
 
 // Provide more specific error messages
 let errorMessage = 'Failed to load attendance data';
 if (error.response?.status === 401) {
 errorMessage = 'Authentication required. Please log in again.';
 } else if (error.response?.status === 403) {
 errorMessage = 'Access denied. Only students can view attendance records.';
 } else if (error.response?.status === 404) {
 errorMessage = 'Attendance service not found.';
 } else if (error.response?.status >= 500) {
 errorMessage = 'Server error. Please try again later.';
 } else if (error.code === 'NETWORK_ERROR') {
 errorMessage = 'Network error. Please check your connection.';
 }
 
 return {
 success: false,
 data: {
 records: [],
 totalRecords: 0,
 message: errorMessage,
 },
 };
 }
};

export default attendanceAPI; 