export interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DepartmentFormData {
  name: string;
}

export interface DepartmentResponse {
  success: boolean;
  message?: string;
  department?: Department;
  departments?: Department[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DepartmentStats {
  totalDepartments: number;
  departmentsWithClasses: Array<{
    id: string;
    name: string;
    classes: { count: number };
  }>;
}

export interface DepartmentStatsResponse {
  success: boolean;
  stats: DepartmentStats;
}

export interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
} 