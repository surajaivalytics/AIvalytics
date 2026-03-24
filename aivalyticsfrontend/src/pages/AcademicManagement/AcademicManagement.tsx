import React, { useState, useMemo, useEffect } from "react";
import { 
 PlusIcon, PencilSquareIcon, BookOpenIcon, ArrowUpTrayIcon,
 AcademicCapIcon, CalendarDaysIcon, ClipboardDocumentListIcon,
 CalculatorIcon, PaperAirplaneIcon, ClockIcon, EyeIcon, 
 CheckIcon, XMarkIcon, TrashIcon, ChartBarIcon
} from "@heroicons/react/24/outline";

// --- Interfaces ---
interface Course {
 id: string;
 name: string;
 code: string;
 type: "Theory" | "Lab";
 credits: number;
 students: number;
}

interface Student {
 roll: string;
 name: string;
 status: "Present" | "Absent" | "Pending";
 time: string;
}

interface Assignment {
 id: string;
 courseId: string;
 title: string;
 marks: number;
 dueDate: string;
 submissions: number;
}

const AcademicManagementSystem: React.FC = () => {
 // --- Global State ---
 const [activeTab, setActiveTab] = useState("Courses");
 const [courses, setCourses] = useState<Course[]>([
 { id: "1", name: "Data Structures", code: "CS301", type: "Theory", credits: 4, students: 45 },
 { id: "2", name: "Algorithm Lab", code: "CS302", type: "Lab", credits: 2, students: 45 },
 ]);
 
 const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");

 const [students, setStudents] = useState<Student[]>([
 { roll: "2026AI01", name: "Pruthviraj Patil", status: "Pending", time: "-" },
 { roll: "2026AI02", name: "Alice Smith", status: "Pending", time: "-" },
 { roll: "2026AI03", name: "Bob Johnson", status: "Pending", time: "-" },
 ]);

 const [assignments, setAssignments] = useState<Assignment[]>([
 { id: "a1", courseId: "1", title: "Array Implementation", marks: 100, dueDate: "2026-03-10", submissions: 2 },
 ]);

 // --- Modals State ---
 const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
 const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

 // --- Derived Data (Workability Logic) ---
 const attendanceStats = useMemo(() => {
 const total = students.length;
 const present = students.filter(s => s.status === "Present").length;
 const absent = students.filter(s => s.status === "Absent").length;
 return { total, present, absent, percent: total > 0 ? Math.round((present / total) * 100) : 0 };
 }, [students]);

 const currentCourse = courses.find(c => c.id === selectedCourseId);
 const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);

 // --- Handlers ---
 const handleAddCourse = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const formData = new FormData(e.currentTarget);
 const newCourse: Course = {
 id: Math.random().toString(36).substr(2, 9),
 name: formData.get("name") as string,
 code: formData.get("code") as string,
 type: formData.get("type") as "Theory" | "Lab",
 credits: Number(formData.get("credits")),
 students: 0
 };
 setCourses([...courses, newCourse]);
 setIsCourseModalOpen(false);
 };

 const handleAddAssignment = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const formData = new FormData(e.currentTarget);
 const newAssign: Assignment = {
 id: Math.random().toString(36).substr(2, 9),
 courseId: selectedCourseId,
 title: formData.get("title") as string,
 marks: Number(formData.get("marks")),
 dueDate: formData.get("date") as string,
 submissions: 0
 };
 setAssignments([...assignments, newAssign]);
 setIsAssignModalOpen(false);
 };

 const markAttendance = (roll: string, status: "Present" | "Absent") => {
 setStudents(prev => prev.map(s => s.roll === roll ? { 
 ...s, 
 status, 
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
 } : s));
 };

 return (
 <div className="min-h-screen bg-[#F3F4F6] text-slate-900 font-sans">
 <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
 
 {/* Header */}
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">ACADEMIC HUB</h1>
 <p className="text-slate-500 font-medium">Session: Jan - June 2026</p>
 </div>
 <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
 <span className="text-xs font-bold text-slate-400 uppercase block">Active Course</span>
 <select 
 value={selectedCourseId} 
 onChange={(e) => setSelectedCourseId(e.target.value)}
 className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
 >
 {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
 </select>
 </div>
 </div>

 {/* Navigation */}
 <nav className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit border border-slate-200">
 {[
 { id: "Courses", icon: BookOpenIcon },
 { id: "Attendance", icon: CalendarDaysIcon },
 { id: "Assignments", icon: ClipboardDocumentListIcon },
 { id: "Internal Marks", icon: CalculatorIcon },
 { id: "Leave", icon: PaperAirplaneIcon },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
 activeTab === tab.id ? "bg-white text-[#5D2E8E] shadow-md" : "text-slate-500 hover:bg-white/50"
 }`}
 >
 <tab.icon className="h-4 w-4" />
 {tab.id}
 </button>
 ))}
 </nav>

 {/* --- Tab Content --- */}
 <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[600px] overflow-hidden">
 
 {/* 1. COURSES TAB */}
 {activeTab === "Courses" && (
 <div className="p-8 space-y-6 animate-in fade-in duration-500">
 <div className="flex justify-between items-center">
 <h2 className="text-2xl font-bold">Course Registry</h2>
 <button onClick={() => setIsCourseModalOpen(true)} className="bg-[#5D2E8E] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
 <PlusIcon className="h-5 w-5" /> Add Course
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {courses.map(course => (
 <div key={course.id} className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50/50 hover:border-[#5D2E8E]/30 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-[#5D2E8E] border border-slate-200">{course.code}</span>
 <span className="text-xs font-bold text-slate-400 uppercase">{course.type}</span>
 </div>
 <h3 className="text-lg font-bold mb-1">{course.name}</h3>
 <p className="text-sm text-slate-500 mb-6">{course.credits} Credits</p>
 <div className="flex gap-2">
 <button className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">View Details</button>
 <button 
 onClick={() => setCourses(courses.filter(c => c.id !== course.id))}
 className="p-2 text-red-500 hover:bg-gray-50 rounded-xl transition-colors"
 >
 <TrashIcon className="h-5 w-5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* 2. ATTENDANCE TAB */}
 {activeTab === "Attendance" && (
 <div className="animate-in slide-in-bg-right-4 duration-500">
 <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-8 justify-between items-center">
 <div className="flex gap-12">
 <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Class</p><p className="text-2xl font-bold">{attendanceStats.total}</p></div>
 <div><p className="text-[10px] font-black text-green-500 uppercase mb-1">Present</p><p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p></div>
 <div><p className="text-[10px] font-black text-red-400 uppercase mb-1">Absent</p><p className="text-2xl font-bold text-red-500">{attendanceStats.absent}</p></div>
 </div>
 <div className="h-16 w-16 rounded-full border-4 border-[#5D2E8E] flex items-center justify-center font-black text-[#5D2E8E] bg-white shadow-inner">
 {attendanceStats.percent}%
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="text-[11px] font-black text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
 <tr>
 <th className="px-8 py-4">Student Info</th>
 <th className="px-8 py-4">Status</th>
 <th className="px-8 py-4">Check-In Time</th>
 <th className="px-8 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {students.map(student => (
 <tr key={student.roll} className="hover:bg-slate-50/80 transition-colors">
 <td className="px-8 py-5">
 <p className="font-bold text-slate-800">{student.name}</p>
 <p className="text-[10px] text-slate-400 font-mono">{student.roll}</p>
 </td>
 <td className="px-8 py-5">
 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
 student.status === 'Present' ? 'bg-green-100 text-green-700' : 
 student.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
 }`}>
 {student.status}
 </span>
 </td>
 <td className="px-8 py-5 font-medium text-slate-500 text-sm">{student.time}</td>
 <td className="px-8 py-5 text-right">
 <div className="flex gap-2 justify-end">
 <button onClick={() => markAttendance(student.roll, "Present")} className="p-2 border rounded-xl text-green-600 hover:bg-gray-50"><CheckIcon className="h-5 w-5"/></button>
 <button onClick={() => markAttendance(student.roll, "Absent")} className="p-2 border rounded-xl text-red-600 hover:bg-gray-50"><XMarkIcon className="h-5 w-5"/></button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* 3. ASSIGNMENTS TAB */}
 {activeTab === "Assignments" && (
 <div className="p-8 space-y-6 animate-in fade-in">
 <div className="flex justify-between items-center">
 <h2 className="text-2xl font-bold">Assignments - {currentCourse?.name}</h2>
 <button onClick={() => setIsAssignModalOpen(true)} className="bg-[#5D2E8E] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
 <PlusIcon className="h-5 w-5" /> New Task
 </button>
 </div>
 <div className="space-y-4">
 {courseAssignments.length === 0 ? (
 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
 <p className="text-slate-400 font-bold">No assignments created for this course yet.</p>
 </div>
 ) : (
 courseAssignments.map(a => (
 <div key={a.id} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
 <div className="flex items-center gap-6">
 <div className="h-12 w-12 bg-[#5D2E8E]/10 rounded-2xl flex items-center justify-center text-[#5D2E8E]">
 <ClipboardDocumentListIcon className="h-6 w-6" />
 </div>
 <div>
 <h4 className="font-bold text-slate-800">{a.title}</h4>
 <p className="text-xs font-bold text-slate-400">Due: {new Date(a.dueDate).toLocaleDateString()} • {a.marks} Marks</p>
 </div>
 </div>
 <div className="flex items-center gap-8">
 <div className="text-right">
 <p className="text-xs font-black text-slate-400 uppercase mb-1">Submissions</p>
 <div className="flex items-center gap-3">
 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
 <div className="bg-orange-400 h-full" style={{ width: `${(a.submissions/students.length)*100}%` }}></div>
 </div>
 <span className="text-sm font-bold">{a.submissions}/{students.length}</span>
 </div>
 </div>
 <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100"><EyeIcon className="h-5 w-5 text-slate-400" /></button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* 4. INTERNAL MARKS TAB */}
 {activeTab === "Internal Marks" && (
 <div className="p-8 space-y-8 animate-in zoom-in-95 duration-300">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-[#5D2E8E] p-8 rounded-3xl text-white shadow-xl shadow-[#5D2E8E]/20">
 <ChartBarIcon className="h-8 w-8 mb-4 opacity-50" />
 <p className="text-xs font-black uppercase opacity-70 mb-1">Class Average</p>
 <h3 className="text-4xl font-black">78.4%</h3>
 </div>
 <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl">
 <AcademicCapIcon className="h-8 w-8 mb-4 text-[#5D2E8E] opacity-30" />
 <p className="text-xs font-black text-slate-400 uppercase mb-1">Top Performer</p>
 <h3 className="text-xl font-bold">Pruthviraj Patil</h3>
 </div>
 <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl">
 <CalculatorIcon className="h-8 w-8 mb-4 text-[#5D2E8E] opacity-30" />
 <p className="text-xs font-black text-slate-400 uppercase mb-1">Components</p>
 <h3 className="text-xl font-bold">{courseAssignments.length} Assignments</h3>
 </div>
 </div>
 <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
 <h3 className="font-bold mb-6">Student Marks Ledger</h3>
 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
 <table className="w-full text-left">
 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
 <tr>
 <th className="px-6 py-4">Student</th>
 {courseAssignments.map(a => <th key={a.id} className="px-6 py-4">{a.title}</th>)}
 <th className="px-6 py-4 text-right">Total</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {students.map(s => (
 <tr key={s.roll} className="text-sm">
 <td className="px-6 py-4 font-bold">{s.name}</td>
 {courseAssignments.map(a => <td key={a.id} className="px-6 py-4 text-slate-500 font-medium">85 / {a.marks}</td>)}
 <td className="px-6 py-4 text-right font-black text-[#5D2E8E]">85%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* 5. LEAVE TAB */}
 {activeTab === "Leave" && (
 <div className="p-12 max-w-3xl mx-auto space-y-8 animate-in slide-in-bg-bottom-8">
 <div className="text-center">
 <div className="h-16 w-16 bg-[#5D2E8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <PaperAirplaneIcon className="h-8 w-8 text-[#5D2E8E]" />
 </div>
 <h2 className="text-3xl font-black">Request Absence</h2>
 <p className="text-slate-500">Submit your leave request for faculty approval.</p>
 </div>
 <form onSubmit={(e) => { e.preventDefault(); alert("Application Sent!"); }} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Start Date</label>
 <input type="date" required className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-[#5D2E8E] outline-none transition-colors" />
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">End Date</label>
 <input type="date" required className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-[#5D2E8E] outline-none transition-colors" />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Reason for Absence</label>
 <textarea required rows={4} className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-[#5D2E8E] outline-none transition-colors" placeholder="Explain the reason..."></textarea>
 </div>
 <button type="submit" className="w-full bg-[#5D2E8E] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#5D2E8E]/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
 SEND APPLICATION
 </button>
 </form>
 </div>
 )}
 </div>
 </div>

 {/* --- MODALS (Functional Forms) --- */}
 {isCourseModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
 <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
 <h3 className="text-xl font-black mb-6">New Course</h3>
 <form onSubmit={handleAddCourse} className="space-y-4">
 <input name="name" placeholder="Course Name (e.g. Operating Systems)" required className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#5D2E8E]" />
 <input name="code" placeholder="Course Code (e.g. CS401)" required className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#5D2E8E]" />
 <div className="flex gap-4">
 <input name="credits" type="number" placeholder="Credits" required className="w-1/2 border-2 border-slate-100 p-4 rounded-2xl" />
 <select name="type" className="w-1/2 border-2 border-slate-100 p-4 rounded-2xl bg-white">
 <option value="Theory">Theory</option>
 <option value="Lab">Lab</option>
 </select>
 </div>
 <div className="flex gap-3 pt-4">
 <button type="button" onClick={() => setIsCourseModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
 <button type="submit" className="flex-1 bg-[#5D2E8E] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#5D2E8E]/20">Save Course</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {isAssignModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
 <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
 <h3 className="text-xl font-black mb-2">Create Assignment</h3>
 <p className="text-sm text-slate-400 mb-6">Assigning to: <span className="text-[#5D2E8E] font-bold">{currentCourse?.name}</span></p>
 <form onSubmit={handleAddAssignment} className="space-y-4">
 <input name="title" placeholder="Assignment Title" required className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#5D2E8E]" />
 <div className="grid grid-cols-2 gap-4">
 <input name="marks" type="number" placeholder="Max Marks" required className="border-2 border-slate-100 p-4 rounded-2xl" />
 <input name="date" type="date" required className="border-2 border-slate-100 p-4 rounded-2xl" />
 </div>
 <div className="flex gap-3 pt-4">
 <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
 <button type="submit" className="flex-1 bg-[#5D2E8E] text-white py-4 rounded-2xl font-bold">Publish Task</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};

export default AcademicManagementSystem;