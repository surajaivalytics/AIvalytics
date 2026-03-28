import React from "react";
import { Link } from "react-router-dom";

const TeacherStudentsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Students
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Monitor and track your students' academic progress.
          </p>
        </div>

        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Student Progress Tracker Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Progress Tracker</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Accuracy</th>
                    <th className="px-6 py-4 font-medium">Quizzes</th>
                    <th className="px-6 py-4 font-medium">Weak Areas</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {[
                    { name: "John Smith", accuracy: 85, trend: "up", quizzes: 12, weakAreas: ["Calculus", "Neural Networks"] },
                    { name: "Maria Rodriguez", accuracy: 72, trend: "neutral", quizzes: 10, weakAreas: ["Statistics"] },
                    { name: "Alex Johnson", accuracy: 58, trend: "down", quizzes: 11, weakAreas: ["Linear Algebra", "Algorithms", "Probability"] },
                    { name: "Sarah Chen", accuracy: 94, trend: "up", quizzes: 12, weakAreas: [] },
                  ].map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition dark:text-gray-200">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{student.accuracy}%</span>
                          {student.trend === "up" && <span className="text-emerald-500 text-lg leading-none mt-1">↑</span>}
                          {student.trend === "neutral" && <span className="text-gray-400 text-lg leading-none mt-1">—</span>}
                          {student.trend === "down" && <span className="text-red-500 text-lg leading-none mt-1">↓</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.quizzes}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {student.weakAreas.map((area, aIdx) => (
                            <span key={aIdx} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow-sm">
                          Support
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentsPage;
