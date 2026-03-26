import React, { useState } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const recentReports = [
  { id: 1, name: "Department Academic Summary – Mar 2026", type: "Comprehensive", date: "25 Mar 2026", by: "Prof. Williams" },
  { id: 2, name: "Faculty Performance Report – Q1 2026", type: "Performance", date: "20 Mar 2026", by: "Prof. Williams" },
  { id: 3, name: "Syllabus Coverage Analysis – Sem 6", type: "Academic", date: "15 Mar 2026", by: "Prof. Williams" },
  { id: 4, name: "Student Attendance Report – Mar 2026", type: "Attendance", date: "10 Mar 2026", by: "Prof. Williams" },
  { id: 5, name: "Course Accuracy Trend – CS Dept", type: "Performance", date: "05 Mar 2026", by: "Prof. Williams" },
];

const typeColors: Record<string, string> = {
  Comprehensive: "bg-orange-100 text-[#f97316]",
  Performance: "bg-purple-100 text-[#7C3AED]",
  Academic: "bg-blue-100 text-blue-700",
  Attendance: "bg-emerald-100 text-emerald-700",
};

const HodReports: React.FC = () => {
  const [reportType, setReportType] = useState("Performance");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [month, setMonth] = useState("March");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
  };

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate and manage department reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Generate Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 h-fit">
            <h2 className="text-sm font-semibold text-gray-800">Generate Report</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                {["Academic", "Performance", "Attendance", "Comprehensive"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                {["2025-26", "2024-25", "2023-24"].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold shadow hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="w-4 h-4" /> Generate Report</>
              )}
            </button>

            {generated && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Report generated successfully
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Recent Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Report Name", "Type", "Date", "By", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 text-xs leading-tight">{r.name}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[r.type]}`}>{r.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{r.date}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{r.by}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-[#7C3AED] hover:bg-purple-50 transition-colors" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </HodLayout>
  );
};

export default HodReports;
