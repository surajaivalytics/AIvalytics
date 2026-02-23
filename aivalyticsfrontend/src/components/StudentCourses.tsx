import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  UsersIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { courseService } from "../services/courseApi";
import { Course, CourseFilters } from "../types/course";
import CourseCard from "./CourseCard";

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
    search: "",
    status: "all",
  });
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    availableCourses: 0,
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCourses();
    loadStats();
  }, [filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(filters);
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await courseService.getCourseStats();
      setStats({
        enrolledCourses: response.stats.enrolledCourses || 0,
        availableCourses: response.stats.availableCourses || 0,
      });
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await courseService.enrollInCourse(courseId);
      toast.success("Successfully enrolled in course!");
      loadCourses();
      loadStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to enroll in course"
      );
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await courseService.unenrollFromCourse(courseId);
      toast.success("Successfully unenrolled from course!");
      loadCourses();
      loadStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to unenroll from course"
      );
    } finally {
      setEnrolling(null);
    }
  };

  const openCourseModal = async (course: Course) => {
    try {
      const response = await courseService.getCourseById(course.id);
      setSelectedCourse(response.course);
      setShowCourseModal(true);
    } catch (error: any) {
      toast.error("Failed to load course details");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: CourseFilters["status"]) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started":
        return <PauseIcon className="h-4 w-4 text-gray-500" />;
      case "in_progress":
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const statusFilters = [
    { value: "all", label: "All Courses" },
    { value: "enrollment_open", label: "Enrollment Open" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Available Courses
          </h1>
          <p className="text-gray-600">Browse and enroll in courses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Enrolled Courses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.enrolledCourses}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Available Courses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.availableCourses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search || ""}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() =>
                  handleStatusFilter(filter.value as CourseFilters["status"])
                }
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filters.status === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No courses found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={() => handleEnroll(course.id)}
                  enrolling={enrolling === course.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedCourse.name}
                </h3>
                {selectedCourse.isEnrolled ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Enrolled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Available
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Course Description:
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
                  {selectedCourse.about}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Instructor:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedCourse.created_by_user?.username || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Enrolled Students:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedCourse.enrollmentCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created:</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedCourse.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Last Updated:
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedCourse.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                {selectedCourse.isEnrolled ? (
                  <button
                    onClick={() => {
                      handleUnenroll(selectedCourse.id);
                      setShowCourseModal(false);
                    }}
                    disabled={enrolling === selectedCourse.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {enrolling === selectedCourse.id
                      ? "Processing..."
                      : "Unenroll"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleEnroll(selectedCourse.id);
                      setShowCourseModal(false);
                    }}
                    disabled={enrolling === selectedCourse.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {enrolling === selectedCourse.id
                      ? "Processing..."
                      : "Enroll"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
