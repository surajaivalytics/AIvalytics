import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import { courseService } from "../services/courseApi";
import { Course } from "../types/course";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import CourseCard from "../components/CourseCard";

// Add keyframe animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse 4s ease-in-out infinite;
  }

  .animate-shimmer {
    animation: shimmer 2.5s infinite;
  }

  .glass-card {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .glass-card {
    background: rgba(17, 24, 39, 0.7);
    border-color: rgba(75, 85, 99, 0.3);
  }

  .hover-lift {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
  }

  .dark .hover-lift:hover {
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3);
  }
`;

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    availableCourses: 0,
  });

  const fetchCourses = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({
        page,
        limit: 12,
        search,
      });

      if (response.success) {
        setCourses(response.courses);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await courseService.getCourseStats();
      if (response.success) {
        setStats({
          enrolledCourses: response.stats.enrolledCourses || 0,
          availableCourses: response.stats.availableCourses || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch course stats:", error);
    }
  };

  useEffect(() => {
    fetchCourses(1, searchTerm);
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses(1, searchTerm);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      const response = await courseService.enrollInCourse(courseId);

      if (response.success) {
        toast.success(response.message);
        // Update the course enrollment status locally
        setCourses(
          courses.map((course) =>
            course.id === courseId ? { ...course, isEnrolled: true } : course
          )
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          enrolledCourses: prev.enrolledCourses + 1,
        }));
      }
    } catch (error: any) {
      console.error("Failed to enroll in course:", error);
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
      const response = await courseService.unenrollFromCourse(courseId);

      if (response.success) {
        toast.success(response.message);
        // Update the course enrollment status locally
        setCourses(
          courses.map((course) =>
            course.id === courseId ? { ...course, isEnrolled: false } : course
          )
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          enrolledCourses: prev.enrolledCourses - 1,
        }));
      }
    } catch (error: any) {
      console.error("Failed to unenroll from course:", error);
      toast.error(
        error.response?.data?.message || "Failed to unenroll from course"
      );
    } finally {
      setEnrolling(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCourses(page, searchTerm);
  };

  if (loading && courses.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{styles}</style>
      <div className="space-y-6 relative min-h-screen">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow bg-gradient-to-br from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow bg-gradient-to-br from-blue-500/20 to-cyan-500/20"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="relative glass-card rounded-2xl shadow-2xl p-8 overflow-hidden hover-lift">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg animate-float">
                  <BookOpenIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600`}>
                    Available Courses
                  </h1>
                  <p className={`mt-2 ${getThemedClasses(isDark, "text-gray-600", "text-gray-300")}`}>
                    Discover and enroll in courses to enhance your knowledge
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="glass-card rounded-xl p-4 text-center min-w-[120px]">
                  <div className={`text-sm font-medium ${getThemedClasses(isDark, "text-indigo-500", "text-indigo-400")}`}>
                    Enrolled
                  </div>
                  <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600`}>
                    {stats.enrolledCourses}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center min-w-[120px]">
                  <div className={`text-sm font-medium ${getThemedClasses(isDark, "text-emerald-500", "text-emerald-400")}`}>
                    Available
                  </div>
                  <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600`}>
                    {stats.availableCourses}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="glass-card rounded-xl shadow-lg p-6 hover-lift">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${getThemedClasses(isDark, "text-gray-500", "text-gray-400")}`} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by name or description..."
                className={`block w-full pl-12 pr-4 py-3 border rounded-xl bg-opacity-50 backdrop-blur-sm transition-all duration-200 ${
                  getThemedClasses(
                    isDark,
                    "bg-white/50 text-gray-900 placeholder-gray-500 border-gray-200 focus:border-indigo-500",
                    "bg-gray-800/50 text-white placeholder-gray-400 border-gray-700 focus:border-indigo-400"
                  )
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center hover-lift">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 animate-float">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${getThemedClasses(isDark, "text-gray-900", "text-white")}`}>
              No courses found
            </h3>
            <p className={getThemedClasses(isDark, "text-gray-600", "text-gray-400")}>
              {searchTerm ? "Try adjusting your search terms" : "No courses are available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={course.isEnrolled}
                onEnroll={course.isEnrolled ? () => handleUnenroll(course.id) : () => handleEnroll(course.id)}
                enrolling={enrolling === course.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className={`text-sm ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
                    getThemedClasses(
                      isDark,
                      "text-gray-700 bg-white/50 hover:bg-white/70 border border-gray-200",
                      "text-gray-300 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700"
                    )
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          pageNum === currentPage
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                            : getThemedClasses(
                                isDark,
                                "text-gray-700 bg-white/50 hover:bg-white/70 border border-gray-200",
                                "text-gray-300 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700"
                              )
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
                    getThemedClasses(
                      isDark,
                      "text-gray-700 bg-white/50 hover:bg-white/70 border border-gray-200",
                      "text-gray-300 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700"
                    )
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
