import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";
import { courseService } from "../../services/courseApi";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  DocumentChartBarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Course } from "../../types/course";
import LoadingSpinner from "../../components/LoadingSpinner";
import CourseCard from "../../components/CourseCard";
import ClassManagement from "../../components/ClassManagement";

// Add styles for sci-fi effects
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
    50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
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
  }
  
  .group:hover .card-glow {
    opacity: 1;
  }
`;

const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    departmentPerformance: 0,
  });

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
    const fetchDashboardData = async () => {
      try {
        // Comment out API call until backend is ready
        // await courseService.getHodDashboard();
        // Dashboard data would be used here when backend is connected
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: HomeIcon,
    },
    {
      id: "classes",
      name: "Class Management",
      icon: AcademicCapIcon,
    },
  ];

  const statsData = [
    {
      name: "Total Courses",
      value: "24",
      icon: BookOpenIcon,
      color: "from-blue-500 to-blue-600",
      change: "+3 this semester",
    },
    {
      name: "Total Students",
      value: "486",
      icon: UserGroupIcon,
      color: "from-green-500 to-green-600",
      change: "+12% from last year",
    },
    {
      name: "Faculty Members",
      value: "18",
      icon: AcademicCapIcon,
      color: "from-purple-500 to-purple-600",
      change: "+2 new hires",
    },
    {
      name: "Department Performance",
      value: "89%",
      icon: ChartBarIcon,
      color: "from-yellow-500 to-yellow-600",
      change: "+5% improvement",
    },
  ];

  const departmentOverview = {
    name: "Computer Science Department",
    classes: [
      { name: "CS-A", students: 45, teacher: "Dr. Smith" },
      { name: "CS-B", students: 42, teacher: "Prof. Johnson" },
      { name: "CS-C", students: 48, teacher: "Dr. Williams" },
    ],
    recentActivities: [
      {
        id: 1,
        type: "approval",
        title: "Approved new course curriculum",
        time: "2 hours ago",
        status: "completed",
      },
      {
        id: 2,
        type: "meeting",
        title: "Faculty meeting scheduled",
        time: "1 day ago",
        status: "scheduled",
      },
      {
        id: 3,
        type: "report",
        title: "Monthly performance report generated",
        time: "3 days ago",
        status: "completed",
      },
    ],
  };

  const pendingApprovals = [
    {
      id: 1,
      type: "course",
      title: "New Elective Course Proposal",
      submittedBy: "Dr. Anderson",
      priority: "high",
      dueDate: "2024-01-15",
    },
    {
      id: 2,
      type: "budget",
      title: "Lab Equipment Budget Request",
      submittedBy: "Prof. Davis",
      priority: "medium",
      dueDate: "2024-01-18",
    },
    {
      id: 3,
      type: "leave",
      title: "Faculty Leave Application",
      submittedBy: "Dr. Wilson",
      priority: "low",
      dueDate: "2024-01-20",
    },
  ];

  const teacherPerformance = [
    { name: "Dr. Smith", courses: 3, avgRating: 4.8, students: 145 },
    { name: "Prof. Johnson", courses: 2, avgRating: 4.6, students: 98 },
    { name: "Dr. Williams", courses: 4, avgRating: 4.7, students: 167 },
    { name: "Dr. Anderson", courses: 2, avgRating: 4.5, students: 76 },
  ];

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-64 ${getThemedClasses(
          isDark,
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <LoadingSpinner
          size="xl"
          variant="secondary"
          sciFi={true}
          message="Loading dashboard..."
        />
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse ${getThemedClasses(
            isDark,
            "bg-purple-300",
            "bg-purple-500"
          )}`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse ${getThemedClasses(
            isDark,
            "bg-blue-300",
            "bg-blue-500"
          )}`}
        ></div>
        <div
          className={`absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse ${getThemedClasses(
            isDark,
            "bg-indigo-300",
            "bg-indigo-500"
          )}`}
        ></div>
      </div>

      {/* Welcome Header */}
      <div
        className={`rounded-2xl shadow-2xl border p-6 relative z-10 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              Welcome, HOD {user?.username}!
            </h1>
            <p
              className={`${getThemedClasses(
                isDark,
                "text-gray-600",
                "text-gray-300"
              )}`}
            >
              Manage your department, oversee faculty, and ensure academic
              excellence.
            </p>
            <div
              className={`mt-4 flex items-center space-x-4 text-sm ${getThemedClasses(
                isDark,
                "text-gray-500",
                "text-gray-400"
              )}`}
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                <span>Head of Department</span>
              </div>
              <div className="flex items-center">
                <span>{departmentOverview.name}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="h-20 w-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className={`rounded-2xl shadow-lg border p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${getThemedClasses(
              isDark,
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div className="flex items-center">
              <div
                className={`bg-gradient-to-r ${stat.color} rounded-xl p-3 shadow-lg`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${getThemedClasses(
                    isDark,
                    "text-gray-600",
                    "text-gray-400"
                  )}`}
                >
                  {stat.name}
                </p>
                <p
                  className={`text-2xl font-semibold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-sm ${getThemedClasses(
                  isDark,
                  "text-gray-500",
                  "text-gray-500"
                )}`}
              >
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Department Classes */}
        <div
          className={`rounded-2xl shadow-2xl border overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div
            className={`p-6 border-b ${getThemedClasses(
              isDark,
              "border-gray-200",
              "border-gray-700"
            )}`}
          >
            <h3
              className={`text-lg font-medium flex items-center ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-400" />
              Department Classes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentOverview.classes.map((classItem, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 ${getThemedClasses(
                    isDark,
                    "bg-gray-50 border-gray-200 hover:bg-gray-100",
                    "bg-gray-700 border-gray-700 hover:bg-gray-600"
                  )}`}
                >
                  <div>
                    <h4
                      className={`font-medium ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {classItem.name}
                    </h4>
                    <p
                      className={`text-sm ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}`}
                    >
                      {classItem.teacher}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {classItem.students} students
                    </p>
                    <p
                      className={`text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-500",
                        "text-gray-500"
                      )}`}
                    >
                      Active
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          className={`rounded-2xl shadow-2xl border overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div
            className={`p-6 border-b flex items-center justify-between ${getThemedClasses(
              isDark,
              "border-gray-200",
              "border-gray-700"
            )}`}
          >
            <h3
              className={`text-lg font-medium flex items-center ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              <ClockIcon className="h-5 w-5 mr-2 text-yellow-400" />
              Pending Approvals
            </h3>
            <div
              className={`text-xs rounded-full px-2 py-1 border ${getThemedClasses(
                isDark,
                "bg-yellow-100 text-yellow-800 border-yellow-200",
                "bg-yellow-900 text-yellow-300 border-yellow-700"
              )}`}
            >
              {pendingApprovals.length} pending
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-3 rounded-xl border transition-colors duration-200 ${getThemedClasses(
                    isDark,
                    "bg-gray-50 border-gray-200 hover:bg-gray-100",
                    "bg-gray-700 border-gray-700 hover:bg-gray-600"
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className={`text-sm font-medium ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {approval.title}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        approval.priority === "high"
                          ? isDark
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-red-900 text-red-300 border border-red-700"
                          : approval.priority === "medium"
                          ? isDark
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-yellow-900 text-yellow-300 border border-yellow-700"
                          : isDark
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-green-900 text-green-300 border border-green-700"
                      }`}
                    >
                      {approval.priority}
                    </span>
                  </div>
                  <p
                    className={`text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-600",
                      "text-gray-400"
                    )}`}
                  >
                    By {approval.submittedBy}
                  </p>
                  <p
                    className={`text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-500",
                      "text-gray-500"
                    )}`}
                  >
                    Due: {new Date(approval.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div
          className={`rounded-2xl shadow-2xl border overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div
            className={`p-6 border-b ${getThemedClasses(
              isDark,
              "border-gray-200",
              "border-gray-700"
            )}`}
          >
            <h3
              className={`text-lg font-medium flex items-center ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2 text-green-400" />
              Recent Activities
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentOverview.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center space-x-4 p-3 rounded-xl border transition-colors duration-200 ${getThemedClasses(
                    isDark,
                    "bg-gray-50 border-gray-200 hover:bg-gray-100",
                    "bg-gray-700 border-gray-700 hover:bg-gray-600"
                  )}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "completed"
                        ? "bg-green-500"
                        : activity.status === "scheduled"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {activity.title}
                    </p>
                    <p
                      className={`text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}`}
                    >
                      {activity.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {activity.status === "completed" ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    ) : activity.status === "scheduled" ? (
                      <ClockIcon className="h-4 w-4 text-blue-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Performance */}
      <div
        className={`rounded-2xl shadow-2xl border overflow-hidden relative z-10 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div
          className={`p-6 border-b ${getThemedClasses(
            isDark,
            "border-gray-200",
            "border-gray-700"
          )}`}
        >
          <h3
            className={`text-lg font-medium flex items-center ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-400" />
            Teacher Performance Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherPerformance.map((teacher, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-colors duration-200 ${getThemedClasses(
                  isDark,
                  "bg-gray-50 border-gray-200 hover:bg-gray-100",
                  "bg-gray-700 border-gray-700 hover:bg-gray-600"
                )}`}
              >
                <h4
                  className={`font-medium mb-2 ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  {teacher.name}
                </h4>
                <div
                  className={`space-y-1 text-sm ${getThemedClasses(
                    isDark,
                    "text-gray-600",
                    "text-gray-400"
                  )}`}
                >
                  <div className="flex justify-between">
                    <span>Courses:</span>
                    <span
                      className={`${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {teacher.courses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className="text-yellow-400">
                      ★ {teacher.avgRating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span
                      className={`${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      {teacher.students}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "classes":
        return <ClassManagement />;
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`min-h-full relative transition-colors duration-300 ${getThemedClasses(
        isDark,
        "bg-gray-50",
        "bg-gray-900"
      )}`}
    >
      <style>{styles}</style>

      {/* Cursor following glow effect */}
      <div
        className="fixed pointer-events-none z-0 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-300"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Tab Navigation - Fixed and improved */}
      <div
        className={`border-b sticky top-0 z-10 mb-6 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? `border-purple-500 text-purple-400 ${getThemedClasses(
                          isDark,
                          "bg-purple-50",
                          "bg-gray-700"
                        )}`
                      : `border-transparent ${getThemedClasses(
                          isDark,
                          "text-gray-600 hover:text-gray-900 hover:border-gray-300",
                          "text-gray-400 hover:text-gray-300 hover:border-gray-300"
                        )}`
                  } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-200 min-w-max`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area - Improved scrolling */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 relative z-10">
        <div className="relative">{renderContent()}</div>
      </div>
    </div>
  );
};

export default HodDashboard;
