import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Target,
  TrendingUp,
  CheckSquare,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";
import { mockFaculty } from "../../data/hod/mockFaculty";
import { mockCourses } from "../../data/hod/mockCourses";
import { mockAlerts } from "../../data/hod/mockAlerts";
import { coursePerformance } from "../../data/hod/mockPerformance";

const TABS = [
  "Department Overview",
  "Faculty Performance",
  "Course Progress",
  "Department Alerts",
];

const PIE_DATA = [
  { name: "First Year", value: 28, color: "#7C3AED" },
  { name: "Second Year", value: 26, color: "#10b981" },
  { name: "Third Year", value: 24, color: "#f59e0b" },
  { name: "Fourth Year", value: 22, color: "#ef4444" },
];

const statusColors: Record<string, string> = {
  "On Track": "bg-blue-100 text-blue-700",
  Behind: "bg-red-100 text-red-700",
  Excellent: "bg-emerald-100 text-emerald-700",
};

const severityConfig = {
  Critical: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", icon: AlertCircle, iconColor: "text-red-500" },
  Warning: { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle, iconColor: "text-amber-500" },
  Info: { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", icon: Info, iconColor: "text-blue-500" },
} as const;

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((e: any) => (
          <p key={e.name} style={{ color: e.color }}>
            {e.name}: <span className="font-bold">{e.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Custom Pie Label ── */
const RADIAN = Math.PI / 180;
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── Stat Card ── */
const StatCard = ({
  title, value, subtitle, subtitleGreen = false,
  icon: Icon, iconBg, iconColor,
}: {
  title: string; value: string; subtitle: string; subtitleGreen?: boolean;
  icon: React.ComponentType<any>; iconBg: string; iconColor: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between hover:shadow-md transition-shadow duration-200">
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-xs font-semibold ${subtitleGreen ? "text-[#10b981]" : "text-gray-400"}`}>
        {subtitle}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 ml-3`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  </div>
);

const HodDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Head of Department Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Computer Science Department · Academic Year 2025–26
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Faculty"
            value="24"
            subtitle="Across all programs"
            icon={Users}
            iconBg="bg-purple-100"
            iconColor="text-[#7C3AED]"
          />
          <StatCard
            title="Department Accuracy"
            value="76%"
            subtitle="↑ 2% from last month"
            subtitleGreen
            icon={Target}
            iconBg="bg-emerald-100"
            iconColor="text-[#10b981]"
          />
          <StatCard
            title="Syllabus Progress"
            value="68%"
            subtitle="↑ On target"
            subtitleGreen
            icon={TrendingUp}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Course Completion"
            value="4/7"
            subtitle="Courses completing this month"
            icon={CheckSquare}
            iconBg="bg-orange-100"
            iconColor="text-[#f97316]"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto px-4 pt-1">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeTab === i
                      ? "border-[#7C3AED] text-[#7C3AED]"
                      : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {/* ── Tab 0: Department Overview ── */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Student Distribution by Year
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        outerRadius={88}
                        dataKey="value"
                        labelLine={false}
                        label={PieLabel}
                      >
                        {PIE_DATA.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, ""]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* 2×2 legend grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 px-2">
                    {PIE_DATA.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {entry.name}{" "}
                          <span className="font-semibold">{entry.value}%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Course Performance Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart
                      data={coursePerformance}
                      margin={{ top: 5, right: 10, left: -20, bottom: 50 }}
                      barSize={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      <Bar dataKey="accuracy" name="Accuracy %" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="syllabus" name="Syllabus %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Tab 1: Faculty Performance ── */}
            {activeTab === 1 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Faculty Name", "Course Assigned", "Accuracy %", "Syllabus %", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4 first:pr-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockFaculty.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {f.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                              <p className="text-xs text-gray-400">{f.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">{f.courses.join(", ")}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-[#7C3AED]" style={{ width: `${f.accuracy}%` }} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{f.accuracy}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-[#10b981]" style={{ width: `${f.syllabus}%` }} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{f.syllabus}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[f.status]}`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Tab 2: Course Progress ── */}
            {activeTab === 2 && (
              <div className="space-y-3">
                {mockCourses.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{c.code}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{c.faculty} · Year {c.year}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xl font-bold text-gray-900">{c.completion}%</span>
                        <p className="text-xs text-gray-400">complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          c.completion >= 85 ? "bg-[#10b981]" : c.completion >= 70 ? "bg-blue-500" : c.completion >= 60 ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                        }`}
                        style={{ width: `${c.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab 3: Department Alerts ── */}
            {activeTab === 3 && (
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  const cfg = severityConfig[alert.severity];
                  const Icon = cfg.icon;
                  return (
                    <div key={alert.id} className={`flex gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                          <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.description}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <span className="text-[11px] text-gray-400">
                            {new Date(alert.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </HodLayout>
  );
};

export default HodDashboard;
