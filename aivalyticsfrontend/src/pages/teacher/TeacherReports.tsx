import React from "react";
import { useNavigate } from "react-router-dom";
import MCQGenerator from "../../components/MCQGenerator";
import { Plus as PlusIcon } from "lucide-react";

const TeacherReports: React.FC = () => {
 const navigate = useNavigate();

 return (
 <>
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="space-y-6">
 {/* Quiz Management Header */}
 <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
 <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-500/[0.05]"></div>
 <div className="relative p-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-amber-600 dark:bg-amber-400 ">
 Reports & Quizzes
 </h2>
 <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
 Create and manage assessments
 </p>
 </div>
 <button
 onClick={() => navigate("/quiz-generator")}
 className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-200"
 >
 <PlusIcon className="h-4 w-4 mr-2" />
 New Quiz
 </button>
 </div>
 </div>
 </div>

 {/* Quiz Content */}
 <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
 <div className="p-6">
 <MCQGenerator />
 </div>
 </div>
 </div>
 </div>
 </div>
 </>
 );
};

export default TeacherReports;
