import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { attendanceAPI } from "../../services/attendanceApi";
import {
 ChevronLeft,
 ChevronRight,
 CheckCircle,
 XCircle,
 Clock,
 AlertTriangle,
} from "lucide-react";

interface AttendanceRecord {
 id: string;
 session_date: string;
 attendance_status:
 | "present"
 | "absent"
 | "late"
 | "excused"
 | "medical_leave";
 course_name: string;
 session_type: string;
}

interface AttendanceCalendarProps {
 studentId?: string;
 courseId?: string;
 onDateSelect?: (date: string) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
 studentId,
 courseId,
 onDateSelect,
}) => {
 const { theme } = useTheme();
 const [currentDate, setCurrentDate] = useState(new Date());
 const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedDate, setSelectedDate] = useState<string | null>(null);

 const fetchAttendanceData = async () => {
 try {
 setLoading(true);
 setError(null);

 // Prepare date range for the current month
 const startDate = new Date(
 currentDate.getFullYear(),
 currentDate.getMonth(),
 1
 );
 const endDate = new Date(
 currentDate.getFullYear(),
 currentDate.getMonth() + 1,
 0
 );

 // Fetch attendance data
 const response = await attendanceAPI.getStudentCalendarAttendance({
 student_id: studentId,
 course_id: courseId,
 start_date: startDate.toISOString().split("T")[0],
 end_date: endDate.toISOString().split("T")[0],
 limit: 100, // Increased limit to capture all records
 });

 if (response.success && response.data?.attendance_records) {
 setAttendanceData(response.data.attendance_records);
 } else {
 throw new Error(response.message || "Failed to fetch attendance data");
 }
 } catch (err) {
 console.error("Attendance calendar fetch error:", err);
 setError(
 err instanceof Error
 ? err.message
 : "Unable to load attendance calendar data"
 );
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchAttendanceData();
 }, [currentDate, studentId, courseId]);

 // Helper functions
 const getDaysInMonth = (date: Date) => {
 const year = date.getFullYear();
 const month = date.getMonth();
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const daysInMonth = lastDay.getDate();
 const startingDayOfWeek = firstDay.getDay();

 const days = [];

 // Add empty cells for days before the first day of the month
 for (let i = 0; i < startingDayOfWeek; i++) {
 days.push(null);
 }

 // Add days of the month
 for (let day = 1; day <= daysInMonth; day++) {
 days.push(day);
 }

 return days;
 };

 const getAttendanceForDate = (day: number) => {
 const dateStr = `${currentDate.getFullYear()}-${String(
 currentDate.getMonth() + 1
 ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
 return attendanceData.filter((record) =>
 record.session_date.startsWith(dateStr)
 );
 };

 const getDateStatus = (day: number) => {
 const records = getAttendanceForDate(day);
 if (records.length === 0) return "no-session";

 const statuses = records.map((r) => r.attendance_status);

 if (statuses.every((s) => s === "present")) return "present";
 if (statuses.every((s) => s === "absent")) return "absent";
 if (statuses.some((s) => s === "late")) return "late";
 if (statuses.some((s) => s === "excused")) return "excused";
 return "mixed";
 };

 const getStatusColor = (status: string) => {
 const colors = {
 present: theme === "dark" ? "bg-green-600" : "bg-green-500",
 absent: theme === "dark" ? "bg-red-600" : "bg-red-500",
 late: theme === "dark" ? "bg-yellow-600" : "bg-yellow-500",
 excused: theme === "dark" ? "bg-blue-600" : "bg-blue-500",
 mixed: theme === "dark" ? "bg-purple-600" : "bg-purple-500",
 "no-session": theme === "dark" ? "bg-gray-700" : "bg-gray-200",
 };
 return colors[status as keyof typeof colors] || colors["no-session"];
 };

 const handleDateClick = (day: number) => {
 const dateStr = `${currentDate.getFullYear()}-${String(
 currentDate.getMonth() + 1
 ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
 setSelectedDate(dateStr);
 onDateSelect?.(dateStr);
 };

 const navigateMonth = (direction: "prev" | "next") => {
 setCurrentDate((prev) => {
 const newDate = new Date(prev);
 if (direction === "prev") {
 newDate.setMonth(prev.getMonth() - 1);
 } else {
 newDate.setMonth(prev.getMonth() + 1);
 }
 return newDate;
 });
 };

 const monthNames = [
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December",
 ];

 const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

 const days = getDaysInMonth(currentDate);

 // Render detailed view for selected date
 const renderDateDetails = () => {
 if (!selectedDate) return null;

 const records = attendanceData.filter((record) =>
 record.session_date.startsWith(selectedDate)
 );

 return (
 <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
 <h4 className="text-lg font-semibold mb-3">
 Attendance on {new Date(selectedDate).toLocaleDateString()}
 </h4>
 {records.length === 0 ? (
 <p className="text-gray-500">No attendance records for this date</p>
 ) : (
 <div className="space-y-2">
 {records.map((record) => (
 <div
 key={record.id}
 className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-md p-3"
 >
 <div className="flex items-center space-x-3">
 {record.attendance_status === "present" && (
 <CheckCircle className="w-5 h-5 text-green-500" />
 )}
 {record.attendance_status === "absent" && (
 <XCircle className="w-5 h-5 text-red-500" />
 )}
 {record.attendance_status === "late" && (
 <Clock className="w-5 h-5 text-yellow-500" />
 )}
 {(record.attendance_status === "excused" ||
 record.attendance_status === "medical_leave") && (
 <AlertTriangle className="w-5 h-5 text-blue-500" />
 )}
 <div>
 <p className="font-medium">{record.course_name}</p>
 <p className="text-sm text-gray-500">
 {record.session_type}
 </p>
 </div>
 </div>
 <span
 className={`px-2 py-1 rounded-full text-xs font-medium ${
 record.attendance_status === "present"
 ? "bg-green-100 text-green-800"
 : record.attendance_status === "absent"
 ? "bg-red-100 text-red-800"
 : record.attendance_status === "late"
 ? "bg-yellow-100 text-yellow-800"
 : "bg-blue-100 text-blue-800"
 }`}
 >
 {record.attendance_status}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 };

 if (loading) {
 return (
 <div className="animate-pulse p-6">
 <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
 <div className="grid grid-cols-7 gap-2">
 {Array.from({ length: 35 }).map((_, i) => (
 <div
 key={i}
 className="h-16 bg-gray-300 dark:bg-gray-700 rounded"
 ></div>
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="text-center p-6 bg-gray-50 dark:bg-red-900 rounded-lg">
 <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <p className="text-red-700 dark:text-red-300">{error}</p>
 <button
 onClick={fetchAttendanceData}
 className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
 >
 Try Again
 </button>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {/* Calendar Header */}
 <div className="flex items-center justify-between mb-4">
 <button
 onClick={() => navigateMonth("prev")}
 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
 >
 <ChevronLeft className="w-6 h-6" />
 </button>
 <h2 className="text-xl font-semibold">
 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
 </h2>
 <button
 onClick={() => navigateMonth("next")}
 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
 >
 <ChevronRight className="w-6 h-6" />
 </button>
 </div>

 {/* Day Names */}
 <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
 {dayNames.map((day) => (
 <div key={day}>{day}</div>
 ))}
 </div>

 {/* Calendar Grid */}
 <div className="grid grid-cols-7 gap-1">
 {days.map((day, index) => (
 <div
 key={index}
 className={`
 relative aspect-square border rounded-lg 
 ${
 day
 ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
 : ""
 }
 `}
 onClick={() => day && handleDateClick(day)}
 >
 {day && (
 <>
 <div className="absolute top-1 left-1 text-xs font-medium">
 {day}
 </div>
 <div
 className={`
 absolute bottom-1 right-1 w-2 h-2 rounded-full 
 ${getStatusColor(getDateStatus(day))}
 `}
 ></div>
 </>
 )}
 </div>
 ))}
 </div>

 {/* Date Details */}
 {selectedDate && renderDateDetails()}
 </div>
 );
};

export default AttendanceCalendar;
