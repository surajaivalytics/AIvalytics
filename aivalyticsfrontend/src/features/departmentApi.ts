import axios, { AxiosResponse } from 'axios';
import {
 Department,
 DepartmentFormData,
 DepartmentResponse,
 DepartmentStatsResponse,
 DepartmentQuery,
} from '../types/department';

class DepartmentApiService {
 private api = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
 timeout: 10000,
 withCredentials: true,
 headers: {
 'Content-Type': 'application/json',
 },
 });

 constructor() {
 // Request interceptor to add auth token
 this.api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('accessToken');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
 );

 // Response interceptor for error handling
 this.api.interceptors.response.use(
 (response) => response,
 async (error) => {
 if (error.response?.status === 401) {
 // Token expired, redirect to login
 localStorage.removeItem('accessToken');
 localStorage.removeItem('refreshToken');
 window.location.href = '/login';
 }
 return Promise.reject(error);
 }
 );
 }

 // Get all departments with pagination and search
 async getAllDepartments(query: DepartmentQuery = {}): Promise<DepartmentResponse> {
 const params = new URLSearchParams();
 if (query.page) params.append('page', query.page.toString());
 if (query.limit) params.append('limit', query.limit.toString());
 if (query.search) params.append('search', query.search);

 const response: AxiosResponse<DepartmentResponse> = await this.api.get(
 `/departments?${params.toString()}`
 );
 return response.data;
 }

 // Get department by ID
 async getDepartmentById(id: string): Promise<DepartmentResponse> {
 const response: AxiosResponse<DepartmentResponse> = await this.api.get(
 `/departments/${id}`
 );
 return response.data;
 }

 // Create new department
 async createDepartment(data: DepartmentFormData): Promise<DepartmentResponse> {
 const response: AxiosResponse<DepartmentResponse> = await this.api.post(
 '/departments',
 data
 );
 return response.data;
 }

 // Update department
 async updateDepartment(id: string, data: DepartmentFormData): Promise<DepartmentResponse> {
 const response: AxiosResponse<DepartmentResponse> = await this.api.put(
 `/departments/${id}`,
 data
 );
 return response.data;
 }

 // Delete department
 async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
 const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(
 `/departments/${id}`
 );
 return response.data;
 }

 // Get department statistics
 async getDepartmentStats(): Promise<DepartmentStatsResponse> {
 const response: AxiosResponse<DepartmentStatsResponse> = await this.api.get(
 '/departments/stats'
 );
 return response.data;
 }
}

export const departmentApiService = new DepartmentApiService();
export default departmentApiService; 