import React, { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ListBulletIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import apiService from "../services/api";
import AttendanceCalendar from "./charts/AttendanceCalendar";

interface AttendanceRecord {
  id: string;
  course_id: string;
  course_name: string;
  session_date: string;
  session_time: string;
  topic: string;
  attendance_status:
    | "present"
    | "absent"
    | "late"
    | "excused"
    | "medical_leave";
  marked_at: string;
  notes?: string;
}

interface CourseSummary {
  course_id: string;
  course_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_percentage: number;
  status: "excellent" | "good" | "warning" | "critical";
}

interface StudentAttendanceProps {
  studentId?: string;
  courseId?: string;
  showHeader?: boolean;
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  studentId,
  courseId,
  showHeader = true,
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [courseSummaries, setCourseSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courseId || null);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");

  const fetchStudentAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate user and permissions
      if (!user) {
        throw new Error("Authentication required. Please log in.");
      }

      // Prepare query parameters
      const params = {
        student_id: studentId || user.id,
        ...(selectedCourse && { course_id: selectedCourse }),
        limit: 50,
      };

      // Fetch attendance data using Axios
      const response = await apiService.get("/attendance/student", { params });

      // Check response structure
      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "Unable to load attendance data"
        );
      }

      // Set attendance records and summaries
      setAttendanceRecords(response.data.data?.attendance_records || []);
      setCourseSummaries(response.data.data?.summary || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAttendance();
  }, [studentId, selectedCourse, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case "late":
        return <ClockIcon className="w-5 h-5 text-amber-500" />;
      case "absent":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "excused":
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return getThemedClasses(
          isDark,
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
          "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30"
        );
      case "good":
        return getThemedClasses(
          isDark,
          "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
          "bg-blue-900/30 text-blue-400 ring-1 ring-blue-500/30"
        );
      case "warning":
        return getThemedClasses(
          isDark,
          "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
          "bg-amber-900/30 text-amber-400 ring-1 ring-amber-500/30"
        );
      case "critical":
        return getThemedClasses(
          isDark,
          "bg-red-50 text-red-700 ring-1 ring-red-600/20",
          "bg-red-900/30 text-red-400 ring-1 ring-red-500/30"
        );
      default:
        return getThemedClasses(
          isDark,
          "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
          "bg-gray-900/30 text-gray-400 ring-1 ring-gray-500/30"
        );
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${
        getThemedClasses(
          isDark,
          "bg-white",
          "bg-gray-800"
        )
      }`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${
        getThemedClasses(
          isDark,
          "bg-white",
          "bg-gray-800"
        )
      }`}>
        <ExclamationTriangleIcon className={`w-16 h-16 mx-auto mb-4 ${
          getThemedClasses(
            isDark,
            "text-red-500",
            "text-red-400"
          )
        }`} />
        <h3 className={`text-xl font-semibold mb-2 ${
          getThemedClasses(
            isDark,
            "text-gray-900",
            "text-white"
          )
        }`}>
          Unable to Load Attendance Data
        </h3>
        <p className={`mb-6 ${
          getThemedClasses(
            isDark,
            "text-gray-600",
            "text-gray-400"
          )
        }`}>
          {error}
        </p>
        <button
          onClick={fetchStudentAttendance}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            getThemedClasses(
              isDark,
              "bg-primary-50 text-primary-700 hover:bg-primary-100",
              "bg-primary-900/30 text-primary-400 hover:bg-primary-900/50"
            )
          }`}
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* View Toggle and Course Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("list")}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeView === "list"
                ? getThemedClasses(
                    isDark,
                    "bg-primary-50 text-primary-700",
                    "bg-primary-900/30 text-primary-400"
                  )
                : getThemedClasses(
                    isDark,
                    "bg-gray-50 text-gray-700 hover:bg-gray-100",
                    "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )
            }`}
          >
            <ListBulletIcon className="w-4 h-4 mr-2" />
            List View
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeView === "calendar"
                ? getThemedClasses(
                    isDark,
                    "bg-primary-50 text-primary-700",
                    "bg-primary-900/30 text-primary-400"
                  )
                : getThemedClasses(
                    isDark,
                    "bg-gray-50 text-gray-700 hover:bg-gray-100",
                    "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4 mr-2" />
            Calendar View
          </button>
        </div>

        {courseSummaries.length > 1 && (
          <div className="relative">
            <select
              value={selectedCourse || "all"}
              onChange={(e) => setSelectedCourse(e.target.value === "all" ? null : e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                getThemedClasses(
                  isDark,
                  "bg-gray-50 text-gray-900 border border-gray-200",
                  "bg-gray-800 text-white border border-gray-700"
                )
              }`}
            >
              <option value="all">All Courses</option>
              {courseSummaries.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              getThemedClasses(
                isDark,
                "text-gray-500",
                "text-gray-400"
              )
            }`} />
          </div>
        )}
      </div>

      {/* Calendar View */}
      {activeView === "calendar" && (
        <div className={`rounded-xl overflow-hidden ${
          getThemedClasses(
            isDark,
            "bg-white border border-gray-200",
            "bg-gray-800 border border-gray-700"
          )
        }`}>
          <AttendanceCalendar
            studentId={studentId || user?.id}
            courseId={selectedCourse || undefined}
          />
        </div>
      )}

      {/* Course Summaries */}
      {courseSummaries.length > 0 && activeView === "list" && (
        <div className="space-y-6">
          <h3 className={`text-lg font-semibold flex items-center ${
            getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )
          }`}>
            <BookOpenIcon className="w-5 h-5 mr-2" />
            Course Attendance Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseSummaries.map((course) => (
              <div
                key={course.course_id}
                className={`rounded-xl p-6 transition-colors duration-200 ${
                  getThemedClasses(
                    isDark,
                    "bg-white border border-gray-200 hover:border-gray-300",
                    "bg-gray-800 border border-gray-700 hover:border-gray-600"
                  )
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className={`font-semibold mb-1 ${
                      getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )
                    }`}>
                      {course.course_name}
                    </h4>
                    <p className={`text-sm ${
                      getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )
                    }`}>
                      {course.total_sessions} total sessions
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${
                        getThemedClasses(
                          isDark,
                          "text-gray-700",
                          "text-gray-300"
                        )
                      }`}>
                        Attendance Rate
                      </span>
                      <span className={`text-sm font-semibold ${
                        getThemedClasses(
                          isDark,
                          "text-gray-900",
                          "text-white"
                        )
                      }`}>
                        {course.attendance_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${
                      getThemedClasses(
                        isDark,
                        "bg-gray-100",
                        "bg-gray-700"
                      )
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          course.status === "excellent"
                            ? "bg-emerald-500"
                            : course.status === "good"
                            ? "bg-blue-500"
                            : course.status === "warning"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${course.attendance_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${
                      getThemedClasses(
                        isDark,
                        "bg-gray-50",
                        "bg-gray-700/50"
                      )
                    }`}>
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className={`w-5 h-5 ${
                          getThemedClasses(
                            isDark,
                            "text-emerald-500",
                            "text-emerald-400"
                          )
                        }`} />
                        <div>
                          <p className={`text-xs ${
                            getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )
                          }`}>
                            Present
                          </p>
                          <p className={`text-sm font-semibold ${
                            getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )
                          }`}>
                            {course.present_count}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      getThemedClasses(
                        isDark,
                        "bg-gray-50",
                        "bg-gray-700/50"
                      )
                    }`}>
                      <div className="flex items-center gap-3">
                        <XCircleIcon className={`w-5 h-5 ${
                          getThemedClasses(
                            isDark,
                            "text-red-500",
                            "text-red-400"
                          )
                        }`} />
                        <div>
                          <p className={`text-xs ${
                            getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )
                          }`}>
                            Absent
                          </p>
                          <p className={`text-sm font-semibold ${
                            getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )
                          }`}>
                            {course.absent_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Records */}
      {activeView === "list" && (
        <div>
          <h3 className={`text-lg font-semibold flex items-center mb-6 ${
            getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )
          }`}>
            <ClockIcon className="w-5 h-5 mr-2" />
            Recent Attendance Records
          </h3>

          <div className="space-y-4">
            {attendanceRecords.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${
                getThemedClasses(
                  isDark,
                  "bg-white border border-gray-200",
                  "bg-gray-800 border border-gray-700"
                )
              }`}>
                <CalendarDaysIcon className={`w-12 h-12 mx-auto mb-4 ${
                  getThemedClasses(
                    isDark,
                    "text-gray-400",
                    "text-gray-500"
                  )
                }`} />
                <p className={`font-medium mb-1 ${
                  getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )
                }`}>
                  No Attendance Records
                </p>
                <p className={`text-sm ${
                  getThemedClasses(
                    isDark,
                    "text-gray-600",
                    "text-gray-400"
                  )
                }`}>
                  Your attendance records will appear here once teachers start marking attendance.
                </p>
              </div>
            ) : (
              attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl transition-colors duration-200 ${
                    getThemedClasses(
                      isDark,
                      "bg-white border border-gray-200 hover:border-gray-300",
                      "bg-gray-800 border border-gray-700 hover:border-gray-600"
                    )
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(record.attendance_status)}
                      <div>
                        <p className={`font-medium mb-1 ${
                          getThemedClasses(
                            isDark,
                            "text-gray-900",
                            "text-white"
                          )
                        }`}>
                          {record.course_name}
                        </p>
                        <p className={`text-sm ${
                          getThemedClasses(
                            isDark,
                            "text-gray-600",
                            "text-gray-400"
                          )
                        }`}>
                          {record.topic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.attendance_status)}`}>
                        {record.attendance_status.charAt(0).toUpperCase() + record.attendance_status.slice(1)}
                      </span>
                      <p className={`text-sm mt-1 ${
                        getThemedClasses(
                          isDark,
                          "text-gray-600",
                          "text-gray-400"
                        )
                      }`}>
                        {new Date(record.session_date).toLocaleDateString()} at {record.session_time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
