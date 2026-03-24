import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
 AcademicCapIcon,
 ComputerDesktopIcon,
 CpuChipIcon,
 ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Course } from "../types/course";

interface ModuleData {
 id: string;
 name: string;
 progress: number;
 lastAccessed: string;
 status: "just_started" | "in_progress" | "almost_complete";
 icon: React.ComponentType<{ className?: string }>;
 color: string;
 bgColor: string;
 progressColor: string;
 comparisonText: string;
}

interface ModuleCompletionStatusProps {
 courses: Course[];
 title?: string;
}

const ModuleCompletionStatus: React.FC<ModuleCompletionStatusProps> = ({
 courses,
 title = "Module Completion Status",
}) => {
 const { isDark } = useTheme();

 // Transform courses into module data format
 const getModuleData = (): ModuleData[] => {
 // Sample progress values to demonstrate the component
 const sampleProgress = [90, 75, 45];

 return courses.slice(0, 3).map((course, index) => {
 const progress =
 course.progress_percentage ||
 sampleProgress[index] ||
 Math.floor(Math.random() * 100);
 const icons = [AcademicCapIcon, ComputerDesktopIcon, CpuChipIcon];
 const colors = [
 {
 color: "text-green-600",
 bgColor: "bg-gray-50",
 progressColor: "bg-green-500",
 },
 {
 color: "text-blue-600",
 bgColor: "bg-gray-50",
 progressColor: "bg-blue-500",
 },
 {
 color: "text-purple-600",
 bgColor: "bg-gray-50",
 progressColor: "bg-purple-500",
 },
 ];

 let status: ModuleData["status"] = "just_started";
 if (progress >= 90) status = "almost_complete";
 else if (progress >= 75) status = "in_progress";

 const colorConfig = colors[index % colors.length];

 return {
 id: course.id,
 name: course.name,
 progress,
 lastAccessed: course.updated_at || course.created_at,
 status,
 icon: icons[index % icons.length],
 ...colorConfig,
 comparisonText:
 progress > 85
 ? "+8% above average"
 : progress > 65
 ? "+3% above average"
 : "+7% above average",
 };
 });
 };

 const modules = getModuleData();

 const getStatusBadge = (status: ModuleData["status"]) => {
 const badges = {
 just_started: { text: "Just Started (<75%)", color: "text-purple-600" },
 in_progress: { text: "In Progress (75-89%)", color: "text-blue-600" },
 almost_complete: {
 text: "Almost Complete (≥90%)",
 color: "text-green-600",
 },
 };
 return badges[status];
 };

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString("en-US", {
 month: "numeric",
 day: "numeric",
 year: "numeric",
 });
 };

 if (modules.length === 0) {
 return null;
 }

 return (
 <div
 className={`rounded-2xl shadow-lg border overflow-hidden ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800 border-gray-700"
 )}`}
 >
 {/* Header */}
 <div
 className={`p-6 border-b ${getThemedClasses(
 isDark,
 "border-gray-200",
 "border-gray-700"
 )}`}
 >
 <div className="flex items-center justify-between">
 <h3
 className={`text-lg font-semibold flex items-center font-primary ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 <AcademicCapIcon className="h-5 w-5 mr-2 text-indigo-500" />
 {title}
 </h3>
 <ChevronRightIcon
 className={`h-5 w-5 ${getThemedClasses(
 isDark,
 "text-gray-400",
 "text-gray-500"
 )}`}
 />
 </div>
 </div>

 {/* Module List */}
 <div className="p-6 space-y-6 font-secondary">
 {modules.map((module) => {
 const IconComponent = module.icon;
 const statusBadge = getStatusBadge(module.status);

 return (
 <div key={module.id} className="space-y-3">
 {/* Module Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div
 className={`p-2 rounded-lg ${
 isDark ? "bg-gray-700" : module.bgColor
 }`}
 >
 <IconComponent
 className={`h-5 w-5 ${
 isDark ? "text-gray-300" : module.color
 }`}
 />
 </div>
 <div>
 <h4
 className={`font-medium font-primary ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 {module.name}
 </h4>
 <p
 className={`text-sm ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 Last accessed: {formatDate(module.lastAccessed)}
 </p>
 </div>
 </div>
 <div className="text-right">
 <div
 className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
 isDark
 ? "bg-gray-700 text-gray-300"
 : `${statusBadge.color} bg-gray-100`
 }`}
 >
 {module.progress}%
 </div>
 </div>
 </div>

 {/* Progress Bar */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <div className="w-full">
 <div
 className={`h-2 rounded-full overflow-hidden ${getThemedClasses(
 isDark,
 "bg-gray-200",
 "bg-gray-700"
 )}`}
 >
 <div
 className={`h-full rounded-full transition-all duration-500 ${
 isDark ? "bg-indigo-500" : module.progressColor
 }`}
 style={{ width: `${module.progress}%` }}
 ></div>
 </div>
 </div>
 <span
 className={`ml-3 text-xs font-medium ${
 isDark ? "text-indigo-400" : module.color
 }`}
 >
 {module.progress}%
 </span>
 </div>

 {/* Comparison Text */}
 <p
 className={`text-xs ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 {module.comparisonText}
 </p>
 </div>
 </div>
 );
 })}

 {/* Legend */}
 <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
 <div className="flex items-center">
 <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
 <span className="text-xs">Just Started (&lt;75%)</span>
 </div>
 <div className="flex items-center">
 <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
 <span className="text-xs">In Progress (75-89%)</span>
 </div>
 <div className="flex items-center">
 <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
 <span className="text-xs">Almost Complete (≥90%)</span>
 </div>
 </div>
 </div>
 </div>
 );
};

export default ModuleCompletionStatus;
