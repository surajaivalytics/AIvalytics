import React from "react";
import { useNavigate } from "react-router-dom";
import CourseManagement from "../../components/CourseManagement";
import { Plus as PlusIcon } from "lucide-react";

const TeacherAcademicManagement: React.FC = () => {
 const navigate = useNavigate();

 return (
 <>
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="space-y-6">
 {/* Course Management Header */}
 <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
 <div className="absolute inset-0 dark:bg-purple-500/[0.05]"></div>
 <div className="relative p-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-purple-600 dark:bg-purple-400 ">
 Academic Management
 </h2>
 <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
 Create and manage your educational content
 </p>
 </div>
 <button
 onClick={() => navigate("/courses/new")}
 className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
 >
 <PlusIcon className="h-4 w-4 mr-2" />
 New Course
 </button>
 </div>
 </div>
 </div>

 {/* Course Management Content */}
 <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
 <div className="p-6">
 <CourseManagement />
 </div>
 </div>
 </div>
 </div>
 </div>
 </>
 );
};

export default TeacherAcademicManagement;
