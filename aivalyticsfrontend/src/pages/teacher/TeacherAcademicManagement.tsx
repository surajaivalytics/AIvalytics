import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Book, 
  Calendar, 
  FileText, 
  Target, 
  GraduationCap, 
  ClipboardCheck, 
  BarChart,
  Plus,
  Pencil,
  BookOpen,
  Upload,
  Users,
  Check,
  X,
  Clock,
  Download,
  Filter,
  Eye,
  Camera,
  Link,
  TrendingUp,
  Calculator,
  Award,
  ChevronDown,
  Send,
  RotateCcw
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const TeacherAcademicManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [obeTab, setObeTab] = useState("teaching-planning");

  const tabs = [
    { id: "courses", label: "Courses", icon: Book },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "obe", label: "OBE Mapping", icon: Target },
    { id: "marks", label: "Internal Marks", icon: GraduationCap },
    { id: "leave", label: "Leave", icon: ClipboardCheck },
    { id: "reports", label: "Reports", icon: BarChart },
  ];

  const mockCourses = [
    {
      id: 1,
      name: "Data Structures and Algorithms",
      code: "CS301",
      type: "theory",
      credits: 4,
      semester: 3,
      students: 45
    }
  ];

  const [attendanceData, setAttendanceData] = useState([
    { id: 1, name: "Sarah Johnson", rollNo: "CS2021001", totalClasses: 40, attended: 35, status: "Present" },
    { id: 2, name: "Michael Chen", rollNo: "CS2021002", totalClasses: 40, attended: 28, status: "Absent" },
    { id: 3, name: "Emily Rodriguez", rollNo: "CS2021003", totalClasses: 40, attended: 38, status: "Present" },
    { id: 4, name: "Alex Kumar", rollNo: "CS2021004", totalClasses: 40, attended: 26, status: "Present" },
  ]);

  const mockAssignments = [
    {
      id: 1,
      title: "Binary Search Tree Implementation",
      marks: 100,
      weightage: 20,
      type: "assignment",
      dueDate: "6/25/2025",
      totalStudents: 45,
      submittedCount: 1,
      gradedCount: 1,
      pendingCount: 0,
      status: "Published"
    }
  ];

  const mockPOs = [
    { id: "PO1", level: 3, description: "Engineering knowledge: Apply knowledge of mathematics, science, engineering fundamentals" },
    { id: "PO2", level: 3, description: "Problem analysis: Identify, formulate, research literature, and analyze complex engineering problems" },
    { id: "PO3", level: 2, description: "Design/development of solutions: Design solutions for complex engineering problems" },
    { id: "PO4", level: 2, description: "Conduct investigations of complex problems using research-based knowledge" },
    { id: "PO5", level: 1, description: "Modern tool usage: Create, select, and apply appropriate techniques and tools" },
  ];

  const mockCOs = [
    { code: "CO1", description: "Understand fundamental concepts of data structures and their applications", bloom: "understand", pos: ["PO1", "PO2"] },
    { code: "CO2", description: "Analyze and compare different data structure algorithms for efficiency", bloom: "analyze", pos: ["PO2", "PO4"] },
    { code: "CO3", description: "Design and implement appropriate data structures for given problems", bloom: "create", pos: ["PO3", "PO5"] },
  ];

  const mockAnalytics = {
    coAttainment: [
      { subject: 'CO1', A: 85, fullMark: 100 },
      { subject: 'CO2', A: 72, fullMark: 100 },
      { subject: 'CO3', A: 68, fullMark: 100 },
      { subject: 'CO4', A: 90, fullMark: 100 },
      { subject: 'CO5', A: 75, fullMark: 100 },
    ],
    poAttainment: [
      { name: 'PO1', value: 78 },
      { name: 'PO2', value: 65 },
      { name: 'PO3', value: 82 },
      { name: 'PO4', value: 55 },
      { name: 'PO5', value: 90 },
    ],
    bloomsDistribution: [
      { name: 'Understand', value: 40, color: '#10b981' }, 
      { name: 'Apply', value: 25, color: '#3b82f6' }, 
      { name: 'Analyze', value: 20, color: '#f59e0b' }, 
      { name: 'Create', value: 15, color: '#ef4444' }, 
    ],
    mappingStrength: [
      { name: 'Strong', value: 45, color: '#8b5cf6' },
      { name: 'Moderate', value: 35, color: '#a78bfa' },
      { name: 'Weak', value: 20, color: '#e2e8f0' },
    ]
  };

  const mockInternalMarks = [
    {
      id: 1,
      student: "Sarah Johnson",
      rollNo: "CS2021001",
      assignments: [
        { name: "BST Implementation", score: "85/100", weight: "20%" },
        { name: "Algorithm Analysis", score: "42/50", weight: "15%" },
        { name: "Mid-term Quiz", score: "68/75", weight: "25%" }
      ],
      totalMarks: "52.3/60",
      percentage: 87.2,
      grade: "A"
    },
    {
      id: 2,
      student: "Michael Chen",
      rollNo: "CS2021002",
      assignments: [
        { name: "BST Implementation", score: "72/100", weight: "20%" },
        { name: "Algorithm Analysis", score: "38/50", weight: "15%" },
        { name: "Mid-term Quiz", score: "55/75", weight: "25%" }
      ],
      totalMarks: "44.1/60",
      percentage: 73.5,
      grade: "B"
    },
    {
      id: 3,
      student: "Emily Rodriguez",
      rollNo: "CS2021003",
      assignments: [
        { name: "BST Implementation", score: "65/100", weight: "20%" },
        { name: "Algorithm Analysis", score: "35/50", weight: "15%" },
        { name: "Mid-term Quiz", score: "48/75", weight: "25%" }
      ],
      totalMarks: "39.5/60",
      percentage: 65.8,
      grade: "C"
    }
  ];

  const toggleStatus = (id: number) => {
    setAttendanceData(attendanceData.map(student => 
      student.id === id 
        ? { ...student, status: student.status === "Present" ? "Absent" : "Present" }
        : student
    ));
  };

  const markAllPresent = () => {
    setAttendanceData(attendanceData.map(student => ({ ...student, status: "Present" })));
  };

  const totalStudents = attendanceData.length;
  const presentCount = attendanceData.filter(s => s.status === "Present").length;
  const absentCount = attendanceData.filter(s => s.status === "Absent").length;
  const overallAttendance = Math.round((presentCount / totalStudents) * 100) || 0;

  return (
    <>
      <div className="min-h-screen bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Academic Management System
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Comprehensive platform for course management, assessment, and outcome-based education
              </p>
            </div>
            {activeTab === "attendance" && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition">
                  <Download className="w-4 h-4" /> Export Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition">
                  <Filter className="w-4 h-4" /> View Reports
                </button>
              </div>
            )}
          </div>

          {/* Navigation Pill Tabs */}
          <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50 w-max min-w-full sm:min-w-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "courses" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Secondary Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Course Management
                </h2>
                <button 
                  onClick={() => navigate("/courses/new")}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </button>
              </div>

              {/* My Courses Card/Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Courses</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Credits</th>
                        <th className="px-6 py-4">Semester</th>
                        <th className="px-6 py-4">Students</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition dark:text-gray-200">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.code}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                              {course.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                            {course.credits}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                            {course.semester}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                              <span className="font-medium">{course.students}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <BookOpen className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <Upload className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "attendance" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Management</h2>
              
              {/* Filter Controls Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mark Attendance</h3>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" className="w-full rounded-lg border-gray-200 outline-none border dark:border-gray-700 dark:bg-gray-900 dark:text-white px-4 py-2" defaultValue="2026-03-27" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                    <select className="w-full rounded-lg border-gray-200 outline-none border dark:border-gray-700 dark:bg-gray-900 dark:text-white px-4 py-2">
                      <option>CS301 - Data Structures</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                    <select className="w-full rounded-lg border-gray-200 outline-none border dark:border-gray-700 dark:bg-gray-900 dark:text-white px-4 py-2">
                      <option>Section A</option>
                      <option>Section B</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-auto mt-4 sm:mt-0">
                    <button onClick={markAllPresent} className="w-full bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Mark All Present
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 text-xl"><Users className="w-6 h-6"/></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{totalStudents}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Students</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 text-xl"><Check className="w-6 h-6"/></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{presentCount}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Present</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-xl"><X className="w-6 h-6"/></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{absentCount}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Absent</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 text-xl"><Calendar className="w-6 h-6"/></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{overallAttendance}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Attendance</p>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Attendance - 2026-03-27</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-4">Roll No</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Total Classes</th>
                        <th className="px-6 py-4">Attended</th>
                        <th className="px-6 py-4">Percentage</th>
                        <th className="px-6 py-4">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {attendanceData.map((student) => {
                        const percentage = Math.round((student.attended / student.totalClasses) * 100) || 0;
                        const isLowAttendance = percentage < 75;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition dark:text-gray-200">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.rollNo}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                  {student.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.totalClasses}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.attended}</td>
                            <td className="px-6 py-4">
                              <span className={`font-bold ${isLowAttendance ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                                {percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleStatus(student.id)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                                  student.status === "Present" 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-transparent dark:border-green-800'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-transparent dark:border-red-800'
                                }`}
                              >
                                {student.status === "Present" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                {student.status}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : activeTab === "assignments" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Secondary Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assignment Management
                </h2>
                <button 
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </button>
              </div>

              {/* Assignments List Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assignments</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-4">Assignment</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Submissions</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockAssignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition dark:text-gray-200">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{assignment.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.marks} marks • {assignment.weightage}% weightage</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                              {assignment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                              <span>{assignment.dueDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[150px]">
                            <div className="flex flex-col gap-1 w-full flex-1">
                              <div className="flex items-center justify-between text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                <div className="h-2 flex-grow max-w-[80px] bg-amber-400 rounded-full mr-3">
                                  {/* In reality this would have dynamic width based on ratio */}
                                  <div className="h-full bg-amber-400 rounded-full" style={{width: `${(assignment.submittedCount / assignment.totalStudents) * 100}%`}}></div>
                                </div>
                                <span>{assignment.submittedCount}/{assignment.totalStudents}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                {assignment.gradedCount} graded, {assignment.pendingCount} pending
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-700 text-white shadow-sm">
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "obe" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* OBE Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Automated OBE Mapping System
                </h2>
                <button 
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course Outcome
                </button>
              </div>

              {/* Secondary Navigation */}
              <div className="flex flex-wrap gap-2 lg:gap-0 lg:space-x-2 bg-gray-50/50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50 w-full sm:w-max">
                <button 
                  onClick={() => setObeTab("teaching-planning")}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${obeTab === "teaching-planning" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-600" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"}`}
                >
                  <Upload className={`w-4 h-4 mr-2 ${obeTab === "teaching-planning" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                  Teaching Planning
                </button>
                <button 
                  onClick={() => setObeTab("mapping")}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${obeTab === "mapping" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-600" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"}`}
                >
                  <Link className={`w-4 h-4 mr-2 ${obeTab === "mapping" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                  OBE Mapping
                </button>
                <button 
                  onClick={() => setObeTab("outcomes")}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${obeTab === "outcomes" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-600" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"}`}
                >
                  <Target className={`w-4 h-4 mr-2 ${obeTab === "outcomes" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                  Outcomes
                </button>
                <button 
                  onClick={() => setObeTab("analytics")}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${obeTab === "analytics" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-gray-600" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"}`}
                >
                  <TrendingUp className={`w-4 h-4 mr-2 ${obeTab === "analytics" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                  Analytics
                </button>
              </div>

              {obeTab === "teaching-planning" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Main Upload Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                      <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Book Index for Automated OBE Mapping</h3>
                    </div>
                    <div className="p-6">
                      {/* Upload Zone */}
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Book Index Photo</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mb-8 leading-relaxed">
                          Take a photo or upload an image of your textbook's index page. Our OCR system will extract chapter titles and suggest OBE mappings.
                        </p>
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Camera className="w-4 h-4" />
                            Take Photo
                          </button>
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* How it works Info Box */}
                  <div className="bg-[#eff6ff] dark:bg-blue-900/10 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 dark:text-[#1e3a8a] dark:text-white mb-4">How it works:</h4>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-[#475569] dark:text-gray-400">
                      <li>Upload or capture a photo of your textbook's index page</li>
                      <li>OCR extracts chapter/unit titles automatically</li>
                      <li>System suggests CO/PO/PSO mappings based on content analysis</li>
                      <li>Review and edit mappings with drag-and-drop interface</li>
                      <li>Link to assessments and generate compliance reports</li>
                    </ol>
                  </div>
                </div>
              )}

              {obeTab === "mapping" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 rounded-xl mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Index Extracted Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 hover:cursor-default leading-relaxed text-sm">
                    Upload a book index image in the Teaching Planning tab to start automated OBE mapping.
                  </p>
                  <button 
                    onClick={() => setObeTab("teaching-planning")} 
                    className="flex justify-center items-center gap-2 px-6 py-2.5 bg-[#5b21b6] hover:bg-purple-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                    <Upload className="w-4 h-4" />
                    Go to Teaching Planning
                  </button>
                </div>
              )}

              {obeTab === "outcomes" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Program Outcomes Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/30">
                       <Target className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">Program Outcomes (POs)</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col gap-3">
                        {mockPOs.map((po) => (
                           <div key={po.id} className="p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 flex flex-col gap-2 transition hover:shadow-sm">
                             <div className="flex items-center gap-2">
                               <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                 {po.id}
                               </span>
                               <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  po.level === 3 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                                  po.level === 2 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                               }`}>Level {po.level}</span>
                             </div>
                             <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                               {po.description}
                             </p>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Course Outcomes Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/30">
                       <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Outcomes (COs)</h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                              <th className="px-6 py-4">CO Code</th>
                              <th className="px-6 py-4">Description</th>
                              <th className="px-6 py-4">Bloom's Level</th>
                              <th className="px-6 py-4">Mapped POs</th>
                              <th className="px-6 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {mockCOs.map((co) => (
                               <tr key={co.code} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                                 <td className="px-6 py-4">
                                   <span className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                                     {co.code}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{co.description}</td>
                                 <td className="px-6 py-4">
                                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                      co.bloom === "understand" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
                                      co.bloom === "analyze" ? "bg-[#ffedd5] text-[#c2410c] border-[#ffedd5] dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" :
                                      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                   }`}>
                                     {co.bloom}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4">
                                   <div className="flex gap-1.5 flex-wrap">
                                     {co.pos.map((mpo) => (
                                       <span key={mpo} className="px-2.5 py-1 rounded-[6px] bg-[#fbbf24] text-[#854d0e] font-bold text-xs shadow-sm dark:bg-amber-500/20 dark:text-amber-500">
                                         {mpo}
                                       </span>
                                     ))}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <button className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition shadow-sm">
                                      Edit
                                    </button>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              )}

              {obeTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Top Row: Attainment Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Card: CO Attainment */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Course Outcome (CO) Attainment</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockAnalytics.coAttainment}>
                            <PolarGrid stroke="#e5e7eb" className="dark:opacity-20" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <Radar name="Attainment %" dataKey="A" stroke="#7e22ce" fill="#a855f7" fillOpacity={0.5} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right Card: PO Attainment */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Program Outcome (PO) Attainment</h3>
                      <div className="h-[300px] w-full flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="90%">
                          <RechartsBarChart data={mockAnalytics.poAttainment} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} width={40} />
                            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                            <Bar dataKey="value" fill="#9333ea" radius={[0, 6, 6, 0]} barSize={20}>
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Mapping Strength & Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Card: Mapping Strength */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">CO-PO Mapping Strength</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={mockAnalytics.mappingStrength} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} />
                            <YAxis hide />
                            <RechartsTooltip cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                              {mockAnalytics.mappingStrength.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right Card: Bloom's Level Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bloom's Level Distribution</h3>
                      <div className="h-[260px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mockAnalytics.bloomsDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {mockAnalytics.bloomsDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : activeTab === "marks" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Internal Marks Management
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition inline-flex">
                    <Calculator className="w-4 h-4" /> Recalculate
                  </button>
                  <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition inline-flex">
                    <Download className="w-4 h-4" /> Export Report
                  </button>
                </div>
              </div>

              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Course Selection Card */}
                <div className="md:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Course Selection</h3>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg px-4 py-2.5 outline-none hover:border-gray-300 dark:hover:border-gray-600 transition shadow-sm cursor-pointer">
                      <option>CS301 - Data Structures</option>
                      <option>CS302 - Algorithms</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">76%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Class Average</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <Award className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">A Grades</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Components</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Weightage Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Assessment Weightage Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Assignments", pct: 35, desc: "Programming assignments and projects", fill: 35 },
                    { title: "Quizzes", pct: 25, desc: "Regular concept-based quizzes", fill: 25 },
                    { title: "Tests", pct: 30, desc: "Mid-term and unit tests", fill: 30 },
                    { title: "Participation", pct: 10, desc: "Class participation and activities", fill: 10 }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-sm transition group">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">{item.title}</h4>
                         <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-bold rounded border border-gray-100 dark:border-gray-600">
                           {item.pct}%
                         </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed pr-2 min-h-[32px]">
                        {item.desc}
                      </p>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-purple-700 dark:bg-purple-600 rounded-l-full" style={{ width: '40%' }}></div>
                        <div className="h-full bg-amber-400 rounded-r-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Internal Marks Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-transparent">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student Internal Marks</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-transparent">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Assignment Breakdown</th>
                        <th className="px-6 py-4">Total Marks</th>
                        <th className="px-6 py-4">Percentage</th>
                        <th className="px-6 py-4">Grade</th>
                        <th className="px-6 py-4 w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockInternalMarks.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                          <td className="px-6 py-5 align-top">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{student.student}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{student.rollNo}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <ul className="space-y-1.5">
                              {student.assignments.map((ast, idx) => (
                                <li key={idx} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                                  <span className="truncate max-w-[130px]" title={ast.name}>{ast.name.length > 15 ? ast.name.substring(0,14)+'...' : ast.name}</span>
                                  <span className="font-medium whitespace-nowrap text-gray-800 dark:text-gray-200">{ast.score} ({ast.weight})</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{student.totalMarks}</span>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex mt-0.5">
                                <div className="h-full bg-purple-700 dark:bg-purple-600" style={{ width: `${student.percentage}%` }}></div>
                                <div className="h-full bg-amber-400" style={{ width: '4px' }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{student.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                               student.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                               student.grade === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                               'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                             }`}>
                               {student.grade}
                             </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <button className="px-3 border border-gray-200 dark:border-gray-600 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm w-full text-center">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grade Distribution Footer */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Grade Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { grade: "Grade A", count: 1, percent: "33%", colorClass: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" },
                    { grade: "Grade B", count: 1, percent: "33%", colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
                    { grade: "Grade C", count: 1, percent: "33%", colorClass: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400" },
                    { grade: "Grade D", count: 0, percent: "0%", colorClass: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
                    { grade: "Grade F", count: 0, percent: "0%", colorClass: "text-[#ef4444] bg-[#fef2f2] dark:bg-red-900/20 dark:text-red-400" }
                  ].map((g, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:shadow-sm transition">
                      <p className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-2">{g.count}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5 ${g.colorClass}`}>
                        {g.grade}
                      </span>
                      <p className="text-xs text-gray-400 font-medium">{g.percent}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "leave" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Management</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply for leave and track your applications</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium shadow-sm transition inline-flex">
                    <Send className="w-4 h-4" /> Apply Leave
                  </button>
                  <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition inline-flex">
                    <RotateCcw className="w-4 h-4" /> Leave History
                  </button>
                </div>
              </div>

              {/* Leave Application Form Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leave Application Form</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 ml-11">
                  Fill out the form below to apply for leave. Your application will be sent to your reporting authority for approval.
                </p>

                <form className="space-y-6 max-w-5xl">
                  {/* Top Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Leave Type */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        Leave Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition shadow-sm cursor-pointer">
                          <option value="">Select leave type</option>
                          <option value="casual">Casual Leave</option>
                          <option value="sick">Sick Leave</option>
                          <option value="duty">Duty Leave</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Leave Duration */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        Leave Duration
                      </label>
                      <div className="flex items-center gap-2 h-10 px-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 border border-transparent rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>0 day(s)</span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="mm/dd/yyyy"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition shadow-sm placeholder:text-gray-400"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="mm/dd/yyyy"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition shadow-sm placeholder:text-gray-400"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Reason for Leave */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                      Reason for Leave <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Please provide a detailed reason for your leave application"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-4 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition shadow-sm placeholder:text-gray-400 resize-y"
                    ></textarea>
                  </div>

                  {/* Alternate Teaching Arrangement */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-900 dark:text-gray-200 mb-2">
                      Alternate Teaching Arrangement
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Describe how your classes will be covered during your absence (optional)"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-4 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition shadow-sm placeholder:text-gray-400 resize-y"
                    ></textarea>
                  </div>

                  {/* Submit Action */}
                  <div className="flex justify-end pt-4">
                    <button type="button" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium shadow-sm transition">
                      <Send className="w-4 h-4" /> Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                This module is currently under development. Please check back later for updates.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default TeacherAcademicManagement;
