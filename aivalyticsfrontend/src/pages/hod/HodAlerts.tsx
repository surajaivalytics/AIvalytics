import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, Clock, CheckCheck } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

type Severity = "Critical" | "Warning" | "Info";

const alerts = [
  { id: 1, severity: "Critical" as Severity, title: "Low Course Accuracy Detected", description: "Machine Learning (CS402) has dropped below the 70% accuracy threshold. Immediate review recommended.", timestamp: "2026-03-26T09:15:00", type: "Academic", read: false },
  { id: 2, severity: "Warning" as Severity, title: "Syllabus Coverage Behind Schedule", description: "Database Systems (CS301) is 25% behind the expected syllabus coverage for this point in the semester.", timestamp: "2026-03-25T14:30:00", type: "Performance", read: false },
  { id: 3, severity: "Warning" as Severity, title: "Faculty Submission Pending", description: "Prof. Michael Chen has not submitted the mid-semester assessment grades for CS301.", timestamp: "2026-03-24T11:00:00", type: "Administrative", read: true },
  { id: 4, severity: "Warning" as Severity, title: "Attendance Drop Reported", description: "Student attendance in Operating Systems has fallen below 75% for the past 2 weeks.", timestamp: "2026-03-23T16:45:00", type: "Attendance", read: true },
  { id: 5, severity: "Info" as Severity, title: "Department Meeting Reminder", description: "Monthly department review meeting scheduled for March 28, 2026 at 10:00 AM in Room 401.", timestamp: "2026-03-22T08:00:00", type: "Administrative", read: false },
  { id: 6, severity: "Info" as Severity, title: "AI Tool Update Available", description: "The AI-powered MCQ generator has been updated with new Computer Science topic support.", timestamp: "2026-03-20T09:00:00", type: "Administrative", read: true },
];

const cfg = {
  Critical: { border: "border-l-[#ef4444]", bg: "bg-red-50", badge: "bg-red-100 text-red-700", icon: AlertCircle, iconCls: "text-[#ef4444]", tab: "bg-red-500" },
  Warning: { border: "border-l-[#f59e0b]", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle, iconCls: "text-[#f59e0b]", tab: "bg-amber-500" },
  Info: { border: "border-l-blue-500", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", icon: Info, iconCls: "text-blue-500", tab: "bg-blue-500" },
};

const FILTER_TABS = ["All", "Critical", "Warning", "Info"] as const;

const HodAlerts: React.FC = () => {
  const [filter, setFilter] = useState<(typeof FILTER_TABS)[number]>("All");
  const [readState, setReadState] = useState<Record<number, boolean>>(
    Object.fromEntries(alerts.map((a) => [a.id, a.read]))
  );

  const filtered = filter === "All" ? alerts : alerts.filter((a) => a.severity === filter);

  const counts: Record<string, number> = {
    All: alerts.length,
    Critical: alerts.filter((a) => a.severity === "Critical").length,
    Warning: alerts.filter((a) => a.severity === "Warning").length,
    Info: alerts.filter((a) => a.severity === "Info").length,
  };

  const toggleRead = (id: number) =>
    setReadState((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Alerts</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {alerts.filter((a) => !a.read).length} unread alerts requiring attention
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                filter === tab
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab}
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {filtered.map((alert) => {
            const c = cfg[alert.severity];
            const Icon = c.icon;
            const isRead = readState[alert.id];
            return (
              <div
                key={alert.id}
                className={`flex gap-4 p-4 rounded-xl border border-l-4 ${c.border} ${c.bg} transition-all hover:shadow-sm ${isRead ? "opacity-70" : ""}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.iconCls}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`text-sm font-semibold text-gray-900 ${isRead ? "" : ""}`}>
                        {alert.title}
                      </p>
                      {!isRead && (
                        <span className="w-2 h-2 bg-[#7C3AED] rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {alert.type}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-[11px] text-gray-400">
                        {new Date(alert.timestamp).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleRead(alert.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-[#7C3AED] transition-colors border border-gray-200 hover:border-purple-300 px-2.5 py-1 rounded-lg"
                    >
                      <CheckCheck className="w-3 h-3" />
                      {isRead ? "Mark Unread" : "Mark as Read"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-300">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No alerts in this category.</p>
            </div>
          )}
        </div>
      </div>
    </HodLayout>
  );
};

export default HodAlerts;
