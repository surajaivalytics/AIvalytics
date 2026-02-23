import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  BookOpen,
  BarChart3,
  CalendarDays,
  Target,
  Award,
  Activity,
  Grid3X3,
  BarChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import toast from "react-hot-toast";
import { getStudentAttendanceRecords, AttendanceRecord } from "../services/attendanceApi";
import CourseAttendanceCalendar from "../components/CourseAttendanceCalendar";

interface AttendanceStats {
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  lateSessions: number;
  excusedSessions: number;
  attendancePercentage: number;
  currentStreak: number;
  longestStreak: number;
  averageAttendance: number;
}

interface CourseAttendance {
  courseName: string;
  totalSessions: number;
  presentSessions: number;
  attendancePercentage: number;
  lastAttendance: string;
}

const StudentAttendanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "analytics">("overview");

  useEffect(() => {
    console.log('👤 Dashboard: Current user:', user);
    console.log('👤 Dashboard: User ID:', user?.id);
    console.log('👤 Dashboard: User role:', user?.role);
    fetchAttendanceData();
  }, [selectedPeriod]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Dashboard: Starting to fetch attendance data...');
      
      // Fetch attendance records using the existing API
      const data = await getStudentAttendanceRecords();
      console.log('📊 Dashboard: Received data:', data);
      
      if (data.success) {
        const records = data.data.records || [];
        console.log('📋 Dashboard: Processing records:', records.length);
        setAttendanceRecords(records);
        
        // Calculate statistics
        calculateStats(records);
        calculateCourseAttendance(records);
      } else {
        console.log('❌ Dashboard: API returned success: false');
        toast.error('Failed to load attendance data');
        setAttendanceRecords([]);
      }
      
    } catch (error) {
      console.error('❌ Dashboard: Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const totalSessions = records.length;
    const presentSessions = records.filter(r => r.attendance_status === 'present').length;
    const absentSessions = records.filter(r => r.attendance_status === 'absent').length;
    const lateSessions = records.filter(r => r.attendance_status === 'late').length;
    const excusedSessions = records.filter(r => r.attendance_status === 'excused').length;
    
    const attendancePercentage = totalSessions > 0 ? 
      ((presentSessions + lateSessions + excusedSessions) / totalSessions) * 100 : 0;
    
    // Calculate current streak (consecutive present/late/excused)
    const sortedRecords = records.sort((a, b) => 
      new Date(b.session.session_date).getTime() - new Date(a.session.session_date).getTime()
    );
    
    let currentStreak = 0;
    for (const record of sortedRecords) {
      if (['present', 'late', 'excused'].includes(record.attendance_status)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const record of sortedRecords) {
      if (['present', 'late', 'excused'].includes(record.attendance_status)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    setStats({
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      excusedSessions,
      attendancePercentage,
      currentStreak,
      longestStreak,
      averageAttendance: attendancePercentage,
    });
  };

  const calculateCourseAttendance = (records: AttendanceRecord[]) => {
    const courseMap = new Map<string, CourseAttendance>();
    
    records.forEach(record => {
      const courseName = record.session.course.name;
      const existing = courseMap.get(courseName);
      
      if (existing) {
        existing.totalSessions++;
        if (['present', 'late', 'excused'].includes(record.attendance_status)) {
          existing.presentSessions++;
        }
        existing.attendancePercentage = (existing.presentSessions / existing.totalSessions) * 100;
        existing.lastAttendance = record.session.session_date;
      } else {
        courseMap.set(courseName, {
          courseName,
          totalSessions: 1,
          presentSessions: ['present', 'late', 'excused'].includes(record.attendance_status) ? 1 : 0,
          attendancePercentage: ['present', 'late', 'excused'].includes(record.attendance_status) ? 100 : 0,
          lastAttendance: record.session.session_date,
        });
      }
    });
    
    setCourseAttendance(Array.from(courseMap.values()));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "excused":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "excused":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    // Remove seconds if present and format as HH:MM
    return timeString.substring(0, 5);
  };

  // Chart data for attendance trend
  const attendanceTrendData = attendanceRecords
    .sort((a, b) => new Date(a.session.session_date).getTime() - new Date(b.session.session_date).getTime())
    .map(record => ({
      date: formatDate(record.session.session_date),
      attendance: record.attendance_status === 'present' ? 100 : 
                 record.attendance_status === 'late' ? 75 :
                 record.attendance_status === 'excused' ? 50 : 0,
    }));

  // Pie chart data for attendance distribution
  const pieChartData = stats ? [
    { name: 'Present', value: stats.presentSessions, color: '#10B981' },
    { name: 'Late', value: stats.lateSessions, color: '#F59E0B' },
    { name: 'Absent', value: stats.absentSessions, color: '#EF4444' },
    { name: 'Excused', value: stats.excusedSessions, color: '#3B82F6' },
  ] : [];

  const handleDateClick = (date: string, courseName?: string) => {
    console.log(`📅 Date clicked: ${date}, Course: ${courseName || 'All'}`);
    // You can add more functionality here, like showing detailed view
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading attendance data...</span>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Grid3X3 },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Attendance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your attendance performance and statistics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPeriod("all")}
              className={selectedPeriod === "all" ? "bg-blue-50" : ""}
            >
              All Time
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedPeriod("month")}
              className={selectedPeriod === "month" ? "bg-blue-50" : ""}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedPeriod("week")}
              className={selectedPeriod === "week" ? "bg-blue-50" : ""}
            >
              This Week
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Overview Stats */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.attendancePercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.presentSessions + stats.lateSessions + stats.excusedSessions} of {stats.totalSessions} sessions
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.currentStreak}</div>
                        <p className="text-xs text-muted-foreground">
                          Consecutive sessions attended
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.longestStreak}</div>
                        <p className="text-xs text-muted-foreground">
                          Best consecutive attendance
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                          Sessions tracked
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {attendanceTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={attendanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          No attendance data available for trend analysis
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Attendance Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          No attendance data available for distribution
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Course-wise Attendance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course-wise Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {courseAttendance.length > 0 ? (
                      <div className="space-y-4">
                        {courseAttendance.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <BookOpen className="h-5 w-5 text-blue-500" />
                              <div>
                                <h3 className="font-semibold">{course.courseName}</h3>
                                <p className="text-sm text-gray-600">
                                  {course.presentSessions} of {course.totalSessions} sessions
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-lg font-bold">{course.attendancePercentage.toFixed(1)}%</div>
                                <div className="text-sm text-gray-600">Attendance</div>
                              </div>
                              <div className="w-16 h-16">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { value: course.presentSessions, fill: '#10B981' },
                                        { value: course.totalSessions - course.presentSessions, fill: '#E5E7EB' }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={15}
                                      outerRadius={25}
                                      dataKey="value"
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        No course attendance data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Attendance Records */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendanceRecords.length > 0 ? (
                      <div className="space-y-4">
                        {attendanceRecords.slice(0, 10).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              {getStatusIcon(record.attendance_status)}
                              <div>
                                <h3 className="font-semibold">{record.session.course.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(record.session.session_date)} • {formatTime(record.session.session_time)}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(record.attendance_status)}>
                              {record.attendance_status.charAt(0).toUpperCase() + record.attendance_status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        No attendance records available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <CourseAttendanceCalendar
                attendanceRecords={attendanceRecords}
                onDateClick={handleDateClick}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Advanced analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentAttendanceDashboard;
