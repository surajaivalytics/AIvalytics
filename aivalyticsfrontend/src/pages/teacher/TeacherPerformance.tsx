import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const classPerformanceData = [
  { name: "Section A", accuracy: 78, engagement: 85 },
  { name: "Section B", accuracy: 65, engagement: 70 },
  { name: "Section C", accuracy: 45, engagement: 55 },
  { name: "Section D", accuracy: 82, engagement: 90 },
];

const conceptData = [
  { subject: "Linear Algebra", progress: 87 },
  { subject: "Calculus", progress: 65 },
  { subject: "Statistics", progress: 92 },
  { subject: "Probability", progress: 45 },
  { subject: "Algorithms", progress: 73 },
  { subject: "Machine Learning", progress: 58 },
  { subject: "Neural Networks", progress: 36 },
  { subject: "Data Structures", progress: 81 },
];

const getProgressColor = (value: number) => {
  if (value > 80) return "bg-green-500";
  if (value >= 50) return "bg-amber-400";
  return "bg-red-500";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
              <span className="font-bold text-gray-900 dark:text-white">{entry.value}%</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const TeacherPerformance: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Class Performance
          </h1>
        </div>

        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Section 1: Class-wise MCQ Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Class-wise MCQ Performance</h3>
            </div>
            <div className="p-6 h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                   data={classPerformanceData}
                   margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                   barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{ fill: "#6B7280", fontSize: 13 }} 
                    dy={10} 
                    stroke="#D1D5DB"
                    className="dark:stroke-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#6B7280", fontSize: 13 }} 
                    domain={[0, 100]} 
                    dx={-10}
                    className="dark:text-gray-400"
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                  <Legend 
                    iconType="square" 
                    wrapperStyle={{ paddingTop: "20px" }} 
                    formatter={(value) => <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{value}</span>}
                  />
                  <Bar dataKey="accuracy" name="Quiz Accuracy (%)" fill="#3B82F6" w-10 />
                  <Bar dataKey="engagement" name="Engagement Level (%)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 2: AI Concept Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Concept Heatmap</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {conceptData.map((concept, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{concept.subject}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-1">
                        <div 
                          className={`h-full rounded-full ${getProgressColor(concept.progress)}`} 
                          style={{ width: `${concept.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8">{concept.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Time-based Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Time-based Analysis</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400">Detailed time-based performance metrics will appear here.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherPerformance;
