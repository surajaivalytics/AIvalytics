import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api';

// Export API_BASE_URL for other services
export { API_BASE_URL };

interface LoginResponse {
 success: boolean;
 message: string;
 user: any;
 tokens: {
 accessToken: string;
 refreshToken: string;
 };
}

interface RegisterResponse {
 success: boolean;
 message: string;
}

interface ForgotPasswordResponse {
 success: boolean;
 message: string;
 resetToken?: string;
}

interface VerifyTokenResponse {
 success: boolean;
 message: string;
 user: any;
}

interface RefreshTokenResponse {
 success: boolean;
 message: string;
 tokens: {
 accessToken: string;
 refreshToken: string;
 };
}

interface LogoutResponse {
 success: boolean;
 message: string;
}

interface ProfileResponse {
 success: boolean;
 message: string;
 user: any;
}

interface UpdateProfileResponse {
 success: boolean;
 message: string;
}

interface ChangePasswordResponse {
 success: boolean;
 message: string;
}

interface ResetPasswordResponse {
 success: boolean;
 message: string;
}

class ApiService {
 private api: AxiosInstance;
 private refreshPromise: Promise<any> | null = null;

 constructor() {
 this.api = axios.create({
 baseURL: API_BASE_URL,
 timeout: 60000, // Increased from 10000 to 60000 (60 seconds)
 withCredentials: true,
 headers: {
 'Content-Type': 'application/json',
 },
 });

 // Request interceptor to add auth token
 this.api.interceptors.request.use(
 (config) => {
 const token = this.getValidToken();
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
 );

 // Response interceptor to handle token refresh
 this.api.interceptors.response.use(
 (response) => response,
 async (error: AxiosError) => {
 const originalRequest = error.config as any;

 if (error.response?.status === 401 && !originalRequest._retry) {
 originalRequest._retry = true;

 try {
 console.log("🔐 401 error detected, attempting token refresh...");
 await this.refreshToken();
 const token = this.getValidToken();
 if (token) {
 originalRequest.headers.Authorization = `Bearer ${token}`;
 return this.api(originalRequest);
 }
 } catch (refreshError) {
 console.error("🔐 Token refresh failed:", refreshError);
 // Clear all tokens and redirect to login
 this.clearAllTokens();
 window.location.href = '/login';
 return Promise.reject(refreshError);
 }
 }

 return Promise.reject(error);
 }
 );
 }

 // Get valid token from localStorage
 private getValidToken(): string | null {
 const accessToken = localStorage.getItem('accessToken');
 const legacyToken = localStorage.getItem('token');
 return accessToken || legacyToken;
 }

 // Clear all authentication tokens
 private clearAllTokens(): void {
 localStorage.removeItem('accessToken');
 localStorage.removeItem('refreshToken');
 localStorage.removeItem('token');
 console.log("🔐 All tokens cleared");
 }

 // Get auth headers
 private getAuthHeaders(): Record<string, string> {
 const token = this.getValidToken();
 return token ? { Authorization: `Bearer ${token}` } : {};
 }

 // Authentication methods
 async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
 try {
 console.log("🔐 Attempting login...");
 const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
 console.log("🔐 Login successful");
 return response.data;
 } catch (error: any) {
 console.error("🔐 Login failed:", error.response?.data || error.message);
 throw error;
 }
 }

 async register(data: any): Promise<RegisterResponse> {
 try {
 const response: AxiosResponse<RegisterResponse> = await this.api.post('/auth/register', data);
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 async forgotPassword(data: { email: string }): Promise<ForgotPasswordResponse> {
 try {
 const response: AxiosResponse<ForgotPasswordResponse> = await this.api.post('/auth/forgot-password', data);
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 async resetPassword(data: { token: string; password: string }): Promise<ResetPasswordResponse> {
 try {
 const response: AxiosResponse<ResetPasswordResponse> = await this.api.post('/auth/reset-password', data);
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ChangePasswordResponse> {
 try {
 const response: AxiosResponse<ChangePasswordResponse> = await this.api.post('/auth/change-password', data);
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 async verifyToken(): Promise<VerifyTokenResponse> {
 try {
 const response: AxiosResponse<VerifyTokenResponse> = await this.api.get('/auth/verify');
 return response.data;
 } catch (error: any) {
 console.error("🔐 Token verification failed:", error.response?.data || error.message);
 throw error;
 }
 }

 async refreshToken(): Promise<RefreshTokenResponse> {
 // Prevent multiple simultaneous refresh requests
 if (this.refreshPromise) {
 return this.refreshPromise;
 }

 this.refreshPromise = this.performRefreshToken();
 return this.refreshPromise;
 }

 private async performRefreshToken(): Promise<RefreshTokenResponse> {
 try {
 const refreshToken = localStorage.getItem('refreshToken');
 if (!refreshToken) {
 throw new Error('No refresh token available');
 }

 console.log("🔐 Refreshing token...");
 const response: AxiosResponse<RefreshTokenResponse> = await this.api.post('/auth/refresh', {
 refreshToken,
 });

 // Update tokens in localStorage
 if (response.data.success && response.data.tokens) {
 localStorage.setItem('accessToken', response.data.tokens.accessToken);
 localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
 console.log("🔐 Token refreshed successfully");
 }

 return response.data;
 } catch (error: any) {
 console.error("🔐 Token refresh failed:", error.response?.data || error.message);
 this.clearAllTokens();
 throw error;
 } finally {
 this.refreshPromise = null;
 }
 }

 async logout(): Promise<LogoutResponse> {
 try {
 const response: AxiosResponse<LogoutResponse> = await this.api.post('/auth/logout');
 this.clearAllTokens();
 return response.data;
 } catch (error: any) {
 // Even if logout API fails, clear local tokens
 this.clearAllTokens();
 throw error;
 }
 }

 async getProfile(): Promise<ProfileResponse> {
 try {
 const response: AxiosResponse<ProfileResponse> = await this.api.get('/auth/profile');
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 async updateProfile(data: { username: string; rollNumber: string }): Promise<UpdateProfileResponse> {
 try {
 const response: AxiosResponse<UpdateProfileResponse> = await this.api.put('/auth/profile', data);
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 // Generic HTTP methods for other services
 public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
 return this.api.get<T>(url, config);
 }

 public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
 return this.api.post<T>(url, data, config);
 }

 public put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
 return this.api.put<T>(url, data, config);
 }

 public delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
 return this.api.delete<T>(url, config);
 }

 // Generic API request method
 async makeRequest<T>(endpoint: string, options: any = {}): Promise<T> {
 try {
 const response: AxiosResponse<T> = await this.api.request({
 url: endpoint,
 ...options,
 });
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }

 // Health check
 async healthCheck(): Promise<any> {
 try {
 const response = await this.api.get('/auth/health');
 return response.data;
 } catch (error: any) {
 throw error;
 }
 }
}

export default new ApiService(); 