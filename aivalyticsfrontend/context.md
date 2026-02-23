
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, Book, Calendar, MessageSquare, PieChart, TrendingUp, 
  ListCheck, Star, GraduationCap, Users, BookOpen, 
  Clock, BarChart2, Activity, AlertCircle, Brain, GitBranch, LineChart
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import StudentWeeklyReport from '@/components/student/StudentWeeklyReport';
import ImprovementPlan from '@/components/student/ImprovementPlan';
import LearningResources from '@/components/student/LearningResources';
import BadgesAchievements from '@/components/student/BadgesAchievements';
import DailyQuizzes from '@/components/student/DailyQuizzes';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, TooltipProps, Cell, LabelList 
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [animateCharts, setAnimateCharts] = useState(false);
  
  // Module completion data with icons
  const moduleData = [
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
    },
    { 
      name: "Data Structures", 
      completion: 90, 
      icon: <GitBranch className="h-4 w-4" />,
      lastAccessed: "2024-05-08",
      hoursSpent: 15.8,
      classAverage: 82,
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
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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
  const ModuleTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-medium">
            {data.icon}
            {data.name}
          </div>
          <div className="text-sm mt-2 space-y-1">
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

  return (
    <div className="p-6 max-w-full overflow-hidden space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Quizzes Completed" 
          value="42" 
          trend="up"
          trendValue="5 more than last week"
          icon={<Book className="h-6 w-6" />}
        />
        <StatCard 
          title="Overall Accuracy" 
          value="76%" 
          trend="up"
          trendValue="3% from last month"
          icon={<PieChart className="h-6 w-6" />}
        />
        <StatCard 
          title="Streak" 
          value="14 days" 
          description="Keep it up!" 
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard 
          title="Badge Progress" 
          value="3/5" 
          description="Data Science Master" 
          icon={<Award className="h-6 w-6" />}
        />
      </div>

      <Card className="mb-6 overflow-hidden transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            <GraduationCap className="h-5 w-5" />
            Module Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {moduleData.map((module, index) => (
              <TooltipProvider key={index}>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{module.icon}</span>
                          <span className="font-medium">{module.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={module.completion >= 90 ? "success" : 
                              module.completion >= 70 ? "info" : "default"}
                          >
                            {module.completion}%
                          </Badge>
                        </div>
                      </div>

                      <div className="relative h-6 w-full bg-gray-100 rounded-md dark:bg-gray-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-md ${getProgressColor(module.completion)} transition-all duration-1000 ease-out flex items-center px-2 justify-end`}
                          style={{ 
                            width: `${animateCharts ? module.completion : 0}%`,
                            background: `linear-gradient(90deg, ${module.completion < 75 ? 
                              'rgba(139, 92, 246, 0.7)' : 
                              module.completion < 90 ? 
                                'rgba(59, 130, 246, 0.7)' : 
                                'rgba(16, 185, 129, 0.7)'} 0%, ${
                              module.completion < 75 ? 
                                'rgba(139, 92, 246, 1)' : 
                                module.completion < 90 ? 
                                  'rgba(59, 130, 246, 1)' : 
                                  'rgba(16, 185, 129, 1)'} 100%)` 
                          }}
                        >
                          <span className="text-xs font-medium text-white">
                            {module.completion}%
                          </span>
                        </div>
                        
                        {/* Class average indicator */}
                        <div 
                          className="absolute top-0 h-full border-l-2 border-gray-400 dark:border-gray-300 flex items-center"
                          style={{ left: `${module.classAverage}%` }}
                        >
                          <div className="absolute -top-5 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
                            Avg
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between pt-1">
                        <span>Last accessed: {new Date(module.lastAccessed).toLocaleDateString()}</span>
                        <span>{module.completion > module.classAverage ? 
                          `+${module.completion - module.classAverage}% above average` : 
                          `${module.classAverage - module.completion}% below average`}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="w-80">
                    <ModuleTooltip active={true} payload={[{payload: module}]} />
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            ))}

            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-purple-500 dark:bg-purple-600 rounded-full mr-1"></span> 
                Just Started (&lt;75%)
              </div>
              <div className="flex items-center">  
                <span className="inline-block w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full mr-1"></span> 
                In Progress (75-89%)
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full mr-1"></span> 
                Almost Complete (≥90%)
              </div>
              <div className="flex items-center">
                <span className="inline-block w-0 h-6 border-l-2 border-gray-400 dark:border-gray-300 mr-1"></span> 
                Class Average
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Learning Time
              </CardTitle>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <BarChart2 className="h-4 w-4" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500">
                  <LineChart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={learningTimeData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 25,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }}
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#888' }}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={60} stroke="#ff6b6b" strokeDasharray="3 3" label={{ 
                    value: 'Goal: 60 min', 
                    position: 'insideBottomRight',
                    fill: '#ff6b6b',
                    fontSize: 12
                  }} />
                  <ReferenceLine 
                    y={averageLearningTime} 
                    stroke="#4CAF50" 
                    strokeDasharray="5 5" 
                    label={{ 
                      value: `Avg: ${averageLearningTime} min`, 
                      position: 'insideTopLeft',
                      fill: '#4CAF50',
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
                        fill={entry.minutes >= entry.goal ? 
                          'rgba(76, 175, 80, 0.8)' : 
                          'rgba(91, 46, 144, 0.8)'}
                      />
                    ))}
                    <LabelList 
                      dataKey="minutes" 
                      position="top" 
                      fill="#555" 
                      fontSize={10}
                      formatter={(value: number) => `${value}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span className="font-medium">Average:</span> {averageLearningTime} min/day
                {averageLearningTime < 60 ? (
                  <span className="text-amber-500 dark:text-amber-400 ml-2">
                    (Need {60 - averageLearningTime} more min to reach goal)
                  </span>
                ) : (
                  <span className="text-green-500 dark:text-green-400 ml-2">
                    (Exceeding goal by {averageLearningTime - 60} min)
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Attendance Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    className="dark:stroke-gray-700"
                  />
                  {/* Progress circle with animation */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={attendanceData.percentage >= 90 ? "#10B981" : attendanceData.percentage >= 75 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="10"
                    strokeDasharray={`${animateCharts ? attendanceData.percentage * 2.83 : 0} 283`}
                    strokeDashoffset="0"
                    className="transition-all duration-1500 ease-out"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Center emoji and percentage */}
                  <text
                    x="50%"
                    y="40%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="text-3xl"
                  >
                    {getAttendanceInfo(attendanceData.percentage).emoji}
                  </text>
                  <text
                    x="50%"
                    y="60%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className={`text-xl font-bold ${getAttendanceInfo(attendanceData.percentage).color} fill-current`}
                  >
                    {animateCharts ? attendanceData.percentage : 0}%
                  </text>
                </svg>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm font-medium dark:text-gray-300">
                  {attendanceData.attended} of {attendanceData.total} classes attended
                </p>
                <p className={`text-sm font-medium ${getAttendanceInfo(attendanceData.percentage).color}`}>
                  {getAttendanceInfo(attendanceData.percentage).status}
                </p>
                
                {attendanceData.missed.length > 0 ? (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center justify-center cursor-pointer">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {attendanceData.missed.length} missed {attendanceData.missed.length === 1 ? 'session' : 'sessions'}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="w-60">
                        <div className="space-y-2">
                          <p className="font-medium">Missed Sessions:</p>
                          {attendanceData.missed.map((session, index) => (
                            <div key={index} className="text-xs">
                              <p>{session.course}</p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {new Date(session.date).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                ) : (
                  <p className="mt-1 text-xs text-green-500 dark:text-green-400">
                    Perfect attendance!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-6">
          <StudentWeeklyReport />
        </TabsContent>
        
        <TabsContent value="improvement">
          <ImprovementPlan />
        </TabsContent>
        
        <TabsContent value="quizzes">
          <DailyQuizzes />
        </TabsContent>
        
        <TabsContent value="resources">
          <LearningResources />
        </TabsContent>
        
        <TabsContent value="badges">
          <BadgesAchievements />
        </TabsContent>
      </Tabs>

      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-purple-800 dark:text-purple-200">
                  1
                </div>
                <span className="font-medium">Maya Patel</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>192 points</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-purple-800 dark:text-purple-200">
                  2
                </div>
                <span className="font-medium">Alex Johnson</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>187 points</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-2 border-yellow-200 dark:border-yellow-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-yellow-800 dark:text-yellow-200">
                  3
                </div>
                <span className="font-medium">You</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>173 points</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-md dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-medium text-gray-700 dark:text-gray-300">
                  4
                </div>
                <span>Sam Wilson</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-400" />
                <span>165 points</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-md dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-medium text-gray-700 dark:text-gray-300">
                  5
                </div>
                <span>Priya Shah</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-400" />
                <span>152 points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;


import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { generateAIReport } from '@/services/aiService';
import { Quiz } from '@/types/quiz';

// Import our new components
import ActiveQuiz from './ActiveQuiz';
import TodayQuiz from './TodayQuiz';
import UpcomingQuizzes from './UpcomingQuizzes';
import CompletedQuizzes from './CompletedQuizzes';

const DailyQuizzes: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('today');
  const [quizzes, setQuizzes] = useState<{
    today: Quiz | null;
    upcoming: Quiz[];
    completed: Quiz[];
  }>({
    today: null,
    upcoming: [],
    completed: []
  });
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Load quizzes from localStorage
  useEffect(() => {
    const loadQuizzes = () => {
      try {
        const storedQuizzes = JSON.parse(localStorage.getItem('student_quizzes') || '[]');
        const completed = JSON.parse(localStorage.getItem('student_completed_quizzes') || '[]');
        
        console.log("Loaded stored quizzes:", storedQuizzes);
        console.log("Loaded completed quizzes:", completed);
        
        // Parse dates and ensure they're proper Date objects for both sets
        const parsedQuizzes = storedQuizzes.map((q: any) => ({
          ...q,
          date: new Date(q.date)
        }));
        
        const parsedCompleted = completed.map((q: any) => ({
          ...q,
          date: new Date(q.date)
        }));
        
        // Find today's quiz
        const todayQuiz = parsedQuizzes.find((q: Quiz) => q.status === 'available');
        
        // Get upcoming quizzes
        const upcoming = parsedQuizzes
          .filter((q: Quiz) => q.status === 'upcoming')
          .slice(0, 2);
          
        setQuizzes({
          today: todayQuiz || null,
          upcoming,
          completed: parsedCompleted
        });
        
        console.log("Set quizzes state:", {
          today: todayQuiz || null,
          upcoming,
          completed: parsedCompleted
        });
      } catch (error) {
        console.error("Error loading quizzes:", error);
        toast.error("Failed to load quizzes");
      }
    };
    
    loadQuizzes();
    
    // Refresh data every 10 seconds for testing purposes
    const interval = setInterval(loadQuizzes, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentScore(0);
    setAnsweredQuestions(0);
    setQuizCompleted(false);
  };
  
  const handleAnswerQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setCurrentScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => {
      const newAnswered = prev + 1;
      
      // Check if all questions are answered
      if (activeQuiz && activeQuiz.mcqs && newAnswered === activeQuiz.mcqs.length) {
        handleQuizCompletion();
      }
      
      return newAnswered;
    });
  };
  
  const handleQuizCompletion = async () => {
    if (!activeQuiz || !activeQuiz.mcqs) return;
    
    setQuizCompleted(true);
    const totalQuestions = activeQuiz.mcqs.length;
    const accuracy = Math.round((currentScore / totalQuestions) * 100);
    
    // Create completed quiz entry
    const completedQuiz: Quiz = {
      ...activeQuiz,
      status: 'completed',
      score: currentScore,
      accuracy: accuracy
    };
    
    // Store in localStorage
    const completed = JSON.parse(localStorage.getItem('student_completed_quizzes') || '[]');
    localStorage.setItem('student_completed_quizzes', JSON.stringify([completedQuiz, ...completed]));
    
    // Remove from current quizzes
    const currentQuizzes = JSON.parse(localStorage.getItem('student_quizzes') || '[]');
    const updatedQuizzes = currentQuizzes.filter((q: Quiz) => q.id !== activeQuiz.id);
    localStorage.setItem('student_quizzes', JSON.stringify(updatedQuizzes));
    
    // Update state
    setQuizzes(prev => ({
      ...prev,
      today: null,
      completed: [completedQuiz, ...prev.completed]
    }));
    
    // Generate report
    try {
      toast.info("Generating your personalized feedback report...");
      
      // Prepare content for report generation
      const reportContent = `
        Quiz Title: ${activeQuiz.title}
        Topic: ${activeQuiz.topic}
        Score: ${currentScore}/${totalQuestions}
        Accuracy: ${accuracy}%
        Strengths: ${currentScore > totalQuestions / 2 ? 'Good understanding of core concepts' : 'Needs improvement'}
      `;
      
      // Generate AI report
      const report = await generateAIReport('student', reportContent);
      
      // Store report
      const reports = JSON.parse(localStorage.getItem('student_reports') || '[]');
      localStorage.setItem('student_reports', JSON.stringify([
        {
          id: `report-${Date.now()}`,
          quizId: activeQuiz.id,
          title: `${activeQuiz.title} - Performance Report`,
          date: new Date(),
          report
        },
        ...reports
      ]));
      
      toast.success("Feedback report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate feedback report");
    }
  };
  
  const resetActiveQuiz = () => {
    setActiveQuiz(null);
    setSelectedTab('completed');
  };
  
  // If an active quiz is being taken, show the quiz interface
  if (activeQuiz && activeQuiz.mcqs) {
    return (
      <ActiveQuiz 
        activeQuiz={activeQuiz}
        onComplete={resetActiveQuiz}
        currentScore={currentScore}
        answeredQuestions={answeredQuestions}
        quizCompleted={quizCompleted}
        handleAnswerQuestion={handleAnswerQuestion}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs defaultValue="today" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="today">Today's Quiz</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>All Quizzes</span>
          </Badge>
        </div>
        
        <TabsContent value="today" className="mt-4">
          <TodayQuiz quiz={quizzes.today} onStartQuiz={handleStartQuiz} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <UpcomingQuizzes quizzes={quizzes.upcoming} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <CompletedQuizzes quizzes={quizzes.completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyQuizzes;




import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Star, TrendingUp, Calendar, BookOpen, Check } from 'lucide-react';

const BadgesAchievements: React.FC = () => {
  const earnedBadges = [
    {
      id: 1,
      name: "Consistent Learner",
      description: "Completed quizzes for 14 consecutive days",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-green-100 text-green-700",
      date: "Oct 15, 2024"
    },
    {
      id: 2,
      name: "Data Structures Master",
      description: "Achieved 90%+ accuracy in Data Structures topics",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-700",
      date: "Sep 28, 2024"
    },
    {
      id: 3,
      name: "Quick Learner",
      description: "Improved accuracy by 20% in just one week",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-700",
      date: "Sep 10, 2024"
    }
  ];
  
  const inProgressBadges = [
    {
      id: 4,
      name: "Machine Learning Expert",
      description: "Answer 50 ML questions with 80%+ accuracy",
      icon: <Award className="h-5 w-5" />,
      progress: 65,
      color: "bg-orange-100 text-orange-700"
    },
    {
      id: 5,
      name: "Perfect Month",
      description: "Complete all quizzes in a month with no misses",
      icon: <Check className="h-5 w-5" />,
      progress: 80,
      color: "bg-pink-100 text-pink-700"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievement Badges
              </CardTitle>
              <CardDescription>
                Earn badges by completing learning milestones
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex gap-1 items-center">
              <Star className="h-3.5 w-3.5" />
              <span>8 total badges</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Earned Badges (3)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {earnedBadges.map(badge => (
                  <Card key={badge.id} className="border-2 border-dashed">
                    <CardContent className="pt-6 text-center">
                      <div className={`${badge.color} w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3`}>
                        {badge.icon}
                      </div>
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        Earned on {badge.date}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                In Progress (2)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressBadges.map(badge => (
                  <Card key={badge.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`${badge.color} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-amber-600" />
                LinkedIn Certifications
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Professional Certifications</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Connect your LinkedIn account to showcase your learning achievements on your professional profile
                      </p>
                      <div className="mt-3">
                        <Badge variant="outline" className="text-blue-600 border-blue-300">Data Science Fundamentals</Badge>
                        <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">Programming Excellence</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgesAchievements;




import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Video, ListCheck, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LearningResources: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Resources</CardTitle>
          <CardDescription>
            Based on your learning style and identified knowledge gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Course Materials */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Current Course Materials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Machine Learning Foundations</h4>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Lecture notes from Week 3</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Added 2 days ago</span>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Neural Networks Explained</h4>
                    <Badge variant="outline">Video</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Recorded lecture from Prof. Williams</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">28 mins</span>
                    <Button variant="ghost" size="sm">Watch</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Book className="h-5 w-5 mr-2 text-purple-600" />
                Additional AI-recommended Resources
              </h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Visual Guide to Neural Networks</h4>
                        <Badge>Visual Learner</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        An illustrated guide to neural network architectures and functions
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">Aligns with your identified weak areas</span>
                        <Button size="sm" variant="outline">Access</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded text-green-700">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Interactive ML Tutorials</h4>
                        <Badge>Interactive Learner</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Hands-on tutorials for supervised and unsupervised learning
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">Recommended based on your learning style</span>
                        <Button size="sm" variant="outline">Start</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded text-purple-700">
                      <ListCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Practice Problem Set</h4>
                        <Badge>Knowledge Reinforcement</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        20 practice problems covering neural networks and deep learning
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">Helps solidify concepts from recent lectures</span>
                        <Button size="sm" variant="outline">Practice</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* External Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                Industry & Advanced Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex flex-col h-full">
                    <h4 className="font-medium">AI in Healthcare</h4>
                    <p className="text-sm text-gray-500 mt-1 flex-grow">Real-world applications of ML in medical diagnostics</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">Explore</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex flex-col h-full">
                    <h4 className="font-medium">Research Papers</h4>
                    <p className="text-sm text-gray-500 mt-1 flex-grow">Latest publications on deep learning architectures</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">Browse</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex flex-col h-full">
                    <h4 className="font-medium">Career Paths</h4>
                    <p className="text-sm text-gray-500 mt-1 flex-grow">ML engineer and data scientist role requirements</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">View</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningResources;



import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ListCheck, Book, Calendar, GraduationCap } from 'lucide-react';

const ImprovementPlan: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListCheck className="h-5 w-5" />
            AI-Generated Personalized Improvement Plan
          </CardTitle>
          <CardDescription>
            Based on your quiz results from the last 2 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-l-4 border-purple-500 pl-4 py-2 mb-6 bg-purple-50 rounded-r-md">
            <p className="text-purple-700 font-medium">
              Your progress is on track, but focusing on the following areas will help you achieve better results.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topics to Revise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Neural Networks</span>
              <span className="text-muted-foreground">45% Mastery</span>
            </div>
            <Progress value={45} />
            <div className="text-sm text-muted-foreground">
              Focus on activation functions and backpropagation
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Machine Learning</span>
              <span className="text-muted-foreground">68% Mastery</span>
            </div>
            <Progress value={68} />
            <div className="text-sm text-muted-foreground">
              Review supervised vs unsupervised learning
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" size="sm" className="w-full">
              <Book className="h-4 w-4 mr-2" />
              Access Learning Materials
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-3">
            <div className="bg-blue-100 p-1.5 rounded">
              <Book className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Neural Networks Foundations</h4>
              <p className="text-xs text-gray-500 mt-1">PDF • Chapter 3 & 4</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-3">
            <div className="bg-purple-100 p-1.5 rounded">
              <GraduationCap className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Video: ML Models Explained</h4>
              <p className="text-xs text-gray-500 mt-1">Video • 18 min</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-3">
            <div className="bg-green-100 p-1.5 rounded">
              <ListCheck className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Practice Questions</h4>
              <p className="text-xs text-gray-500 mt-1">Quiz • 10 questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Study Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Today</span>
            </div>
            
            <div className="ml-6 border-l-2 border-purple-200 pl-4 pb-3 relative">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-500"></div>
              <p className="text-sm font-medium">4:00 PM - 4:45 PM</p>
              <p className="text-xs text-muted-foreground">Neural Networks</p>
            </div>
            
            <div className="ml-6 border-l-2 border-purple-200 pl-4 relative">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-300"></div>
              <p className="text-sm font-medium">5:00 PM - 5:30 PM</p>
              <p className="text-xs text-muted-foreground">Practice Quiz</p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tomorrow</span>
            </div>
            
            <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-3 relative">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gray-300"></div>
              <p className="text-sm font-medium">3:00 PM - 4:00 PM</p>
              <p className="text-xs text-muted-foreground">Machine Learning Models</p>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              View Full Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovementPlan;








import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart, TrendingUp, BarChart2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const StudentWeeklyReport: React.FC = () => {
  const weeklyPerformanceData = [
    { day: 'Mon', accuracy: 65, attendance: 100 },
    { day: 'Tue', accuracy: 72, attendance: 100 },
    { day: 'Wed', accuracy: 68, attendance: 100 },
    { day: 'Thu', accuracy: 75, attendance: 100 },
    { day: 'Fri', accuracy: 82, attendance: 100 },
    { day: 'Sat', accuracy: 0, attendance: 0 },
    { day: 'Sun', accuracy: 0, attendance: 0 },
  ];

  const conceptMasteryData = [
    { concept: 'Data Structures', mastery: 85 },
    { concept: 'Algorithms', mastery: 72 },
    { concept: 'Machine Learning', mastery: 65 },
    { concept: 'Neural Networks', mastery: 45 },
    { concept: 'Statistics', mastery: 78 },
  ];

  const timeSpentData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 65 },
    { day: 'Wed', minutes: 52 },
    { day: 'Thu', minutes: 58 },
    { day: 'Fri', minutes: 42 },
    { day: 'Sat', minutes: 20 },
    { day: 'Sun', minutes: 15 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="accuracy" stroke="#8884d8" fill="#8884d8" name="Accuracy %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Concept Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={conceptMasteryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="concept" width={150} />
              <Tooltip />
              <Bar dataKey="mastery" fill="#8884d8" name="Mastery %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Time Spent on Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={timeSpentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#82ca9d" name="Minutes" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Attendance Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-6xl font-bold text-purple-700">95%</div>
            <p className="text-gray-500 mt-2">Attendance Rate</p>
            <p className="mt-4 text-sm">19 out of 20 classes attended</p>
            <div className="mt-6 text-center">
              <h4 className="font-medium text-sm">Missed Sessions:</h4>
              <p className="text-gray-600 mt-1 text-sm">Introduction to Deep Learning (Oct 15)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentWeeklyReport;




import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue,
  className,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer", 
        onClick ? "card-hover" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend === 'up' && (
                  <div className="text-education-success flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {trendValue}
                  </div>
                )}
                {trend === 'down' && (
                  <div className="text-education-danger flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {trendValue}
                  </div>
                )}
                {trend === 'neutral' && (
                  <div className="text-gray-500 flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                    {trendValue}
                  </div>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-education-light text-education-primary dark:bg-gray-700 dark:text-purple-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
