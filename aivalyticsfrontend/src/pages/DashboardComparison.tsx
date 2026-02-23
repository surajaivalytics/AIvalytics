import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowsRightLeftIcon,
  CircleStackIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

// Original dashboards
import StudentDashboard from "./dashboards/StudentDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import HodDashboard from "./dashboards/HodDashboard";
import PrincipalDashboard from "./dashboards/PrincipalDashboard";

// Real data dashboards
import RealDataStudentDashboard from "./dashboards/RealDataStudentDashboard";
import RealDataTeacherDashboard from "./dashboards/RealDataTeacherDashboard";
import RealDataHodDashboard from "./dashboards/RealDataHodDashboard";
import RealDataPrincipalDashboard from "./dashboards/RealDataPrincipalDashboard";

const DashboardComparison: React.FC = () => {
  const { user } = useAuth();
  const [useRealData, setUseRealData] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    const role = user.role?.toLowerCase();

    if (useRealData) {
      // Real data dashboards
      switch (role) {
        case "student":
          return <RealDataStudentDashboard />;
        case "teacher":
          return <RealDataTeacherDashboard />;
        case "hod":
          return <RealDataHodDashboard />;
        case "principal":
          return <RealDataPrincipalDashboard />;
        default:
          return <RealDataStudentDashboard />;
      }
    } else {
      // Original mock data dashboards
      // ... remove any mock/sample/fallback data usage and ensure only real data is used ...
      // ... existing code ...
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Dashboard Toggle */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <svg
                    className="h-6 w-6 text-white"
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
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user.role} - {user.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/30">
                <span
                  className={`text-sm font-medium transition-all duration-200 ${
                    !useRealData ? "text-blue-600 scale-105" : "text-gray-500"
                  }`}
                >
                  Mock Data
                </span>
                <button
                  onClick={() => setUseRealData(!useRealData)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 ${
                    useRealData
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "bg-gray-300 shadow-md"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                      useRealData ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium transition-all duration-200 ${
                    useRealData ? "text-blue-600 scale-105" : "text-gray-500"
                  }`}
                >
                  Real Data
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/30">
                {useRealData ? (
                  <>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                      <CircleStackIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        Database Connected
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">
                          Live Data
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-md">
                      <CubeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        Mock Data
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Demo Mode</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="transition-all duration-500 ease-in-out">
        {renderDashboard()}
      </div>

      {/* Enhanced Info Banner */}
      <div className="fixed bottom-6 right-6 z-20">
        <div
          className={`rounded-2xl shadow-2xl p-6 max-w-sm backdrop-blur-lg border transition-all duration-300 transform hover:scale-105 ${
            useRealData
              ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/50"
              : "bg-gradient-to-br from-gray-50/90 to-slate-50/90 border-gray-200/50"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-xl shadow-lg ${
                useRealData
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}
            >
              {useRealData ? (
                <CircleStackIcon className="h-6 w-6 text-white" />
              ) : (
                <CubeIcon className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-sm font-bold mb-2 ${
                  useRealData ? "text-blue-900" : "text-gray-900"
                }`}
              >
                {useRealData
                  ? "🔗 Real Data Dashboard"
                  : "🎭 Mock Data Dashboard"}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  useRealData ? "text-blue-700" : "text-gray-600"
                }`}
              >
                {useRealData
                  ? "✨ Displaying live data from your database with actual user scores, courses, and analytics."
                  : "🎨 Displaying sample data for demonstration purposes. Switch to Real Data to see your actual information."}
              </p>
              <div className="mt-3 flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    useRealData ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ${
                    useRealData ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {useRealData ? "Live Connection" : "Demo Mode"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComparison;
