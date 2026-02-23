import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import AttendanceBadge from "./AttendanceBadge";

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  trend: "up" | "down" | "stable";
  streaks: {
    current: number;
    longest: number;
    type: "present" | "absent";
  };
}

interface CourseStats {
  courseId: string;
  courseName: string;
  stats: AttendanceStats;
}

interface AttendanceStatsProps {
  data: AttendanceStats | CourseStats[];
  type: "overall" | "course-breakdown";
  showTrends?: boolean;
  showStreaks?: boolean;
  showComparison?: boolean;
  className?: string;
}

const AttendanceStatsComponent: React.FC<AttendanceStatsProps> = ({
  data,
  type,
  showTrends = true,
  showStreaks = true,
  showComparison = true,
  className = "",
}) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "semester"
  >("month");

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 7l-9.2 9.2M7 7v10h10"
            />
          </svg>
        );
      case "stable":
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        );
    }
  };

  const renderOverallStats = (stats: AttendanceStats) => (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Sessions
              </p>
              <p
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {stats.totalSessions}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                theme === "dark" ? "bg-gray-600" : "bg-white"
              }`}
            >
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Attendance
              </p>
              <p
                className={`text-2xl font-bold ${getPercentageColor(
                  stats.attendancePercentage
                )}`}
              >
                {stats.attendancePercentage.toFixed(1)}%
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                theme === "dark" ? "bg-gray-600" : "bg-white"
              }`}
            >
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          {showTrends && (
            <div className="flex items-center mt-2 space-x-1">
              {getTrendIcon(stats.trend)}
              <span
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                vs last period
              </span>
            </div>
          )}
        </div>

        {/* Present Count */}
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Present
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.presentCount}
              </p>
            </div>
            <AttendanceBadge status="present" showText={false} size="sm" />
          </div>
        </div>

        {/* Absent Count */}
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Absent
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.absentCount}
              </p>
            </div>
            <AttendanceBadge status="absent" showText={false} size="sm" />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div
        className={`p-6 rounded-lg ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <h4
          className={`text-lg font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Attendance Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <AttendanceBadge status="present" size="lg" />
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {stats.presentCount} sessions
            </p>
            <p className="text-lg font-semibold text-green-600">
              {((stats.presentCount / stats.totalSessions) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <AttendanceBadge status="late" size="lg" />
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {stats.lateCount} sessions
            </p>
            <p className="text-lg font-semibold text-yellow-600">
              {((stats.lateCount / stats.totalSessions) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <AttendanceBadge status="excused" size="lg" />
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {stats.excusedCount} sessions
            </p>
            <p className="text-lg font-semibold text-blue-600">
              {((stats.excusedCount / stats.totalSessions) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <AttendanceBadge status="absent" size="lg" />
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {stats.absentCount} sessions
            </p>
            <p className="text-lg font-semibold text-red-600">
              {((stats.absentCount / stats.totalSessions) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Streaks */}
      {showStreaks && (
        <div
          className={`p-6 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <h4
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Attendance Streaks
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  stats.streaks.type === "present"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.streaks.current}
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Current {stats.streaks.type} streak
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.streaks.longest}
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Longest attendance streak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Averages */}
      {showComparison && (
        <div
          className={`p-6 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <h4
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Period Averages
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getPercentageColor(
                  stats.weeklyAverage
                )}`}
              >
                {stats.weeklyAverage.toFixed(1)}%
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Weekly Average
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getPercentageColor(
                  stats.monthlyAverage
                )}`}
              >
                {stats.monthlyAverage.toFixed(1)}%
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Monthly Average
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCourseBreakdown = (courses: CourseStats[]) => (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3
          className={`text-xl font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Course-wise Attendance
        </h3>
        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(e.target.value as "week" | "month" | "semester")
          }
          className={`px-3 py-1 rounded border ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="semester">This Semester</option>
        </select>
      </div>

      {courses.map((course) => (
        <div
          key={course.courseId}
          className={`p-6 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4
              className={`text-lg font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {course.courseName}
            </h4>
            <div
              className={`text-2xl font-bold ${getPercentageColor(
                course.stats.attendancePercentage
              )}`}
            >
              {course.stats.attendancePercentage.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {course.stats.presentCount}
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Present
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {course.stats.lateCount}
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Late
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {course.stats.excusedCount}
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Excused
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {course.stats.absentCount}
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Absent
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (course.stats.presentCount / course.stats.totalSessions) * 100
                }%`,
              }}
            />
          </div>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {course.stats.presentCount} out of {course.stats.totalSessions}{" "}
            sessions attended
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-lg p-6`}
    >
      {type === "overall"
        ? renderOverallStats(data as AttendanceStats)
        : renderCourseBreakdown(data as CourseStats[])}
    </div>
  );
};

export default AttendanceStatsComponent;
