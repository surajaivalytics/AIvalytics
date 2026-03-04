import React from "react";
import Layout from "../components/Layout";
import TeacherAttendance from "../components/TeacherAttendance";
import { Badge } from "../components/ui/badge";

const TeacherPerformance: React.FC = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Attendance Header */}
                        <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/[0.05] dark:to-emerald-500/0"></div>
                            <div className="relative p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
                                            Performance & Attendance
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Track and manage student attendance and progression
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="font-normal bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50">
                                        Today's Overview
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Content */}
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            <div className="p-6">
                                <TeacherAttendance />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherPerformance;
