import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface AttendanceData {
 date: string;
 present: number;
 absent: number;
 late: number;
 excused: number;
 total: number;
}

interface AttendanceChartProps {
 data?: AttendanceData[];
 chartType?: "line" | "bar" | "pie" | "donut";
 title?: string;
 height?: number;
 showLegend?: boolean;
 showGrid?: boolean;
 animate?: boolean;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({
 data = [],
 chartType = "line",
 title,
 height = 300,
 showLegend = true,
 showGrid = true,
 animate = true,
}) => {
 const { theme } = useTheme();
 const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
 const [animationProgress, setAnimationProgress] = useState(0);

 // Check if data exists and has elements
 if (!data || data.length === 0) {
 return (
 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
 {title || "Attendance Chart"}
 </h3>
 <div className="flex items-center justify-center h-64 text-gray-400">
 <p>No attendance data available</p>
 </div>
 </div>
 );
 }

 useEffect(() => {
 if (animate) {
 const timer = setTimeout(() => {
 setAnimationProgress(1);
 }, 100);
 return () => clearTimeout(timer);
 } else {
 setAnimationProgress(1);
 }
 }, [animate]);

 const colors = {
 present: "#10B981", // green
 absent: "#EF4444", // red
 late: "#F59E0B", // yellow
 excused: "#3B82F6", // blue
 grid: theme === "dark" ? "#374151" : "#E5E7EB",
 text: theme === "dark" ? "#F3F4F6" : "#1F2937",
 background: theme === "dark" ? "#1F2937" : "#FFFFFF",
 };

 // Calculate chart dimensions
 const padding = { top: 20, right: 20, bottom: 60, left: 60 };
 const chartWidth = 600;
 const chartHeight = height;
 const innerWidth = chartWidth - padding.left - padding.right;
 const innerHeight = chartHeight - padding.top - padding.bottom;

 // Calculate scales
 const maxValue = Math.max(...data.map((d) => d.total));
 const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
 const yScale = (value: number) =>
 innerHeight - (value / maxValue) * innerHeight;

 // Generate SVG path for line chart
 const generatePath = (
 values: number[],
 color: string,
 animate: boolean = true
 ) => {
 if (values.length === 0) return "";

 const points = values.map((value, index) => ({
 x: xScale(index),
 y: yScale(value),
 }));

 let path = `M ${points[0].x} ${points[0].y}`;

 for (let i = 1; i < points.length; i++) {
 const prevPoint = points[i - 1];
 const currentPoint = points[i];

 // Create smooth curves using quadratic bezier curves
 const cpx = (prevPoint.x + currentPoint.x) / 2;
 path += ` Q ${cpx} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
 }

 return path;
 };

 // Render line chart
 const renderLineChart = () => {
 const presentValues = data.map((d) => d.present);
 const absentValues = data.map((d) => d.absent);
 const lateValues = data.map((d) => d.late);
 const excusedValues = data.map((d) => d.excused);

 return (
 <g>
 {/* Grid lines */}
 {showGrid && (
 <g>
 {Array.from({ length: 6 }).map((_, i) => {
 const y = (i / 5) * innerHeight;
 return (
 <line
 key={i}
 x1={0}
 y1={y}
 x2={innerWidth}
 y2={y}
 stroke={colors.grid}
 strokeWidth={1}
 opacity={0.3}
 />
 );
 })}
 {data.map((_, i) => {
 const x = xScale(i);
 return (
 <line
 key={i}
 x1={x}
 y1={0}
 x2={x}
 y2={innerHeight}
 stroke={colors.grid}
 strokeWidth={1}
 opacity={0.2}
 />
 );
 })}
 </g>
 )}

 {/* Lines */}
 <path
 d={generatePath(presentValues, colors.present)}
 fill="none"
 stroke={colors.present}
 strokeWidth={3}
 strokeLinecap="round"
 strokeDasharray={
 animate ? `${animationProgress * 1000} 1000` : undefined
 }
 style={{ transition: "stroke-dasharray 2s ease-in-out" }}
 />
 <path
 d={generatePath(absentValues, colors.absent)}
 fill="none"
 stroke={colors.absent}
 strokeWidth={3}
 strokeLinecap="round"
 strokeDasharray={
 animate ? `${animationProgress * 1000} 1000` : undefined
 }
 style={{ transition: "stroke-dasharray 2s ease-in-out" }}
 />
 <path
 d={generatePath(lateValues, colors.late)}
 fill="none"
 stroke={colors.late}
 strokeWidth={3}
 strokeLinecap="round"
 strokeDasharray={
 animate ? `${animationProgress * 1000} 1000` : undefined
 }
 style={{ transition: "stroke-dasharray 2s ease-in-out" }}
 />
 <path
 d={generatePath(excusedValues, colors.excused)}
 fill="none"
 stroke={colors.excused}
 strokeWidth={3}
 strokeLinecap="round"
 strokeDasharray={
 animate ? `${animationProgress * 1000} 1000` : undefined
 }
 style={{ transition: "stroke-dasharray 2s ease-in-out" }}
 />

 {/* Data points */}
 {data.map((d, i) => (
 <g key={i}>
 <circle
 cx={xScale(i)}
 cy={yScale(d.present)}
 r={hoveredPoint === i ? 6 : 4}
 fill={colors.present}
 onMouseEnter={() => setHoveredPoint(i)}
 onMouseLeave={() => setHoveredPoint(null)}
 style={{ transition: "r 0.2s ease" }}
 />
 <circle
 cx={xScale(i)}
 cy={yScale(d.absent)}
 r={hoveredPoint === i ? 6 : 4}
 fill={colors.absent}
 onMouseEnter={() => setHoveredPoint(i)}
 onMouseLeave={() => setHoveredPoint(null)}
 style={{ transition: "r 0.2s ease" }}
 />
 <circle
 cx={xScale(i)}
 cy={yScale(d.late)}
 r={hoveredPoint === i ? 6 : 4}
 fill={colors.late}
 onMouseEnter={() => setHoveredPoint(i)}
 onMouseLeave={() => setHoveredPoint(null)}
 style={{ transition: "r 0.2s ease" }}
 />
 <circle
 cx={xScale(i)}
 cy={yScale(d.excused)}
 r={hoveredPoint === i ? 6 : 4}
 fill={colors.excused}
 onMouseEnter={() => setHoveredPoint(i)}
 onMouseLeave={() => setHoveredPoint(null)}
 style={{ transition: "r 0.2s ease" }}
 />
 </g>
 ))}
 </g>
 );
 };

 // Render bar chart
 const renderBarChart = () => {
 const barWidth = (innerWidth / data.length) * 0.8;
 const barSpacing = (innerWidth / data.length) * 0.2;

 return (
 <g>
 {/* Grid lines */}
 {showGrid && (
 <g>
 {Array.from({ length: 6 }).map((_, i) => {
 const y = (i / 5) * innerHeight;
 return (
 <line
 key={i}
 x1={0}
 y1={y}
 x2={innerWidth}
 y2={y}
 stroke={colors.grid}
 strokeWidth={1}
 opacity={0.3}
 />
 );
 })}
 </g>
 )}

 {/* Bars */}
 {data.map((d, i) => {
 const x = i * (barWidth + barSpacing) + barSpacing / 2;
 const segmentWidth = barWidth / 4;

 return (
 <g key={i}>
 <rect
 x={x}
 y={yScale(d.present)}
 width={segmentWidth}
 height={innerHeight - yScale(d.present)}
 fill={colors.present}
 opacity={animationProgress}
 style={{ transition: "opacity 1s ease-in-out" }}
 />
 <rect
 x={x + segmentWidth}
 y={yScale(d.absent)}
 width={segmentWidth}
 height={innerHeight - yScale(d.absent)}
 fill={colors.absent}
 opacity={animationProgress}
 style={{ transition: "opacity 1s ease-in-out" }}
 />
 <rect
 x={x + segmentWidth * 2}
 y={yScale(d.late)}
 width={segmentWidth}
 height={innerHeight - yScale(d.late)}
 fill={colors.late}
 opacity={animationProgress}
 style={{ transition: "opacity 1s ease-in-out" }}
 />
 <rect
 x={x + segmentWidth * 3}
 y={yScale(d.excused)}
 width={segmentWidth}
 height={innerHeight - yScale(d.excused)}
 fill={colors.excused}
 opacity={animationProgress}
 style={{ transition: "opacity 1s ease-in-out" }}
 />
 </g>
 );
 })}
 </g>
 );
 };

 // Render pie chart
 const renderPieChart = () => {
 const totalValues = data.reduce(
 (acc, d) => ({
 present: acc.present + d.present,
 absent: acc.absent + d.absent,
 late: acc.late + d.late,
 excused: acc.excused + d.excused,
 }),
 { present: 0, absent: 0, late: 0, excused: 0 }
 );

 const total =
 totalValues.present +
 totalValues.absent +
 totalValues.late +
 totalValues.excused;
 const centerX = innerWidth / 2;
 const centerY = innerHeight / 2;
 const radius = Math.min(innerWidth, innerHeight) / 2 - 20;

 let currentAngle = -Math.PI / 2; // Start from top

 const segments = [
 { value: totalValues.present, color: colors.present, label: "Present" },
 { value: totalValues.absent, color: colors.absent, label: "Absent" },
 { value: totalValues.late, color: colors.late, label: "Late" },
 { value: totalValues.excused, color: colors.excused, label: "Excused" },
 ];

 return (
 <g>
 {segments.map((segment, i) => {
 const angle =
 (segment.value / total) * 2 * Math.PI * animationProgress;
 const startX = centerX + Math.cos(currentAngle) * radius;
 const startY = centerY + Math.sin(currentAngle) * radius;
 const endX = centerX + Math.cos(currentAngle + angle) * radius;
 const endY = centerY + Math.sin(currentAngle + angle) * radius;

 const largeArcFlag = angle > Math.PI ? 1 : 0;

 const pathData = [
 `M ${centerX} ${centerY}`,
 `L ${startX} ${startY}`,
 `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
 "Z",
 ].join(" ");

 currentAngle += angle;

 return (
 <path
 key={i}
 d={pathData}
 fill={segment.color}
 stroke={colors.background}
 strokeWidth={2}
 style={{ transition: "all 1s ease-in-out" }}
 />
 );
 })}
 </g>
 );
 };

 // Render axes
 const renderAxes = () => (
 <g>
 {/* Y-axis */}
 <line
 x1={0}
 y1={0}
 x2={0}
 y2={innerHeight}
 stroke={colors.text}
 strokeWidth={2}
 />

 {/* X-axis */}
 <line
 x1={0}
 y1={innerHeight}
 x2={innerWidth}
 y2={innerHeight}
 stroke={colors.text}
 strokeWidth={2}
 />

 {/* Y-axis labels */}
 {Array.from({ length: 6 }).map((_, i) => {
 const value = Math.round((maxValue / 5) * i);
 const y = innerHeight - (i / 5) * innerHeight;
 return (
 <text
 key={i}
 x={-10}
 y={y + 5}
 textAnchor="end"
 fill={colors.text}
 fontSize="12"
 >
 {value}
 </text>
 );
 })}

 {/* X-axis labels */}
 {data.map((d, i) => (
 <text
 key={i}
 x={xScale(i)}
 y={innerHeight + 20}
 textAnchor="middle"
 fill={colors.text}
 fontSize="12"
 transform={`rotate(-45, ${xScale(i)}, ${innerHeight + 20})`}
 >
 {new Date(d.date).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 })}
 </text>
 ))}
 </g>
 );

 // Render legend
 const renderLegend = () => (
 <div className="flex flex-wrap gap-4 mt-4 justify-center">
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 bg-green-500 rounded"></div>
 <span
 className={`text-sm ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Present
 </span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 bg-red-500 rounded"></div>
 <span
 className={`text-sm ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Absent
 </span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 bg-yellow-500 rounded"></div>
 <span
 className={`text-sm ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Late
 </span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 bg-blue-500 rounded"></div>
 <span
 className={`text-sm ${
 theme === "dark" ? "text-gray-300" : "text-gray-700"
 }`}
 >
 Excused
 </span>
 </div>
 </div>
 );

 if (data.length === 0) {
 return (
 <div
 className={`p-6 rounded-lg ${
 theme === "dark" ? "bg-gray-800" : "bg-white"
 } shadow-lg`}
 >
 <div className="text-center text-gray-500">
 <svg
 className="w-12 h-12 mx-auto mb-4 opacity-50"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
 />
 </svg>
 <p>No attendance data available</p>
 </div>
 </div>
 );
 }

 return (
 <div
 className={`p-6 rounded-lg ${
 theme === "dark" ? "bg-gray-800" : "bg-white"
 } shadow-lg`}
 >
 {title && (
 <h3
 className={`text-xl font-semibold mb-4 ${
 theme === "dark" ? "text-white" : "text-gray-900"
 }`}
 >
 {title}
 </h3>
 )}

 <div className="relative">
 <svg
 width={chartWidth}
 height={chartHeight}
 className="overflow-visible"
 >
 <g transform={`translate(${padding.left}, ${padding.top})`}>
 {chartType === "line" && renderLineChart()}
 {chartType === "bar" && renderBarChart()}
 {chartType === "pie" && renderPieChart()}
 {chartType === "donut" && renderPieChart()}
 {(chartType === "line" || chartType === "bar") && renderAxes()}
 </g>
 </svg>

 {/* Tooltip */}
 {hoveredPoint !== null && (
 <div
 className={`absolute z-10 p-2 rounded shadow-lg ${
 theme === "dark"
 ? "bg-gray-700 text-white"
 : "bg-white text-gray-900"
 } border`}
 style={{
 left: padding.left + xScale(hoveredPoint) + 10,
 top: padding.top + 10,
 }}
 >
 <div className="text-sm font-medium">
 {new Date(data[hoveredPoint].date).toLocaleDateString()}
 </div>
 <div className="text-xs space-y-1">
 <div>Present: {data[hoveredPoint].present}</div>
 <div>Absent: {data[hoveredPoint].absent}</div>
 <div>Late: {data[hoveredPoint].late}</div>
 <div>Excused: {data[hoveredPoint].excused}</div>
 <div className="font-medium">
 Total: {data[hoveredPoint].total}
 </div>
 </div>
 </div>
 )}
 </div>

 {showLegend && renderLegend()}
 </div>
 );
};

export default AttendanceChart;
