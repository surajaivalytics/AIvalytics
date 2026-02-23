import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface FilterOptions {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  courseId: string;
  attendanceStatus: string[];
  sessionType: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AttendanceFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  courses?: Array<{ id: string; name: string }>;
  initialFilters?: Partial<FilterOptions>;
  showAdvanced?: boolean;
}

const AttendanceFilter: React.FC<AttendanceFilterProps> = ({
  onFilterChange,
  courses = [],
  initialFilters = {},
  showAdvanced = true,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      startDate: initialFilters.dateRange?.startDate || "",
      endDate: initialFilters.dateRange?.endDate || "",
    },
    courseId: initialFilters.courseId || "",
    attendanceStatus: initialFilters.attendanceStatus || [],
    sessionType: initialFilters.sessionType || [],
    sortBy: initialFilters.sortBy || "date",
    sortOrder: initialFilters.sortOrder || "desc",
  });

  const attendanceStatusOptions = [
    { value: "present", label: "Present", color: "bg-green-500" },
    { value: "absent", label: "Absent", color: "bg-red-500" },
    { value: "late", label: "Late", color: "bg-yellow-500" },
    { value: "excused", label: "Excused", color: "bg-blue-500" },
  ];

  const sessionTypeOptions = [
    { value: "lecture", label: "Lecture" },
    { value: "lab", label: "Lab" },
    { value: "tutorial", label: "Tutorial" },
    { value: "exam", label: "Exam" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "course", label: "Course" },
    { value: "status", label: "Status" },
    { value: "session_type", label: "Session Type" },
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const handleCourseChange = (courseId: string) => {
    setFilters((prev) => ({
      ...prev,
      courseId,
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      attendanceStatus: prev.attendanceStatus.includes(status)
        ? prev.attendanceStatus.filter((s) => s !== status)
        : [...prev.attendanceStatus, status],
    }));
  };

  const handleSessionTypeToggle = (sessionType: string) => {
    setFilters((prev) => ({
      ...prev,
      sessionType: prev.sessionType.includes(sessionType)
        ? prev.sessionType.filter((s) => s !== sessionType)
        : [...prev.sessionType, sessionType],
    }));
  };

  const handleSortChange = (field: "sortBy" | "sortOrder", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { startDate: "", endDate: "" },
      courseId: "",
      attendanceStatus: [],
      sessionType: [],
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.startDate ||
      filters.dateRange.endDate ||
      filters.courseId ||
      filters.attendanceStatus.length > 0 ||
      filters.sessionType.length > 0 ||
      filters.sortBy !== "date" ||
      filters.sortOrder !== "desc"
    );
  };

  // Quick filter presets
  const applyQuickFilter = (preset: string) => {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    switch (preset) {
      case "today":
        setFilters((prev) => ({
          ...prev,
          dateRange: {
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          },
        }));
        break;
      case "week":
        setFilters((prev) => ({
          ...prev,
          dateRange: {
            startDate: startOfWeek.toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          },
        }));
        break;
      case "month":
        setFilters((prev) => ({
          ...prev,
          dateRange: {
            startDate: startOfMonth.toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          },
        }));
        break;
      case "year":
        setFilters((prev) => ({
          ...prev,
          dateRange: {
            startDate: startOfYear.toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          },
        }));
        break;
    }
  };

  return (
    <div
      className={`rounded-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      } shadow-lg border ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
            <h3
              className={`font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Filters
            </h3>
            {hasActiveFilters() && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className={`text-sm px-3 py-1 rounded ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                } transition-colors`}
              >
                Clear All
              </button>
            )}
            {showAdvanced && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } transition-colors`}
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-4 space-y-4">
        {/* Quick Date Filters */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {["today", "week", "month", "year"].map((preset) => (
              <button
                key={preset}
                onClick={() => applyQuickFilter(preset)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange.startDate}
              onChange={(e) =>
                handleDateRangeChange("startDate", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Course Filter */}
        {courses.length > 0 && (
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Course
            </label>
            <select
              value={filters.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Attendance Status Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Attendance Status
          </label>
          <div className="flex flex-wrap gap-2">
            {attendanceStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusToggle(option.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  filters.attendanceStatus.includes(option.value)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && showAdvanced && (
        <div
          className={`border-t p-4 space-y-4 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Session Type Filter */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Session Type
            </label>
            <div className="flex flex-wrap gap-2">
              {sessionTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSessionTypeToggle(option.value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    filters.sessionType.includes(option.value)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange("sortBy", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleSortChange(
                    "sortOrder",
                    e.target.value as "asc" | "desc"
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceFilter;
