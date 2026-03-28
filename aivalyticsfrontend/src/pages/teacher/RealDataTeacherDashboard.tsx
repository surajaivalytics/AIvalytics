import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardApi";

import {
  CheckCircle,
  FileText as DocumentText,
  Users,
  TrendingUp,
  AlertTriangle as ExclamationCircle,
  Clock
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import MCQPerformanceChart from "../../components/charts/MCQPerformanceChart";
import AIConceptHeatmap from "../../components/charts/AIConceptHeatmap";
import StatCard from "../../components/dashboard/StatCard";


interface TeacherDashboardData {
  user: {
    id: number;
    name: string;
    role: string;
  };
  stats: {
    totalCourses: number;
    totalQuizzes: number;
    totalStudents: number;
    averageClassScore: number;
  };
  courses: Array<{
    id: number;
    name: string;
    description: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: number;
    type: string;
    student: string;
    quiz: string;
    course: string;
    score: string;
    percentage: number;
    timestamp: string;
  }>;
  coursePerformance: Array<{
    course: string;
    students: number;
    attempts: number;
    averageScore: number;
  }>;
  quizzes: Array<{
    id: number;
    name: string;
    course: string;
    attempts: number;
    averageScore: number;
    createdAt: string;
  }>;
}

const RealDataTeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [dashboardData, setDashboardData] =
    useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const loadMockData = () => {
    setDashboardData({
      user: { id: 1, name: "Yashodip", role: "teacher" },
      stats: {
        totalCourses: 12,
        totalQuizzes: 28,
        totalStudents: 125,
        averageClassScore: 72
      },
      courses: [],
      recentActivity: [],
      coursePerformance: [],
      quizzes: []
    });
    console.log("⚠️ Using mock data fallback due to fetch error");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching teacher dashboard data...");
      const response = await dashboardService.getTeacherDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
        console.log("✅ Teacher dashboard data loaded:", response.data);
      } else {
        loadMockData();
      }
    } catch (err: any) {
      console.error("❌ Teacher dashboard error:", err);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-gray-50 dark: border-green-200 dark:border-green-800";
    if (score >= 80) return "bg-gray-50 dark: border-blue-200 dark:border-blue-800";
    if (score >= 70) return "bg-gray-50 dark: border-yellow-200 dark:border-yellow-800";
    if (score >= 60) return "bg-gray-50 dark: border-orange-200 dark:border-orange-800";
    return "bg-gray-50 dark: border-red-200 dark:border-red-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 mx-auto mb-6 shadow-lg"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-white/20 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Your Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Fetching your latest academic data...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800/50">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500 shadow-lg mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={fetchDashboardData}
                className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-6 relative z-10">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Teacher Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your classes.
              </p>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm">
                <DocumentText className="h-4 w-4" /> Generate Report
              </button>
              <Link to="/quiz-generator" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <CheckCircle className="h-4 w-4" />
                Create Quiz
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Students */}
            <div className="relative overflow-hidden bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-xl border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</span>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    125
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Across all sections
                  </div>
                </div>
              </div>
            </div>

            {/* Average Quiz Accuracy */}
            <div className="relative overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-xl border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Quiz Accuracy</span>
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">72%</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                      ↑ 5% from last week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quizzes Generated */}
            <div className="relative overflow-hidden bg-orange-50/50 dark:bg-orange-950/20 backdrop-blur-xl border border-orange-100 dark:border-orange-800/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-orange-100/80 dark:bg-orange-900/40"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quizzes Generated</span>
                  <DocumentText className="h-5 w-5 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    28
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    This semester
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Level */}
            <div className="relative overflow-hidden bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-xl border border-purple-100 dark:border-purple-800/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-purple-100/80 dark:bg-purple-900/40"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Level</span>
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">78%</span>
                    <span className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center">
                      ↓ 3% from last week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-white/50 dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 p-1 rounded-lg">
                <TabsTrigger value="overview" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="students" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Students</TabsTrigger>
                <TabsTrigger value="quizzes" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">Quizzes</TabsTrigger>
              </TabsList>
            </div>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <MCQPerformanceChart />
                <AIConceptHeatmap />
              </div>

              {/* Smart Alerts & To-Dos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Alerts & To-Dos</h3>
                  <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">View All</button>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Low quiz completion in recent section", time: "2 hours ago", type: "warning" },
                    { title: "Quiz not generated for yesterday's lecture", time: "5 hours ago", type: "action" },
                    { title: "Review recent student performance drops", time: "1 day ago", type: "critical" }
                  ].map((alert, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-xl hover:shadow-sm transition-all gap-4 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full ${alert.type === 'critical' ? 'bg-red-100 dark:text-red-400' : alert.type === 'warning' ? 'bg-orange-100 dark:text-orange-400' : 'bg-blue-100 dark:text-blue-400'}`}>
                          <ExclamationCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{alert.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:ml-4">
                        <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Dismiss</button>
                        <button className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-gray-50 dark:bg-gray-700 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
                          Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* STUDENTS TAB */}
            <TabsContent value="students" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-6">
                {/* Student Progress Tracker Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Progress Tracker</h3>
                    <button className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      View All
                    </button>
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
            </TabsContent>

            {/* QUIZZES TAB */}
            <TabsContent value="quizzes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Review</h2>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
                  {/* Quiz Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Machine Learning Fundamentals Quiz</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sent Yesterday, 2:30 PM • 42/45 students attempted
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <PencilIcon className="w-4 h-4" />
                      Edit Quiz
                    </button>
                  </div>

                  {/* Questions List */}
                  <div className="p-6 space-y-8 bg-white dark:bg-gray-800/90">
                    {[
                      {
                        id: 1,
                        questionText: "Which of the following is NOT a type of machine learning?",
                        accuracy: 78,
                        options: [
                          { text: "Supervised Learning", isCorrect: false },
                          { text: "Unsupervised Learning", isCorrect: false },
                          { text: "Reinforcement Learning", isCorrect: false },
                          { text: "Cognitive Learning", isCorrect: true },
                        ]
                      },
                      {
                        id: 2,
                        questionText: "What is the purpose of the activation function in neural networks?",
                        accuracy: 62,
                        options: [
                          { text: "To initialize weights", isCorrect: false },
                          { text: "To introduce non-linearity", isCorrect: true },
                          { text: "To normalize input data", isCorrect: false },
                          { text: "To prevent overfitting", isCorrect: false },
                        ]
                      }
                    ].map((q, index) => (
                      <div key={q.id} className={index !== 0 ? "pt-8 border-t border-gray-100 dark:border-gray-700/50" : ""}>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Question {q.id}</h4>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${q.accuracy >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {q.accuracy}% accuracy
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-4">{q.questionText}</p>
                        
                        <div className="space-y-3">
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`p-4 rounded-lg flex justify-between items-center ${
                                opt.isCorrect 
                                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50' 
                                  : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700/50'
                              }`}
                            >
                              <span className={`text-sm ${opt.isCorrect ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                {opt.text}
                              </span>
                              {opt.isCorrect && (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RealDataTeacherDashboard;
