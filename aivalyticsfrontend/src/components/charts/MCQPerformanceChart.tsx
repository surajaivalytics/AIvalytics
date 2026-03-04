import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { BarChart as BarChartIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const data = [
    {
        name: 'Section A',
        accuracy: 78,
        engagement: 82,
    },
    {
        name: 'Section B',
        accuracy: 85,
        engagement: 88,
    },
    {
        name: 'Section C',
        accuracy: 65,
        engagement: 70,
    },
    {
        name: 'Section D',
        accuracy: 90,
        engagement: 92,
    },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-4 py-3 rounded-lg shadow-xl border border-gray-200/20 dark:border-gray-700/20">
                <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-8">
                            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
                            <span className="font-medium" style={{ color: entry.color }}>
                                {entry.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const MCQPerformanceChart: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-blue-500/0 dark:from-blue-500/[0.02] dark:to-blue-500/0"></div>
            <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <BarChartIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        Class Performance
                    </CardTitle>
                    <Badge variant="outline" className="font-normal bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
                        All Sections
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative pt-6">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(209, 213, 219, 0.5)"} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                            <Bar
                                dataKey="accuracy"
                                name="Quiz Accuracy (%)"
                                fill={isDark ? "#60a5fa" : "#3b82f6"}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                            <Bar
                                dataKey="engagement"
                                name="Engagement Level (%)"
                                fill={isDark ? "#34d399" : "#10b981"}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default MCQPerformanceChart;
