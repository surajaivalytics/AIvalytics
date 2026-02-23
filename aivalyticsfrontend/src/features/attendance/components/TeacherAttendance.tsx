import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { attendanceAPI } from "../../../services/attendanceApi";
import { courseService } from "../../../services/courseApi";
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
import { Course, Student } from "../../../types/course";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Attendance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Mark and manage student attendance for your sessions
              </p>
            </div>
          </div>

          {/* Course Selection Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Course
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
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

              <div className="flex items-end">
                <button
                  onClick={createSession}
                  disabled={
                    creatingSession || !selectedCourseId || !newSession.topic
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {creatingSession ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      New Session
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Create New Session Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <PlusIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Session
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newSession.session_date}
                  onChange={(e) =>
                    setNewSession((prev) => ({
                      ...prev,
                      session_date: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newSession.session_time}
                  onChange={(e) =>
                    setNewSession((prev) => ({
                      ...prev,
                      session_time: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={newSession.topic}
                  onChange={(e) =>
                    setNewSession((prev) => ({
                      ...prev,
                      topic: e.target.value,
                    }))
                  }
                  placeholder="Session topic"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                  disabled={creatingSession}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newSession.session_type}
                  onChange={(e) =>
                    setNewSession((prev) => ({
                      ...prev,
                      session_type: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                  disabled={creatingSession}
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session Selection Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Session
              </h2>
            </div>

            {/* Auto-suggesting Search Input */}
            <div className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions by topic, course, date, or time..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                />
                {showSuggestions && (
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSessions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {session.topic}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {formatDate(session.session_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {formatTime(session.session_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserGroupIcon className="w-4 h-4" />
                              {session.totalStudents || 0} students
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {session.courseName || "Unknown Course"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Session Info */}
            {selectedSession && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedSession.topic}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(selectedSession.session_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatTime(selectedSession.session_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {selectedSession.totalStudents || 0} students
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {selectedSession.courseName || "Unknown Course"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        {selectedSession && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Attendance Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mark Attendance
                </h2>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {students.length} Students
                  </span>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {student.username.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.username}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Roll: {student.roll_number}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Status Buttons */}
                    <div className="flex items-center gap-2">
                      {[
                        {
                          status: "present",
                          color: "emerald",
                          label: "Present",
                          icon: <CheckCircleIcon className="w-4 h-4" />,
                        },
                        {
                          status: "absent",
                          color: "red",
                          label: "Absent",
                          icon: <XCircleIcon className="w-4 h-4" />,
                        },
                        {
                          status: "late",
                          color: "amber",
                          label: "Late",
                          icon: <ClockIconSolid className="w-4 h-4" />,
                        },
                        {
                          status: "excused",
                          color: "blue",
                          label: "Excused",
                          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
                        },
                      ].map(({ status, color, label, icon }) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateAttendanceStatus(student.id, status)
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            ${
                              attendanceRecords[student.id] === status
                                ? `bg-${color}-500 text-white border-${color}-600 shadow-lg`
                                : `bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-${color}-50 dark:hover:bg-${color}-900/30 hover:border-${color}-300 dark:hover:border-${color}-600`
                            }`}
                          title={label}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Status Display */}
                  {attendanceRecords[student.id] && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current Status:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          attendanceRecords[student.id]
                        )}`}
                      >
                        {getStatusIcon(attendanceRecords[student.id])}
                        {attendanceRecords[student.id].charAt(0).toUpperCase() +
                          attendanceRecords[student.id].slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={markAttendance}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Attendance Records"}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedSession && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Session Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select a course and search for sessions above to start marking
              attendance
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
