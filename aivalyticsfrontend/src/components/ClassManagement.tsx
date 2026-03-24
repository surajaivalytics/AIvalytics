import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
 PlusIcon,
 MagnifyingGlassIcon,
 PencilIcon,
 TrashIcon,
 UserPlusIcon,
 UserMinusIcon,
 AcademicCapIcon,
 UsersIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import { classService } from "../services/classApi";
import {
 Class,
 Department,
 Student,
 ClassFilters,
 ClassFormData,
} from "../types/class";

const ClassManagement: React.FC = () => {
 const { isDark } = useTheme();
 const [classes, setClasses] = useState<Class[]>([]);
 const [departments, setDepartments] = useState<Department[]>([]);
 const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
 const [selectedClass, setSelectedClass] = useState<Class | null>(null);
 const [loading, setLoading] = useState(false);
 const [pagination, setPagination] = useState({
 page: 1,
 limit: 10,
 total: 0,
 totalPages: 0,
 });
 const [filters, setFilters] = useState<ClassFilters>({
 page: 1,
 limit: 10,
 search: "",
 });
 const [stats, setStats] = useState({
 totalClasses: 0,
 totalStudentsInClasses: 0,
 });

 // Modal states
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
 const [showAddStudentModal, setShowAddStudentModal] = useState(false);

 // Form states
 const [formData, setFormData] = useState<ClassFormData>({
 name: "",
 department_id: "",
 });
 const [studentSearch, setStudentSearch] = useState("");
 const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

 // Load initial data
 useEffect(() => {
 loadClasses();
 loadDepartments();
 loadStats();
 }, [filters]);

 const loadClasses = async () => {
 try {
 setLoading(true);
 const response = await classService.getClasses(filters);
 setClasses(response.classes);
 setPagination(response.pagination);
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to load classes");
 } finally {
 setLoading(false);
 }
 };

 const loadDepartments = async () => {
 try {
 const response = await classService.getDepartments();
 setDepartments(response.departments);
 } catch (error: any) {
 toast.error("Failed to load departments");
 }
 };

 const loadStats = async () => {
 try {
 const response = await classService.getClassStats();
 setStats(response.stats);
 } catch (error: any) {
 console.error("Failed to load stats:", error);
 }
 };

 const loadAvailableStudents = async (search: string = "") => {
 try {
 const response = await classService.getAvailableStudents(search);
 setAvailableStudents(response.students);
 } catch (error: any) {
 toast.error("Failed to load available students");
 }
 };

 const handleCreateClass = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 setLoading(true);
 await classService.createClass(formData);
 toast.success("Class created successfully");
 setShowCreateModal(false);
 setFormData({ name: "", department_id: "" });
 loadClasses();
 loadStats();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to create class");
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateClass = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedClass) return;

 try {
 setLoading(true);
 await classService.updateClass(selectedClass.id, formData);
 toast.success("Class updated successfully");
 setShowEditModal(false);
 setSelectedClass(null);
 setFormData({ name: "", department_id: "" });
 loadClasses();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to update class");
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteClass = async () => {
 if (!selectedClass) return;

 try {
 setLoading(true);
 await classService.deleteClass(selectedClass.id);
 toast.success("Class deleted successfully");
 setShowDeleteModal(false);
 setSelectedClass(null);
 loadClasses();
 loadStats();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to delete class");
 } finally {
 setLoading(false);
 }
 };

 const handleAddStudent = async () => {
 if (!selectedClass || !selectedStudent) return;

 try {
 setLoading(true);
 await classService.addStudentToClass(selectedClass.id, {
 student_id: selectedStudent.id,
 });
 toast.success("Student added to class successfully");
 setShowAddStudentModal(false);
 setSelectedStudent(null);
 setStudentSearch("");
 loadClassDetails(selectedClass.id);
 loadStats();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to add student");
 } finally {
 setLoading(false);
 }
 };

 const handleRemoveStudent = async (studentId: string) => {
 if (!selectedClass) return;

 try {
 setLoading(true);
 await classService.removeStudentFromClass(selectedClass.id, studentId);
 toast.success("Student removed from class successfully");
 loadClassDetails(selectedClass.id);
 loadStats();
 } catch (error: any) {
 toast.error(error.response?.data?.message || "Failed to remove student");
 } finally {
 setLoading(false);
 }
 };

 const loadClassDetails = async (classId: string) => {
 try {
 const response = await classService.getClassById(classId);
 setSelectedClass(response.class);
 } catch (error: any) {
 toast.error("Failed to load class details");
 }
 };

 const openCreateModal = () => {
 setFormData({ name: "", department_id: "" });
 setShowCreateModal(true);
 };

 const openEditModal = (classItem: Class) => {
 setSelectedClass(classItem);
 setFormData({
 name: classItem.name,
 department_id: classItem.department_id,
 });
 setShowEditModal(true);
 };

 const openDeleteModal = (classItem: Class) => {
 setSelectedClass(classItem);
 setShowDeleteModal(true);
 };

 const openClassDetailsModal = async (classItem: Class) => {
 await loadClassDetails(classItem.id);
 setShowClassDetailsModal(true);
 };

 const openAddStudentModal = () => {
 setStudentSearch("");
 setSelectedStudent(null);
 loadAvailableStudents();
 setShowAddStudentModal(true);
 };

 const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value;
 setFilters((prev) => ({ ...prev, search: value, page: 1 }));
 };

 const handlePageChange = (page: number) => {
 setFilters((prev) => ({ ...prev, page }));
 };

 const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value;
 setStudentSearch(value);
 loadAvailableStudents(value);
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex justify-between items-center">
 <div>
 <h1
 className={`text-2xl font-bold ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Class Management
 </h1>
 <p
 className={`${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 Manage classes and student enrollment
 </p>
 </div>
 <button
 onClick={openCreateModal}
 className=" bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-lg transition-all duration-200"
 >
 <PlusIcon className="h-5 w-5" />
 Create Class
 </button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div
 className={`p-6 rounded-xl shadow-lg border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="flex items-center">
 <div className=" bg-purple-500 p-3 rounded-xl shadow-lg">
 <AcademicCapIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )}`}
 >
 Total Classes
 </p>
 <p
 className={`text-2xl font-bold ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {stats.totalClasses}
 </p>
 </div>
 </div>
 </div>
 <div
 className={`p-6 rounded-xl shadow-lg border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="flex items-center">
 <div className=" bg-green-500 p-3 rounded-xl shadow-lg">
 <UsersIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )}`}
 >
 Students Enrolled
 </p>
 <p
 className={`text-2xl font-bold ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {stats.totalStudentsInClasses}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Search and Filters */}
 <div
 className={`p-4 rounded-xl shadow-lg border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="flex items-center gap-4">
 <div className="flex-1 relative">
 <MagnifyingGlassIcon
 className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 />
 <input
 type="text"
 placeholder="Search classes..."
 value={filters.search || ""}
 onChange={handleSearch}
 className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
 "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
 )}`}
 />
 </div>
 </div>
 </div>

 {/* Classes Table */}
 <div
 className={`rounded-xl shadow-lg overflow-hidden border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="overflow-x-auto">
 <table
 className={`min-w-full divide-y ${getThemedClasses(
 isDark,
 "divide-gray-200",
 "divide-gray-700"
 )}`}
 >
 <thead
 className={`${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 <tr>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Class Name
 </th>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Department
 </th>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Students
 </th>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Created
 </th>
 <th
 className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Actions
 </th>
 </tr>
 </thead>
 <tbody
 className={`divide-y ${getThemedClasses(
 isDark,
 "bg-white divide-gray-200",
 "bg-gray-800 divide-gray-700"
 )}`}
 >
 {loading ? (
 <tr>
 <td colSpan={5} className="px-6 py-4 text-center">
 <div className="flex justify-center">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
 </div>
 </td>
 </tr>
 ) : classes.length === 0 ? (
 <tr>
 <td
 colSpan={5}
 className={`px-6 py-4 text-center ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )}`}
 >
 No classes found
 </td>
 </tr>
 ) : (
 classes.map((classItem) => (
 <tr
 key={classItem.id}
 className={`transition-colors duration-150 ${getThemedClasses(
 isDark,
 "hover:bg-gray-50",
 "hover:bg-gray-700"
 )}`}
 >
 <td className="px-6 py-4 whitespace-nowrap">
 <div
 className={`text-sm font-medium ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {classItem.name}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div
 className={`text-sm ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 {classItem.department?.name || "N/A"}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div
 className={`text-sm ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 {classItem.num_students} students
 </div>
 </td>
 <td
 className={`px-6 py-4 whitespace-nowrap text-sm ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 {new Date(classItem.created_at).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end gap-2">
 <button
 onClick={() => openClassDetailsModal(classItem)}
 className="text-blue-400 hover:text-blue-300"
 title="View Details"
 >
 <UsersIcon className="h-5 w-5" />
 </button>
 <button
 onClick={() => openEditModal(classItem)}
 className="text-indigo-400 hover:text-indigo-300"
 title="Edit"
 >
 <PencilIcon className="h-5 w-5" />
 </button>
 <button
 onClick={() => openDeleteModal(classItem)}
 className="text-red-400 hover:text-red-300"
 title="Delete"
 >
 <TrashIcon className="h-5 w-5" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {pagination.totalPages > 1 && (
 <div
 className={`px-4 py-3 flex items-center justify-between border-t ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-200",
 "bg-gray-700 border-gray-600"
 )}`}
 >
 <div className="flex-1 flex justify-between sm:hidden">
 <button
 onClick={() => handlePageChange(pagination.page - 1)}
 disabled={pagination.page === 1}
 className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 ${getThemedClasses(
 isDark,
 "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
 "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
 )}`}
 >
 Previous
 </button>
 <button
 onClick={() => handlePageChange(pagination.page + 1)}
 disabled={pagination.page === pagination.totalPages}
 className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 ${getThemedClasses(
 isDark,
 "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
 "border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
 )}`}
 >
 Next
 </button>
 </div>
 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
 <div>
 <p
 className={`text-sm ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
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
 className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 ${getThemedClasses(
 isDark,
 "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
 "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
 )}`}
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
 ? "z-10 bg-purple-500 border-purple-500 text-purple-100"
 : getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
 "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
 )
 }`}
 >
 {page}
 </button>
 ))}
 <button
 onClick={() => handlePageChange(pagination.page + 1)}
 disabled={pagination.page === pagination.totalPages}
 className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 ${getThemedClasses(
 isDark,
 "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
 "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
 )}`}
 >
 Next
 </button>
 </nav>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Create Class Modal */}
 {showCreateModal && (
 <div
 className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${getThemedClasses(
 isDark,
 "bg-gray-900/75",
 "bg-gray-900/75"
 )}`}
 >
 <div
 className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="mt-3">
 <h3
 className={`text-lg font-medium mb-4 ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Create New Class
 </h3>
 <form onSubmit={handleCreateClass} className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Class Name
 </label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, name: e.target.value }))
 }
 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900",
 "bg-gray-700 border-gray-600 text-white"
 )}`}
 placeholder="Enter class name"
 />
 </div>
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Department
 </label>
 <select
 required
 value={formData.department_id}
 onChange={(e) =>
 setFormData((prev) => ({
 ...prev,
 department_id: e.target.value,
 }))
 }
 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900",
 "bg-gray-700 border-gray-600 text-white"
 )}`}
 >
 <option value="">Select Department</option>
 {departments.map((dept) => (
 <option key={dept.id} value={dept.id}>
 {dept.name}
 </option>
 ))}
 </select>
 </div>
 <div className="flex justify-end gap-3 pt-4">
 <button
 type="button"
 onClick={() => setShowCreateModal(false)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 hover:bg-gray-200",
 "text-gray-300 bg-gray-700 hover:bg-gray-600"
 )}`}
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all duration-200"
 >
 {loading ? "Creating..." : "Create Class"}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Edit Class Modal */}
 {showEditModal && selectedClass && (
 <div
 className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${getThemedClasses(
 isDark,
 "bg-gray-900/75",
 "bg-gray-900/75"
 )}`}
 >
 <div
 className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="mt-3">
 <h3
 className={`text-lg font-medium mb-4 ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Edit Class
 </h3>
 <form onSubmit={handleUpdateClass} className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Class Name
 </label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, name: e.target.value }))
 }
 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900",
 "bg-gray-700 border-gray-600 text-white"
 )}`}
 placeholder="Enter class name"
 />
 </div>
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Department
 </label>
 <select
 required
 value={formData.department_id}
 onChange={(e) =>
 setFormData((prev) => ({
 ...prev,
 department_id: e.target.value,
 }))
 }
 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900",
 "bg-gray-700 border-gray-600 text-white"
 )}`}
 >
 <option value="">Select Department</option>
 {departments.map((dept) => (
 <option key={dept.id} value={dept.id}>
 {dept.name}
 </option>
 ))}
 </select>
 </div>
 <div className="flex justify-end gap-3 pt-4">
 <button
 type="button"
 onClick={() => setShowEditModal(false)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 hover:bg-gray-200",
 "text-gray-300 bg-gray-700 hover:bg-gray-600"
 )}`}
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all duration-200"
 >
 {loading ? "Updating..." : "Update Class"}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {showDeleteModal && selectedClass && (
 <div
 className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${getThemedClasses(
 isDark,
 "bg-gray-900/75",
 "bg-gray-900/75"
 )}`}
 >
 <div
 className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="mt-3 text-center">
 <h3
 className={`text-lg font-medium mb-4 ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Delete Class
 </h3>
 <p
 className={`text-sm mb-4 ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 Are you sure you want to delete "{selectedClass.name}"? This
 action cannot be undone.
 </p>
 <div className="flex justify-center gap-3">
 <button
 onClick={() => setShowDeleteModal(false)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 hover:bg-gray-200",
 "text-gray-300 bg-gray-700 hover:bg-gray-600"
 )}`}
 >
 Cancel
 </button>
 <button
 onClick={handleDeleteClass}
 disabled={loading}
 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200"
 >
 {loading ? "Deleting..." : "Delete"}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Class Details Modal */}
 {showClassDetailsModal && selectedClass && (
 <div
 className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${getThemedClasses(
 isDark,
 "bg-gray-900/75",
 "bg-gray-900/75"
 )}`}
 >
 <div
 className={`relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-xl ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="mt-3">
 <div className="flex justify-between items-center mb-4">
 <h3
 className={`text-lg font-medium ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {selectedClass.name} - Student Management
 </h3>
 <button
 onClick={openAddStudentModal}
 className=" bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 shadow-md"
 >
 <UserPlusIcon className="h-4 w-4" />
 Add Student
 </button>
 </div>

 <div className="mb-4">
 <p
 className={`text-sm ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 Department: {selectedClass.department?.name} | Students:{" "}
 {selectedClass.num_students}
 </p>
 </div>

 <div className="max-h-96 overflow-y-auto">
 {selectedClass.students && selectedClass.students.length > 0 ? (
 <table
 className={`min-w-full divide-y ${getThemedClasses(
 isDark,
 "divide-gray-200",
 "divide-gray-700"
 )}`}
 >
 <thead
 className={`${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 <tr>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Username
 </th>
 <th
 className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Roll Number
 </th>
 <th
 className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Actions
 </th>
 </tr>
 </thead>
 <tbody
 className={`divide-y ${getThemedClasses(
 isDark,
 "bg-white divide-gray-200",
 "bg-gray-800 divide-gray-700"
 )}`}
 >
 {selectedClass.students.map((student) => (
 <tr
 key={student.id}
 className={`transition-colors duration-150 ${getThemedClasses(
 isDark,
 "hover:bg-gray-50",
 "hover:bg-gray-700"
 )}`}
 >
 <td
 className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {student.username}
 </td>
 <td
 className={`px-6 py-4 whitespace-nowrap text-sm ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 {student.roll_number}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <button
 onClick={() => handleRemoveStudent(student.id)}
 className="text-red-400 hover:text-red-300"
 title="Remove Student"
 >
 <UserMinusIcon className="h-5 w-5" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 ) : (
 <p
 className={`text-center py-8 ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 No students enrolled in this class
 </p>
 )}
 </div>

 <div className="flex justify-end pt-4">
 <button
 onClick={() => setShowClassDetailsModal(false)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 hover:bg-gray-200",
 "text-gray-300 bg-gray-700 hover:bg-gray-600"
 )}`}
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Add Student Modal */}
 {showAddStudentModal && (
 <div
 className={`fixed inset-0 overflow-y-auto h-full w-full z-50 ${getThemedClasses(
 isDark,
 "bg-gray-900/75",
 "bg-gray-900/75"
 )}`}
 >
 <div
 className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="mt-3">
 <h3
 className={`text-lg font-medium mb-4 ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Add Student to Class
 </h3>

 <div className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 Search Students
 </label>
 <div className="relative">
 <MagnifyingGlassIcon
 className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${getThemedClasses(
 isDark,
 "text-gray-400",
 "text-gray-400"
 )}`}
 />
 <input
 type="text"
 value={studentSearch}
 onChange={handleStudentSearch}
 className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getThemedClasses(
 isDark,
 "bg-white border-gray-300 text-gray-900",
 "bg-gray-700 border-gray-600 text-white"
 )}`}
 placeholder="Search by name or roll number"
 />
 </div>
 </div>

 <div
 className={`max-h-60 overflow-y-auto mt-2 rounded-lg ${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-700"
 )}`}
 >
 {availableStudents.length === 0 ? (
 <p
 className={`text-center py-4 ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 No students found
 </p>
 ) : (
 <ul
 className={`divide-y ${getThemedClasses(
 isDark,
 "divide-gray-200",
 "divide-gray-600"
 )}`}
 >
 {availableStudents.map((student) => (
 <li
 key={student.id}
 className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
 selectedStudent?.id === student.id
 ? " border-l-4 border-purple-500"
 : getThemedClasses(
 isDark,
 "hover:bg-gray-100",
 "hover:bg-gray-600"
 )
 }`}
 onClick={() => setSelectedStudent(student)}
 >
 <div className="flex justify-between items-center">
 <div>
 <p
 className={`text-sm font-medium ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {student.username}
 </p>
 <p
 className={`text-xs ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 {student.roll_number}
 </p>
 </div>
 {selectedStudent?.id === student.id && (
 <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
 )}
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>

 <div className="flex justify-end gap-3 pt-4">
 <button
 type="button"
 onClick={() => setShowAddStudentModal(false)}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 hover:bg-gray-200",
 "text-gray-300 bg-gray-700 hover:bg-gray-600"
 )}`}
 >
 Cancel
 </button>
 <button
 onClick={handleAddStudent}
 disabled={loading || !selectedStudent}
 className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
 >
 {loading ? "Adding..." : "Add Student"}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default ClassManagement;
