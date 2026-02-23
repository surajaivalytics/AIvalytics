import api from './api';

export interface StudentPerformanceReport {
  student: {
    id: string;
    username: string;
    rollNumber: string;
    email: string;
    memberSince: string;
  };
  enrolledCourses: number;
  courseDetails: Array<{
    id: string;
    name: string;
    about: string;
    duration_months: number;
    created_at: string;
  }>;
  performance: {
    overallStats: {
      totalQuizzes: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
      passRate: number;
      totalMarks: number;
      totalPossibleMarks: number;
    };
    subjectPerformance: Array<{
      courseName: string;
      quizzesTaken: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
      totalMarks: number;
      totalPossible: number;
      percentage: number;
    }>;
    recentPerformance: Array<{
      quizName: string;
      courseName: string;
      score: number;
      maxScore: number;
      percentage: number;
      date: string;
    }>;
    performanceTrend: 'improving' | 'declining' | 'stable' | 'no_data';
    strengths: Array<{
      area: string;
      score: number;
      reason: string;
    }>;
    weaknesses: Array<{
      area: string;
      score: number;
      reason: string;
    }>;
    monthlyProgress: Array<{
      month: string;
      quizzesTaken: number;
      averageScore: number;
      totalMarks: number;
    }>;
  };
  aiSuggestions: {
    overallAssessment: string;
    strengths: Array<{
      area: string;
      description: string;
      advice: string;
    }>;
    areasForImprovement: Array<{
      area: string;
      currentIssue: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    studyRecommendations: Array<{
      recommendation: string;
      reason: string;
      timeframe: string;
    }>;
    motivationalMessage: string;
    nextSteps: string[];
  } | null;
  generatedAt: string;
  totalQuizzesTaken: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Report {
  id: string;
  name: string;
  report_type: 'performance' | 'attendance' | 'comprehensive' | 'custom' | 'all';
  report_data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  accuracy?: number;
  suggestions?: string;
  date_created: string;
  created_at: string;
  course?: {
    id: string;
    name: string;
  };
}

export interface ReportGenerationRequest {
  course_id?: string;
  report_type?: 'performance' | 'attendance' | 'comprehensive' | 'custom' | 'all';
}

export interface ReportsResponse {
  reports: Report[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ReportQueryParams {
  report_type?: string;
  course_id?: string;
  limit?: number;
  offset?: number;
}

// Legacy report service class
class ReportService {
  async generateStudentReport(): Promise<ApiResponse<StudentPerformanceReport>> {
    try {
      const response = await api.get('/reports/student-performance');
      return response.data;
    } catch (error: any) {
      console.error('Error generating student report:', error);
      return {
        success: false,
        message: error.message || 'Failed to generate report',
      };
    }
  }
}

export const reportService = new ReportService();

/**
 * Generate and store a new performance report
 */
export const generateAndStoreReport = async (data: ReportGenerationRequest) => {
  const response = await api.post('/reports/generate-and-store', data);
  return response.data;
};

/**
 * Get all reports for the current student
 */
export const getStudentReports = async (params: ReportQueryParams = {}): Promise<ReportsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.report_type) queryParams.append('report_type', params.report_type);
    if (params.course_id) queryParams.append('course_id', params.course_id);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/reports/student-reports?${queryParams.toString()}`);
    
    // The backend returns { success: true, data: { reports: [...], pagination: {...} } }
    // We need to extract the data from the nested structure
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error('Unexpected response structure:', response.data);
      return {
        reports: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      };
    }
  } catch (error: any) {
    console.error('Error fetching student reports:', error);
    // Return default structure on error
    return {
      reports: [],
      pagination: {
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      },
    };
  }
};

/**
 * Get a specific report by ID
 */
export const getReportById = async (reportId: string): Promise<Report> => {
  const response = await api.get(`/reports/${reportId}`);
  
  // The backend returns { success: true, data: report }
  // We need to extract the data from the nested structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  } else {
    console.error('Unexpected response structure:', response.data);
    throw new Error('Failed to fetch report data');
  }
};

/**
 * Generate a performance report (legacy - doesn't store)
 */
export const generatePerformanceReport = async () => {
  const response = await api.get('/reports/student-performance');
  return response.data;
}; 