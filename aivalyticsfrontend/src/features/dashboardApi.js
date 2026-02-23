const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

class DashboardService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard`;
  }

  // Get authentication token from localStorage
  getAuthToken() {
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
  }

  // Common request headers
  getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic API request method
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      console.log(`📊 Dashboard API Request: ${config.method || "GET"} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific authentication errors
        if (response.status === 401) {
          // Clear invalid tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("token");
          throw new Error(
            data.message || "Session expired. Please log in again."
          );
        }

        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log(`✅ Dashboard API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Dashboard API Error:`, error);
      throw error;
    }
  }

  // Student Dashboard Data
  async getStudentDashboard() {
    try {
      const response = await this.makeRequest("/student");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // Teacher Dashboard Data
  async getTeacherDashboard() {
    try {
      const response = await this.makeRequest("/teacher");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // HOD Dashboard Data
  async getHodDashboard() {
    try {
      const response = await this.makeRequest("/hod");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // Principal Dashboard Data
  async getPrincipalDashboard() {
    try {
      const response = await this.makeRequest("/principal");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 10) {
    try {
      const response = await this.makeRequest(`/leaderboard?limit=${limit}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // Get dashboard data based on user role
  async getDashboardByRole(role) {
    switch (role?.toLowerCase()) {
      case "student":
        return this.getStudentDashboard();
      case "teacher":
        return this.getTeacherDashboard();
      case "hod":
        return this.getHodDashboard();
      case "principal":
        return this.getPrincipalDashboard();
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;

// Named exports for specific methods
export const {
  getStudentDashboard,
  getTeacherDashboard,
  getHodDashboard,
  getPrincipalDashboard,
  getDashboardByRole,
  getLeaderboard,
} = dashboardService;
