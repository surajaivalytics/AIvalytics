import React, { useState, useEffect } from "react";
// import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import { courseService } from "../services/courseApi";
import { Course } from "../types/course";
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { toast } from "react-hot-toast";

// Course form data interface
interface CourseFormData {
  name: string;
  about: string;
  duration_months: number;
  start_date: string;
}

// Updated styles
const styles = `
  .glass-effect {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .dark .glass-effect {
    background: rgba(17, 24, 39, 0.4);
  }

  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
  }

  .dark .hover-lift:hover {
    box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.3);
  }

  .modal-backdrop {
    backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.4);
  }

  .dark .modal-backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Create course modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    about: "",
    duration_months: 6,
    start_date: "",
  });

  // Edit course modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete course states
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourses({ limit: 50 });
        if (response.success) {
          // Filter courses created by this teacher
          const teacherCourses = response.courses.filter(
            (course) => course.created_by === user?.id
          );
          setCourses(teacherCourses);
          setFilteredCourses(teacherCourses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  // Handle create course modal
  const openCreateModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({
      name: "",
      about: "",
      duration_months: 6,
      start_date: tomorrow.toISOString().split("T")[0],
    });
    setShowCreateModal(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await courseService.createCourse(formData);
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
      // Refresh courses list
      await fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      about: course.about || "",
      duration_months: course.duration_months || 6,
      start_date: course.start_date ? course.start_date.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      setEditLoading(true);
      await courseService.updateCourse(editingCourse.id, formData);
      toast.success("Course updated successfully!");
      setShowEditModal(false);
      setEditingCourse(null);
      setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
      // Refresh courses list
      await fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted successfully!");
      // Refresh courses list
      await fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    } finally {
      setDeletingCourseId(null);
    }
  };

  useEffect(() => {
    // Apply filters and search
    let result = [...courses];

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((course) => {
        if (filterStatus === "active")
          return course.timelineStatus === "in_progress";
        if (filterStatus === "draft")
          return course.timelineStatus === "not_started";
        if (filterStatus === "completed")
          return course.timelineStatus === "completed";
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (course) =>
          course.name.toLowerCase().includes(term) ||
          (course.about && course.about.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "students") {
      result.sort(
        (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      );
    }

    setFilteredCourses(result);
  }, [courses, filterStatus, searchTerm, sortBy]);

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                My Courses
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your educational content and track student progress
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Course
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
              <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="students">Most Students</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "draft", label: "Draft" },
                  { id: "completed", label: "Completed" },
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setFilterStatus(status.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      filterStatus === status.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading courses...</span>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <BookOpenIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || filterStatus !== "all" ? "No matches found" : "Start Your Teaching Journey"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first course to begin sharing your knowledge"}
              </p>
              <button
                onClick={searchTerm || filterStatus !== "all" ? () => {
                  setSearchTerm("");
                  setFilterStatus("all");
                } : openCreateModal}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-200"
              >
                {searchTerm || filterStatus !== "all" ? "Clear filters" : "Create Course"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
              >
                <CourseCard
                  course={course}
                  showCreateQuiz={true}
                  showTeacherActions={true}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  deleting={deletingCourseId === course.id}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
              <span className="inline-block h-screen align-middle">&#8203;</span>
              
              <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {showCreateModal ? "Create New Course" : "Edit Course"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {showCreateModal ? "Share your knowledge with the world" : "Update your course details"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          setEditingCourse(null);
                          setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
                        }}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={showCreateModal ? handleCreateCourse : handleUpdateCourse} className="p-6">
                    <div className="space-y-4">
                      {/* Form fields remain the same but with updated styling */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="e.g., Introduction to Web Development"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Course Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          value={formData.about}
                          onChange={(e) => setFormData((prev) => ({ ...prev, about: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                          placeholder="Describe what students will learn..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={formData.duration_months}
                            onChange={(e) => setFormData((prev) => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value={1}>1 Month</option>
                            <option value={2}>2 Months</option>
                            <option value={3}>3 Months</option>
                            <option value={6}>6 Months</option>
                            <option value={9}>9 Months</option>
                            <option value={12}>1 Year</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.start_date}
                            onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          setEditingCourse(null);
                          setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createLoading || editLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLoading || editLoading ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            <span>{showCreateModal ? "Creating..." : "Updating..."}</span>
                          </div>
                        ) : (
                          <span>{showCreateModal ? "Create Course" : "Update Course"}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCoursesPage; 
