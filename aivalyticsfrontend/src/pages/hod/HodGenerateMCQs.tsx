import React, { useState } from "react";
import { ClipboardList, Loader2, CheckCircle, Copy, Download, ChevronDown, ChevronRight } from "lucide-react";
import HodLayout from "../../components/hod/HodLayout";

const courses = [
  "Data Structures","Database Systems","Computer Networks",
  "Operating Systems","Software Engineering","Machine Learning",
];

const MOCK_MCQS = [
  {
    q: "Which of the following is a self-balancing binary search tree?",
    options: ["Binary Tree", "AVL Tree", "Max Heap", "B-Tree"],
    correct: 1,
  },
  {
    q: "What is the average-case time complexity of QuickSort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correct: 1,
  },
  {
    q: "Which data structure is used in Breadth-First Search?",
    options: ["Stack", "Priority Queue", "Queue", "Deque"],
    correct: 2,
  },
  {
    q: "What is the worst-case space complexity of Merge Sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 2,
  },
  {
    q: "Which collision resolution technique uses linked lists in a hash table?",
    options: ["Open Addressing", "Linear Probing", "Chaining", "Double Hashing"],
    correct: 2,
  },
];

const LABELS = ["A", "B", "C", "D"];

const HodGenerateMCQs: React.FC = () => {
  const [course, setCourse] = useState("Data Structures");
  const [topic, setTopic] = useState("Trees and Graphs");
  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setLoading(true); setGenerated(false);
    setTimeout(() => { setLoading(false); setGenerated(true); setOpen({ 0: true }); }, 1800);
  };

  const handleCopy = () => {
    const text = MOCK_MCQS.map((m, i) =>
      `Q${i+1}. ${m.q}\n${m.options.map((o, j) => `  ${LABELS[j]}. ${o}`).join("\n")}\nAnswer: ${LABELS[m.correct]}`
    ).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const diffColors = { Easy: "bg-emerald-500", Medium: "bg-[#f59e0b]", Hard: "bg-[#ef4444]" };

  return (
    <HodLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate MCQs</h1>
          <p className="text-sm text-gray-400 mt-0.5">AI-powered multiple choice question generator</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 h-fit">
            <h2 className="text-sm font-semibold text-gray-800">Configuration</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Course</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                {courses.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Trees and Graphs, SQL Joins..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">
                Number of Questions: <span className="text-[#7C3AED] font-bold">{numQ}</span>
              </label>
              <input type="range" min={1} max={20} value={numQ} onChange={(e) => setNumQ(Number(e.target.value))}
                className="w-full accent-[#7C3AED]" />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5"><span>1</span><span>20</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Difficulty</label>
              <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 text-sm font-semibold transition-all duration-150 ${
                      difficulty === d ? `${diffColors[d]} text-white` : "bg-white text-gray-400 hover:bg-gray-50"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold shadow hover:bg-purple-700 hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><ClipboardList className="w-4 h-4" /> Generate MCQs</>}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                Generated Questions
                {generated && <span className="flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle className="w-3.5 h-3.5" />{numQ} ready</span>}
              </h2>
              {generated && (
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-medium border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-[#7C3AED] px-2.5 py-1.5 rounded-lg transition-colors">
                    <Copy className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy All"}
                  </button>
                  <button className="flex items-center gap-1 text-xs font-medium border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-[#7C3AED] px-2.5 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              )}
            </div>

            {!generated && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-200">
                <ClipboardList className="w-16 h-16 mb-3" />
                <p className="text-sm">Configure and click Generate</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-[#7C3AED] animate-spin" />
                <p className="text-sm text-gray-400">AI is crafting questions…</p>
              </div>
            )}

            {generated && (
              <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
                {MOCK_MCQS.map((mcq, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      <span className="text-sm font-semibold text-gray-900 pr-4">
                        Q{idx + 1}. {mcq.q}
                      </span>
                      {open[idx] ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </button>
                    {open[idx] && (
                      <div className="px-4 pb-3 space-y-1.5">
                        {mcq.options.map((opt, j) => (
                          <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            j === mcq.correct
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                              : "bg-gray-50 text-gray-600"
                          }`}>
                            <span className={`text-xs font-bold w-5 flex-shrink-0 ${j === mcq.correct ? "text-emerald-600" : "text-gray-400"}`}>
                              {LABELS[j]}.
                            </span>
                            {opt}
                            {j === mcq.correct && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </HodLayout>
  );
};

export default HodGenerateMCQs;
