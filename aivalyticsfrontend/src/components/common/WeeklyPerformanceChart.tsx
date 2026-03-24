import React from "react";

interface WeeklyPerformanceProps {
 weeklyData?: {
 day: string;
 value: number;
 }[];
}

const WeeklyPerformanceChart: React.FC<WeeklyPerformanceProps> = ({
 weeklyData = [],
}) => {
 // Check if data exists and has elements
 if (!weeklyData || weeklyData.length === 0) {
 return (
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
 <div className="flex items-center mb-4">
 <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
 <svg
 className="h-4 w-4 text-gray-300"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
 />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-white font-primary">
 Weekly Performance
 </h3>
 </div>
 <div className="flex items-center justify-center h-48 text-gray-400">
 <p>No data available</p>
 </div>
 </div>
 );
 }

 // Find max value for scaling
 const maxValue = Math.max(...weeklyData.map((day) => day.value), 100);

 return (
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
 <div className="flex items-center mb-4">
 <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
 <svg
 className="h-4 w-4 text-gray-300"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
 />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-white font-primary">
 Weekly Performance
 </h3>
 </div>

 <div className="relative h-48 mt-6 font-secondary">
 {/* Y-axis labels */}
 <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
 <span>100</span>
 <span>75</span>
 <span>50</span>
 <span>25</span>
 <span>0</span>
 </div>

 {/* Grid lines */}
 <div className="absolute left-8 right-0 top-0 bottom-0">
 <div className="h-full flex flex-col justify-between">
 {[0, 1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="border-t border-dashed border-gray-700 w-full h-0"
 ></div>
 ))}
 </div>
 </div>

 {/* Chart area */}
 <div className="absolute left-10 right-2 top-0 bottom-6 flex items-end">
 {/* Area chart */}
 <svg
 className="w-full h-full"
 viewBox={`0 0 ${weeklyData.length - 1} 100`}
 preserveAspectRatio="none"
 >
 {/* Area fill */}
 <path
 d={`
 M0,${100 - (weeklyData[0].value / maxValue) * 100}
 ${weeklyData
 .slice(1)
 .map(
 (day, i) =>
 `L${i + 1},${100 - (day.value / maxValue) * 100}`
 )
 .join(" ")}
 L${weeklyData.length - 1},100
 L0,100
 Z
 `}
 fill="url(#performance-gradient)"
 opacity="0.5"
 />

 {/* Line */}
 <path
 d={`
 M0,${100 - (weeklyData[0].value / maxValue) * 100}
 ${weeklyData
 .slice(1)
 .map(
 (day, i) =>
 `L${i + 1},${100 - (day.value / maxValue) * 100}`
 )
 .join(" ")}
 `}
 stroke="#8b5cf6"
 strokeWidth="2"
 fill="none"
 />

 {/* Gradient definition */}
 <defs>
 <linearGradient
 id="performance-gradient"
 x1="0%"
 y1="0%"
 x2="0%"
 y2="100%"
 >
 <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
 <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
 </linearGradient>
 </defs>
 </svg>
 </div>

 {/* X-axis labels */}
 <div className="absolute left-10 right-2 bottom-0 flex justify-between text-xs text-gray-400">
 {weeklyData.map((day, index) => (
 <div key={index}>{day.day}</div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default React.memo(WeeklyPerformanceChart);
