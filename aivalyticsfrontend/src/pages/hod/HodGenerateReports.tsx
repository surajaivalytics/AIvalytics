import React, { useState } from "react";
import { Cpu, Loader2, Check, Download } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const facultyOptions = [
  "All Faculty","Dr. Sarah Johnson","Prof. Michael Chen","Dr. Priya Sharma",
  "Prof. David Wilson","Dr. Emily Rodriguez","Prof. James Kumar",
];

const mockPreview = {
  title: "Faculty Performance Report — Q1 2026",
  period: "January 1, 2026 – March 31, 2026",
  faculty: "All Faculty",
  sections: {
    accuracy: {
      heading: "Accuracy Analysis",
      content: "The department achieved an average accuracy of 76% in Q1 2026, a 2% improvement over Q4 2025. Dr. Emily Rodriguez leads at 91%, while Prof. James Kumar (68%) and Dr. Anita Mehta (57%) require focused mentoring.",
    },
    syllabus: {
      heading: "Syllabus Coverage",
      content: "Overall syllabus completion stands at 71%. Software Engineering (92%) and Algorithms (100%) are on track. Machine Learning and Database Systems are behind by 20–25%, posing a risk to academic completion timelines.",
    },
    student: {
      heading: "Student Performance",
      content: "Average student quiz scores across all courses: 72.4%. Courses with high accuracy (≥85%) show direct correlation with higher student performance. Programs with accuracy below 70% exhibit a 15% gap in student outcomes.",
    },
    recommendations: {
      heading: "Recommendations",
      content: "1. Schedule bi-weekly reviews with faculty below 75% accuracy.\n2. Mandate weekly syllabus coverage submissions.\n3. Activate AI-generated MCQs for underperforming courses to increase practice volume.\n4. Consider peer observation sessions between high and low performers.",
    },
  },
};

const HodGenerateReports: React.FC = () => {
  const [reportType, setReportType] = useState("Performance");
  const [faculty, setFaculty] = useState("All Faculty");
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-03-31");
  const [checks, setChecks] = useState({
    accuracy: true,
    syllabus: true,
    student: true,
    recommendations: false,
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const toggleCheck = (k: keyof typeof checks) =>
    setChecks((prev) => ({ ...prev, [k]: !prev[k] }));

  const handleGenerate = () => {
    setLoading(true); setGenerated(false);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 2000);
  };

  const checkItems = [
    { key: "accuracy" as const, label: "Accuracy Analysis" },
    { key: "syllabus" as const, label: "Syllabus Coverage" },
    { key: "student" as const, label: "Student Performance" },
    { key: "recommendations" as const, label: "Recommendations" },
  ];

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate AI Report</h1>
          <p className="text-sm text-gray-400 mt-0.5">Compose comprehensive department reports with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 h-fit">
            <h2 className="text-sm font-semibold text-gray-800">Report Settings</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                {["Academic","Performance","Attendance","Comprehensive"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Faculty</label>
              <select value={faculty} onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                {facultyOptions.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            {/* Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Include Sections</label>
              <div className="space-y-2">
                {checkItems.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleCheck(key)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checks[key]
                          ? "bg-[#7C3AED] border-[#7C3AED]"
                          : "border-gray-300 group-hover:border-purple-400"
                      }`}
                    >
                      {checks[key] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold shadow hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Cpu className="w-4 h-4" /> Generate Report</>}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Preview</h2>
              {generated && (
                <button className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-[#7C3AED] px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              )}
            </div>

            {!generated && !loading && (
              <div className="flex flex-col items-center justify-center h-72 text-gray-200 p-8">
                <Cpu className="w-14 h-14 mb-3" />
                <p className="text-sm text-gray-300">Configure options and click Generate to preview</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-72 gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-[#7C3AED] animate-spin" />
                <p className="text-sm text-gray-400">Composing report with AI…</p>
              </div>
            )}

            {generated && (
              <div className="p-5 space-y-5 overflow-y-auto max-h-[520px]">
                {/* Report header */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
                  <h3 className="text-base font-bold text-purple-900">{mockPreview.title}</h3>
                  <p className="text-xs text-purple-600 mt-1">Period: {mockPreview.period}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Faculty: {faculty} · Generated: 26 Mar 2026</p>
                </div>

                {/* Sections */}
                {checkItems
                  .filter(({ key }) => checks[key])
                  .map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <h4 className="text-sm font-bold text-gray-800 pb-1 border-b border-gray-100">
                        {mockPreview.sections[key].heading}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {mockPreview.sections[key].content}
                      </p>
                    </div>
                  ))}

                {!checkItems.some(({ key }) => checks[key]) && (
                  <p className="text-sm text-gray-400 text-center py-8">Select at least one section to include.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </HodLayout>
  );
};

export default HodGenerateReports;
