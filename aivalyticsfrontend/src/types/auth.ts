export interface User {
  id: string;
  username: string;
  email?: string;
  rollNumber?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  age?: number;
  classId?: string;
  createdAt?: string;
  updatedAt?: string;
  profilePic?: string;
  class?: {
    id: string;
    name: string;
    department?: string;
  };
}

export type UserRole = 'student' | 'teacher' | 'hod' | 'principal';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
  rollNumber: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  age?: number;
  classId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
} 