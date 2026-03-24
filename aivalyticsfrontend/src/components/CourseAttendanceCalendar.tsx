import React, { useState, useMemo } from "react";
import { BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AttendanceRecord } from "../services/attendanceApi";
import AttendanceCalendar from "./AttendanceCalendar";

interface CourseAttendanceCalendarProps {
 attendanceRecords: AttendanceRecord[];
 onDateClick?: (date: string, courseName: string) => void;
}

const CourseAttendanceCalendar: React.FC<CourseAttendanceCalendarProps> = ({
 attendanceRecords,
 onDateClick,
}) => {
 const [selectedCourse, setSelectedCourse] = useState<string>("all");
 const [viewMode, setViewMode] = useState<"combined" | "separate">("combined");

 // Get unique courses from attendance records
 const courses = useMemo(() => {
 const courseSet = new Set<string>();
 attendanceRecords.forEach((record) => {
 courseSet.add(record.session.course.name);
 });
 return Array.from(courseSet).sort();
 }, [attendanceRecords]);

 // Filter records by selected course
 const filteredRecords = useMemo(() => {
 if (selectedCourse === "all") return attendanceRecords;
 return attendanceRecords.filter(
 (record) => record.session.course.name === selectedCourse
 );
 }, [attendanceRecords, selectedCourse]);

 // Group records by course
 const recordsByCourse = useMemo(() => {
 const grouped: Record<string, AttendanceRecord[]> = {};
 attendanceRecords.forEach((record) => {
 const courseName = record.session.course.name;
 if (!grouped[courseName]) {
 grouped[courseName] = [];
 }
 grouped[courseName].push(record);
 });
 return grouped;
 }, [attendanceRecords]);

 const handleDateClick = (date: string) => {
 if (selectedCourse !== "all") {
 onDateClick?.(date, selectedCourse);
 }
 };

 if (attendanceRecords.length === 0) {
 return (
 <Card className="w-full">
 <CardContent className="flex items-center justify-center h-64">
 <div className="text-center text-gray-500">
 <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
 <p>No attendance data available</p>
 <p className="text-sm">
 Attendance records will appear here once marked by teachers
 </p>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header Controls */}
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <CalendarIcon className="h-5 w-5" />
 Course Attendance Calendar
 </CardTitle>
 <div className="flex items-center gap-4">
 {/* Course Selector */}
 <div className="flex items-center gap-2">
 <BookOpen className="h-4 w-4 text-gray-500" />
 <select
 value={selectedCourse}
 onChange={(e) => setSelectedCourse(e.target.value)}
 className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
 >
 <option value="all">All Courses</option>
 {courses.map((course) => (
 <option key={course} value={course}>
 {course}
 </option>
 ))}
 </select>
 </div>

 {/* View Mode Toggle */}
 <div className="flex items-center gap-2">
 <Button
 variant={viewMode === "combined" ? "default" : "outline"}
 size="sm"
 onClick={() => setViewMode("combined")}
 >
 Combined
 </Button>
 <Button
 variant={viewMode === "separate" ? "default" : "outline"}
 size="sm"
 onClick={() => setViewMode("separate")}
 >
 Separate
 </Button>
 </div>
 </div>
 </div>
 </CardHeader>
 </Card>

 {/* Combined View */}
 {viewMode === "combined" && (
 <AttendanceCalendar
 attendanceRecords={filteredRecords}
 selectedCourse={selectedCourse === "all" ? undefined : selectedCourse}
 onDateClick={handleDateClick}
 />
 )}

 {/* Separate View */}
 {viewMode === "separate" && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {courses.map((course) => (
 <Card key={course} className="w-full">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <BookOpen className="h-5 w-5" />
 {course}
 <Badge variant="secondary">
 {recordsByCourse[course]?.length || 0} sessions
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <AttendanceCalendar
 attendanceRecords={recordsByCourse[course] || []}
 selectedCourse={course}
 onDateClick={(date) => onDateClick?.(date, course)}
 />
 </CardContent>
 </Card>
 ))}
 </div>
 )}

 {/* Course Summary */}
 <Card>
 <CardHeader>
 <CardTitle>Course Summary</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {courses.map((course) => {
 const courseRecords = recordsByCourse[course] || [];
 const totalSessions = courseRecords.length;
 const presentSessions = courseRecords.filter((r) =>
 ["present", "late", "excused"].includes(r.attendance_status)
 ).length;
 const attendancePercentage =
 totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

 return (
 <div key={course} className="p-4 border rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-semibold">{course}</h3>
 <Badge variant="outline">{totalSessions} sessions</Badge>
 </div>
 <div className="space-y-2">
 <div className="flex justify-between">
 <span className="text-sm text-gray-600">Attendance:</span>
 <span className="font-medium">
 {attendancePercentage.toFixed(1)}%
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-sm text-gray-600">Present:</span>
 <span className="font-medium">
 {presentSessions}/{totalSessions}
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div
 className="bg-green-500 h-2 rounded-full transition-all duration-300"
 style={{ width: `${attendancePercentage}%` }}
 ></div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
};

export default CourseAttendanceCalendar;
