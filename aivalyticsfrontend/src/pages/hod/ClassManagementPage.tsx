import React from "react";
import ClassManagement from "../../components/ClassManagement";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";

const ClassManagementPage: React.FC = () => {
 const { isDark } = useTheme();

 return (
 <>
 <div
 className={`min-h-full transition-colors duration-300 ${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 {/* Page Header */}
 <div
 className={`rounded-2xl shadow-2xl border p-6 mb-6 ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 <div className="flex items-center justify-between">
 <div>
 <h1
 className={`text-3xl font-bold mb-2 ${getThemedClasses(
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
 Manage classes, assign students, and organize your department's
 academic structure.
 </p>
 </div>
 <div className="hidden md:block">
 <div className="h-16 w-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
 <svg
 className="h-8 w-8 text-white"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
 />
 </svg>
 </div>
 </div>
 </div>
 </div>

 {/* Class Management Component */}
 <ClassManagement />
 </div>
 </>
 );
};

export default ClassManagementPage;
