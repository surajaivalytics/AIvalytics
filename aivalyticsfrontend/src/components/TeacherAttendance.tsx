import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { attendanceAPI } from "../services/attendanceApi";
import { courseService } from "../services/courseApi";
import { toast } from "react-hot-toast";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
  Book,
} from "lucide-react";
import {
  UserGroupIcon,
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Course, Student } from "../types/course";

interface Session {
  id: string;
  course_id: string;
  session_date: string;
  session_time: string;
  topic: string;
  session_type: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
  courseName?: string; // Will be populated from course data
  totalStudents?: number; // Will be populated from course data
}

interface AttendanceRecord {
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
  timestamp: string;
  arrival_time?: string;
  excuse_reason?: string;
}

interface MarkAttendanceData {
  session_id: string;
  attendance_records: {
    student_id: string;
    attendance_status:
      | "present"
      | "absent"
      | "late"
      | "excused"
      | "medical_leave";
    arrival_time?: string;
    excuse_reason?: string;
  }[];
}

const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    session_date: new Date().toISOString().split("T")[0],
    session_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    topic: "",
    session_type: "lecture",
    location: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseDetails(selectedCourseId);
      fetchSessions(selectedCourseId);
    } else {
      setStudents([]);
      setSessions([]);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getTeacherCourses();
      if (response.success) {
        setCourses(response.courses);
        if (response.courses.length > 0) {
          setSelectedCourseId(response.courses[0].id);
        }
      } else {
        toast.error("Failed to fetch courses");
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      if (response.success) {
        setStudents(response.course.enrolledStudents || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAttendanceSessions({
        course_id: courseId,
      });
      if (response.success) {
        // Map sessions to include course name and student count
        const mappedSessions = (response.data || []).map((session: Session) => {
          const course = courses.find((c) => c.id === session.course_id);
          return {
            ...session,
            courseName: course?.name || "Unknown Course",
            totalStudents: course?.enrolledStudents?.length || 0,
          };
        });
        setSessions(mappedSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    try {
      setCreatingSession(true);
      let sessionTime = newSession.session_time;
      if (sessionTime && sessionTime.length === 5) {
        sessionTime = sessionTime + ":00";
      }
      const response = await attendanceAPI.createAttendanceSession({
        course_id: selectedCourseId,
        ...newSession,
        session_time: sessionTime,
      });
      if (response.success) {
        toast.success("Session created successfully");
        setNewSession({
          session_date: new Date().toISOString().split("T")[0],
          session_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
          topic: "",
          session_type: "lecture",
          location: "",
        });
        if (response.data) {
          const course = courses.find((c) => c.id === selectedCourseId);
          const newSessionWithCourse = {
            ...response.data,
            courseName: course?.name || "Unknown Course",
            totalStudents: course?.enrolledStudents?.length || 0,
          };
          setSessions((prev) => [newSessionWithCourse, ...prev]);
          setSelectedSession(newSessionWithCourse);
        } else {
          fetchSessions(selectedCourseId);
        }
      } else {
        if (
          response.message &&
          response.message.includes("unique_session_per_course_datetime")
        ) {
          toast.error(
            "A session for this course, date, and time already exists. Please choose a different time or date."
          );
        } else {
          toast.error(response.message || "Failed to create session");
        }
      }
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message || error?.message || "";
      if (backendMsg.includes("unique_session_per_course_datetime")) {
        toast.error(
          "A session for this course, date, and time already exists. Please choose a different time or date."
        );
      } else {
        toast.error("Failed to create session");
      }
    } finally {
      setCreatingSession(false);
    }
  };

  const markAttendance = async () => {
    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }
    if (Object.keys(attendanceRecords).length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    setLoading(true);
    try {
      const attendanceData: MarkAttendanceData = {
        session_id: selectedSession.id,
        attendance_records: Object.entries(attendanceRecords).map(
          ([studentId, status]) => {
            let record: MarkAttendanceData["attendance_records"][0] = {
              student_id: studentId,
              attendance_status: status as
                | "present"
                | "absent"
                | "late"
                | "excused"
                | "medical_leave",
            };

            if (status === "late") {
              let arrival_time = window.prompt(
                `Enter arrival time (HH:MM:SS) for student ${studentId}:`,
                "09:15:00"
              );
              if (!arrival_time) {
                toast.error("Arrival time is required for late status");
                throw new Error("Arrival time required");
              }
              record.arrival_time = arrival_time;
            }

            if (status === "excused" || status === "medical_leave") {
              let excuse_reason = window.prompt(
                `Enter excuse reason for student ${studentId}:`,
                status === "medical_leave" ? "Medical Leave" : "Approved Excuse"
              );
              if (!excuse_reason || excuse_reason.trim() === "") {
                toast.error(
                  "A detailed excuse reason is required for excused status"
                );
                throw new Error("Excuse reason required");
              }
              record.excuse_reason = excuse_reason.trim();
            }

            return record;
          }
        ),
      };
      const response = await attendanceAPI.markAttendance(attendanceData);
      if (response.success) {
        toast.success("Attendance marked successfully");
        setAttendanceRecords({});
        setSelectedSession(null);
        setSearchTerm("");
      } else {
        toast.error(response.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);

      // Extract error details from the response
      const errorResponse = (error as any)?.response?.data;
      const errorMessage =
        errorResponse?.message ||
        (error instanceof Error ? error.message : "Error marking attendance");

      const errorDetails = errorResponse?.details;

      // Construct a detailed error message
      const fullErrorMessage = errorDetails
        ? `${errorMessage} (Student ID: ${errorDetails.student_id}, Status: ${errorDetails.attendance_status})`
        : errorMessage;

      toast.error(fullErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = async (studentId: string, status: string) => {
    if (!selectedSession) return;

    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));

    try {
      // Mock API call - replace with actual implementation
      console.log(
        `Marking ${status} for student ${studentId} in session ${selectedSession.id}`
      );
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "absent":
        return <XCircleIcon className="w-4 h-4" />;
      case "late":
        return <ClockIconSolid className="w-4 h-4" />;
      case "excused":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700";
      case "late":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700";
      case "excused":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    // Remove seconds if present and format as HH:MM
    return timeString.substring(0, 5);
  };

  // Filter sessions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSessions(sessions);
    } else {
      const filtered = sessions.filter(
        (session) =>
          (session.topic?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (session.courseName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (session.session_date || "").includes(searchTerm) ||
          (session.session_time || "").includes(searchTerm)
      );
      setFilteredSessions(filtered);
    }
  }, [searchTerm, sessions]);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setSearchTerm(
      `${session.topic} - ${session.courseName || "Unknown Course"} (${
        session.session_date
      })`
    );
    setShowSuggestions(false);
    // Load existing attendance records for this session
    loadAttendanceRecords(session.id);
  };

  const loadAttendanceRecords = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getSessionAttendance(sessionId);
      if (response.success && Array.isArray(response.data)) {
        const recordMap: Record<string, string> = {};
        response.data.forEach((rec: any) => {
          recordMap[rec.student_id] = rec.attendance_status;
        });
        setAttendanceRecords(recordMap);
      } else {
        setAttendanceRecords({});
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
      setAttendanceRecords({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/0 dark:from-blue-500/[0.05] dark:to-purple-500/0"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                Attendance Management
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track and manage student attendance records
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {students.length} Students
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selection and Session Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Selection */}
        <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/[0.05] dark:to-emerald-500/0"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Course
              </h3>
            </div>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-all duration-200"
              disabled={loading || courses.length === 0}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* New Session Creation */}
        <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/0 dark:from-purple-500/[0.05] dark:to-purple-500/0"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Session
                </h3>
              </div>
              <button
                onClick={createSession}
                disabled={creatingSession || !selectedCourseId || !newSession.topic}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingSession ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {creatingSession ? "Creating..." : "Create"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newSession.session_date}
                  onChange={(e) => setNewSession(prev => ({ ...prev, session_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/10 focus:border-purple-500/50 dark:focus:border-purple-500/50 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newSession.session_time}
                  onChange={(e) => setNewSession(prev => ({ ...prev, session_time: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/10 focus:border-purple-500/50 dark:focus:border-purple-500/50 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={newSession.topic}
                  onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Enter session topic"
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/10 focus:border-purple-500/50 dark:focus:border-purple-500/50 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Selection */}
      <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/0 dark:from-blue-500/[0.05] dark:to-blue-500/0"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Session
            </h3>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-3 pl-12 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-all duration-200"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          {showSuggestions && filteredSessions.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {session.topic}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.session_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(session.session_time)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {session.courseName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSession && (
            <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedSession.topic}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedSession.session_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedSession.session_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedSession.totalStudents} students
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {selectedSession.courseName}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Marking Section */}
      {selectedSession && (
        <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/[0.05] dark:to-emerald-500/0"></div>
          <div className="relative">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mark Attendance
                </h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100/50 dark:border-emerald-800/50">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {students.length} Students
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {student.username}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Roll: {student.roll_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {[
                        {
                          status: "present",
                          label: "Present",
                          icon: <CheckCircle className="w-4 h-4" />,
                          colors: "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                        },
                        {
                          status: "absent",
                          label: "Absent",
                          icon: <XCircle className="w-4 h-4" />,
                          colors: "bg-red-500 text-white border-red-600 hover:bg-red-600"
                        },
                        {
                          status: "late",
                          label: "Late",
                          icon: <Clock className="w-4 h-4" />,
                          colors: "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                        },
                        {
                          status: "excused",
                          label: "Excused",
                          icon: <AlertTriangle className="w-4 h-4" />,
                          colors: "bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
                        }
                      ].map(({ status, label, icon, colors }) => (
                        <button
                          key={status}
                          onClick={() => updateAttendanceStatus(student.id, status)}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200 hover:shadow-lg
                            ${attendanceRecords[student.id] === status
                              ? colors
                              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {attendanceRecords[student.id] && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current Status:
                      </span>
                      <span className={`
                        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(attendanceRecords[student.id])}
                      `}>
                        {getStatusIcon(attendanceRecords[student.id])}
                        {attendanceRecords[student.id].charAt(0).toUpperCase() + 
                         attendanceRecords[student.id].slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={markAttendance}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Attendance Records'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedSession && (
        <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Session Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select a course and session to start marking attendance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
