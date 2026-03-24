import React, { useState, useMemo } from "react";
import {
 ChevronLeft,
 ChevronRight,
 Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AttendanceRecord } from "../services/attendanceApi";

interface AttendanceCalendarProps {
 attendanceRecords: AttendanceRecord[];
 selectedCourse?: string;
 onDateClick?: (date: string) => void;
}

interface CalendarDay {
 date: Date;
 day: number;
 isCurrentMonth: boolean;
 isToday: boolean;
 attendance?: {
 status: "present" | "absent" | "late" | "excused";
 sessionName: string;
 courseName: string;
 time: string;
 };
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
 attendanceRecords,
 selectedCourse,
 onDateClick,
}) => {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [hoveredDate, setHoveredDate] = useState<string | null>(null);

 // Group attendance records by date and course
 const attendanceByDate = useMemo(() => {
 const grouped: Record<string, AttendanceRecord[]> = {};

 attendanceRecords.forEach((record) => {
 const dateKey = record.session.session_date;
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(record);
 });

 return grouped;
 }, [attendanceRecords]);

 // Filter records by selected course
 const filteredRecords = useMemo(() => {
 if (!selectedCourse) return attendanceRecords;
 return attendanceRecords.filter(
 (record) => record.session.course.name === selectedCourse
 );
 }, [attendanceRecords, selectedCourse]);

 // Generate calendar days
 const calendarDays = useMemo(() => {
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();

 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const startDate = new Date(firstDay);
 startDate.setDate(startDate.getDate() - firstDay.getDay());

 const days: CalendarDay[] = [];
 const today = new Date();

 for (let i = 0; i < 42; i++) {
 const date = new Date(startDate);
 date.setDate(startDate.getDate() + i);

 const dateKey = date.toISOString().split("T")[0];
 const dayAttendance = attendanceByDate[dateKey];

 const day: CalendarDay = {
 date,
 day: date.getDate(),
 isCurrentMonth: date.getMonth() === month,
 isToday: date.toDateString() === today.toDateString(),
 attendance: dayAttendance?.[0]
 ? {
 status: dayAttendance[0].attendance_status,
 sessionName: `Session on ${dayAttendance[0].session.session_date}`,
 courseName: dayAttendance[0].session.course.name,
 time: dayAttendance[0].session.session_time,
 }
 : undefined,
 };

 days.push(day);
 }

 return days;
 }, [currentDate, attendanceByDate]);

 const getStatusColor = (status: string) => {
 switch (status) {
 case "present":
 return "bg-green-500";
 case "absent":
 return "bg-red-500";
 case "late":
 return "bg-yellow-500";
 case "excused":
 return "bg-blue-500";
 default:
 return "bg-gray-300";
 }
 };

 const getStatusText = (status: string) => {
 switch (status) {
 case "present":
 return "Present";
 case "absent":
 return "Absent";
 case "late":
 return "Late";
 case "excused":
 return "Excused";
 default:
 return "Unknown";
 }
 };

 const formatTime = (timeString: string) => {
 if (!timeString) return "";
 return timeString.substring(0, 5);
 };

 const navigateMonth = (direction: "prev" | "next") => {
 setCurrentDate((prev) => {
 const newDate = new Date(prev);
 if (direction === "prev") {
 newDate.setMonth(newDate.getMonth() - 1);
 } else {
 newDate.setMonth(newDate.getMonth() + 1);
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

 return (
 <Card className="w-full">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <CalendarIcon className="h-5 w-5" />
 Attendance Calendar
 {selectedCourse && (
 <Badge variant="secondary" className="ml-2">
 {selectedCourse}
 </Badge>
 )}
 </CardTitle>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth("prev")}
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <span className="text-lg font-semibold min-w-[120px] text-center">
 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
 </span>
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth("next")}
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {/* Calendar Legend */}
 <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
 <span className="text-sm">Present</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
 <span className="text-sm">Absent</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
 <span className="text-sm">Late</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
 <span className="text-sm">Excused</span>
 </div>
 </div>

 {/* Calendar Grid */}
 <div className="grid grid-cols-7 gap-1">
 {/* Day Headers */}
 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
 <div
 key={day}
 className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
 >
 {day}
 </div>
 ))}

 {/* Calendar Days */}
 {calendarDays.map((day, index) => (
 <div
 key={index}
 className={`
 relative p-2 min-h-[60px] border border-gray-200 dark:border-gray-700
 ${
 day.isCurrentMonth
 ? "bg-white dark:bg-gray-900"
 : "bg-gray-50 dark:bg-gray-800"
 }
 ${day.isToday ? "ring-2 ring-blue-500" : ""}
 ${
 day.attendance
 ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
 : ""
 }
 transition-colors duration-200
 `}
 onClick={() =>
 day.attendance &&
 onDateClick?.(day.date.toISOString().split("T")[0])
 }
 onMouseEnter={() =>
 day.attendance &&
 setHoveredDate(day.date.toISOString().split("T")[0])
 }
 onMouseLeave={() => setHoveredDate(null)}
 >
 <div className="text-sm font-medium mb-1">{day.day}</div>

 {/* Attendance Indicator */}
 {day.attendance && (
 <div className="flex flex-col items-center gap-1">
 <div
 className={`w-3 h-3 rounded-full ${getStatusColor(
 day.attendance.status
 )}`}
 title={getStatusText(day.attendance.status)}
 />
 <div className="text-xs text-gray-500 dark:text-gray-400">
 {formatTime(day.attendance.time)}
 </div>
 </div>
 )}

 {/* Hover Tooltip */}
 {hoveredDate === day.date.toISOString().split("T")[0] &&
 day.attendance && (
 <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
 <div className="font-semibold">
 {day.attendance.sessionName}
 </div>
 <div className="text-gray-300">
 {day.attendance.courseName}
 </div>
 <div className="text-gray-300">
 {formatTime(day.attendance.time)}
 </div>
 <div className="flex items-center gap-2 mt-1">
 <div
 className={`w-2 h-2 rounded-full ${getStatusColor(
 day.attendance.status
 )}`}
 />
 <span>{getStatusText(day.attendance.status)}</span>
 </div>
 <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Monthly Summary */}
 <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
 <h3 className="font-semibold mb-3">Monthly Summary</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {["present", "absent", "late", "excused"].map((status) => {
 const count = calendarDays.filter(
 (day) => day.attendance?.status === status
 ).length;

 return (
 <div key={status} className="flex items-center gap-2">
 <div
 className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
 />
 <span className="text-sm capitalize">{status}</span>
 <span className="text-sm font-medium">{count}</span>
 </div>
 );
 })}
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default AttendanceCalendar;
