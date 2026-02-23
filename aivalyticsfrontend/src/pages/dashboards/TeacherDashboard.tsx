import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LabelList
} from 'recharts';
import {
  Book,
  Calendar,
  ChartBar,
  CheckCircle,
  Bell as BellIcon,
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
import TeacherAttendance from "../../components/TeacherAttendance";
import CourseManagement from "../../components/CourseManagement";
import MCQGenerator from "../../components/MCQGenerator";
import LoadingSpinner from "../../components/LoadingSpinner";

// Static data for charts
const weeklyPerformanceData = [
  { day: 'Mon', accuracy: 65, attendance: 100 },
  { day: 'Tue', accuracy: 72, attendance: 100 },
  { day: 'Wed', accuracy: 68, attendance: 100 },
  { day: 'Thu', accuracy: 75, attendance: 100 },
  { day: 'Fri', accuracy: 82, attendance: 100 },
  { day: 'Sat', accuracy: 78, attendance: 90 },
  { day: 'Sun', accuracy: 80, attendance: 95 },
];

const conceptMasteryData = [
  { name: "Machine Learning", percentage: 85 },
  { name: "Neural Networks", percentage: 72 },
  { name: "Data Structures", percentage: 90 },
  { name: "Algorithms", percentage: 78 },
  { name: "Statistics", percentage: 88 },
];

const learningTimeData = [
  { day: 'Mon', minutes: 45, goal: 60 },
  { day: 'Tue', minutes: 68, goal: 60 },
  { day: 'Wed', minutes: 52, goal: 60 },
  { day: 'Thu', minutes: 63, goal: 60 },
  { day: 'Fri', minutes: 49, goal: 60 },
  { day: 'Sat', minutes: 32, goal: 60 },
  { day: 'Sun', minutes: 38, goal: 60 },
];

const tabItems = [
  {
    value: "overview",
    label: "Overview",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "blue",
    description: "Dashboard overview and key metrics"
  },
  {
    value: "courses",
    label: "Courses",
    icon: <Book className="h-4 w-4" />,
    color: "purple",
    description: "Manage your courses and content"
  },
  {
    value: "attendance",
    label: "Attendance",
    icon: <Calendar className="h-4 w-4" />,
    color: "emerald",
    description: "Track student attendance"
  },
  {
    value: "quizzes",
    label: "Quizzes",
    icon: <ListCheck className="h-4 w-4" />,
    color: "amber",
    description: "Create and manage assessments"
  }
];

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [animateCharts, setAnimateCharts] = useState(false);

  // Enhanced static data
  const dashboardStats = {
    totalStudents: 156,
    activeStudents: 142,
    averageQuizAccuracy: 75,
    quizzesGenerated: 24,
    engagementLevel: 82,
    quizAccuracyChange: "+5%",
    engagementChange: "+3%",
    upcomingClasses: 3,
    pendingAssignments: 12
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      setAnimateCharts(true);
    }, 1000);
  }, []);

  // Custom tooltip with improved styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
              return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-4 py-3 rounded-lg shadow-xl border border-gray-200/20 dark:border-gray-700/20">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-8">
                <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {entry.value}%
                </span>
          </div>
            ))}
      </div>
    </div>
  );
    }
    return null;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/[0.05] dark:to-purple-500/[0.05]"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, 
                {user?.username ? ` ${user.username}` : ''}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Here's what's happening in your classes today
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center px-4 py-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/50">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Upcoming</div>
                <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats.upcomingClasses}</div>
                <div className="text-xs text-blue-600/70 dark:text-blue-300/70">Classes Today</div>
              </div>
              <div className="text-center px-4 py-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</div>
                <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{dashboardStats.pendingAssignments}</div>
                <div className="text-xs text-amber-600/70 dark:text-amber-300/70">Assignments</div>
              </div>
      </div>
        </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Create Quiz",
            description: "Generate new assessments",
            icon: <PlusIcon className="w-5 h-5" />,
            bgColor: "bg-blue-50/50 dark:bg-blue-900/20",
            borderColor: "border-blue-100/50 dark:border-blue-800/50",
            iconColor: "text-blue-600 dark:text-blue-400",
            onClick: () => navigate("/quiz-generator")
          },
          {
            title: "Schedule Class",
            description: "Plan your sessions",
            icon: <Calendar className="w-5 h-5" />,
            bgColor: "bg-purple-50/50 dark:bg-purple-900/20",
            borderColor: "border-purple-100/50 dark:border-purple-800/50",
            iconColor: "text-purple-600 dark:text-purple-400"
          },
          {
            title: "Grade Assignments",
            description: "Review submissions",
            icon: <DocumentText className="w-5 h-5" />,
            bgColor: "bg-emerald-50/50 dark:bg-emerald-900/20",
            borderColor: "border-emerald-100/50 dark:border-emerald-800/50",
            iconColor: "text-emerald-600 dark:text-emerald-400"
          },
          {
            title: "AI Assistant",
            description: "Get teaching insights",
            icon: <Brain className="w-5 h-5" />,
            bgColor: "bg-amber-50/50 dark:bg-amber-900/20",
            borderColor: "border-amber-100/50 dark:border-amber-800/50",
            iconColor: "text-amber-600 dark:text-amber-400"
          }
        ].map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-lg border ${action.borderColor} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
            <div className="relative p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.bgColor} ${action.iconColor} group-hover:scale-110 transition-transform`}>
                  {action.icon}
        </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{action.description}</div>
              </div>
              </div>
            </div>
          </button>
          ))}
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={dashboardStats.totalStudents.toString()}
          description={`${dashboardStats.activeStudents} active now`}
          icon={<Users className="h-5 w-5" />}
          trend="+12"
          trendLabel="this month"
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
        />
        <StatCard
          title="Quiz Performance"
          value={`${dashboardStats.averageQuizAccuracy}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={dashboardStats.quizAccuracyChange}
          trendLabel="accuracy rate"
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
        />
        <StatCard
          title="Assessments Created"
          value={dashboardStats.quizzesGenerated.toString()}
          icon={<ListCheck className="h-5 w-5" />}
          description="Last 30 days"
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
        />
        <StatCard
          title="Class Engagement"
          value={`${dashboardStats.engagementLevel}%`}
          icon={<ChartBar className="h-5 w-5" />}
          trend={dashboardStats.engagementChange}
          trendLabel="participation"
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-blue-500/0 dark:from-blue-500/[0.02] dark:to-blue-500/0"></div>
          <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                  Weekly Performance
                </span>
              </CardTitle>
              <Badge variant="outline" className="font-normal bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
                Last 7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyPerformanceData}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? "#60a5fa" : "#3b82f6"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={isDark ? "#60a5fa" : "#3b82f6"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"} />
                  <XAxis 
                    dataKey="day" 
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <YAxis 
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke={isDark ? "#60a5fa" : "#3b82f6"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-purple-500/0 dark:from-purple-500/[0.02] dark:to-purple-500/0"></div>
          <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300">
                  Subject Performance
                </span>
              </CardTitle>
              <Badge variant="outline" className="font-normal bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50">
                Class Average
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conceptMasteryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="percentage" 
                    radius={[0, 4, 4, 0]}
                  >
                    {conceptMasteryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={isDark ? `rgba(147, 51, 234, ${0.3 + (entry.percentage / 200)})` : `rgba(147, 51, 234, ${0.4 + (entry.percentage / 200)})`}
                      />
                    ))}
                    <LabelList 
                      dataKey="percentage" 
                      position="right" 
                      formatter={(value: any) => `${value}%`}
                      fill={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-emerald-500/0 dark:from-emerald-500/[0.02] dark:to-emerald-500/0"></div>
          <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
                  Student Learning Time
                </span>
              </CardTitle>
              <Badge variant="outline" className="font-normal bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50">
                Daily Average
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"} />
                  <XAxis 
                    dataKey="day"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <YAxis 
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {learningTimeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.minutes >= entry.goal ? 
                          (isDark ? "rgba(16, 185, 129, 0.7)" : "rgba(5, 150, 105, 0.7)") : 
                          (isDark ? "rgba(99, 102, 241, 0.7)" : "rgba(79, 70, 229, 0.7)")}
                      />
                    ))}
                    <LabelList 
                      dataKey="minutes" 
                      position="top"
                      fill={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <LoadingSpinner variant="secondary" size="lg" />
          <p className="mt-4 text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          {/* Enhanced Tab List */}
        <div className="mb-8">
            <TabsList className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-1 grid grid-cols-4 gap-1">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    relative overflow-hidden group px-4 py-2.5 rounded-lg transition-all duration-300
                    data-[state=active]:bg-${tab.color}-50/50 dark:data-[state=active]:bg-${tab.color}-900/20
                    data-[state=active]:text-${tab.color}-700 dark:data-[state=active]:text-${tab.color}-300
                    data-[state=active]:border-${tab.color}-200/50 dark:data-[state=active]:border-${tab.color}-800/50
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
                  <div className="relative flex items-center gap-2">
                    <span className={`
                      text-gray-400 dark:text-gray-500 group-data-[state=active]:text-${tab.color}-500 
                      dark:group-data-[state=active]:text-${tab.color}-400
                    `}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-2 px-1">
              {tabItems.map((tab) => (
                <div
                  key={tab.value}
                  className={`text-sm text-gray-500 dark:text-gray-400 ${activeTab === tab.value ? 'block' : 'hidden'}`}
                >
                  {tab.description}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-6">
              {/* Course Management Header */}
              <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/0 dark:from-purple-500/[0.05] dark:to-purple-500/0"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
            <div>
                      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300">
                        Course Management
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
          </TabsContent>

          <TabsContent value="attendance">
            <div className="space-y-6">
              {/* Attendance Header */}
              <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/[0.05] dark:to-emerald-500/0"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
                        Attendance Management
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Track and manage student attendance
                      </p>
                    </div>
                    <Badge variant="outline" className="font-normal bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50">
                      Today's Overview
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Attendance Content */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="p-6">
              <TeacherAttendance />
            </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              {/* Quiz Management Header */}
              <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-amber-500/0 dark:from-amber-500/[0.05] dark:to-amber-500/0"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-300">
                        Quiz Management
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
