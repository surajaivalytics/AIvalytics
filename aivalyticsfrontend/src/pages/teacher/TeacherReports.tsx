import React from "react";
import { 
  FileText, 
  Download, 
  Brain, 
  Sparkles,
  UserCheck,
  TrendingUp,
  FileBadge2,
  LineChart
} from "lucide-react";

const TeacherReports: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Smart Report Generator
          </h1>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
            <Sparkles className="w-4 h-4" />
            Generate New AI Report
          </button>
        </div>

        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Section 1: Static Reports Grid (Top Section) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Class Engagement Report</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Summary of student engagement metrics, quiz completion rates, and content interactions.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-6">
                  Last updated: May 1, 2025
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Learning Trends Analysis</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Detailed breakdown of learning progress, topic mastery levels, and knowledge gaps.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-6">
                  Last updated: April 28, 2025
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">NAAC-Ready Performance Stats</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Formatted report suitable for NAAC accreditation submissions with all required metrics.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-6">
                  Last updated: April 25, 2025
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Teaching Effectiveness Report</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Analysis of teaching impact, content effectiveness, and suggested improvements.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-6">
                  Last updated: April 22, 2025
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

          </div>

          {/* Section 2: AI Report Generation Section (Bottom) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col pt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Report Generation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create detailed reports with AI-powered insights and recommendations</p>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Feature Banner */}
              <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-800/50">
                <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-blue-900 dark:text-blue-100">AI-Powered Report Generator</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Generate intelligent reports with insights and recommendations based on educational data.
                  </p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Student Performance</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Individual student analytics with personalized improvement plans.</p>
                </div>
                
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Class Overview</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aggregated class metrics with topic mastery breakdowns.</p>
                </div>
                
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FileBadge2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">NAAC/NBA Ready</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accreditation-ready reports with required parameters.</p>
                </div>
                
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Trend Analysis</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Long-term performance pattern detection and forecasting.</p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full flex justify-center items-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
                <Brain className="w-5 h-5" />
                Open AI Report Generator
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherReports;
