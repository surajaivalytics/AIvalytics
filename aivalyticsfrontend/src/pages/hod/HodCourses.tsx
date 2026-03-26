import React, { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const courses = [
  { id: 1, name: "Data Structures", code: "CS201", faculty: "Dr. Sarah Johnson", year: 2, accuracy: 85, syllabus: 78, status: "Active" as const },
  { id: 2, name: "Database Systems", code: "CS301", faculty: "Prof. Michael Chen", year: 3, accuracy: 74, syllabus: 65, status: "Active" as const },
  { id: 3, name: "Computer Networks", code: "CS302", faculty: "Dr. Priya Sharma", year: 3, accuracy: 80, syllabus: 72, status: "Active" as const },
  { id: 4, name: "Operating Systems", code: "CS303", faculty: "Prof. David Wilson", year: 3, accuracy: 79, syllabus: 85, status: "Active" as const },
  { id: 5, name: "Software Engineering", code: "CS401", faculty: "Dr. Emily Rodriguez", year: 4, accuracy: 91, syllabus: 92, status: "Active" as const },
  { id: 6, name: "Machine Learning", code: "CS402", faculty: "Prof. James Kumar", year: 4, accuracy: 68, syllabus: 60, status: "Active" as const },
  { id: 7, name: "Algorithms", code: "CS202", faculty: "Dr. Sarah Johnson", year: 2, accuracy: 88, syllabus: 100, status: "Completed" as const },
  { id: 8, name: "AI Fundamentals", code: "CS403", faculty: "Dr. Anita Mehta", year: 4, accuracy: 57, syllabus: 52, status: "Active" as const },
  { id: 9, name: "Cloud Computing", code: "CS304", faculty: "Dr. Priya Sharma", year: 3, accuracy: 83, syllabus: 70, status: "Upcoming" as const },
];

const yearColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-violet-100 text-violet-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-orange-100 text-[#f97316]",
};

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700",
  Completed: "bg-blue-100 text-blue-700",
  Upcoming: "bg-amber-100 text-amber-700",
};

const HodCourses: React.FC = () => {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.faculty.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === "All" || c.year === parseInt(yearFilter);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchYear && matchStatus;
  });

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{courses.length} courses registered this semester</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold shadow hover:bg-purple-700 hover:shadow-lg transition-all">
            <BookOpen className="w-4 h-4" />
            Add Course
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            <option value="All">All Years</option>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Upcoming</option>
          </select>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden group"
            >
              {/* Header strip */}
              <div className="px-5 py-4 bg-gradient-to-r from-[#7C3AED] to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{c.name}</p>
                    <p className="text-purple-200 text-xs mt-0.5">{c.code}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{c.faculty}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${yearColors[c.year]}`}>
                    Year {c.year}
                  </span>
                </div>

                {/* Accuracy bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="font-semibold text-[#7C3AED]">{c.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#7C3AED] transition-all duration-500"
                      style={{ width: `${c.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Syllabus bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Syllabus</span>
                    <span className="font-semibold text-[#10b981]">{c.syllabus}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#10b981] transition-all duration-500"
                      style={{ width: `${c.syllabus}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-300">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No courses match your filters.</p>
          </div>
        )}
      </div>
    </HodLayout>
  );
};

export default HodCourses;
