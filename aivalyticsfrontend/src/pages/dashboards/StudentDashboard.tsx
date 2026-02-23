import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Award, Book, Calendar, MessageSquare, PieChart, TrendingUp,
  ListCheck, Star, GraduationCap, Users, BookOpen,
  Clock, BarChart2, Activity, AlertCircle, Brain, GitBranch, LineChart,
  Sparkles, Target, Trophy, FileText, Bell, ExternalLink, CheckCircle2,
  XCircle, Info
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import StudentWeeklyReport from '../../components/student/StudentWeeklyReport';
import ImprovementPlan from '../../components/student/ImprovementPlan';
import LearningResources from '../../components/student/LearningResources';
import BadgesAchievements from '../../components/student/BadgesAchievements';
import DailyQuizzes from '../../components/student/DailyQuizzes';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
  AreaChart, Area
} from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useTheme } from '../../contexts/ThemeContext';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface ModuleData {
  name: string;
  completion: number;
  icon: React.ReactNode;
  lastAccessed: string;
  hoursSpent: number;
  classAverage: number;
}

const StudentDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('performance');
  const [animateCharts, setAnimateCharts] = useState(false);

  // Notification data
  const notifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Low Attendance Warning',
      message: 'Your attendance has dropped below 80%. Please attend classes regularly.',
      time: '2 hours ago',
      read: false,
      priority: 'high',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />
    },
    {
      id: 2,
      type: 'report',
      title: 'New Performance Report Available',
      message: 'Your weekly performance report for Data Structures is ready.',
      time: '5 hours ago',
      read: false,
      priority: 'medium',
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Badge Earned!',
      message: 'Congratulations! You\'ve earned the "Quiz Master" badge.',
      time: '1 day ago',
      read: true,
      priority: 'low',
      icon: <Award className="h-4 w-4 text-purple-500" />
    }
  ];

  // Reports summary data
  const reportsSummary = {
    total: 12,
    recent: 3,
    averageAccuracy: 85,
    lastGenerated: '2024-05-08'
  };

  // Module completion data with icons
  const moduleData: ModuleData[] = [
    {
      name: "Data Structures",
      completion: 90,
      icon: <GitBranch className="h-4 w-4" />,
      lastAccessed: "2024-05-08",
      hoursSpent: 15.8,
      classAverage: 82,
    },
    {
      name: "Machine Learning Fundamentals",
      completion: 75,
      icon: <Activity className="h-4 w-4" />,
      lastAccessed: "2024-05-07",
      hoursSpent: 12.5,
      classAverage: 68,
    },
    {
      name: "Neural Networks",
      completion: 45,
      icon: <Brain className="h-4 w-4" />,
      lastAccessed: "2024-05-05",
      hoursSpent: 8.2,
      classAverage: 42,
    }
  ].sort((a, b) => b.completion - a.completion); // Sort by completion

  // Learning time data with goals
  const learningTimeData = [
    { day: 'Mon', minutes: 45, goal: 60 },
    { day: 'Tue', minutes: 68, goal: 60 },
    { day: 'Wed', minutes: 52, goal: 60 },
    { day: 'Thu', minutes: 63, goal: 60 },
    { day: 'Fri', minutes: 49, goal: 60 },
    { day: 'Sat', minutes: 32, goal: 60 },
    { day: 'Sun', minutes: 38, goal: 60 },
  ];

  // Weekly performance data
  const weeklyPerformanceData = [
    { day: 'Mon', score: 72 },
    { day: 'Tue', score: 75 },
    { day: 'Wed', score: 70 },
    { day: 'Thu', score: 78 },
    { day: 'Fri', score: 80 },
    { day: 'Sat', score: 20 },
    { day: 'Sun', score: 10 },
  ];

  // Concept mastery data
  const conceptMasteryData = [
    { concept: 'Data Structures', mastery: 85 },
    { concept: 'Algorithms', mastery: 75 },
    { concept: 'Machine Learning', mastery: 70 },
    { concept: 'Neural Networks', mastery: 55 },
    { concept: 'Statistics', mastery: 90 },
  ];

  // Time spent learning data
  const timeSpentData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 65 },
    { day: 'Wed', minutes: 52 },
    { day: 'Thu', minutes: 58 },
    { day: 'Fri', minutes: 42 },
    { day: 'Sat', minutes: 20 },
    { day: 'Sun', minutes: 15 },
  ];

  // Calculate average learning time
  const averageLearningTime = Math.round(
    learningTimeData.reduce((acc, item) => acc + item.minutes, 0) / learningTimeData.length
  );

  // Attendance data
  const attendanceData = {
    percentage: 95,
    attended: 19,
    total: 20,
    missed: [
      { date: '2025-04-28', course: 'Data Structures & Algorithms' }
    ]
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500 dark:bg-green-600";
    if (percentage >= 75) return "bg-blue-500 dark:bg-blue-600";
    return "bg-purple-500 dark:bg-purple-600";
  };

  // Get attendance color and emoji
  const getAttendanceInfo = (percentage: number) => {
    if (percentage >= 90) return {
      color: "text-green-500 dark:text-green-400",
      emoji: "😊",
      status: "Excellent"
    };
    if (percentage >= 75) return {
      color: "text-amber-500 dark:text-amber-400",
      emoji: "😐",
      status: "Caution"
    };
    return {
      color: "text-red-500 dark:text-red-400",
      emoji: "⚠️",
      status: "Warning"
    };
  };

  // Custom tooltip for learning time chart
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.minutes / data.goal) * 100);

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{label}</p>
          <div className="text-sm mt-1">
            <div className="flex justify-between">
              <span>Study time:</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {payload[0].value} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span>Goal:</span>
              <span className="font-medium">{data.goal} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Completion:</span>
              <span className={percentage >= 100 ? "text-green-500" : "text-amber-500"}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Module completion custom tooltip
  const ModuleTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

    return (
        <div className="bg-white w-full dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-medium">
            {data.icon}
            {data.name}
          </div>
          <div className="text-sm mt-2  w-full">
            <div className="flex justify-between">
              <span>Completion:</span>
              <span className="font-medium">{data.completion}%</span>
            </div>
            <div className="flex justify-between">
              <span>Class average:</span>
              <span
                className={data.completion > data.classAverage ?
                  "text-green-500" : "text-amber-500"}
              >
                {data.classAverage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last accessed:</span>
              <span>{new Date(data.lastAccessed).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time spent:</span>
              <span>{data.hoursSpent} hours</span>
            </div>
          </div>
      </div>
    );
  }
    return null;
  };

  // Animation effect
  useEffect(() => {
    // Delay animation to allow component to mount
    setTimeout(() => {
      setAnimateCharts(true);
    }, 300);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-pink-500/[0.03]"></div>
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-primary text-gray-900 dark:text-white mb-1">
                  Student Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-secondary">
                  Track your progress, attendance, and performance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1.5 text-sm font-medium">
                  <Trophy className="w-4 h-4 mr-1.5" />
                  Rank #3
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Grid: Attendance, Reports, Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Attendance Card - Prominent */}
          <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800/50 shadow-md hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Attendance
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${animateCharts ? attendanceData.percentage * 2.64 : 0} 264`}
                      className={`transition-all duration-1000 ease-out ${
                        attendanceData.percentage >= 90
                          ? "text-emerald-500 dark:text-emerald-400"
                          : attendanceData.percentage >= 75
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${getAttendanceInfo(attendanceData.percentage).color}`}>
                      {animateCharts ? attendanceData.percentage : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {attendanceData.attended} / {attendanceData.total} classes
                  </p>
                  <p className={`text-xs font-medium ${getAttendanceInfo(attendanceData.percentage).color} mb-2`}>
                    {getAttendanceInfo(attendanceData.percentage).status}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    onClick={() => navigate('/attendance')}
                  >
                    View Details <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Quick Access */}
          <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Reports
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Reports</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{reportsSummary.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Accuracy</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{reportsSummary.averageAccuracy}%</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                  onClick={() => navigate('/reports')}
                >
                  View All Reports <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Quick Access */}
          <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 relative">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.slice(0, 2).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded-lg text-xs ${
                      !notification.read
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notification.icon}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-[10px] mt-0.5">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-xs h-7 px-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                onClick={() => {
                  // Scroll to notifications section or open notifications panel
                  const notificationsSection = document.getElementById('notifications-section');
                  notificationsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View All Notifications <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Quizzes Completed"
            value="42"
            trend="+5"
            trendLabel="more than last week"
            icon={<Book className="h-5 w-5" />}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          />
          <StatCard
            title="Overall Accuracy"
            value="76%"
            trend="+3%"
            trendLabel="from last month"
            icon={<Target className="h-5 w-5" />}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          />
          <StatCard
            title="Learning Streak"
            value="14 days"
            description="Keep it up!"
            icon={<Sparkles className="h-5 w-5" />}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          />
          <StatCard
            title="Badge Progress"
            value="3/5"
            description="Data Science Master"
            icon={<Award className="h-5 w-5" />}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          />
        </div>

        {/* Module Completion Card */}
        <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10"></div>
          <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Module Completion Status
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Track your progress across all learning modules
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <div className="space-y-6">
              {moduleData.map((module, index) => (
                <div key={index} className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        {module.icon}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">
                        {module.name}
                      </span>
                    </div>
                    <Badge variant="outline" className={`
                      text-sm font-semibold px-2.5 py-1
                      ${module.completion >= 90 
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : module.completion >= 75 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      }
                    `}>
                      {module.completion}%
                    </Badge>
                  </div>

                  <div className="relative h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out rounded-full"
                      style={{ 
                        width: `${animateCharts ? module.completion : 0}%`,
                        background: module.completion >= 90 
                          ? 'linear-gradient(90deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)' 
                          : module.completion >= 75 
                            ? 'linear-gradient(90deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)' 
                            : 'linear-gradient(90deg, rgb(147, 51, 234) 0%, rgb(126, 34, 206) 100%)'
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last accessed: {new Date(module.lastAccessed).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${
                      module.completion > module.classAverage
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {module.completion > module.classAverage 
                        ? `+${(module.completion - module.classAverage).toFixed(1)}% above average`
                        : `${(module.classAverage - module.completion).toFixed(1)}% below average`
                      }
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="font-medium">Just Started (&lt;75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-medium">In Progress (75-89%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium">Almost Complete (≥90%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Time Chart */}
        <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10"></div>
          <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Learning Time
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Weekly study time vs. daily goals
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <BarChart2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={learningTimeData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                      label={{ 
                        value: 'Minutes', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fontSize: 12, 
                        fill: isDark ? "#9ca3af" : "#6b7280" 
                      }}
                      width={60}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <ReferenceLine 
                      y={60} 
                      stroke={isDark ? "#f87171" : "#ef4444"} 
                      strokeDasharray="3 3" 
                      label={{
                      value: 'Goal: 60 min',
                      position: 'insideBottomRight',
                        fill: isDark ? "#f87171" : "#ef4444",
                      fontSize: 12
                      }} 
                    />
                    <ReferenceLine
                      y={averageLearningTime}
                      stroke={isDark ? "#4ade80" : "#22c55e"}
                      strokeDasharray="5 5"
                      label={{
                        value: `Avg: ${averageLearningTime} min`,
                        position: 'insideTopLeft',
                        fill: isDark ? "#4ade80" : "#22c55e",
                        fontSize: 11
                      }}
                    />
                    <Bar
                      dataKey="minutes"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                      animationBegin={animateCharts ? 0 : 9999}
                    >
                      {learningTimeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.minutes >= entry.goal
                            ? isDark ? "rgba(52, 211, 153, 0.8)" : "rgba(16, 185, 129, 0.8)"
                            : isDark ? "rgba(124, 58, 237, 0.8)" : "rgba(109, 40, 217, 0.8)"
                          }
                    />
                  ))}
                      <LabelList
                        dataKey="minutes"
                        position="top"
                        fill={isDark ? "#9ca3af" : "#6b7280"}
                        fontSize={10}
                        formatter={(value: any) => `${value}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              <span className="font-semibold text-gray-900 dark:text-white">Average:</span> {averageLearningTime} min/day
              {averageLearningTime < 60 ? (
                <span className="text-amber-600 dark:text-amber-400 ml-2 font-medium">
                  (Need {60 - averageLearningTime} more min to reach goal)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-medium">
                  (Exceeding goal by {averageLearningTime - 60} min)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card id="notifications-section" className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10"></div>
          <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 relative">
                  <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Stay updated with important announcements and alerts
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !notification.read
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-sm'
                      : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      !notification.read
                        ? 'bg-purple-100 dark:bg-purple-900/40'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${
                          !notification.read
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${
                        !notification.read
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {notification.time}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            notification.priority === 'high'
                              ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                              : notification.priority === 'medium'
                              ? 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {notification.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No notifications at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs 
          defaultValue="performance" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-2 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-pink-500/[0.03]"></div>
            <TabsList className="relative grid w-full grid-cols-2 sm:grid-cols-5 bg-transparent gap-1">
              {[
                { value: "performance", label: "Performance", icon: <TrendingUp className="h-4 w-4" /> },
                { value: "improvement", label: "Improvement", icon: <Target className="h-4 w-4" /> },
                { value: "quizzes", label: "Quizzes", icon: <ListCheck className="h-4 w-4" /> },
                { value: "resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
                { value: "badges", label: "Badges", icon: <Award className="h-4 w-4" /> }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="relative overflow-hidden group px-3 py-2.5 sm:px-4 rounded-lg text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/15 data-[state=active]:to-purple-500/15 dark:data-[state=active]:from-blue-500/25 dark:data-[state=active]:to-purple-500/25 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400 transition-colors">
                      {tab.icon}
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-500/3 to-transparent dark:from-white/[0.02] dark:via-white/[0.01] dark:to-transparent"></div>
            <div className="relative p-4 sm:p-6">
              <TabsContent value="performance" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Weekly Performance Chart */}
                  <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10"></div>
                    <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          Weekly Performance
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={weeklyPerformanceData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                          >
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              vertical={false} 
                              stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"}
                            />
                            <XAxis 
                              dataKey="day" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            />
                            <YAxis 
                              domain={[0, 100]}
                              ticks={[0, 25, 50, 75, 100]}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke={isDark ? "#818cf8" : "#6366f1"}
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Concept Mastery Chart */}
                  <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10"></div>
                    <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          Concept Mastery
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={conceptMasteryData}
                            layout="vertical"
                            margin={{ top: 10, right: 10, left: 80, bottom: 10 }}
                          >
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              horizontal={true} 
                              vertical={false}
                              stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"}
                            />
                            <XAxis
                              type="number" 
                              domain={[0, 100]}
                              ticks={[0, 25, 50, 75, 100]} 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            />
                            <YAxis
                              dataKey="concept" 
                              type="category" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                              width={80}
                            />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="mastery" 
                              fill={isDark ? "rgba(167, 139, 250, 0.8)" : "rgba(124, 58, 237, 0.8)"}
                              radius={[0, 4, 4, 0]}
                              barSize={20}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="improvement" className="mt-0">
            <ImprovementPlan />
          </TabsContent>

              <TabsContent value="quizzes" className="mt-0">
            <DailyQuizzes />
          </TabsContent>

              <TabsContent value="resources" className="mt-0">
            <LearningResources />
          </TabsContent>

              <TabsContent value="badges" className="mt-0">
            <BadgesAchievements />
          </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Leaderboard Card */}
        <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent dark:from-yellow-500/20 dark:via-yellow-500/10"></div>
          <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Your ranking among peers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              {[
                { rank: 1, name: "Maya Patel", points: 192, highlight: false },
                { rank: 2, name: "Alex Johnson", points: 187, highlight: false },
                { rank: 3, name: "You", points: 173, highlight: true },
                { rank: 4, name: "Sam Wilson", points: 165, highlight: false },
                { rank: 5, name: "Priya Shah", points: 152, highlight: false }
              ].map((user, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border transition-all
                    ${user.highlight
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm'
                      : index < 2
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-sm
                      ${user.highlight
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        : index < 2
                          ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }
                    `}>
                      {user.rank}
                    </div>
                    <span className={`font-semibold text-base ${
                      user.highlight ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {user.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${
                      user.highlight || index < 2 ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <span className={`font-semibold ${
                      user.highlight ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {user.points} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;