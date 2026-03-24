import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
 PlusIcon,
 MagnifyingGlassIcon,
 PencilIcon,
 TrashIcon,
 UsersIcon,
 BookOpenIcon,
 ClockIcon,
 CalendarIcon,
} from "@heroicons/react/24/outline";
import { courseService } from "../services/courseApi";
import {
 Course,
 CourseFilters,
 CreateCourseRequest,
 UpdateCourseRequest,
} from "../types/course";

interface CourseFormData extends CreateCourseRequest {
 // This will include name, about, duration_months, start_date
}

interface CourseManagementProps {
 initialShowCreateModal?: boolean;
}

const CourseManagement: React.FC<CourseManagementProps> = ({
 initialShowCreateModal = false,
}) => {
 const [courses, setCourses] = useState<Course[]>([]);
 const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
 const [loading, setLoading] = useState(false);
 const [pagination, setPagination] = useState({
 page: 1,
 limit: 10,
 total: 0,
 totalPages: 0,
 });
 const [filters, setFilters] = useState<CourseFilters>({
 page: 1,
 limit: 10,
 search: "",
 status: "all",
 });
 const [stats, setStats] = useState({
 totalCourses: 0,
 totalEnrollments: 0,
 });

 // Modal states
 const [showCreateModal, setShowCreateModal] = useState(
 initialShowCreateModal
 );
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);

 // Form states
 const [formData, setFormData] = useState<CourseFormData>({
 name: "",
 about: "",
 duration_months: 6,
 start_date: "",
 });

 // Effect to handle initialShowCreateModal prop changes
 useEffect(() => {
 if (initialShowCreateModal) {
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 setFormData({
 name: "",
 about: "",
 duration_months: 6,
 start_date: tomorrow.toISOString().split("T")[0],
 });
 setShowCreateModal(true);
 }
 }, [initialShowCreateModal]);

 // Load initial data
 useEffect(() => {
 loadCourses();
 loadStats();
 }, [filters]);

 const loadCourses = async () => {
 try {
 setLoading(true);
 const response = await courseService.getTeacherCourses(filters);
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
 totalCourses: response.stats.totalCourses || 0,
 totalEnrollments: response.stats.totalEnrollments || 0,
 });
 } catch (error: any) {
 console.error("Failed to load stats:", error);
 }
 };

 const handleCreateCourse = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 setLoading(true);
 await courseService.createCourse(formData);
 toast.success("Course created successfully");
 setShowCreateModal(false);
 setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
 loadCourses();
 loadStats();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to create course");
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateCourse = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedCourse) return;

 try {
 setLoading(true);
 const updateData: UpdateCourseRequest = {};
 if (formData.name !== selectedCourse.name)
 updateData.name = formData.name;
 if (formData.about !== selectedCourse.about)
 updateData.about = formData.about;
 if (formData.duration_months !== selectedCourse.duration_months)
 updateData.duration_months = formData.duration_months;
 if (formData.start_date !== selectedCourse.start_date)
 updateData.start_date = formData.start_date;

 await courseService.updateCourse(selectedCourse.id, updateData);
 toast.success("Course updated successfully");
 setShowEditModal(false);
 setSelectedCourse(null);
 setFormData({ name: "", about: "", duration_months: 6, start_date: "" });
 loadCourses();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to update course");
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteCourse = async () => {
 if (!selectedCourse) return;

 try {
 setLoading(true);
 console.log(
 "Attempting to delete course:",
 selectedCourse.id,
 selectedCourse.name
 );

 // Call the delete API
 const response = await courseService.deleteCourse(selectedCourse.id);
 console.log("Delete response:", response);

 if (response.success) {
 toast.success("Course deleted successfully");
 console.log("Course deleted successfully, refreshing data...");

 // Close modal and clear selection
 setShowDeleteModal(false);
 setSelectedCourse(null);

 // Force refresh the course list and stats
 await Promise.all([loadCourses(), loadStats()]);

 console.log("Data refreshed after deletion");

 // Also refresh the page filters to ensure clean state
 setFilters((prev) => ({ ...prev, page: 1 }));
 } else {
 console.error("Delete failed with response:", response);
 throw new Error(response.message || "Failed to delete course");
 }
 } catch (error: any) {
 console.error("Delete course error:", error);
 console.error("Error details:", {
 message: error.message,
 response: error.response?.data,
 status: error.response?.status,
 });
 toast.error(error.response?.data?.message || "Failed to delete course");
 } finally {
 setLoading(false);
 }
 };

 const loadCourseDetails = async (courseId: string) => {
 try {
 const response = await courseService.getCourseById(courseId);
 return response;
 } catch (error: any) {
 console.error("Failed to load course details:", error);
 return null;
 }
 };

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

 const openEditModal = (course: Course) => {
 setSelectedCourse(course);
 setFormData({
 name: course.name,
 about: course.about,
 duration_months: course.duration_months,
 start_date: course.start_date,
 });
 setShowEditModal(true);
 };

 const openDeleteModal = (course: Course) => {
 setSelectedCourse(course);
 setShowDeleteModal(true);
 };

 const openCourseDetailsModal = async (course: Course) => {
 setSelectedCourse(course);
 setShowCourseDetailsModal(true);
 };

 const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
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

 const getStatusBadge = (course: Course) => {
 const status = course.timelineStatus || "not_started";
 const statusConfig = {
 not_started: {
 label: "Not Started",
 className:
 "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
 },
 in_progress: {
 label: "In Progress",
 className:
 "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
 },
 completed: {
 label: "Completed",
 className:
 "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
 },
 unknown: {
 label: "Unknown",
 className:
 "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
 },
 };

 const config = statusConfig[status] || statusConfig.unknown;

 return <Badge className={config.className}>{config.label}</Badge>;
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
 Course Management
 </h1>
 <p className="text-gray-600 dark:text-gray-400 mt-1">
 Create, manage, and track your educational courses
 </p>
 </div>
 <Button
 onClick={openCreateModal}
 className="bg-blue-600 hover:bg-blue-700"
 >
 <PlusIcon className="h-4 w-4 mr-2" />
 Create New Course
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="transition-all hover:shadow-lg">
 <CardContent className="p-6">
 <div className="flex items-center">
 <div className="p-3 bg-blue-100 dark: rounded-lg">
 <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
 My Courses
 </p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {stats.totalCourses}
 </p>
 <Progress
 value={Math.min((stats.totalCourses / 10) * 100, 100)}
 className="mt-2"
 />
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="transition-all hover:shadow-lg">
 <CardContent className="p-6">
 <div className="flex items-center">
 <div className="p-3 bg-green-100 dark: rounded-lg">
 <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
 Total Enrollments
 </p>
 <p className="text-2xl font-bold text-gray-900 dark:text-white">
 {stats.totalEnrollments}
 </p>
 <Progress
 value={Math.min((stats.totalEnrollments / 100) * 100, 100)}
 className="mt-2"
 />
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Search and Filters */}
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center gap-4">
 <div className="flex-1 relative">
 <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 placeholder="Search courses..."
 value={filters.search || ""}
 onChange={handleSearch}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
 />
 </div>
 <Button variant="outline" onClick={() => handleStatusFilter("all")}>
 All
 </Button>
 <Button
 variant="outline"
 onClick={() => handleStatusFilter("active")}
 >
 Active
 </Button>
 <Button
 variant="outline"
 onClick={() => handleStatusFilter("not_started")}
 >
 Not Started
 </Button>
 </div>
 </CardContent>
 </Card>

 {/* Courses List */}
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Your Courses</CardTitle>
 <p className="text-sm text-gray-600 dark:text-gray-400">
 Manage and track your course progress
 </p>
 </CardHeader>
 <CardContent>
 {loading ? (
 <div className="flex justify-center items-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
 <p className="ml-3 text-gray-600 dark:text-gray-400">
 Loading courses...
 </p>
 </div>
 ) : courses.length === 0 ? (
 <div className="text-center py-12">
 <div className="h-16 w-16 bg-blue-100 dark: rounded-full flex items-center justify-center mx-auto mb-4">
 <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
 </div>
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
 No courses found
 </h3>
 <p className="text-gray-600 dark:text-gray-400 mb-4">
 Create your first course to get started!
 </p>
 <Button onClick={openCreateModal}>
 <PlusIcon className="h-4 w-4 mr-2" />
 Create Course
 </Button>
 </div>
 ) : (
 <div className="space-y-4">
 {courses.map((course) => (
 <div
 key={course.id}
 className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <div className="h-12 w-12 bg-blue-100 dark: rounded-lg flex items-center justify-center">
 <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
 </div>
 <div>
 <div className="flex items-center space-x-2">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
 {course.name}
 </h3>
 {getStatusBadge(course)}
 </div>
 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
 {course.about}
 </p>
 <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
 <span className="flex items-center">
 <ClockIcon className="h-4 w-4 mr-1" />
 {course.duration_months} months
 </span>
 <span className="flex items-center">
 <CalendarIcon className="h-4 w-4 mr-1" />
 {course.start_date
 ? formatDate(course.start_date)
 : "Not set"}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => openEditModal(course)}
 >
 <PencilIcon className="h-4 w-4" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => openDeleteModal(course)}
 className="text-red-600 hover:text-red-700"
 >
 <TrashIcon className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>

 {/* Modals - Keep existing functionality */}
 {/* Create Course Modal */}
 {showCreateModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
 Create New Course
 </h2>
 <form onSubmit={handleCreateCourse} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Course Name
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Description
 </label>
 <textarea
 value={formData.about}
 onChange={(e) =>
 setFormData({ ...formData, about: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 rows={3}
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Duration (months)
 </label>
 <input
 type="number"
 value={formData.duration_months}
 onChange={(e) =>
 setFormData({
 ...formData,
 duration_months: parseInt(e.target.value),
 })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 min="1"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Start Date
 </label>
 <input
 type="date"
 value={formData.start_date}
 onChange={(e) =>
 setFormData({ ...formData, start_date: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 required
 />
 </div>
 <div className="flex justify-end space-x-3 pt-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowCreateModal(false)}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 {loading ? "Creating..." : "Create Course"}
 </Button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Edit Course Modal */}
 {showEditModal && selectedCourse && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
 Edit Course
 </h2>
 <form onSubmit={handleUpdateCourse} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Course Name
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Description
 </label>
 <textarea
 value={formData.about}
 onChange={(e) =>
 setFormData({ ...formData, about: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 rows={3}
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Duration (months)
 </label>
 <input
 type="number"
 value={formData.duration_months}
 onChange={(e) =>
 setFormData({
 ...formData,
 duration_months: parseInt(e.target.value),
 })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 min="1"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Start Date
 </label>
 <input
 type="date"
 value={formData.start_date}
 onChange={(e) =>
 setFormData({ ...formData, start_date: e.target.value })
 }
 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 required
 />
 </div>
 <div className="flex justify-end space-x-3 pt-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowEditModal(false)}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 {loading ? "Updating..." : "Update Course"}
 </Button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {showDeleteModal && selectedCourse && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
 Delete Course
 </h2>
 <p className="text-gray-600 dark:text-gray-400 mb-6">
 Are you sure you want to delete "{selectedCourse.name}"? This
 action cannot be undone.
 </p>
 <div className="flex justify-end space-x-3">
 <Button
 variant="outline"
 onClick={() => setShowDeleteModal(false)}
 >
 Cancel
 </Button>
 <Button
 onClick={handleDeleteCourse}
 disabled={loading}
 className="bg-red-600 hover:bg-red-700"
 >
 {loading ? "Deleting..." : "Delete Course"}
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default CourseManagement;
