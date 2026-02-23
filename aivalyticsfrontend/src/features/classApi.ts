import apiService from './api';
import {
  CreateClassRequest,
  UpdateClassRequest,
  ClassListResponse,
  ClassResponse,
  ClassStatsResponse,
  DepartmentListResponse,
  StudentListResponse,
  AddStudentToClassRequest,
  ClassFilters,
} from '../types/class';

export const classService = {
  // Get all classes with pagination and search
  async getClasses(filters: ClassFilters = {}): Promise<ClassListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiService.get(`/classes/?${params.toString()}`);
    return response.data;
  },

  // Get class by ID
  async getClassById(id: string): Promise<ClassResponse> {
    const response = await apiService.get(`/classes/${id}`);
    return response.data;
  },

  // Create new class
  async createClass(classData: CreateClassRequest): Promise<ClassResponse> {
    const response = await apiService.post('/classes', classData);
    return response.data;
  },

  // Update class
  async updateClass(id: string, classData: UpdateClassRequest): Promise<ClassResponse> {
    const response = await apiService.put(`/classes/${id}`, classData);
    return response.data;
  },

  // Delete class
  async deleteClass(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiService.delete(`/classes/${id}`);
    return response.data;
  },

  // Get class statistics
  async getClassStats(): Promise<ClassStatsResponse> {
    const response = await apiService.get('/classes/stats');
    return response.data;
  },

  // Get departments for dropdown
  async getDepartments(): Promise<DepartmentListResponse> {
    const response = await apiService.get('/classes/departments');
    return response.data;
  },

  // Get available students (not enrolled in any class)
  async getAvailableStudents(search: string = ''): Promise<StudentListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await apiService.get(`/classes/students/available?${params.toString()}`);
    return response.data;
  },

  // Add student to class
  async addStudentToClass(classId: string, studentData: AddStudentToClassRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post(`/classes/${classId}/students`, studentData);
    return response.data;
  },

  // Remove student from class
  async removeStudentFromClass(classId: string, studentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiService.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },
};

export default classService; 