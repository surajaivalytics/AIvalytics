import React from "react";

interface LearningTimeChartProps {
 weekData?: {
 day: string;
 minutes: number;
 isCurrentDay?: boolean;
 }[];
 averageMinutes?: number;
 goalMinutes?: number;
}

const LearningTimeChart: React.FC<LearningTimeChartProps> = ({
 weekData = [],
 averageMinutes = 0,
 goalMinutes = 60,
}) => {
 // Check if data exists and has elements
 if (!weekData || weekData.length === 0) {
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
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-white font-primary">
 Learning Time
 </h3>
 </div>
 <div className="flex items-center justify-center h-48 text-gray-400">
 <p>No learning time data available</p>
 </div>
 </div>
 );
 }

 // Find the max value for scaling
 const maxValue = Math.max(
 ...weekData.map((day) => day.minutes),
 goalMinutes,
 80
 );

 // Calculate how much more minutes needed to reach goal
 const minutesToGoal =
 goalMinutes > averageMinutes ? goalMinutes - averageMinutes : 0;

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
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-white font-primary">
 Learning Time
 </h3>
 <div className="ml-auto flex space-x-2">
 <button className="p-1 rounded-md hover:bg-gray-700">
 <svg
 className="h-5 w-5 text-gray-400"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
 />
 </svg>
 </button>
 <button className="p-1 rounded-md hover:bg-gray-700">
 <svg
 className="h-5 w-5 text-gray-400"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
 />
 </svg>
 </button>
 </div>
 </div>

 <div className="relative h-48 mt-6 font-secondary">
 {/* Y-axis labels */}
 <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
 <span>80</span>
 <span>60</span>
 <span>40</span>
 <span>20</span>
 <span>0</span>
 </div>

 {/* Grid lines */}
 <div className="absolute left-8 right-0 top-0 bottom-0">
 <div className="h-full flex flex-col justify-between">
 {[0, 1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="border-t border-gray-700 w-full h-0"
 ></div>
 ))}
 </div>
 </div>

 {/* Goal line */}
 <div
 className="absolute left-8 right-0 border-t border-dashed border-red-500 z-10"
 style={{ top: `${(1 - goalMinutes / maxValue) * 100}%` }}
 >
 <div className="absolute right-0 -top-2.5 text-xs text-red-500">
 Goal: {goalMinutes} min
 </div>
 </div>

 {/* Average line */}
 <div
 className="absolute left-8 right-0 border-t border-dashed border-gray-500 z-10"
 style={{ top: `${(1 - averageMinutes / maxValue) * 100}%` }}
 >
 <div className="absolute left-0 -top-2.5 text-xs text-gray-500">
 Avg: {averageMinutes} min
 </div>
 </div>

 {/* Bars */}
 <div className="absolute left-10 right-2 top-0 bottom-0 flex items-end justify-between">
 {weekData.map((day, index) => (
 <div key={index} className="flex flex-col items-center w-full">
 <div
 className={`w-full max-w-[32px] rounded-t-md ${
 day.isCurrentDay ? "bg-green-500" : "bg-purple-600"
 }`}
 style={{ height: `${(day.minutes / maxValue) * 100}%` }}
 ></div>
 <div className="text-xs text-gray-400 mt-1">{day.day}</div>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-4 text-center font-secondary">
 <div className="text-sm text-gray-300">
 Average: {averageMinutes} min/day
 {minutesToGoal > 0 && (
 <span className="text-yellow-500 ml-2">
 (Need {minutesToGoal} more min to reach goal)
 </span>
 )}
 </div>
 </div>
 </div>
 );
};

export default React.memo(LearningTimeChart);
