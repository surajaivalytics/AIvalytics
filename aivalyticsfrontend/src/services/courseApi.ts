import axios from 'axios';
import {
 Course,
 CreateCourseRequest,
 UpdateCourseRequest,
 CourseListResponse,
 CourseResponse,
 CourseStatsResponse,
 CourseFilters,
 CourseTimelineAnalytics,
 ExtendDurationRequest,
} from '../types/course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const courseApi = axios.create({
 baseURL: `${API_BASE_URL}/courses`,
 withCredentials: true,
 headers: {
 'Content-Type': 'application/json',
 },
});

// Add auth token to requests
courseApi.interceptors.request.use((config) => {
 const token = localStorage.getItem('accessToken');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

// Handle response errors
courseApi.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 localStorage.removeItem('accessToken');
 localStorage.removeItem('refreshToken');
 window.location.href = '/login';
 }
 return Promise.reject(error);
 }
);

export const courseService = {
 // Get all courses with pagination, search, and status filtering
 async getCourses(filters: CourseFilters = {}): Promise<CourseListResponse> {
 const params = new URLSearchParams();
 
 if (filters.page) params.append('page', filters.page.toString());
 if (filters.limit) params.append('limit', filters.limit.toString());
 if (filters.search) params.append('search', filters.search);
 if (filters.status) params.append('status', filters.status);

 const response = await courseApi.get(`/?${params.toString()}`);
 return response.data;
 },

 // Get course by ID
 async getCourseById(id: string): Promise<CourseResponse> {
 const response = await courseApi.get(`/${id}`);
 return response.data;
 },

 // Create new course (Teachers only)
 async createCourse(courseData: CreateCourseRequest): Promise<CourseResponse> {
 const response = await courseApi.post('/', courseData);
 return response.data;
 },

 // Update course (Teachers can only update their own courses)
 async updateCourse(id: string, courseData: UpdateCourseRequest): Promise<CourseResponse> {
 const response = await courseApi.put(`/${id}`, courseData);
 return response.data;
 },

 // Delete course (Teachers can only delete their own courses)
 async deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
 const response = await courseApi.delete(`/${id}`);
 return response.data;
 },

 // Get course statistics
 async getCourseStats(): Promise<CourseStatsResponse> {
 const response = await courseApi.get('/stats');
 return response.data;
 },

 // Get teacher's own courses
 async getTeacherCourses(filters: CourseFilters = {}): Promise<CourseListResponse> {
 const params = new URLSearchParams();
 
 if (filters.page) params.append('page', filters.page.toString());
 if (filters.limit) params.append('limit', filters.limit.toString());
 if (filters.search) params.append('search', filters.search);
 if (filters.status) params.append('status', filters.status);

 const response = await courseApi.get(`/my-courses?${params.toString()}`);
 return response.data;
 },

 // Enroll in course (Students only)
 async enrollInCourse(courseId: string): Promise<{ success: boolean; message: string }> {
 const response = await courseApi.post(`/${courseId}/enroll`);
 return response.data;
 },

 // Unenroll from course (Students only)
 async unenrollFromCourse(courseId: string): Promise<{ success: boolean; message: string }> {
 const response = await courseApi.delete(`/${courseId}/enroll`);
 return response.data;
 },

 // Get course timeline analytics (Teachers, HOD, Principal)
 async getTimelineAnalytics(): Promise<{ success: boolean; analytics?: CourseTimelineAnalytics; courses?: Course[]; message?: string }> {
 const response = await courseApi.get('/timeline-analytics');
 return response.data;
 },

 // Extend course duration (Teachers can extend their own courses)
 async extendCourseDuration(courseId: string, data: ExtendDurationRequest): Promise<{ success: boolean; message: string }> {
 const response = await courseApi.put(`/${courseId}/extend-duration`, data);
 return response.data;
 },
};

export default courseService; 