import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import MCQPerformanceChart from "../../components/charts/MCQPerformanceChart";
import AIConceptHeatmap from "../../components/charts/AIConceptHeatmap";
import {
 Book,
 Calendar,
 ChartBar,
 CheckCircle,
 AlertTriangle as ExclamationCircle,
 FileText as DocumentText,
 GraduationCap,
 Users,
 ListCheck,
 TrendingUp,
 PieChart,
 Clock,
 BarChart2,
 Activity,
 Brain,
 GitBranch,
 LineChart,
 Plus as PlusIcon
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";



const TeacherDashboard: React.FC = () => {
 const { user } = useAuth();
 const { isDark } = useTheme();
 const navigate = useNavigate();
 const [loading, setLoading] = useState(true);
 const [animateCharts, setAnimateCharts] = useState(false);

 useEffect(() => {
 // Simulate loading
 setTimeout(() => {
 setLoading(false);
 setAnimateCharts(true);
 }, 1000);
 }, []);


 if (loading) {
 return (
 <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 ">
 <div className="text-center">
 <LoadingSpinner variant="secondary" size="lg" />
 <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="space-y-6">
 {/* Welcome Section & Actions */}
 <div className="flex flex-col md:flex-row justify-between items-center w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
 <div className="absolute inset-0 dark:bg-blue-500/[0.05] pointer-events-none"></div>

 <div className="relative z-10 mb-4 md:mb-0">
 <h2 className="text-2xl font-semibold text-gray-900 dark:bg-white ">
 Teacher Dashboard
 </h2>
 <p className="mt-1 text-gray-600 dark:text-gray-400">
 Welcome back! Here's what's happening with your classes.
 </p>
 </div>

 {/* Top Right Actions */}
 <div className="flex items-center gap-3 relative z-10">
 <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm">
 Generate Report
 </button>
 <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-800 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
 <CheckCircle className="h-4 w-4" />
 Create Quiz
 </button>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 <StatCard
 title="Total Students"
 value="125"
 icon={<Users className="h-6 w-6 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />}
 className="bg-blue-100 dark: backdrop-blur-xl border-blue-100 dark:border-blue-800/30"
 decoration={<div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-200 dark:"></div>}
 />
 <StatCard
 title="Average Quiz Accuracy"
 value="72%"
 icon={<CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" strokeWidth={1.5} />}
 trend="+ 5% ↑"
 trendLabel="from last week"
 className="bg-green-100 dark: backdrop-blur-xl border-green-100 dark:border-green-800/30"
 decoration={<div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-green-200 dark:"></div>}
 />
 <StatCard
 title="Quizzes Generated"
 value="28"
 icon={<DocumentText className="h-6 w-6 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />}
 description="This semester"
 className="bg-amber-100 dark: backdrop-blur-xl border-orange-100 dark:border-orange-800/30"
 decoration={<div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-amber-200 dark:"></div>}
 />
 <StatCard
 title="Engagement Level"
 value="78%"
 icon={<TrendingUp className="h-6 w-6 text-purple-500 dark:text-purple-400 rotate-180" strokeWidth={1.5} />}
 trend="- 3% ↓"
 trendLabel="from last week"
 className="bg-pink-100 dark: backdrop-blur-xl border-purple-100 dark:border-purple-800/30"
 decoration={<div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-pink-200 dark:"></div>}
 />
 </div>

 {/* Sub-navigation Tabs */}
 <Tabs defaultValue="overview" className="w-full">
 <div className="flex justify-center mb-6">
 <TabsList className="bg-white/50 dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 p-1 rounded-lg">
 <TabsTrigger value="overview" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Overview</TabsTrigger>
 <TabsTrigger value="students" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Students</TabsTrigger>
 <TabsTrigger value="quizzes" className="rounded-md px-6 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Quizzes</TabsTrigger>
 </TabsList>
 </div>

 <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
 {/* Charts Grid */}
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
 { title: "Low engagement in Section C", time: "2 hours ago", type: "warning" },
 { title: "Quiz not sent for yesterday's lecture", time: "5 hours ago", type: "action" },
 { title: "3 students missed 3 consecutive classes", time: "1 day ago", type: "critical" }
 ].map((alert, idx) => (
 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 rounded-xl hover:shadow-sm transition-all gap-4 sm:gap-0">
 <div className="flex items-center gap-4">
 <div className={`p-2.5 rounded-full ${alert.type === 'critical' ? 'bg-red-100 dark: text-red-600 dark:text-red-400' : alert.type === 'warning' ? 'bg-orange-100 dark: text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark: text-blue-600 dark:text-blue-400'}`}>
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
 <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">Dismiss</button>
 <button className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-gray-50 dark: border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover: transition-colors">
 Action
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </TabsContent>

 <TabsContent value="students" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
 <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 overflow-hidden">
 <CardHeader className="border-b border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 pb-4">
 <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Student Progress Tracker</CardTitle>
 </CardHeader>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
 <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50/50 dark:bg-gray-800/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50">
 <tr>
 <th scope="col" className="px-6 py-4 font-semibold">Name</th>
 <th scope="col" className="px-6 py-4 font-semibold">Accuracy</th>
 <th scope="col" className="px-6 py-4 font-semibold">Quizzes</th>
 <th scope="col" className="px-6 py-4 font-semibold">Weak Areas</th>
 <th scope="col" className="px-6 py-4 text-right font-semibold">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
 {[
 { name: "Alex Johnson", accuracy: "92%", quizzes: "14/15", weakArea: "Probability", status: "good" },
 { name: "Sarah Smith", accuracy: "65%", quizzes: "12/15", weakArea: "Calculus", status: "warning" },
 { name: "Michael Chang", accuracy: "48%", quizzes: "9/15", weakArea: "Linear Algebra", status: "critical" },
 { name: "Emily Davis", accuracy: "88%", quizzes: "15/15", weakArea: "None", status: "good" }
 ].map((student, idx) => (
 <tr key={idx} className="bg-white/30 dark:bg-transparent hover:bg-gray-50 dark:bg-gray-800/50/50 dark:hover:bg-gray-800/50 transition-colors">
 <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{student.name}</td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${student.status === 'good' ? 'bg-gray-50 dark: text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : student.status === 'warning' ? 'bg-gray-50 dark: text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark: text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
 {student.accuracy}
 </span>
 </td>
 <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.quizzes}</td>
 <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.weakArea}</td>
 <td className="px-6 py-4 text-right">
 <button className="px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-gray-50 dark: border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover: transition-colors">
 Support
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="quizzes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
 <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50">
 <CardHeader className="border-b border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 pb-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Review</CardTitle>
 <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">Machine Learning Fundamentals Quiz</CardDescription>
 </div>
 <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2">
 <PlusIcon className="h-4 w-4" /> New Quiz
 </button>
 </div>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="space-y-4">
 {[
 { q: "1. What is the main difference between supervised and unsupervised learning?", correct: 85, incorrect: 15 },
 { q: "2. Which of the following is not a common activation function?", correct: 62, incorrect: 38 },
 { q: "3. Explain the bias-variance tradeoff in a few sentences.", correct: 45, incorrect: 55 },
 { q: "4. What is backpropagation used for in neural networks?", correct: 92, incorrect: 8 },
 ].map((question, idx) => (
 <div key={idx} className="p-5 bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 dark:border-gray-700/50 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
 <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">{question.q}</p>
 <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
 <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium min-w-[120px]">
 <CheckCircle className="h-4.5 w-4.5" />
 <span>{question.correct}% Correct</span>
 </div>
 <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium min-w-[120px]">
 <ExclamationCircle className="h-4.5 w-4.5" />
 <span>{question.incorrect}% Incorrect</span>
 </div>
 <div className="flex-1 w-full max-w-sm h-2.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden flex sm:ml-4">
 <div style={{ width: `${question.correct}%` }} className="bg-gray-50 dark: dark:bg-green-400 transition-all duration-1000 ease-in-out"></div>
 <div style={{ width: `${question.incorrect}%` }} className="bg-gray-50 dark: dark:bg-red-400 transition-all duration-1000 ease-in-out"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 </div>
 );
};

export default TeacherDashboard;
