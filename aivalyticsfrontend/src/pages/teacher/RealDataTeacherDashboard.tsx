import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
 AcademicCapIcon,
 BookOpenIcon,
 UserGroupIcon,
 ChartBarIcon,
 ClockIcon,
 PlusIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 EyeIcon,
 PencilIcon,
 PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardApi";

interface TeacherDashboardData {
 user: {
 id: number;
 name: string;
 role: string;
 };
 stats: {
 totalCourses: number;
 totalQuizzes: number;
 totalStudents: number;
 averageClassScore: number;
 };
 courses: Array<{
 id: number;
 name: string;
 description: string;
 createdAt: string;
 }>;
 recentActivity: Array<{
 id: number;
 type: string;
 student: string;
 quiz: string;
 course: string;
 score: string;
 percentage: number;
 timestamp: string;
 }>;
 coursePerformance: Array<{
 course: string;
 students: number;
 attempts: number;
 averageScore: number;
 }>;
 quizzes: Array<{
 id: number;
 name: string;
 course: string;
 attempts: number;
 averageScore: number;
 createdAt: string;
 }>;
}

const RealDataTeacherDashboard: React.FC = () => {
 const { user } = useAuth();
 const [dashboardData, setDashboardData] =
 useState<TeacherDashboardData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetchDashboardData();
 }, []);

 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 setError(null);

 console.log("📊 Fetching teacher dashboard data...");
 const response = await dashboardService.getTeacherDashboard();

 if (response.success && response.data) {
 setDashboardData(response.data);
 console.log("✅ Teacher dashboard data loaded:", response.data);
 } else {
 setError(response.message || "Failed to load dashboard data");
 }
 } catch (err: any) {
 console.error("❌ Teacher dashboard error:", err);
 setError(err.message || "Failed to load dashboard data");
 } finally {
 setLoading(false);
 }
 };

 const getScoreColor = (score: number) => {
 if (score >= 90) return "text-green-600 dark:text-green-400";
 if (score >= 80) return "text-blue-600 dark:text-blue-400";
 if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
 if (score >= 60) return "text-orange-600 dark:text-orange-400";
 return "text-red-600 dark:text-red-400";
 };

 const getScoreBgColor = (score: number) => {
 if (score >= 90) return "bg-gray-50 dark: border-green-200 dark:border-green-800";
 if (score >= 80) return "bg-gray-50 dark: border-blue-200 dark:border-blue-800";
 if (score >= 70) return "bg-gray-50 dark: border-yellow-200 dark:border-yellow-800";
 if (score >= 60) return "bg-gray-50 dark: border-orange-200 dark:border-orange-800";
 return "bg-gray-50 dark: border-red-200 dark:border-red-800";
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
 };

 const formatDateTime = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
 <div className="text-center">
 <div className="relative">
 <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 mx-auto mb-6 shadow-lg"></div>
 <div
 className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 animate-spin mx-auto"
 style={{
 animationDirection: "reverse",
 animationDuration: "1.5s",
 }}
 ></div>
 </div>
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-white/20 dark:border-gray-700/50">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
 Loading Your Dashboard
 </h3>
 <p className="text-gray-600 dark:text-gray-400 mb-4">
 Fetching your latest academic data...
 </p>
 <div className="flex items-center justify-center space-x-2">
 <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
 <div
 className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"
 style={{ animationDelay: "0.1s" }}
 ></div>
 <div
 className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"
 style={{ animationDelay: "0.2s" }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto">
 <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800/50">
 <div className="mb-6">
 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500 shadow-lg mb-4">
 <ExclamationTriangleIcon className="h-8 w-8 text-white" />
 </div>
 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
 Oops! Something went wrong
 </h3>
 <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{error}</p>
 <button
 onClick={fetchDashboardData}
 className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
 >
 🔄 Try Again
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (!dashboardData) {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
 <div className="text-center">
 <p className="text-gray-600 dark:text-gray-400">No dashboard data available</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 
 {/* Enhanced Header */}
 <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
 <div className="flex items-center space-x-4">
 <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
 <span className="text-2xl font-bold text-white">
 {dashboardData.user.name.charAt(0).toUpperCase()}
 </span>
 </div>
 <div className="flex-1">
 <h1 className="text-4xl font-bold text-gray-900 dark:bg-white ">
 Welcome back, {dashboardData.user.name}! 👨‍🏫
 </h1>
 <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
 Manage your courses and track student progress
 </p>
 <div className="mt-3 flex items-center gap-4 flex-wrap">
 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white shadow-lg">
 {dashboardData.user.role.charAt(0).toUpperCase() +
 dashboardData.user.role.slice(1)}
 </span>
 <span className="text-sm text-gray-500 dark:text-gray-400">
 Last updated: {new Date().toLocaleDateString()}
 </span>
 </div>
 
 <div className="mt-6 flex flex-wrap gap-4">
 <Link to="/academic-management" className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
 <PlusIcon className="w-5 h-5 mr-2" />
 Create Course
 </Link>
 <Link to="/quiz-generator" className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
 <PlusIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
 Add Quiz
 </Link>
 <Link to="/my-courses" className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
 <BookOpenIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
 View My Courses
 </Link>
 </div>
 </div>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
 <div className="flex items-center">
 <div className="p-4 bg-blue-500 rounded-xl shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
 <BookOpenIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Total Courses
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:text-blue-400 transition-colors duration-300">
 {dashboardData.stats.totalCourses}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-blue-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min((dashboardData.stats.totalCourses / 20) * 100, 100)}%`,
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
 <div className="flex items-center">
 <div className="p-4 bg-green-500 rounded-xl shadow-lg group-hover:shadow-green-200 transition-all duration-300">
 <CheckCircleIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Total Quizzes
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:text-green-400 transition-colors duration-300">
 {dashboardData.stats.totalQuizzes}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-green-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min((dashboardData.stats.totalQuizzes / 50) * 100, 100)}%`,
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
 <div className="flex items-center">
 <div className="p-4 bg-purple-500 rounded-xl shadow-lg group-hover:shadow-purple-200 transition-all duration-300">
 <UserGroupIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Total Students
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:text-purple-400 transition-colors duration-300">
 {dashboardData.stats.totalStudents}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-purple-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min((dashboardData.stats.totalStudents / 200) * 100, 100)}%`,
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
 <div className="flex items-center">
 <div className="p-4 bg-yellow-500 rounded-xl shadow-lg group-hover:shadow-yellow-200 transition-all duration-300">
 <ChartBarIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Class Average
 </p>
 <p
 className={`text-3xl font-bold ${getScoreColor(
 dashboardData.stats.averageClassScore
 )} group-hover:scale-110 transition-transform duration-300 origin-left`}
 >
 {dashboardData.stats.averageClassScore}%
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${
 dashboardData.stats.averageClassScore >= 90
 ? " bg-green-500 "
 : dashboardData.stats.averageClassScore >= 80
 ? " bg-blue-500 "
 : dashboardData.stats.averageClassScore >= 70
 ? " bg-yellow-500 "
 : dashboardData.stats.averageClassScore >= 60
 ? " bg-orange-500 "
 : " bg-red-500 "
 }`}
 style={{ width: `${dashboardData.stats.averageClassScore}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Recent Student Activity */}
 <div className="lg:col-span-2">
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
 <PresentationChartLineIcon className="w-5 h-5 mr-2 text-indigo-500" />
 Recent Student Submissions
 </h2>
 </div>
 <div className="p-6">
 {dashboardData.recentActivity.length > 0 ? (
 <div className="space-y-4">
 {dashboardData.recentActivity.map((activity, index) => (
 <div
 key={index}
 className="group flex items-center space-x-4 p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-800"
 >
 <div className="p-3 bg-gray-50 dark: rounded-xl group-hover:scale-110 transition-transform duration-200">
 <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
 {activity.student}
 </p>
 <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">
 {activity.quiz}
 </p>
 <div className="flex items-center mt-1 space-x-2">
 <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
 {activity.course}
 </span>
 <span className="text-xs text-gray-500 dark:text-gray-500">
 {formatDateTime(activity.timestamp)}
 </span>
 </div>
 </div>
 <div className="text-right flex flex-col items-end">
 <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(activity.percentage)} border`}>
 <span className={getScoreColor(activity.percentage)}>
 {activity.score} ({activity.percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <ClockIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
 <p className="text-lg font-medium text-gray-900 dark:text-white">No recent student activity</p>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
 Student quiz submissions will appear here
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Course Performance */}
 <div>
 {dashboardData.coursePerformance.length > 0 ? (
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
 <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
 Course Performance
 </h2>
 </div>
 <div className="p-6">
 <div className="space-y-4">
 {dashboardData.coursePerformance.slice(0, 4).map((course, index) => (
 <div
 key={index}
 className={`p-4 rounded-xl border ${getScoreBgColor(
 course.averageScore
 )} hover:-translate-y-1 transition-transform duration-200 hover:shadow-md cursor-default`}
 >
 <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
 {course.course}
 </h3>
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
 <UserGroupIcon className="w-4 h-4 mr-1 opacity-70" />
 Students:
 </span>
 <span className="text-sm font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
 {course.students}
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
 <CheckCircleIcon className="w-4 h-4 mr-1 opacity-70" />
 Attempts:
 </span>
 <span className="text-sm font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
 {course.attempts}
 </span>
 </div>
 <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-gray-700/50 mt-1">
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 Average:
 </span>
 <span
 className={`text-sm font-bold ${getScoreColor(
 course.averageScore
 )}`}
 >
 {course.averageScore.toFixed(1)}%
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 flex flex-col justify-center items-center text-center h-full min-h-[300px]">
 <AcademicCapIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No Course Stats</h2>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
 Performance details will appear once students enroll and take quizzes.
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Recent Quizzes / My Courses merged similarly */}
 <div className="mt-8 grid grid-cols-1 gap-8">
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 flex items-center justify-between">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
 <BookOpenIcon className="w-5 h-5 mr-2 text-blue-500" />
 My Courses Overview
 </h2>
 <Link to="/my-courses" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
 View All &rarr;
 </Link>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {dashboardData.courses.length > 0 ? dashboardData.courses.map((course) => (
 <div
 key={course.id}
 className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl transition-shadow bg-white dark:bg-gray-800"
 >
 <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
 {course.name}
 </h3>
 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
 {course.description}
 </p>
 <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
 <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
 <ClockIcon className="w-3.5 h-3.5 mr-1" />
 {formatDate(course.createdAt)}
 </span>
 <div className="flex space-x-2">
 <button className="p-2 text-blue-600 dark:text-blue-400 bg-gray-50 dark: hover:bg-blue-100 dark:hover: rounded-lg transition-colors">
 <EyeIcon className="h-4 w-4" />
 </button>
 <button className="p-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
 <PencilIcon className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>
 )) : (
 <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
 <BookOpenIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
 <p className="text-gray-600 dark:text-gray-400">No courses created yet</p>
 <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow hover:shadow-lg">
 Create Course
 </button>
 </div>
 )}
 </div>
 </div>
 
 {dashboardData.quizzes.length > 0 && (
 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
 <ChartBarIcon className="w-5 h-5 mr-2 text-purple-500" />
 Recent Quizzes
 </h2>
 </div>
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
 <thead className="bg-gray-50/50 dark:bg-gray-900/30">
 <tr>
 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Quiz Name
 </th>
 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Course
 </th>
 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Attempts
 </th>
 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Average Score
 </th>
 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
 {dashboardData.quizzes.map((quiz) => (
 <tr key={quiz.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="h-8 w-8 rounded-full bg-purple-100 dark: flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
 <BookOpenIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
 </div>
 <span className="text-sm font-semibold text-gray-900 dark:text-white">
 {quiz.name}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
 {quiz.course}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
 <UserGroupIcon className="w-4 h-4 mr-1.5 text-gray-400" />
 {quiz.attempts}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${getScoreBgColor(quiz.averageScore)} border`}>
 <span className={getScoreColor(quiz.averageScore)}>
 {quiz.averageScore.toFixed(1)}%
 </span>
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
 <div className="flex space-x-2">
 <button className="p-1.5 bg-gray-50 dark: text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover: rounded transition-colors">
 <EyeIcon className="h-4 w-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>

 </div>
 </div>
 );
};

export default RealDataTeacherDashboard;
