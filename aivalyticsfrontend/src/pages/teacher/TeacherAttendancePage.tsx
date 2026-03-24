import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import TeacherAttendance from "../../components/TeacherAttendance";
import {
 Users,
 Calendar,
 BarChart3,
 Settings,
 Download,
 Filter,
 RefreshCw,
} from "lucide-react";
import {
 attendanceAPI,
 AttendanceSessionData,
 AttendanceAnalytics,
 AttendanceSession,
} from "../../services/attendanceApi";
import { toast } from "react-hot-toast";

const TeacherAttendancePage: React.FC = () => {
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState<
 "manage" | "analytics" | "sessions" | "settings"
 >("manage");
 const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
 const [sessions, setSessions] = useState<AttendanceSession[]>([]);
 const [loading, setLoading] = useState(false);
 const [selectedCourse, setSelectedCourse] = useState<string>("all");
 const [dateRange, setDateRange] = useState({
 start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
 .toISOString()
 .split("T")[0],
 end: new Date().toISOString().split("T")[0],
 });

 useEffect(() => {
 if (activeTab === "analytics") {
 fetchAnalytics();
 } else if (activeTab === "sessions") {
 fetchSessions();
 }
 }, [activeTab, selectedCourse, dateRange]);

 const fetchAnalytics = async () => {
 try {
 setLoading(true);
 const filters = {
 ...(selectedCourse !== "all" && { course_id: selectedCourse }),
 start_date: dateRange.start,
 end_date: dateRange.end,
 };

 const response = await attendanceAPI.getAttendanceAnalytics(filters);
 if (response.success) {
 setAnalytics(response.data.analytics);
 } else {
 toast.error(response.error || "Failed to fetch analytics");
 }
 } catch (error) {
 console.error("Error fetching analytics:", error);
 toast.error("Failed to fetch analytics");
 } finally {
 setLoading(false);
 }
 };

 const fetchSessions = async () => {
 try {
 setLoading(true);
 const filters = {
 ...(selectedCourse !== "all" && { course_id: selectedCourse }),
 start_date: dateRange.start,
 end_date: dateRange.end,
 };

 const response = await attendanceAPI.getAttendanceSessions(filters);
 if (response.success) {
 setSessions(response.data);
 } else {
 toast.error(response.error || "Failed to fetch sessions");
 }
 } catch (error) {
 console.error("Error fetching sessions:", error);
 toast.error("Failed to fetch sessions");
 } finally {
 setLoading(false);
 }
 };

 const exportAttendance = async () => {
 try {
 const filters = {
 ...(selectedCourse !== "all" && { course_id: selectedCourse }),
 start_date: dateRange.start,
 end_date: dateRange.end,
 };

 const response = await attendanceAPI.exportAttendance({
 ...filters,
 format: "csv",
 });
 if (response.success) {
 toast.success(
 response.message || "Attendance data exported successfully"
 );
 } else {
 toast.error(response.error || "Failed to export data");
 }
 } catch (error) {
 console.error("Export error:", error);
 toast.error("Failed to export attendance data");
 }
 };

 const tabs = [
 { id: "manage", label: "Mark Attendance", icon: Users },
 { id: "analytics", label: "Analytics", icon: BarChart3 },
 { id: "sessions", label: "Sessions", icon: Calendar },
 { id: "settings", label: "Settings", icon: Settings },
 ];

 const getStatusColor = (status: string) => {
 switch (status) {
 case "completed":
 return "bg-green-100 text-green-800 border-green-200";
 case "ongoing":
 return "bg-blue-100 text-blue-800 border-blue-200";
 case "scheduled":
 return "bg-yellow-100 text-yellow-800 border-yellow-200";
 case "cancelled":
 return "bg-red-100 text-red-800 border-red-200";
 default:
 return "bg-gray-100 text-gray-800 border-gray-200";
 }
 };

 if (user?.role !== "teacher") {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
 Access Denied
 </h1>
 <p className="text-gray-600 dark:text-gray-400">
 This page is only accessible to teachers.
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Header */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
 Attendance Management
 </h1>
 <p className="text-gray-600 dark:text-gray-400 mt-1">
 Manage student attendance, view analytics, and generate reports
 </p>
 </div>
 <div className="flex items-center space-x-3">
 <button
 onClick={exportAttendance}
 className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
 >
 <Download className="w-4 h-4" />
 <span>Export</span>
 </button>
 <button
 onClick={() => {
 if (activeTab === "analytics") fetchAnalytics();
 else if (activeTab === "sessions") fetchSessions();
 }}
 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 <RefreshCw className="w-4 h-4" />
 <span>Refresh</span>
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Course
 </label>
 <select
 value={selectedCourse}
 onChange={(e) => setSelectedCourse(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 >
 <option value="all">All Courses</option>
 <option value="1">Python Programming</option>
 <option value="2">Database Management</option>
 <option value="3">Web Development</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Start Date
 </label>
 <input
 type="date"
 value={dateRange.start}
 onChange={(e) =>
 setDateRange((prev) => ({ ...prev, start: e.target.value }))
 }
 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 End Date
 </label>
 <input
 type="date"
 value={dateRange.end}
 onChange={(e) =>
 setDateRange((prev) => ({ ...prev, end: e.target.value }))
 }
 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 />
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
 <div className="border-b border-gray-200 dark:border-gray-700">
 <nav className="flex space-x-8 px-6">
 {tabs.map((tab) => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
 activeTab === tab.id
 ? "border-blue-500 text-blue-600 dark:text-blue-400"
 : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
 }`}
 >
 <Icon className="w-4 h-4" />
 <span>{tab.label}</span>
 </button>
 );
 })}
 </nav>
 </div>

 <div className="p-6">
 {/* Mark Attendance Tab */}
 {activeTab === "manage" && <TeacherAttendance />}

 {/* Analytics Tab */}
 {activeTab === "analytics" && (
 <div className="space-y-6">
 {loading ? (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 ) : analytics ? (
 <>
 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-gray-50 dark: p-6 rounded-lg border border-blue-200 dark:border-blue-800">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
 Total Students
 </p>
 <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
 {analytics.total_students}
 </p>
 </div>
 <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
 </div>
 </div>

 <div className="bg-gray-50 dark: p-6 rounded-lg border border-green-200 dark:border-green-800">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-green-600 dark:text-green-400">
 Average Attendance
 </p>
 <p className="text-2xl font-bold text-green-900 dark:text-green-100">
 {analytics.average_attendance.toFixed(1)}%
 </p>
 </div>
 <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
 </div>
 </div>

 <div className="bg-gray-50 dark: p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
 Warning
 </p>
 <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
 {analytics.warning_attendance}
 </p>
 </div>
 <Filter className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
 </div>
 </div>

 <div className="bg-gray-50 dark: p-6 rounded-lg border border-red-200 dark:border-red-800">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-red-600 dark:text-red-400">
 Critical
 </p>
 <p className="text-2xl font-bold text-red-900 dark:text-red-100">
 {analytics.critical_attendance}
 </p>
 </div>
 <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
 </div>
 </div>
 </div>

 {/* Distribution Chart */}
 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
 Attendance Distribution
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="text-center">
 <div className="text-2xl font-bold text-green-600">
 {analytics?.distribution?.excellent ?? 0}
 </div>
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Excellent (90%+)
 </div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-blue-600">
 {analytics?.distribution?.good ?? 0}
 </div>
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Good (80-89%)
 </div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-yellow-600">
 {analytics?.distribution?.average ?? 0}
 </div>
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Average (70-79%)
 </div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-red-600">
 {analytics?.distribution?.poor ?? 0}
 </div>
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Poor (&lt;70%)
 </div>
 </div>
 </div>
 </div>
 </>
 ) : (
 <div className="text-center py-12">
 <p className="text-gray-500 dark:text-gray-400">
 No analytics data available
 </p>
 </div>
 )}
 </div>
 )}

 {/* Sessions Tab */}
 {activeTab === "sessions" && (
 <div className="space-y-4">
 {loading ? (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 ) : sessions.length > 0 ? (
 sessions.map((session) => (
 <div
 key={session.id}
 className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
 >
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-3 mb-2">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
 {session.course_name ?? ""}
 </h3>
 <span
 className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
 session.status ?? ""
 )}`}
 >
 {session.status
 ? session.status.charAt(0).toUpperCase() +
 session.status.slice(1)
 : ""}
 </span>
 </div>
 <p className="text-gray-600 dark:text-gray-400 mb-2">
 {session.topic}
 </p>
 <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
 <span>
 {new Date(
 session.session_date
 ).toLocaleDateString()}
 </span>
 <span>{session.session_time}</span>
 <span>{session.session_type}</span>
 {session.location && (
 <span>{session.location}</span>
 )}
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
 Attendance: {session.present_students ?? 0}/
 {session.total_students ?? 0}
 </div>
 <div className="text-lg font-semibold text-gray-900 dark:text-white">
 {session.total_students
 ? Math.round(
 (session.present_students ??
 0 / session.total_students) * 100
 )
 : 0}
 %
 </div>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-12">
 <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500 dark:text-gray-400">
 No sessions found
 </p>
 </div>
 )}
 </div>
 )}

 {/* Settings Tab */}
 {activeTab === "settings" && (
 <div className="space-y-6">
 <div className="bg-gray-50 dark: border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
 <p className="text-yellow-800 dark:text-yellow-200">
 Attendance settings will be available in the next update.
 Contact your administrator for configuration changes.
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default TeacherAttendancePage;
export {};
