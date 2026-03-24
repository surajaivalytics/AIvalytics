export interface Course {
 id: string;
 name: string;
 description: string;
 about: string;
 created_by: string;
 updated_by: string;
 created_at: string;
 updated_at: string;
 deleted_at?: string;
 
 // Timeline fields
 duration_months?: number;
 start_date?: string;
 end_date?: string;
 enrollment_deadline?: string;
 is_active?: boolean;
 progress_percentage?: number;
 timeline_updated_at?: string;
 
 // Computed fields
 timelineStatus?: 'not_started' | 'in_progress' | 'completed' | 'unknown';
 daysRemaining?: number;
 enrollmentOpen?: boolean;
 
 created_by_user?: {
 id: string;
 username: string;
 };
 updated_by_user?: {
 id: string;
 username: string;
 };
 enrolledStudents?: Student[];
 enrollmentCount?: number;
 isEnrolled?: boolean;
}

export interface Student {
 id: string;
 username: string;
 roll_number: string;
}

export interface CreateCourseRequest {
 name: string;
 about: string;
 duration_months?: number;
 start_date?: string;
}

export interface UpdateCourseRequest {
 name?: string;
 about?: string;
 duration_months?: number;
 start_date?: string;
}

export interface CourseListResponse {
 success: boolean;
 courses: Course[];
 pagination: {
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 };
}

export interface CourseResponse {
 success: boolean;
 course: Course;
 message?: string;
}

export interface CourseStatsResponse {
 success: boolean;
 stats: {
 totalCourses?: number;
 totalEnrollments?: number;
 enrolledCourses?: number;
 availableCourses?: number;
 };
}

export interface CourseFilters {
 page?: number;
 limit?: number;
 search?: string;
 status?: 'all' | 'active' | 'not_started' | 'in_progress' | 'completed' | 'enrollment_open';
}

export interface CourseFormData {
 name: string;
 about: string;
}

export interface CourseTimelineAnalytics {
 totalCourses: number;
 activeCoursesCount: number;
 notStartedCount: number;
 inProgressCount: number;
 completedCount: number;
 totalEnrollments: number;
 averageProgress: number;
 coursesEndingSoon: number;
}

export interface ExtendDurationRequest {
 additional_months: number;
} 