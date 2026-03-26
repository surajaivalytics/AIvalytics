import React from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const trend = [
  { month: "Jan", accuracy: 71, syllabus: 63 },
  { month: "Feb", accuracy: 72, syllabus: 66 },
  { month: "Mar", accuracy: 69, syllabus: 68 },
  { month: "Apr", accuracy: 74, syllabus: 70 },
  { month: "May", accuracy: 75, syllabus: 72 },
  { month: "Jun", accuracy: 76, syllabus: 71 },
];

const facultyData = [
  { name: "Dr. Rodriguez", accuracy: 91, syllabus: 94, tests: 18, trend: "up" as const },
  { name: "Dr. Johnson", accuracy: 88, syllabus: 92, tests: 14, trend: "up" as const },
  { name: "Dr. Sharma", accuracy: 82, syllabus: 78, tests: 12, trend: "up" as const },
  { name: "Prof. Wilson", accuracy: 79, syllabus: 85, tests: 10, trend: "stable" as const },
  { name: "Prof. Chen", accuracy: 74, syllabus: 65, tests: 9, trend: "down" as const },
  { name: "Prof. Kumar", accuracy: 68, syllabus: 60, tests: 8, trend: "down" as const },
];

const ChartTip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((e: any) => (
        <p key={e.name} style={{ color: e.color }}>
          {e.name}: <span className="font-bold">{e.value}%</span>
        </p>
      ))}
    </div>
  ) : null;

const HodPerformance: React.FC = () => (
  <HodLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Department-wide performance trends and faculty comparisons</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Accuracy", value: "74%", icon: TrendingUp, bg: "bg-purple-100", ic: "text-[#7C3AED]" },
          { label: "Avg Syllabus", value: "71%", icon: TrendingUp, bg: "bg-emerald-100", ic: "text-[#10b981]" },
          { label: "Top Performer", value: "Dr. Sharma", icon: Award, bg: "bg-blue-100", ic: "text-blue-600" },
          { label: "Needs Support", value: "Prof. Mehta", icon: AlertTriangle, bg: "bg-red-100", ic: "text-[#ef4444]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.ic}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="font-bold text-gray-900 text-sm truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Accuracy Trend (Jan–Jun)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis domain={[55, 85]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: "#7C3AED" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="syllabus" name="Syllabus %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Faculty Comparison</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={facultyData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 5, bottom: 0 }}
              barSize={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={90} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="accuracy" name="Accuracy %" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              <Bar dataKey="syllabus" name="Syllabus %" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Faculty Performance Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Faculty", "Course", "Accuracy %", "Syllabus %", "Tests", "Trend"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { faculty: "Dr. Emily Rodriguez", course: "Software Engineering", accuracy: 91, syllabus: 94, tests: 18, trend: "up" as const },
                { faculty: "Dr. Sarah Johnson", course: "Data Structures", accuracy: 88, syllabus: 92, tests: 14, trend: "up" as const },
                { faculty: "Dr. Priya Sharma", course: "Computer Networks", accuracy: 82, syllabus: 78, tests: 12, trend: "up" as const },
                { faculty: "Prof. David Wilson", course: "Operating Systems", accuracy: 79, syllabus: 85, tests: 10, trend: "stable" as const },
                { faculty: "Prof. Michael Chen", course: "Database Systems", accuracy: 74, syllabus: 65, tests: 9, trend: "down" as const },
                { faculty: "Prof. James Kumar", course: "Machine Learning", accuracy: 68, syllabus: 60, tests: 8, trend: "down" as const },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 text-sm">{row.faculty}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{row.course}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold text-sm ${row.accuracy >= 75 ? "text-[#10b981]" : row.accuracy >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
                      {row.accuracy}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold text-sm ${row.syllabus >= 75 ? "text-[#10b981]" : row.syllabus >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
                      {row.syllabus}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{row.tests}</td>
                  <td className="px-5 py-3.5">
                    {row.trend === "up" ? (
                      <div className="flex items-center gap-1 text-[#10b981]"><TrendingUp className="w-4 h-4" /><span className="text-xs font-semibold">↑</span></div>
                    ) : row.trend === "down" ? (
                      <div className="flex items-center gap-1 text-[#ef4444]"><TrendingDown className="w-4 h-4" /><span className="text-xs font-semibold">↓</span></div>
                    ) : (
                      <span className="text-xs text-gray-400 font-semibold">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </HodLayout>
);

export default HodPerformance;
