import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Target } from "lucide-react";
import { Progress } from "../ui/progress";

const conceptData = [
    { name: 'Linear Algebra', percentage: 87 },
    { name: 'Calculus', percentage: 65 },
    { name: 'Statistics', percentage: 92 },
    { name: 'Probability', percentage: 45 },
    { name: 'Algorithms', percentage: 73 },
    { name: 'Machine Learning', percentage: 58 },
    { name: 'Neural Networks', percentage: 36 },
    { name: 'Data Structures', percentage: 81 },
];

const getColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
};

const getTextColorForPercentage = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
};

const AIConceptHeatmap: React.FC = () => {
    return (
        <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-purple-500/0 dark:from-purple-500/[0.02] dark:to-purple-500/0"></div>
            <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Target className="h-5 w-5 text-green-500 dark:text-green-400" />
                        Concept Mastery
                    </CardTitle>
                    <Badge variant="outline" className="font-normal bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50">
                        AI Heatmap
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {conceptData.map((concept, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{concept.name}</span>
                                <span className={`font-semibold ${getTextColorForPercentage(concept.percentage)}`}>
                                    {concept.percentage}%
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${getColorForPercentage(concept.percentage)}`}
                                    style={{ width: `${concept.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIConceptHeatmap;
