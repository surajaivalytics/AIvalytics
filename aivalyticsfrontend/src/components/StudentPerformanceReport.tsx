import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import { useNavigate } from "react-router-dom";
import {
  DocumentChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { reportService, StudentPerformanceReport } from "../services/reportApi";
import { useAuth } from "../contexts/AuthContext";
import PrintTemplate from "./PrintTemplate";
import toast from "react-hot-toast";

interface Strength {
  area: string;
  score: number;
  reason: string;
}

interface Weakness {
  area: string;
  score: number;
  reason: string;
}

interface Recommendation {
  recommendation: string;
  reason: string;
  timeframe: string;
}

interface Subject {
  courseName: string;
  quizzesTaken: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalMarks: number;
  totalPossible: number;
  percentage: number;
  totalQuizzes?: number;
}

interface Quiz {
  quizName: string;
  courseName: string;
  percentage: number;
  date: string;
}

interface AIRecommendation {
  text: string;
}

const StudentPerformanceReportComponent: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [report, setReport] = useState<StudentPerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    { id: "overview", name: "Overview", icon: DocumentChartBarIcon },
    { id: "subjects", name: "Subject Details", icon: BookOpenIcon },
    { id: "history", name: "Performance History", icon: ClockIcon },
    { id: "ai_insights", name: "AI Insights", icon: SparklesIcon },
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Generating student performance report...");

      // Show loading toast
      const loadingToast = toast.loading(
        "Generating your performance report...",
        {
          duration: 30000, // 30 seconds loading toast
        }
      );

      const response = await reportService.generateStudentReport();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        setReport(response.data);
        toast.success("Report generated successfully!");
        console.log("✅ Report generated successfully");
      } else {
        setError(response.message || "Failed to generate report");
        toast.error(response.message || "Failed to generate report");
      }
    } catch (err: any) {
      console.error("❌ Report generation error:", err);

      // Handle specific timeout errors
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Report generation timed out. Please try again.");
        toast.error("Report generation timed out. Please try again.");
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again later.");
        toast.error("Server error occurred. Please try again later.");
      } else {
        setError(err.message || "Failed to generate report");
        toast.error(err.message || "Failed to generate report");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await generateReport();
    setIsGenerating(false);
  };

  const handlePrint = () => {
    if (!report) {
      alert("No report data available to print.");
      return;
    }
    window.print();
  };

  const handleShare = async () => {
    if (!report) return;
    try {
      setIsSharing(true);
      const shareData = {
        title: `${report.student.username}'s Academic Performance Report`,
        text: `Check out my academic performance report! Average Score: ${report.performance.overallStats.averageScore.toFixed(
          1
        )}%`,
        url: window.location.href,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert("Report link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 80) return "bg-blue-100";
    if (score >= 70) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "improving":
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case "declining":
        return (
          <ArrowTrendingUpIcon className="h-5 w-5 text-red-500 transform rotate-180" />
        );
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div
        className={`p-8 text-center ${getThemedClasses(
          isDark,
          "text-gray-900",
          "text-white"
        )}`}
      >
        <div
          className={`p-4 rounded-lg inline-block mb-6 ${getThemedClasses(
            isDark,
            "bg-gray-50",
            "bg-gray-900"
          )}`}
        >
          <div className="text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <DocumentChartBarIcon className="relative h-20 w-20 text-blue-400 mx-auto mb-6" />
            </div>
            <h1
              className={`text-4xl font-bold mb-4 ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              Generating Report...
            </h1>
            <p
              className={`text-xl ${getThemedClasses(
                isDark,
                "text-gray-600",
                "text-gray-300"
              )}`}
            >
              Please wait while we analyze your performance data.
            </p>

            {/* Previous Reports Button in Loading State */}
            <button
              onClick={() => navigate("/reports")}
              className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              View Previous Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-8 text-center ${getThemedClasses(
          isDark,
          "text-gray-900",
          "text-white"
        )}`}
      >
        <div
          className={`p-4 rounded-lg inline-block mb-6 ${getThemedClasses(
            isDark,
            "bg-gray-50",
            "bg-gray-900"
          )}`}
        >
          <div className="text-center">
            <div className="p-4 bg-red-500/10 rounded-2xl mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto" />
            </div>
            <h1
              className={`text-4xl font-bold mb-4 ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              Error Generating Report
            </h1>
            <p
              className={`text-xl mb-8 ${getThemedClasses(
                isDark,
                "text-gray-600",
                "text-gray-300"
              )}`}
            >
              {error}
            </p>
            <button
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Try Again
            </button>

            {/* Previous Reports Button in Error State */}
            <button
              onClick={() => navigate("/reports")}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              View Previous Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div
        className={`p-8 text-center ${getThemedClasses(
          isDark,
          "text-gray-900",
          "text-white"
        )}`}
      >
        <div
          className={`p-4 rounded-lg inline-block mb-6 ${getThemedClasses(
            isDark,
            "bg-gray-100",
            "bg-gray-900"
          )}`}
        >
          {/* Background decorative elements */}
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
          <div
            className={`absolute inset-0 bg-grid-pattern ${getThemedClasses(
              isDark,
              "opacity-10",
              "opacity-5"
            )}`}
          ></div>

          <div className="relative text-center z-10">
            <div
              className={`p-6 bg-white/20 dark:bg-gray-800/20 backdrop-filter backdrop-blur-xl rounded-full inline-block mb-8 border ${getThemedClasses(
                isDark,
                "border-gray-200",
                "border-gray-700"
              )}`}
            >
              <DocumentChartBarIcon
                className={`h-20 w-20 text-blue-500 transition-transform duration-500 hover:scale-110`}
              />
            </div>

            <h1
              className={`text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${getThemedClasses(
                isDark,
                "from-blue-600 to-purple-600",
                "from-blue-400 to-purple-400"
              )}`}
            >
              Unlock Your Potential
            </h1>
            <p
              className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${getThemedClasses(
                isDark,
                "text-gray-600",
                "text-gray-300"
              )}`}
            >
              Generate a comprehensive analysis of your academic journey, with
              AI-powered insights and personalized recommendations for
              excellence.
            </p>

            <button
              onClick={generateReport}
              disabled={loading}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-4 text-xl font-semibold shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300"
            >
              <SparklesIcon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12" />
              <span>{loading ? "Analyzing..." : "Generate AI Report"}</span>
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </button>

            {/* Previous Reports Button */}
            <button
              onClick={() => navigate("/reports")}
              className="mt-6 group relative bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 inline-flex items-center gap-3 text-lg font-semibold shadow-xl shadow-gray-500/20 hover:shadow-gray-500/40 transform hover:scale-105 transition-all duration-300"
            >
              <DocumentChartBarIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              <span>View Previous Reports</span>
            </button>
            {error && (
              <div className="mt-8 bg-red-900/30 border border-red-700 rounded-xl p-4 shadow-lg text-red-300">
                <div className="flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div
        className={`rounded-xl border ${getThemedClasses(
          isDark,
          "bg-white border-gray-100",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${getThemedClasses(
                  isDark,
                  "bg-blue-50",
                  "bg-blue-900/20"
                )}`}
              >
                <DocumentChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2
                  className={`text-xl font-semibold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  {report.student.username}'s Report
                </h2>
                <p
                  className={getThemedClasses(
                    isDark,
                    "text-gray-600",
                    "text-gray-400"
                  )}
                >
                  Generated on{" "}
                  {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors ${getThemedClasses(
                  isDark,
                  "border-gray-100 hover:bg-gray-50",
                  "border-gray-700 hover:bg-gray-700"
                )}`}
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print
              </button>
              <button
                onClick={handleShare}
                className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors ${getThemedClasses(
                  isDark,
                  "border-gray-100 hover:bg-gray-50",
                  "border-gray-700 hover:bg-gray-700"
                )}`}
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Share
              </button>
              <button
                onClick={() => navigate("/reports")}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 border glass-effect gradient-border ${getThemedClasses(
                  isDark,
                  "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 hover:from-gray-700 hover:to-gray-800",
                  "bg-gradient-to-r from-gray-500 to-gray-600 border-gray-600 hover:from-gray-600 hover:to-gray-700"
                )}`}
              >
                <DocumentChartBarIcon className="h-5 w-5" />
                <span>Previous Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className={`rounded-xl border p-2 ${getThemedClasses(
          isDark,
          "bg-white border-gray-100",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? isDark
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-blue-600"
                  : getThemedClasses(
                      isDark,
                      "text-gray-600 hover:bg-gray-50",
                      "text-gray-300 hover:bg-gray-700"
                    )
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`rounded-xl border ${getThemedClasses(
          isDark,
          "bg-white border-gray-100",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="p-6">
          {activeTab === "overview" && report && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Average Score",
                    value: `${report.performance.overallStats.averageScore.toFixed(
                      1
                    )}%`,
                    color: getScoreColor(
                      report.performance.overallStats.averageScore
                    ),
                    bgColor: isDark ? "bg-blue-900/20" : "bg-blue-50",
                  },
                  {
                    label: "Highest Score",
                    value: `${report.performance.overallStats.highestScore.toFixed(
                      1
                    )}%`,
                    color: "text-green-500",
                    bgColor: isDark ? "bg-green-900/20" : "bg-green-50",
                  },
                  {
                    label: "Pass Rate",
                    value: `${report.performance.overallStats.passRate.toFixed(
                      1
                    )}%`,
                    color: "text-purple-500",
                    bgColor: isDark ? "bg-purple-900/20" : "bg-purple-50",
                  },
                  {
                    label: "Total Quizzes",
                    value: report.performance.overallStats.totalQuizzes,
                    color: "text-orange-500",
                    bgColor: isDark ? "bg-orange-900/20" : "bg-orange-50",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${getThemedClasses(
                      isDark,
                      "border-gray-100",
                      "border-gray-700"
                    )}`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${stat.bgColor} mb-3`}
                    >
                      <DocumentChartBarIcon
                        className={`h-5 w-5 ${stat.color}`}
                      />
                    </div>
                    <div
                      className={`text-2xl font-semibold mb-1 ${stat.color}`}
                    >
                      {stat.value}
                    </div>
                    <div
                      className={getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-400"
                      )}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div
                  className={`rounded-xl border p-6 ${getThemedClasses(
                    isDark,
                    "border-gray-100",
                    "border-gray-700"
                  )}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${getThemedClasses(
                        isDark,
                        "bg-green-50",
                        "bg-green-900/20"
                      )}`}
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      Strengths
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {report.performance.strengths.map(
                      (strength: Strength, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${getThemedClasses(
                            isDark,
                            "bg-gray-50",
                            "bg-gray-800"
                          )}`}
                        >
                          <h4
                            className={`font-medium mb-1 ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {strength.area}
                          </h4>
                          <p
                            className={getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )}
                          >
                            {strength.reason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Weaknesses */}
                <div
                  className={`rounded-xl border p-6 ${getThemedClasses(
                    isDark,
                    "border-gray-100",
                    "border-gray-700"
                  )}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${getThemedClasses(
                        isDark,
                        "bg-red-50",
                        "bg-red-900/20"
                      )}`}
                    >
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      Areas for Improvement
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {report.performance.weaknesses.map(
                      (weakness: Weakness, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${getThemedClasses(
                            isDark,
                            "bg-gray-50",
                            "bg-gray-800"
                          )}`}
                        >
                          <h4
                            className={`font-medium mb-1 ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {weakness.area}
                          </h4>
                          <p
                            className={getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )}
                          >
                            {weakness.reason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subjects" && report && (
            <div className="space-y-4">
              {report.performance.subjectPerformance.map(
                (subject: Subject, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border ${getThemedClasses(
                      isDark,
                      "border-gray-100",
                      "border-gray-700"
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${getThemedClasses(
                            isDark,
                            "bg-blue-50",
                            "bg-blue-900/20"
                          )}`}
                        >
                          <BookOpenIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {subject.courseName}
                          </h3>
                          <p
                            className={getThemedClasses(
                              isDark,
                              "text-gray-600",
                              "text-gray-400"
                            )}
                          >
                            {subject.quizzesTaken} quizzes taken
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-semibold ${getScoreColor(
                          subject.averageScore
                        )}`}
                      >
                        {subject.averageScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "history" && report && (
            <div
              className={`rounded-xl border overflow-hidden ${getThemedClasses(
                isDark,
                "border-gray-100",
                "border-gray-700"
              )}`}
            >
              <table className="w-full">
                <thead
                  className={getThemedClasses(
                    isDark,
                    "bg-gray-50",
                    "bg-gray-800"
                  )}
                >
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Quiz Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {report.performance.recentPerformance.map(
                    (quiz: Quiz, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{quiz.quizName}</td>
                        <td className="px-6 py-4">{quiz.courseName}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              isDark ? "bg-opacity-20" : ""
                            } ${getScoreBgColor(
                              quiz.percentage
                            )} ${getScoreColor(quiz.percentage)}`}
                          >
                            {quiz.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(quiz.date).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "ai_insights" && report && report.aiSuggestions && (
            <div className="space-y-6">
              <div
                className={`rounded-xl border p-6 ${getThemedClasses(
                  isDark,
                  "border-gray-100",
                  "border-gray-700"
                )}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${getThemedClasses(
                      isDark,
                      "bg-purple-50",
                      "bg-purple-900/20"
                    )}`}
                  >
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    AI Recommendations
                  </h3>
                </div>
                <div className="space-y-4">
                  {report.aiSuggestions.studyRecommendations.map(
                    (rec: Recommendation, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${getThemedClasses(
                          isDark,
                          "bg-gray-50",
                          "bg-gray-800"
                        )}`}
                      >
                        <h4
                          className={`font-medium mb-2 ${getThemedClasses(
                            isDark,
                            "text-gray-900",
                            "text-white"
                          )}`}
                        >
                          {rec.recommendation}
                        </h4>
                        <p
                          className={`mb-2 ${getThemedClasses(
                            isDark,
                            "text-gray-600",
                            "text-gray-400"
                          )}`}
                        >
                          {rec.reason}
                        </p>
                        <p
                          className={`text-sm ${getThemedClasses(
                            isDark,
                            "text-gray-500",
                            "text-gray-500"
                          )}`}
                        >
                          Timeframe: {rec.timeframe}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate New Report Button */}
      <div className="text-center py-8 no-print">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden ${
            isGenerating ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Generating Report...
              </>
            ) : (
              <>
                <SparklesIcon className="h-6 w-6 mr-2 animate-pulse" />
                Generate Report Now
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StudentPerformanceReportComponent;
