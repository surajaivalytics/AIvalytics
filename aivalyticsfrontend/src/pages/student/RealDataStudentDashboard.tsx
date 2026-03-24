import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
 AcademicCapIcon,
 BookOpenIcon,
 TrophyIcon,
 ClockIcon,
 ChartBarIcon,
 CalendarIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 ArrowTrendingUpIcon,
 ArrowTrendingDownIcon,
 PlayIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardApi";
import { courseService } from "../../services/courseApi";
import { Course } from "../../types/course";
import ModuleCompletionStatus from "../../components/ModuleCompletionStatus";
import Leaderboard from "../../components/Leaderboard";

interface DashboardData {
 user: {
 id: number;
 name: string;
 role: string;
 };
 stats: {
 enrolledCourses: number;
 completedQuizzes: number;
 averageScore: number;
 totalPoints: number;
 };
 recentActivity: Array<{
 id: number;
 type: string;
 title: string;
 course: string;
 score: string;
 percentage: number;
 timestamp: string;
 }>;
 subjectPerformance: Array<{
 subject: string;
 attempts: number;
 averageScore: number;
 totalScore: number;
 totalMaxScore: number;
 }>;
 upcomingDeadlines: Array<{
 id: number;
 title: string;
 course: string;
 dueDate: string;
 type: string;
 }>;
 performanceTrend: {
 labels: string[];
 data: number[];
 };
}

const RealDataStudentDashboard: React.FC = () => {
 const { user } = useAuth();
 const [dashboardData, setDashboardData] = useState<DashboardData | null>(
 null
 );
 const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetchDashboardData();
 }, []);

 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 setError(null);

 console.log("📊 Fetching student dashboard data...");

 // Fetch dashboard data and courses in parallel
 const [dashboardResponse, coursesResponse] = await Promise.all([
 dashboardService.getStudentDashboard(),
 courseService
 .getCourses({ limit: 10 })
 .catch(() => ({ success: false, courses: [] })),
 ]);

 if (dashboardResponse.success && dashboardResponse.data) {
 setDashboardData(dashboardResponse.data);
 console.log("✅ Dashboard data loaded:", dashboardResponse.data);
 } else {
 setError(dashboardResponse.message || "Failed to load dashboard data");
 }

 // Set enrolled courses if available
 if (coursesResponse.success && coursesResponse.courses) {
 const enrolled = coursesResponse.courses.filter(
 (course: Course) => course.isEnrolled
 );
 setEnrolledCourses(enrolled);
 console.log("✅ Enrolled courses loaded:", enrolled);
 }
 } catch (err: any) {
 console.error("❌ Dashboard error:", err);
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
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const getDaysUntilDeadline = (dueDate: string) => {
 const now = new Date();
 const deadline = new Date(dueDate);
 const diffTime = deadline.getTime() - now.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
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
 <div className="h-2 w-2 bg-gray-50 dark: rounded-full animate-bounce"></div>
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
 Welcome back, {dashboardData.user.name}! 🎓
 </h1>
 <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
 Here's your academic progress overview
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
 <Link to="/quizzes" className="inline-flex items-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
 <PlayIcon className="w-5 h-5 mr-2" />
 Take Quizzes
 </Link>
 <Link to="/courses" className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
 <BookOpenIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
 View Courses
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
 Enrolled Courses
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:text-blue-400 transition-colors duration-300">
 {dashboardData.stats.enrolledCourses}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-blue-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min(
 (dashboardData.stats.enrolledCourses / 10) * 100,
 100
 )}%`,
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
 Completed Quizzes
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:text-green-400 transition-colors duration-300">
 {dashboardData.stats.completedQuizzes}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-green-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min(
 (dashboardData.stats.completedQuizzes / 20) * 100,
 100
 )}%`,
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
 <TrophyIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Average Score
 </p>
 <p
 className={`text-3xl font-bold transition-colors duration-300 ${getScoreColor(
 dashboardData.stats.averageScore
 )} group-hover:scale-110`}
 >
 {dashboardData.stats.averageScore}%
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${
 dashboardData.stats.averageScore >= 90
 ? " bg-green-500 "
 : dashboardData.stats.averageScore >= 80
 ? " bg-blue-500 "
 : dashboardData.stats.averageScore >= 70
 ? " bg-yellow-500 "
 : dashboardData.stats.averageScore >= 60
 ? " bg-orange-500 "
 : " bg-red-500 "
 }`}
 style={{ width: `${dashboardData.stats.averageScore}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
 <div className="flex items-center">
 <div className="p-4 bg-purple-500 rounded-xl shadow-lg group-hover:shadow-purple-200 transition-all duration-300">
 <ChartBarIcon className="h-8 w-8 text-white" />
 </div>
 <div className="ml-4 flex-1">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
 Total Points
 </p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300">
 {dashboardData.stats.totalPoints}
 </p>
 <div className="mt-1 flex items-center">
 <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-purple-500 rounded-full transition-all duration-1000"
 style={{
 width: `${Math.min(
 (dashboardData.stats.totalPoints / 1000) * 100,
 100
 )}%`,
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Module Completion Status */}
 {enrolledCourses.length > 0 && (
 <div className="mb-8">
 <ModuleCompletionStatus courses={enrolledCourses} />
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Recent Activity */}
 <div className="lg:col-span-2">
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
 Recent Activity
 </h2>
 </div>
 <div className="p-6">
 {dashboardData.recentActivity.length > 0 ? (
 <div className="space-y-4">
 {dashboardData.recentActivity.map((activity, index) => (
 <div
 key={index}
 className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
 >
 <div className="p-2 bg-blue-100 rounded-lg">
 <PlayIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
 </div>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-900 dark:text-white">
 {activity.title}
 </p>
 <p className="text-sm text-gray-600 dark:text-gray-400">
 {activity.course}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 {formatDate(activity.timestamp)}
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm font-medium text-gray-900 dark:text-white">
 {activity.score}
 </p>
 <p
 className={`text-sm ${getScoreColor(
 activity.percentage
 )}`}
 >
 {activity.percentage.toFixed(1)}%
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
 <p className="text-sm text-gray-500 dark:text-gray-400">
 Complete some quizzes to see your activity here
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Upcoming Deadlines */}
 <div>
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
 Upcoming Deadlines
 </h2>
 </div>
 <div className="p-6">
 {dashboardData.upcomingDeadlines.length > 0 ? (
 <div className="space-y-4">
 {dashboardData.upcomingDeadlines.map((deadline) => {
 const daysLeft = getDaysUntilDeadline(deadline.dueDate);
 return (
 <div
 key={deadline.id}
 className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
 >
 <div className="p-2 bg-orange-100 rounded-lg">
 <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
 </div>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-900 dark:text-white">
 {deadline.title}
 </p>
 <p className="text-xs text-gray-600 dark:text-gray-400">
 {deadline.course}
 </p>
 <p
 className={`text-xs ${
 daysLeft <= 1
 ? "text-red-600 dark:text-red-400"
 : daysLeft <= 3
 ? "text-orange-600 dark:text-orange-400"
 : "text-gray-500 dark:text-gray-400"
 }`}
 >
 {daysLeft === 0
 ? "Due today"
 : daysLeft === 1
 ? "Due tomorrow"
 : `${daysLeft} days left`}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="text-center py-6">
 <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
 <p className="text-sm text-gray-600 dark:text-gray-400">
 No upcoming deadlines
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Leaderboard */}
 <div className="mt-6">
 <Leaderboard maxItems={5} />
 </div>
 </div>
 </div>

 {/* Subject Performance */}
 {dashboardData.subjectPerformance.length > 0 && (
 <div className="mt-8">
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
 Subject Performance
 </h2>
 </div>
 <div className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {dashboardData.subjectPerformance.map((subject, index) => (
 <div
 key={index}
 className={`p-4 rounded-lg border-2 ${getScoreBgColor(
 subject.averageScore
 )}`}
 >
 <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
 {subject.subject}
 </h3>
 <div className="space-y-2">
 <div className="flex justify-between">
 <span className="text-sm text-gray-600 dark:text-gray-400">
 Average Score:
 </span>
 <span
 className={`text-sm font-medium ${getScoreColor(
 subject.averageScore
 )}`}
 >
 {subject.averageScore.toFixed(1)}%
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-sm text-gray-600 dark:text-gray-400">
 Attempts:
 </span>
 <span className="text-sm font-medium text-gray-900 dark:text-white">
 {subject.attempts}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-sm text-gray-600 dark:text-gray-400">
 Total Score:
 </span>
 <span className="text-sm font-medium text-gray-900 dark:text-white">
 {subject.totalScore}/{subject.totalMaxScore}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Performance Trend */}
 {dashboardData.performanceTrend.data.length > 0 && (
 <div className="mt-8">
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
 <div className="p-6 border-b border-gray-200 dark:border-gray-700">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
 Performance Trend
 </h2>
 </div>
 <div className="p-6">
 <div className="flex items-center space-x-4">
 {dashboardData.performanceTrend.data.map((score, index) => (
 <div key={index} className="text-center">
 <div
 className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBgColor(
 score
 )}`}
 >
 <span
 className={`text-sm font-bold ${getScoreColor(
 score
 )}`}
 >
 {score.toFixed(0)}%
 </span>
 </div>
 <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
 {dashboardData.performanceTrend.labels[index]}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default RealDataStudentDashboard;
