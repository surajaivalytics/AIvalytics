import React, { useState } from 'react';
import {
    CheckCircle,
    AlertTriangle as ExclamationCircle,
    Info,
    Check,
    Clock
} from 'lucide-react';
import Layout from '../components/Layout';

const mockAlerts = [
    {
        id: 1,
        type: 'warning',
        title: 'Low engagement in Section C',
        description: 'Average engagement dropped by 12% this week.',
        time: '2 hours ago'
    },
    {
        id: 2,
        type: 'info',
        title: "Quiz not sent for yesterday's lecture",
        description: 'Remember to distribute the weekly assessment.',
        time: '5 hours ago'
    },
    {
        id: 3,
        type: 'warning',
        title: '3 students missed 3 consecutive classes',
        description: 'Emily Davis, Michael Chang, and Sarah Smith need intervention.',
        time: '1 day ago'
    },
    {
        id: 4,
        type: 'success',
        title: 'All students passed the Midterm Review Quiz',
        description: 'Great job! Class average is 88%.',
        time: '2 days ago'
    },
    {
        id: 5,
        type: 'info',
        title: 'New curriculum update available',
        description: 'Review the latest syllabus changes for Machine Learning.',
        time: '3 days ago'
    }
];

const TeacherAlerts: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredAlerts = mockAlerts.filter(alert => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'warnings') return alert.type === 'warning';
        if (activeFilter === 'info') return alert.type === 'info';
        if (activeFilter === 'success') return alert.type === 'success';
        return true;
    });

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto p-6 md:p-8">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Alerts & To-Dos</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage notifications and track critical class events.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto">
                            <Check className="h-4 w-4" />
                            Mark All as Read
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            All (5)
                        </button>
                        <button
                            onClick={() => setActiveFilter('warnings')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'warnings' ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            Warnings (2)
                        </button>
                        <button
                            onClick={() => setActiveFilter('info')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            Info (2)
                        </button>
                        <button
                            onClick={() => setActiveFilter('success')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'success' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50 shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            Success (1)
                        </button>
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-4">
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert) => (
                                <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex flex-col sm:flex-row gap-4 sm:gap-6">

                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {alert.type === 'warning' && (
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                <ExclamationCircle className="h-5 w-5" />
                                            </div>
                                        )}
                                        {alert.type === 'info' && (
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Info className="h-5 w-5" />
                                            </div>
                                        )}
                                        {alert.type === 'success' && (
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                                                {alert.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap flex-shrink-0">
                                                <Clock className="h-3.5 w-3.5" />
                                                {alert.time}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                            {alert.description}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-lg transition-colors shadow-sm">
                                                Take Action
                                            </button>
                                            <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">No alerts found for this filter.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default TeacherAlerts;
