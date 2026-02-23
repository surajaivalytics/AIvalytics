import React, { useState, useEffect, useRef } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";
import dashboardService from "../../services/dashboardApi";

interface PrincipalDashboardData {
  user: {
    id: number;
    name: string;
    role: string;
  };
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalHODs: number;
    totalCourses: number;
    totalQuizzes: number;
    averageInstitutionScore: number;
  };
  departmentAnalysis: {
    [key: string]: {
      students: number;
      teachers: number;
      courses: number;
      averageScore: number;
    };
  };
  recentActivity: Array<{
    type: string;
    student: string;
    course: string;
    teacher: string;
    score: number;
    timestamp: string;
  }>;
  performanceTrends: {
    labels: string[];
    data: number[];
  };
  institutionMetrics: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
}

// Add styles for sci-fi effects
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
    50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .float-animation { animation: float 6s ease-in-out infinite; }
  .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .shimmer { animation: shimmer 2s infinite; }
  
  .card-glow {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(239, 68, 68, 0.15), transparent 40%);
    border-radius: inherit;
    z-index: 1;
  }
  
  .group:hover .card-glow {
    opacity: 1;
  }
`;

const RealDataPrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [dashboardData, setDashboardData] =
    useState<PrincipalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cursor following effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching Principal dashboard data...");
      const response = await dashboardService.getPrincipalDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
        console.log("✅ Principal dashboard data loaded:", response.data);
      } else {
        setError(response.message || "Failed to load dashboard data");
      }
    } catch (err: any) {
      console.error("❌ Principal dashboard error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${getThemedClasses(
          isDark,
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p
            className={getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-300"
            )}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${getThemedClasses(
          isDark,
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3
            className={`text-lg font-semibold mb-2 ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            Error Loading Dashboard
          </h3>
          <p
            className={`mb-4 ${getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-300"
            )}`}
          >
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${getThemedClasses(
          isDark,
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <div className="text-center">
          <p
            className={getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-300"
            )}
          >
            No dashboard data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${getThemedClasses(
        isDark,
        "bg-gray-50",
        "bg-gray-900"
      )}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={
        {
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            Principal Dashboard - {dashboardData.user.name}
          </h1>
          <p
            className={`mt-2 ${getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-300"
            )}`}
          >
            Institution-wide overview and analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    Students
                  </p>
                  <p
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {dashboardData.stats.totalStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    Teachers
                  </p>
                  <p
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {dashboardData.stats.totalTeachers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    HODs
                  </p>
                  <p
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {dashboardData.stats.totalHODs}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    Courses
                  </p>
                  <p
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {dashboardData.stats.totalCourses}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    Quizzes
                  </p>
                  <p
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {dashboardData.stats.totalQuizzes}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`group relative rounded-lg shadow-sm border p-6 ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    Avg Score
                  </p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      dashboardData.stats.averageInstitutionScore
                    )}`}
                  >
                    {dashboardData.stats.averageInstitutionScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Institution Metrics */}
          <div className="lg:col-span-1">
            <div
              className={`group relative rounded-lg shadow-sm border ${getThemedClasses(
                isDark,
                "bg-white border-gray-200",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              <div className="card-glow"></div>
              <div className="relative z-10">
                <div
                  className={`p-6 border-b ${getThemedClasses(
                    isDark,
                    "border-gray-200",
                    "border-gray-700"
                  )}`}
                >
                  <h2
                    className={`text-lg font-semibold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    Institution Metrics
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div
                    className={`text-center p-4 rounded-lg ${getThemedClasses(
                      isDark,
                      "bg-blue-50",
                      "bg-blue-900/20"
                    )}`}
                  >
                    <p className="text-2xl font-bold text-blue-400">
                      {dashboardData.institutionMetrics.totalAttempts}
                    </p>
                    <p
                      className={`text-sm ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}`}
                    >
                      Total Quiz Attempts
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${getThemedClasses(
                      isDark,
                      "bg-green-50",
                      "bg-green-900/20"
                    )}`}
                  >
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        dashboardData.institutionMetrics.averageScore
                      )}`}
                    >
                      {dashboardData.institutionMetrics.averageScore.toFixed(1)}
                      %
                    </p>
                    <p
                      className={`text-sm ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}`}
                    >
                      Institution Average
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${getThemedClasses(
                      isDark,
                      "bg-purple-50",
                      "bg-purple-900/20"
                    )}`}
                  >
                    <p className="text-2xl font-bold text-purple-400">
                      {dashboardData.institutionMetrics.passRate.toFixed(1)}%
                    </p>
                    <p
                      className={`text-sm ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}`}
                    >
                      Pass Rate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div
              className={`group relative rounded-lg shadow-sm border ${getThemedClasses(
                isDark,
                "bg-white border-gray-200",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              <div className="card-glow"></div>
              <div className="relative z-10">
                <div
                  className={`p-6 border-b ${getThemedClasses(
                    isDark,
                    "border-gray-200",
                    "border-gray-700"
                  )}`}
                >
                  <h2
                    className={`text-lg font-semibold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    Recent Institution Activity
                  </h2>
                </div>
                <div className="p-6">
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-4 p-4 rounded-lg ${getThemedClasses(
                            isDark,
                            "bg-gray-50",
                            "bg-gray-700"
                          )}`}
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <UserGroupIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${getThemedClasses(
                                isDark,
                                "text-gray-900",
                                "text-white"
                              )}`}
                            >
                              {activity.student}
                            </p>
                            <p
                              className={`text-sm ${getThemedClasses(
                                isDark,
                                "text-gray-600",
                                "text-gray-300"
                              )}`}
                            >
                              {activity.course}
                            </p>
                            <p
                              className={`text-xs ${getThemedClasses(
                                isDark,
                                "text-gray-500",
                                "text-gray-400"
                              )}`}
                            >
                              Teacher: {activity.teacher}
                            </p>
                            <p
                              className={`text-xs ${getThemedClasses(
                                isDark,
                                "text-gray-500",
                                "text-gray-400"
                              )}`}
                            >
                              {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${getScoreColor(
                                activity.score
                              )}`}
                            >
                              {activity.score}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserGroupIcon
                        className={`h-12 w-12 mx-auto mb-4 ${getThemedClasses(
                          isDark,
                          "text-gray-400",
                          "text-gray-500"
                        )}`}
                      />
                      <p
                        className={getThemedClasses(
                          isDark,
                          "text-gray-600",
                          "text-gray-400"
                        )}
                      >
                        No recent activity available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Analysis */}
        <div className="mb-8">
          <div
            className={`group relative rounded-lg shadow-sm border ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="card-glow"></div>
            <div className="relative z-10">
              <div
                className={`p-6 border-b ${getThemedClasses(
                  isDark,
                  "border-gray-200",
                  "border-gray-700"
                )}`}
              >
                <h2
                  className={`text-lg font-semibold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  Department Analysis
                </h2>
              </div>
              <div className="p-6">
                {Object.keys(dashboardData.departmentAnalysis).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(dashboardData.departmentAnalysis).map(
                      ([department, data]) => (
                        <div
                          key={department}
                          className={`border rounded-lg p-6 ${getThemedClasses(
                            isDark,
                            "border-gray-200 bg-gray-50",
                            "border-gray-700 bg-gray-700"
                          )}`}
                        >
                          <h3
                            className={`font-semibold mb-4 ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {department}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${getThemedClasses(
                                  isDark,
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Students:
                              </span>
                              <span
                                className={`font-medium ${getThemedClasses(
                                  isDark,
                                  "text-gray-900",
                                  "text-white"
                                )}`}
                              >
                                {data.students}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${getThemedClasses(
                                  isDark,
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Teachers:
                              </span>
                              <span
                                className={`font-medium ${getThemedClasses(
                                  isDark,
                                  "text-gray-900",
                                  "text-white"
                                )}`}
                              >
                                {data.teachers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${getThemedClasses(
                                  isDark,
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Courses:
                              </span>
                              <span
                                className={`font-medium ${getThemedClasses(
                                  isDark,
                                  "text-gray-900",
                                  "text-white"
                                )}`}
                              >
                                {data.courses}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${getThemedClasses(
                                  isDark,
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Avg Score:
                              </span>
                              <span
                                className={`font-bold ${getScoreColor(
                                  data.averageScore
                                )}`}
                              >
                                {data.averageScore.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon
                      className={`h-12 w-12 mx-auto mb-4 ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    />
                    <p
                      className={getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}
                    >
                      No department data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        {dashboardData.performanceTrends.data.length > 0 && (
          <div>
            <div
              className={`group relative rounded-lg shadow-sm border ${getThemedClasses(
                isDark,
                "bg-white border-gray-200",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              <div className="card-glow"></div>
              <div className="relative z-10">
                <div
                  className={`p-6 border-b ${getThemedClasses(
                    isDark,
                    "border-gray-200",
                    "border-gray-700"
                  )}`}
                >
                  <h2
                    className={`text-lg font-semibold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    Performance Trends
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {dashboardData.performanceTrends.data.map(
                      (score, index) => (
                        <div key={index} className="text-center">
                          <div
                            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getThemedClasses(
                              isDark,
                              "bg-blue-50 border-blue-200",
                              "bg-blue-900/20 border-blue-700"
                            )}`}
                          >
                            <span
                              className={`text-sm font-bold ${getScoreColor(
                                score
                              )}`}
                            >
                              {score.toFixed(0)}%
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-2 ${getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )}`}
                          >
                            {dashboardData.performanceTrends.labels[index]}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealDataPrincipalDashboard;
