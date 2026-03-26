import React, { useState } from "react";
import { Search, Eye, Edit2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const faculty = [
  { id: 1, avatar: "SJ", name: "Dr. Sarah Johnson", designation: "Associate Professor", courses: ["Data Structures", "Algorithms"], accuracy: 88, syllabus: 92, status: "Active" as const },
  { id: 2, avatar: "MC", name: "Prof. Michael Chen", designation: "Assistant Professor", courses: ["Database Systems"], accuracy: 74, syllabus: 65, status: "Active" as const },
  { id: 3, avatar: "PS", name: "Dr. Priya Sharma", designation: "Professor", courses: ["Computer Networks", "Cloud Computing"], accuracy: 82, syllabus: 78, status: "Active" as const },
  { id: 4, avatar: "DW", name: "Prof. David Wilson", designation: "Associate Professor", courses: ["Operating Systems"], accuracy: 79, syllabus: 85, status: "On Leave" as const },
  { id: 5, avatar: "ER", name: "Dr. Emily Rodriguez", designation: "Assistant Professor", courses: ["Software Engineering", "Web Dev"], accuracy: 91, syllabus: 94, status: "Active" as const },
  { id: 6, avatar: "JK", name: "Prof. James Kumar", designation: "Associate Professor", courses: ["Machine Learning"], accuracy: 68, syllabus: 60, status: "Active" as const },
  { id: 7, avatar: "AM", name: "Dr. Anita Mehta", designation: "Professor", courses: ["AI Fundamentals"], accuracy: 57, syllabus: 52, status: "Active" as const },
  { id: 8, avatar: "RG", name: "Prof. Rajan Gupta", designation: "Assistant Professor", courses: ["Compiler Design"], accuracy: 80, syllabus: 75, status: "On Leave" as const },
];

const accuracyColor = (v: number) =>
  v >= 75 ? "text-[#10b981] font-bold" : v >= 60 ? "text-[#f59e0b] font-bold" : "text-[#ef4444] font-bold";

const HodFaculty: React.FC = () => {
  const [search, setSearch] = useState("");

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.courses.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage department faculty and track performance</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold shadow hover:bg-purple-700 hover:shadow-lg transition-all">
            <UserPlus className="w-4 h-4" />
            Add Faculty
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search faculty or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Faculty", "Designation", "Courses", "Accuracy %", "Syllabus %", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {f.avatar}
                        </div>
                        <p className="font-semibold text-gray-900">{f.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{f.designation}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {f.courses.map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-purple-50 text-[#7C3AED] rounded-full text-xs font-medium whitespace-nowrap">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm ${accuracyColor(f.accuracy)}`}>{f.accuracy}%</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-[8rem]">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#10b981] transition-all"
                            style={{ width: `${f.syllabus}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{f.syllabus}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        f.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#7C3AED] hover:bg-purple-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">1–8 of 24 faculty members</p>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white text-xs font-bold">1</button>
              <button className="w-7 h-7 rounded-lg text-gray-500 text-xs hover:bg-gray-100 transition-colors">2</button>
              <button className="w-7 h-7 rounded-lg text-gray-500 text-xs hover:bg-gray-100 transition-colors">3</button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </HodLayout>
  );
};

export default HodFaculty;
