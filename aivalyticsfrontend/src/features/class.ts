export interface Department {
 id: string;
 name: string;
 created_at: string;
 updated_at: string;
}

export interface Student {
 id: string;
 username: string;
 roll_number: string;
 class_id?: string;
}

export interface Class {
 id: string;
 name: string;
 num_students: number;
 department_id: string;
 class_teacher_id?: string;
 created_at: string;
 updated_at: string;
 deleted_at?: string;
 department?: Department;
 students?: Student[];
}

export interface CreateClassRequest {
 name: string;
 department_id: string;
}

export interface UpdateClassRequest {
 name?: string;
 department_id?: string;
}

export interface ClassListResponse {
 success: boolean;
 classes: Class[];
 pagination: {
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 };
}

export interface ClassResponse {
 success: boolean;
 class: Class;
 message?: string;
}

export interface ClassStatsResponse {
 success: boolean;
 stats: {
 totalClasses: number;
 totalStudentsInClasses: number;
 };
}

export interface DepartmentListResponse {
 success: boolean;
 departments: Department[];
}

export interface StudentListResponse {
 success: boolean;
 students: Student[];
}

export interface AddStudentToClassRequest {
 student_id: string;
}

export interface ClassFilters {
 page?: number;
 limit?: number;
 search?: string;
}

export interface ClassFormData {
 name: string;
 department_id: string;
} 