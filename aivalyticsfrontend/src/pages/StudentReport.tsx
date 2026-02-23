import React, { useState } from "react";
import Layout from "../components/Layout";
import StudentPerformanceReportComponent from "../components/StudentPerformanceReport";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
  DocumentChartBarIcon,
  InformationCircleIcon,
  ChartBarIcon,
  AcademicCapIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

const StudentReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isDark } = useTheme();

  const features = [
    {
      icon: ChartBarIcon,
      title: "Performance Analytics",
      description: "Comprehensive analysis of your academic performance across all subjects",
    },
    {
      icon: LightBulbIcon,
      title: "AI-Powered Insights",
      description: "Personalized recommendations and study suggestions powered by AI",
    },
    {
      icon: DocumentChartBarIcon,
      title: "Achievement Tracking",
      description: "Track your progress, strengths, and areas for improvement",
    },
    {
      icon: AcademicCapIcon,
      title: "Subject-wise Analysis",
      description: "Detailed breakdown of performance in each subject and course",
    },
  ];

  return (
    <Layout>
      <div className={`min-h-screen ${getThemedClasses(isDark, "bg-gray-50", "bg-gray-900")}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Modern Header with Generate Report CTA */}
          <div className={`relative overflow-hidden rounded-2xl p-8 mb-8 ${getThemedClasses(
            isDark,
            "bg-white shadow-sm border border-gray-100",
            "bg-gray-800 border border-gray-700"
          )}`}>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getThemedClasses(
                    isDark,
                    "bg-blue-50",
                    "bg-blue-900/20"
                  )}`}>
                    <DocumentChartBarIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h1 className={`text-2xl font-semibold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}>
                    Academic Performance Report
                  </h1>
                </div>
                <p className={`max-w-2xl ${getThemedClasses(
                  isDark,
                  "text-gray-600",
                  "text-gray-300"
                )}`}>
                  Get comprehensive insights into your academic performance with detailed analytics and personalized recommendations.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 ${
                  isDark 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-blue-600 hover:bg-blue-700"
                } shadow-sm hover:shadow-md`}
              >
                <DocumentChartBarIcon className="h-5 w-5" />
                Generate Report
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent"></div>
          </div>

          {/* Main Content Card */}
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-100",
            "bg-gray-800 border-gray-700"
          )}`}>
            {/* Modern Tab Navigation */}
            <div className={`border-b ${getThemedClasses(
              isDark,
              "border-gray-100",
              "border-gray-700"
            )}`}>
              <div className="flex p-2 gap-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "overview"
                      ? isDark 
                        ? "bg-gray-700 text-white" 
                        : "bg-gray-100 text-gray-900"
                      : getThemedClasses(
                          isDark,
                          "text-gray-600 hover:bg-gray-50",
                          "text-gray-300 hover:bg-gray-700"
                        )
                  }`}
                >
                  <InformationCircleIcon className="h-5 w-5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("report")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "report"
                      ? isDark 
                        ? "bg-blue-500 text-white" 
                        : "bg-blue-600 text-white"
                      : getThemedClasses(
                          isDark,
                          "text-gray-600 hover:bg-gray-50",
                          "text-gray-300 hover:bg-gray-700"
                        )
                  }`}
                >
                  <DocumentChartBarIcon className="h-5 w-5" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeTab === "overview" ? (
                <div className="space-y-8">
                  {/* Modern Feature Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-sm ${getThemedClasses(
                          isDark,
                          "bg-white hover:bg-gray-50 border-gray-100",
                          "bg-gray-800 hover:bg-gray-750 border-gray-700"
                        )}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getThemedClasses(
                            isDark,
                            "bg-blue-50",
                            "bg-blue-900/20"
                          )}`}>
                            <feature.icon className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold mb-2 ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}>
                              {feature.title}
                            </h3>
                            <p className={getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )}>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Modern CTA Section */}
                  <div className={`rounded-xl border p-8 text-center ${getThemedClasses(
                    isDark,
                    "bg-gray-50 border-gray-100",
                    "bg-gray-800/50 border-gray-700"
                  )}`}>
                    <div className="max-w-2xl mx-auto">
                      <div className={`inline-flex p-3 rounded-lg mb-4 ${getThemedClasses(
                        isDark,
                        "bg-blue-50",
                        "bg-blue-900/20"
                      )}`}>
                        <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-4 ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}>
                        Ready to Generate Your Report?
                      </h3>
                      <p className={`mb-6 ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-300"
                      )}`}>
                        Get detailed insights into your academic performance and receive personalized recommendations for improvement.
                      </p>
                      <button
                        onClick={() => setActiveTab("report")}
                        className={`inline-flex items-center px-8 py-4 rounded-xl font-medium text-white transition-all duration-200 ${
                          isDark 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-blue-600 hover:bg-blue-700"
                        } shadow-sm hover:shadow-md`}
                      >
                        <DocumentChartBarIcon className="h-6 w-6 mr-2" />
                        Generate Your Report Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <StudentPerformanceReportComponent />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentReport;
