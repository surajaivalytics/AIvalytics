import React, { useState, useEffect } from "react";
import {
 ChartBarIcon,
 ClockIcon,
 AcademicCapIcon,
 ArrowTrendingUpIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 PlayIcon,
 PauseIcon,
 UserGroupIcon,
 ClipboardDocumentListIcon,
 TrophyIcon,
 CalendarIcon,
 EyeIcon,
} from "@heroicons/react/24/outline";
import { courseService } from "../services/courseApi";
import { mcqService } from "../services/mcqApi";
import { CourseTimelineAnalytics, Course } from "../types/course";
import { useAuth } from "../contexts/AuthContext";
import CourseCard from "./CourseCard";

interface CourseTimelineAnalyticsProps {
 onTabChange?: (tab: string) => void;
}

interface QuizAnalytics {
 totalQuizzes: number;
 totalSubmissions: number;
 averageScore: number;
 highestScore: number;
 lowestScore: number;
 passRate: number;
 recentQuizzes: any[];
}

interface EnhancedAnalytics extends CourseTimelineAnalytics {
 quizAnalytics: QuizAnalytics;
 topPerformingCourses: Course[];
 recentActivity: any[];
}

const CourseTimelineAnalyticsComponent: React.FC<
 CourseTimelineAnalyticsProps
> = ({ onTabChange }) => {
 const { user } = useAuth();
 const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
 const [courses, setCourses] = useState<Course[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedTimeframe, setSelectedTimeframe] = useState<
 "week" | "month" | "semester"
 >("month");

 useEffect(() => {
 fetchComprehensiveAnalytics();
 }, [selectedTimeframe]);

 const fetchComprehensiveAnalytics = async () => {
 try {
 setLoading(true);
 setError(null);

 console.log("🔄 Starting analytics fetch...");

 // Initialize with empty data
 let courseAnalytics: CourseTimelineAnalytics = {
 totalCourses: 0,
 activeCoursesCount: 0,
 notStartedCount: 0,
 inProgressCount: 0,
 completedCount: 0,
 totalEnrollments: 0,
 averageProgress: 0,
 coursesEndingSoon: 0,
 };
 let teacherCourses: Course[] = [];
 let quizAnalytics: QuizAnalytics = {
 totalQuizzes: 0,
 totalSubmissions: 0,
 averageScore: 0,
 highestScore: 0,
 lowestScore: 0,
 passRate: 0,
 recentQuizzes: [],
 };

 // Fetch course analytics with error handling
 try {
 console.log("📊 Fetching course analytics...");
 const courseResponse = await courseService.getTimelineAnalytics();
 if (courseResponse.success && courseResponse.analytics) {
 courseAnalytics = courseResponse.analytics;
 setCourses(courseResponse.courses || []);
 console.log(
 "✅ Course analytics fetched successfully:",
 courseAnalytics
 );
 } else {
 console.log(
 "⚠️ Course analytics returned empty or failed:",
 courseResponse
 );
 }
 } catch (courseError: any) {
 console.error("❌ Course analytics fetch failed:", courseError);
 // Don't fail the entire request, just log the error
 }

 // Fetch teacher's courses with error handling
 try {
 console.log("👨‍🏫 Fetching teacher courses...");
 const teacherCoursesResponse = await courseService.getTeacherCourses({
 limit: 50,
 });
 if (teacherCoursesResponse.success) {
 teacherCourses = teacherCoursesResponse.courses;
 console.log(
 "✅ Teacher courses fetched successfully:",
 teacherCourses.length
 );
 } else {
 console.log(
 "⚠️ Teacher courses returned empty or failed:",
 teacherCoursesResponse
 );
 }
 } catch (teacherError: any) {
 console.error("❌ Teacher courses fetch failed:", teacherError);
 // Don't fail the entire request, just log the error
 }

 // Fetch quiz analytics with error handling
 try {
 console.log("🧠 Fetching quiz analytics...");
 const quizAnalyticsResponse = await mcqService.getQuizAnalytics();
 if (quizAnalyticsResponse.success) {
 const backendAnalytics = quizAnalyticsResponse.data;
 quizAnalytics = {
 totalQuizzes: backendAnalytics.totalQuizzes,
 totalSubmissions: backendAnalytics.totalSubmissions,
 averageScore: backendAnalytics.averageScore,
 highestScore: backendAnalytics.highestScore,
 lowestScore: backendAnalytics.lowestScore,
 passRate: backendAnalytics.passRate,
 recentQuizzes: backendAnalytics.recentQuizzes,
 };
 console.log("✅ Quiz analytics fetched successfully:", quizAnalytics);
 } else {
 console.log(
 "⚠️ Quiz analytics returned empty or failed:",
 quizAnalyticsResponse
 );
 }
 } catch (quizError: any) {
 console.error("❌ Quiz analytics fetch failed:", quizError);
 // Don't fail the entire request, just log the error
 }

 // Find top performing courses
 const topPerformingCourses = teacherCourses
 .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
 .slice(0, 3);

 // Generate recent activity
 const recentActivity = [
 ...teacherCourses.slice(0, 3).map((course) => ({
 type: "course",
 title: `Course "${course.name}" updated`,
 description: `${course.enrollmentCount || 0} students enrolled`,
 timestamp: course.updated_at || course.created_at,
 icon: AcademicCapIcon,
 color: "blue",
 })),
 ...quizAnalytics.recentQuizzes.slice(0, 2).map((quiz) => ({
 type: "quiz",
 title: `Quiz "${quiz.name}" created`,
 description: `${quiz.question_count || 20} questions generated`,
 timestamp: quiz.created_at,
 icon: ClipboardDocumentListIcon,
 color: "green",
 })),
 ]
 .sort(
 (a, b) =>
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
 )
 .slice(0, 5);

 const enhancedAnalytics: EnhancedAnalytics = {
 ...courseAnalytics,
 quizAnalytics,
 topPerformingCourses,
 recentActivity,
 };

 console.log("🎯 Final analytics data:", enhancedAnalytics);
 setAnalytics(enhancedAnalytics);
 setCourses(teacherCourses);
 } catch (err: any) {
 console.error("❌ Analytics fetch error:", err);
 setError(
 err.response?.data?.message ||
 err.message ||
 "Failed to fetch analytics"
 );
 } finally {
 setLoading(false);
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "not_started":
 return <PauseIcon className="h-5 w-5 text-gray-500" />;
 case "in_progress":
 return <PlayIcon className="h-5 w-5 text-blue-500" />;
 case "completed":
 return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
 default:
 return <ClockIcon className="h-5 w-5 text-gray-400" />;
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

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric",
 });
 };

 const getActivityIcon = (type: string) => {
 switch (type) {
 case "course":
 return AcademicCapIcon;
 case "quiz":
 return ClipboardDocumentListIcon;
 default:
 return CalendarIcon;
 }
 };

 const getActivityColor = (color: string) => {
 switch (color) {
 case "blue":
 return "bg-blue-100 text-blue-600";
 case "green":
 return "bg-green-100 text-green-600";
 case "yellow":
 return "bg-yellow-100 text-yellow-600";
 default:
 return "bg-gray-100 text-gray-600";
 }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="bg-gray-50 border border-red-200 rounded-md p-4">
 <div className="flex">
 <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800">Error</h3>
 <p className="text-sm text-red-700 mt-1">{error}</p>
 </div>
 </div>
 </div>
 );
 }

 if (!analytics) {
 return (
 <div className="text-center py-8">
 <p className="text-gray-500">No analytics data available</p>
 </div>
 );
 }

 // Show empty state if no courses exist
 if (analytics.totalCourses === 0) {
 return (
 <div className="space-y-6">
 {/* Analytics Cards with zero values */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <AcademicCapIcon className="h-6 w-6 text-gray-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Total Courses
 </dt>
 <dd className="text-lg font-medium text-gray-900">0</dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <UserGroupIcon className="h-6 w-6 text-blue-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Total Students
 </dt>
 <dd className="text-lg font-medium text-gray-900">0</dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <ClipboardDocumentListIcon className="h-6 w-6 text-green-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Total Quizzes
 </dt>
 <dd className="text-lg font-medium text-gray-900">0</dd>
 </dl>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <TrophyIcon className="h-6 w-6 text-purple-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Avg Quiz Score
 </dt>
 <dd className="text-lg font-medium text-gray-900">0%</dd>
 </dl>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Empty State Message */}
 <div className="bg-white shadow rounded-lg">
 <div className="px-4 py-12 text-center">
 <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">
 No Courses Created Yet
 </h3>
 <p className="text-gray-500 mb-4">
 Create your first course to start seeing comprehensive analytics
 including student progress, quiz performance, and engagement
 metrics.
 </p>
 <button
 onClick={() =>
 onTabChange
 ? onTabChange("courses")
 : (window.location.href = "#courses")
 }
 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
 >
 <AcademicCapIcon className="h-5 w-5" />
 Create Your First Course
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header with Timeframe Selector */}
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">
 Teaching Analytics
 </h2>
 <p className="text-gray-600">
 Comprehensive insights into your courses and student performance
 </p>
 </div>
 <div className="flex space-x-2">
 {(["week", "month", "semester"] as const).map((timeframe) => (
 <button
 key={timeframe}
 onClick={() => setSelectedTimeframe(timeframe)}
 className={`px-3 py-2 rounded-md text-sm font-medium ${
 selectedTimeframe === timeframe
 ? "bg-blue-600 text-white"
 : "bg-white text-gray-700 hover:bg-gray-50"
 }`}
 >
 {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
 </button>
 ))}
 </div>
 </div>

 {/* Enhanced Analytics Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <AcademicCapIcon className="h-6 w-6 text-blue-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Active Courses
 </dt>
 <dd className="text-lg font-medium text-gray-900">
 {analytics.activeCoursesCount}
 </dd>
 </dl>
 </div>
 </div>
 <div className="mt-2">
 <div className="text-sm text-gray-600">
 {analytics.totalCourses} total courses
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <UserGroupIcon className="h-6 w-6 text-green-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Total Students
 </dt>
 <dd className="text-lg font-medium text-gray-900">
 {analytics.totalEnrollments}
 </dd>
 </dl>
 </div>
 </div>
 <div className="mt-2">
 <div className="text-sm text-gray-600">Across all courses</div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <ClipboardDocumentListIcon className="h-6 w-6 text-purple-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Generated Quizzes
 </dt>
 <dd className="text-lg font-medium text-gray-900">
 {analytics.quizAnalytics.totalQuizzes}
 </dd>
 </dl>
 </div>
 </div>
 <div className="mt-2">
 <div className="text-sm text-gray-600">
 {analytics.quizAnalytics.totalSubmissions} submissions
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white overflow-hidden shadow rounded-lg">
 <div className="p-5">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <TrophyIcon className="h-6 w-6 text-yellow-400" />
 </div>
 <div className="ml-5 w-0 flex-1">
 <dl>
 <dt className="text-sm font-medium text-gray-500 truncate">
 Avg Quiz Score
 </dt>
 <dd className="text-lg font-medium text-gray-900">
 {analytics.quizAnalytics.averageScore}%
 </dd>
 </dl>
 </div>
 </div>
 <div className="mt-2">
 <div className="text-sm text-gray-600">
 {analytics.quizAnalytics.passRate}% pass rate
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Course Performance Overview */}
 <div className="lg:col-span-2 bg-white shadow rounded-lg">
 <div className="px-4 py-5 sm:p-6">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
 Course Performance Overview
 </h3>
 <div className="space-y-4">
 {courses.slice(0, 5).map((course) => (
 <CourseCard key={course.id} course={course} compact={true} />
 ))}
 </div>
 </div>
 </div>

 {/* Recent Activity */}
 <div className="bg-white shadow rounded-lg">
 <div className="px-4 py-5 sm:p-6">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
 Recent Activity
 </h3>
 <div className="space-y-4">
 {analytics.recentActivity.map((activity, index) => {
 const Icon = getActivityIcon(activity.type);
 return (
 <div key={index} className="flex items-start space-x-3">
 <div
 className={`p-2 rounded-full ${getActivityColor(
 activity.color
 )}`}
 >
 <Icon className="h-4 w-4" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900">
 {activity.title}
 </p>
 <p className="text-sm text-gray-500">
 {activity.description}
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {formatDate(activity.timestamp)}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {/* Quiz Analytics Section */}
 {analytics.quizAnalytics.totalQuizzes > 0 && (
 <div className="bg-white shadow rounded-lg">
 <div className="px-4 py-5 sm:p-6">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
 Quiz Performance Analytics
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
 <div className="text-center">
 <div className="text-2xl font-bold text-green-600">
 {analytics.quizAnalytics.averageScore}%
 </div>
 <div className="text-sm text-gray-500">Average Score</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-blue-600">
 {analytics.quizAnalytics.highestScore}%
 </div>
 <div className="text-sm text-gray-500">Highest Score</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-yellow-600">
 {analytics.quizAnalytics.lowestScore}%
 </div>
 <div className="text-sm text-gray-500">Lowest Score</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-purple-600">
 {analytics.quizAnalytics.passRate}%
 </div>
 <div className="text-sm text-gray-500">Pass Rate</div>
 </div>
 </div>

 <div className="space-y-3">
 <h4 className="font-medium text-gray-900">Recent Quizzes</h4>
 {analytics.quizAnalytics.recentQuizzes.map((quiz) => (
 <div
 key={quiz.id}
 className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
 >
 <div className="flex items-center space-x-3">
 <ClipboardDocumentListIcon className="h-5 w-5 text-green-500" />
 <div>
 <p className="text-sm font-medium text-gray-900">
 {quiz.name}
 </p>
 <p className="text-sm text-gray-500">
 {quiz.course?.name} • {quiz.question_count || 20}{" "}
 questions • {quiz.submissions_count || 0} submissions
 </p>
 </div>
 </div>
 <div className="text-sm text-gray-500">
 {formatDate(quiz.created_at)}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Course Status Breakdown */}
 <div className="bg-white shadow rounded-lg">
 <div className="px-4 py-5 sm:p-6">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
 Course Status Breakdown
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-gray-600">
 {analytics.notStartedCount}
 </div>
 <div className="text-sm text-gray-500">Not Started</div>
 <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
 <div
 className="bg-gray-500 h-2 rounded-full"
 style={{
 width: `${
 analytics.totalCourses > 0
 ? (analytics.notStartedCount / analytics.totalCourses) *
 100
 : 0
 }%`,
 }}
 ></div>
 </div>
 </div>
 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-blue-600">
 {analytics.inProgressCount}
 </div>
 <div className="text-sm text-gray-500">In Progress</div>
 <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
 <div
 className="bg-blue-500 h-2 rounded-full"
 style={{
 width: `${
 analytics.totalCourses > 0
 ? (analytics.inProgressCount / analytics.totalCourses) *
 100
 : 0
 }%`,
 }}
 ></div>
 </div>
 </div>
 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-green-600">
 {analytics.completedCount}
 </div>
 <div className="text-sm text-gray-500">Completed</div>
 <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
 <div
 className="bg-green-500 h-2 rounded-full"
 style={{
 width: `${
 analytics.totalCourses > 0
 ? (analytics.completedCount / analytics.totalCourses) *
 100
 : 0
 }%`,
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Top Performing Courses */}
 {analytics.topPerformingCourses.length > 0 && (
 <div className="bg-white shadow rounded-lg">
 <div className="px-4 py-5 sm:p-6">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
 Top Performing Courses
 </h3>
 <div className="space-y-4">
 {analytics.topPerformingCourses.map((course, index) => (
 <CourseCard
 key={course.id}
 course={course}
 compact={true}
 showRank={index + 1}
 />
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Courses Ending Soon Alert */}
 {analytics.coursesEndingSoon > 0 && (
 <div className="bg-gray-50 border border-yellow-200 rounded-md p-4">
 <div className="flex">
 <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
 <div className="ml-3">
 <h3 className="text-sm font-medium text-yellow-800">
 Courses Ending Soon
 </h3>
 <p className="text-sm text-yellow-700 mt-1">
 {analytics.coursesEndingSoon} course(s) will end within the next
 30 days. Consider extending duration or preparing final
 assessments.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default CourseTimelineAnalyticsComponent;
