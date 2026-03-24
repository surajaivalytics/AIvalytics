import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StudentAttendance from "../../components/StudentAttendance";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";
import {
 CalendarDaysIcon,
 ChartBarIcon,
 ShieldExclamationIcon,
 ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const StudentAttendancePage: React.FC = () => {
 const { user } = useAuth();
 const { isDark } = useTheme();
 const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");

 if (user?.role !== "student") {
 return (
 <div className={`min-h-screen flex items-center justify-center ${
 getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )
 }`}>
 <div className={`max-w-md w-full mx-auto p-8 rounded-xl shadow-lg ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <div className="text-center">
 <ShieldExclamationIcon className={`w-16 h-16 mx-auto mb-4 ${
 getThemedClasses(
 isDark,
 "text-red-500",
 "text-red-400"
 )
 }`} />
 <h1 className={`text-2xl font-bold mb-3 ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 Access Denied
 </h1>
 <p className={`${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 This page is only accessible to students. Please contact your administrator if you believe this is an error.
 </p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
 getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )
 }`}>
 <div className="max-w-7xl mx-auto">
 {/* Page Header */}
 <div className="mb-8">
 <h1 className={`text-2xl font-bold ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 Attendance Dashboard
 </h1>
 <p className={`mt-2 ${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 Track and monitor your attendance across all courses
 </p>
 </div>

 {/* Quick Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <div className={`p-6 rounded-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-lg ${
 getThemedClasses(
 isDark,
 "bg-emerald-50",
 "bg-emerald-900/30"
 )
 }`}>
 <ArrowTrendingUpIcon className={`w-6 h-6 ${
 getThemedClasses(
 isDark,
 "text-emerald-600",
 "text-emerald-400"
 )
 }`} />
 </div>
 <div>
 <p className={`text-sm font-medium ${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 Overall Attendance
 </p>
 <p className={`text-2xl font-bold ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 92.5%
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-lg ${
 getThemedClasses(
 isDark,
 "bg-gray-50",
 ""
 )
 }`}>
 <CalendarDaysIcon className={`w-6 h-6 ${
 getThemedClasses(
 isDark,
 "text-blue-600",
 "text-blue-400"
 )
 }`} />
 </div>
 <div>
 <p className={`text-sm font-medium ${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 Total Classes
 </p>
 <p className={`text-2xl font-bold ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 248
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-lg ${
 getThemedClasses(
 isDark,
 "bg-gray-50",
 ""
 )
 }`}>
 <ChartBarIcon className={`w-6 h-6 ${
 getThemedClasses(
 isDark,
 "text-purple-600",
 "text-purple-400"
 )
 }`} />
 </div>
 <div>
 <p className={`text-sm font-medium ${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 Present Days
 </p>
 <p className={`text-2xl font-bold ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 229
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-lg ${
 getThemedClasses(
 isDark,
 "bg-amber-50",
 "bg-amber-900/30"
 )
 }`}>
 <CalendarDaysIcon className={`w-6 h-6 ${
 getThemedClasses(
 isDark,
 "text-amber-600",
 "text-amber-400"
 )
 }`} />
 </div>
 <div>
 <p className={`text-sm font-medium ${
 getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-400"
 )
 }`}>
 Absent Days
 </p>
 <p className={`text-2xl font-bold ${
 getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )
 }`}>
 19
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Tab Navigation */}
 <div className={`mb-6 border-b ${
 getThemedClasses(
 isDark,
 "border-gray-200",
 "border-gray-700"
 )
 }`}>
 <div className="flex gap-1">
 <button
 className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
 activeTab === "summary"
 ? getThemedClasses(
 isDark,
 "bg-white text-primary-600 border-b-2 border-primary-600",
 "bg-gray-800 text-primary-400 border-b-2 border-primary-400"
 )
 : getThemedClasses(
 isDark,
 "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
 "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
 )
 }`}
 onClick={() => setActiveTab("summary")}
 >
 Summary View
 </button>
 <button
 className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
 activeTab === "history"
 ? getThemedClasses(
 isDark,
 "bg-white text-primary-600 border-b-2 border-primary-600",
 "bg-gray-800 text-primary-400 border-b-2 border-primary-400"
 )
 : getThemedClasses(
 isDark,
 "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
 "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
 )
 }`}
 onClick={() => setActiveTab("history")}
 >
 Detailed History
 </button>
 </div>
 </div>

 {/* Content Area */}
 <div className={`rounded-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-200",
 "bg-gray-800 border border-gray-700"
 )
 }`}>
 <StudentAttendance 
 studentId={user.id} 
 showHeader={true}
 />
 </div>
 </div>
 </div>
 );
};

export default StudentAttendancePage;
