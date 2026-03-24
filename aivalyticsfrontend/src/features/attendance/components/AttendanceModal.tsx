import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import AttendanceBadge from "./AttendanceBadge";

interface AttendanceRecord {
 id: string;
 student_id: string;
 student_name: string;
 session_date: string;
 session_time: string;
 attendance_status: "present" | "absent" | "late" | "excused";
 arrival_time?: string;
 notes?: string;
 course_name: string;
 session_type: string;
 location?: string;
}

interface AttendanceModalProps {
 isOpen: boolean;
 onClose: () => void;
 record?: AttendanceRecord;
 mode: "view" | "edit" | "create";
 onSave?: (data: any) => void;
 students?: Array<{ id: string; name: string }>;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
 isOpen,
 onClose,
 record,
 mode,
 onSave,
 students = [],
}) => {
 const { theme } = useTheme();
 const [formData, setFormData] = useState({
 student_id: "",
 student_name: "",
 attendance_status: "present" as "present" | "absent" | "late" | "excused",
 arrival_time: "",
 notes: "",
 excuse_reason: "",
 });
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});

 useEffect(() => {
 if (record) {
 setFormData({
 student_id: record.student_id,
 student_name: record.student_name,
 attendance_status: record.attendance_status,
 arrival_time: record.arrival_time || "",
 notes: record.notes || "",
 excuse_reason: "",
 });
 } else {
 setFormData({
 student_id: "",
 student_name: "",
 attendance_status: "present",
 arrival_time: "",
 notes: "",
 excuse_reason: "",
 });
 }
 setErrors({});
 }, [record, isOpen]);

 const handleInputChange = (field: string, value: string) => {
 setFormData((prev) => ({
 ...prev,
 [field]: value,
 }));
 // Clear error when user starts typing
 if (errors[field]) {
 setErrors((prev) => ({
 ...prev,
 [field]: "",
 }));
 }
 };

 const handleStudentSelect = (studentId: string) => {
 const student = students.find((s) => s.id === studentId);
 setFormData((prev) => ({
 ...prev,
 student_id: studentId,
 student_name: student?.name || "",
 }));
 };

 const validateForm = () => {
 const newErrors: Record<string, string> = {};

 if (mode === "create" && !formData.student_id) {
 newErrors.student_id = "Please select a student";
 }

 if (formData.attendance_status === "late" && !formData.arrival_time) {
 newErrors.arrival_time = "Arrival time is required for late attendance";
 }

 if (
 formData.attendance_status === "excused" &&
 !formData.excuse_reason &&
 !formData.notes
 ) {
 newErrors.excuse_reason = "Please provide a reason for excused absence";
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSave = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 await onSave?.(formData);
 onClose();
 } catch (error) {
 console.error("Error saving attendance:", error);
 } finally {
 setLoading(false);
 }
 };

 const formatDateTime = (date: string, time: string) => {
 const dateObj = new Date(`${date}T${time}`);
 return dateObj.toLocaleString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
 onClick={onClose}
 />

 {/* Modal */}
 <div className="flex min-h-full items-center justify-center p-4">
 <div
 className={`
 relative w-full max-w-md transform overflow-hidden rounded-lg shadow-xl transition-all
 ${theme === "dark" ? "bg-gray-800" : "bg-white"}
 `}
 >
 {/* Header */}
 <div
 className={`px-6 py-4 border-b ${
 theme === "dark" ? "border-gray-700" : "border-gray-200"
 }`}
 >
 <div className="flex items-center justify-between">
 <h3
 className={`text-lg font-semibold ${
 theme === "dark" ? "text-white" : "text-gray-900"
 }`}
 >
 {mode === "view" && "Attendance Details"}
 {mode === "edit" && "Edit Attendance"}
 {mode === "create" && "Mark Attendance"}
 </h3>
 <button
 onClick={onClose}
 className={`p-2 rounded-lg ${
 theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
 } transition-colors`}
 >
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="px-6 py-4 space-y-4">
 {/* Session Info (View Mode) */}
 {mode === "view" && record && (
 <div
 className={`p-4 rounded-lg ${
 theme === "dark" ? "bg-gray-700" : "bg-gray-50"
 }`}
 >
 <h4 className="font-medium mb-2">{record.course_name}</h4>
 <div className="text-sm space-y-1">
 <p>
 <span className="font-medium">Date:</span>{" "}
 {formatDateTime(record.session_date, record.session_time)}
 </p>
 <p>
 <span className="font-medium">Type:</span>{" "}
 {record.session_type}
 </p>
 {record.location && (
 <p>
 <span className="font-medium">Location:</span>{" "}
 {record.location}
 </p>
 )}
 </div>
 </div>
 )}

 {/* Student Selection (Create Mode) */}
 {mode === "create" && (
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Student *
 </label>
 <select
 value={formData.student_id}
 onChange={(e) => handleStudentSelect(e.target.value)}
 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
 theme === "dark"
 ? "bg-gray-700 border-gray-600 text-white"
 : "bg-white border-gray-300 text-gray-900"
 } ${errors.student_id ? "border-red-500" : ""}`}
 >
 <option value="">Select a student</option>
 {students.map((student) => (
 <option key={student.id} value={student.id}>
 {student.name}
 </option>
 ))}
 </select>
 {errors.student_id && (
 <p className="text-red-500 text-sm mt-1">
 {errors.student_id}
 </p>
 )}
 </div>
 )}

 {/* Student Name (View/Edit Mode) */}
 {mode !== "create" && (
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Student
 </label>
 <p
 className={`text-lg font-medium ${
 theme === "dark" ? "text-white" : "text-gray-900"
 }`}
 >
 {formData.student_name}
 </p>
 </div>
 )}

 {/* Attendance Status */}
 <div>
 <label
 className={`block text-sm font-medium mb-2 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Attendance Status *
 </label>
 {mode === "view" ? (
 <AttendanceBadge
 status={formData.attendance_status}
 size="lg"
 />
 ) : (
 <div className="grid grid-cols-2 gap-2">
 {(["present", "absent", "late", "excused"] as const).map(
 (status) => (
 <button
 key={status}
 type="button"
 onClick={() =>
 handleInputChange("attendance_status", status)
 }
 className={`p-3 rounded-lg border-2 transition-colors ${
 formData.attendance_status === status
 ? "border-blue-500 bg-gray-50 text-blue-700"
 : theme === "dark"
 ? "border-gray-600 text-gray-300 hover:bg-gray-700"
 : "border-gray-300 text-gray-700 hover:bg-gray-50"
 }`}
 >
 <AttendanceBadge status={status} size="sm" />
 </button>
 )
 )}
 </div>
 )}
 </div>

 {/* Arrival Time (for Late status) */}
 {formData.attendance_status === "late" && (
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Arrival Time *
 </label>
 <input
 type="time"
 value={formData.arrival_time}
 onChange={(e) =>
 handleInputChange("arrival_time", e.target.value)
 }
 disabled={mode === "view"}
 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
 theme === "dark"
 ? "bg-gray-700 border-gray-600 text-white"
 : "bg-white border-gray-300 text-gray-900"
 } ${errors.arrival_time ? "border-red-500" : ""} ${
 mode === "view" ? "opacity-50" : ""
 }`}
 />
 {errors.arrival_time && (
 <p className="text-red-500 text-sm mt-1">
 {errors.arrival_time}
 </p>
 )}
 </div>
 )}

 {/* Excuse Reason (for Excused status) */}
 {formData.attendance_status === "excused" && mode !== "view" && (
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Excuse Reason *
 </label>
 <textarea
 value={formData.excuse_reason}
 onChange={(e) =>
 handleInputChange("excuse_reason", e.target.value)
 }
 rows={3}
 placeholder="Please provide a reason for the excused absence..."
 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
 theme === "dark"
 ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
 : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
 } ${errors.excuse_reason ? "border-red-500" : ""}`}
 />
 {errors.excuse_reason && (
 <p className="text-red-500 text-sm mt-1">
 {errors.excuse_reason}
 </p>
 )}
 </div>
 )}

 {/* Notes */}
 <div>
 <label
 className={`block text-sm font-medium mb-1 ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Notes
 </label>
 <textarea
 value={formData.notes}
 onChange={(e) => handleInputChange("notes", e.target.value)}
 rows={3}
 disabled={mode === "view"}
 placeholder="Additional notes..."
 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
 theme === "dark"
 ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
 : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
 } ${mode === "view" ? "opacity-50" : ""}`}
 />
 </div>
 </div>

 {/* Footer */}
 <div
 className={`px-6 py-4 border-t ${
 theme === "dark" ? "border-gray-700" : "border-gray-200"
 } flex justify-end space-x-3`}
 >
 <button
 onClick={onClose}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 theme === "dark"
 ? "text-gray-300 hover:bg-gray-700"
 : "text-gray-700 hover:bg-gray-100"
 }`}
 >
 {mode === "view" ? "Close" : "Cancel"}
 </button>
 {mode !== "view" && (
 <button
 onClick={handleSave}
 disabled={loading}
 className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
 loading ? "cursor-wait" : ""
 }`}
 >
 {loading ? "Saving..." : "Save"}
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default AttendanceModal;
