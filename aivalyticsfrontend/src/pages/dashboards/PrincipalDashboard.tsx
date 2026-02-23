import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";
import { courseService } from "../../services/courseApi";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  DocumentChartBarIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  ChartPieIcon,
  BellAlertIcon,
  FlagIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  DocumentDuplicateIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
  AcademicCapIcon as GraduationIcon,
  StarIcon,
  BanknotesIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Course } from "../../types/course";
import LoadingSpinner from "../../components/LoadingSpinner";
import CourseCard from "../../components/CourseCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// Enhanced modern styles with professional animations and better theme support
const styles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    50% { 
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes borderGlow {
    0%, 100% { border-color: rgba(59, 130, 246, 0.3); }
    50% { border-color: rgba(59, 130, 246, 0.6); }
  }
  
  .animate-slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .professional-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border-radius: 24px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }
  
  .professional-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .professional-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981);
    background-size: 300% 300%;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: gradientShift 3s ease infinite;
  }
  
  .professional-card:hover::before {
    opacity: 1;
  }
  
  .metric-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    padding: 2rem;
  }
  
  .metric-card:hover {
    transform: scale(1.02);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    animation: borderGlow 2s ease-in-out infinite;
  }
  
  .metric-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  .metric-card:hover::after {
    transform: translateX(100%);
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .glass-morphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
  }

  .dark .glass-morphism {
    background: rgba(17, 24, 39, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .status-indicator {
    position: relative;
  }
  
  .status-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    animation: pulse-glow 2s infinite;
  }
  
  .priority-high {
    border-left: 4px solid #EF4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
    border-radius: 16px;
  }
  
  .priority-medium {
    border-left: 4px solid #F59E0B;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
    border-radius: 16px;
  }

  .priority-low {
    border-left: 4px solid #10B981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
    border-radius: 16px;
  }
  
  .nav-tab {
    position: relative;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(10px);
    border-radius: 16px;
  }

  .nav-tab::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
    transition: all 0.3s ease;
    transform: translateX(-50%);
    border-radius: 2px;
  }
  
  .nav-tab.active::after {
    width: 100%;
  }
  
  .nav-tab:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
    transform: translateY(-2px);
  }
  
  .insight-card {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.4s ease;
    border-radius: 24px;
  }
  
  .insight-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  .insight-card:hover::before {
    left: 100%;
  }
  
  .insight-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  .data-table {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
  }
  
  .dark .data-table {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .table-row {
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .table-row:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
    transform: translateX(4px);
  }

  .dark .table-row:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  }
  
  .progress-bar {
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    height: 8px;
  }
  
  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  .alert-card {
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  }
  
  .alert-card:hover {
    transform: translateX(8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
  
  .executive-header {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    padding: 3rem;
    margin-bottom: 2rem;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
  }
  
  .dark .executive-header {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .metric-icon {
    background: linear-gradient(135deg, var(--icon-color-1), var(--icon-color-2));
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .metric-icon:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  .department-badge {
    background: linear-gradient(135deg, var(--badge-color-1), var(--badge-color-2));
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .department-badge:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }

  .dark .loading-skeleton {
    background: linear-gradient(90deg, #374151 25%, #4B5563 50%, #374151 75%);
    background-size: 200% 100%;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes shimmerBg {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .loading-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .loading-shimmer {
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0) 40%
    );
    background-size: 1000px 100%;
    animation: shimmerBg 2s linear infinite;
  }

  .dark .loading-shimmer {
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 20%,
      rgba(255, 255, 255, 0) 40%
    );
    background-size: 1000px 100%;
  }
`;

const PrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  // Remove activeTab state since we'll only have Overview
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Enhanced dashboard stats with more comprehensive metrics
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    institutionRating: 0,
    accreditationStatus: "Active",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        // API integration will be added here
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Remove tabs array since we'll only have Overview

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Header */}
          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/[0.05] dark:to-purple-500/[0.05]"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer"></div>
                  </div>
                  <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Table */}
          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                <div className="flex gap-3">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Status */}
          <div className="fixed bottom-4 right-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="h-2 w-2 bg-blue-500 rounded-full loading-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Loading dashboard...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderExecutiveOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Executive Header */}
      <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/[0.05] dark:to-purple-500/[0.05]"></div>
        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Executive Dashboard
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Strategic oversight and institutional performance analytics
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-center px-4 py-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/50">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">System Status</div>
                <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">Active</div>
                <div className="text-xs text-blue-600/70 dark:text-blue-300/70">All Systems Operational</div>
              </div>
              <div className="text-center px-4 py-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Academic Year</div>
                <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">2023-24</div>
                <div className="text-xs text-purple-600/70 dark:text-purple-300/70">Current Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Enrollment",
            value: "2,847",
            change: "+12.5%",
            icon: UsersIcon,
            colors: { start: '#3B82F6', end: '#1D4ED8' },
            description: "Active Students"
          },
          {
            title: "Faculty Excellence",
            value: "156",
            change: "+8.3%",
            icon: GraduationIcon,
            colors: { start: '#8B5CF6', end: '#7C3AED' },
            description: "PhD & Masters"
          },
          {
            title: "Placement Success",
            value: "94.2%",
            change: "+5.2%",
            icon: TrophyIcon,
            colors: { start: '#10B981', end: '#059669' },
            description: "Average Package"
          },
          {
            title: "Accreditation",
            value: "A+",
            status: "Valid until 2026",
            icon: StarIcon,
            colors: { start: '#F59E0B', end: '#D97706' },
            description: "NAAC Grade"
          }
        ].map((metric, index) => (
          <Card key={index} className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
            <CardHeader className="relative p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${metric.colors.start}/10`}>
                  <metric.icon className={`h-5 w-5 text-${metric.colors.start}`} />
                </div>
                <Badge variant="outline" className={`font-normal bg-${metric.colors.start}/10 text-${metric.colors.start} border-${metric.colors.start}/20`}>
                  {metric.change || metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Department Performance Matrix */}
      <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-blue-500/0 dark:from-blue-500/[0.02] dark:to-blue-500/0"></div>
        <CardHeader className="relative border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                Department Performance Matrix
              </span>
            </CardTitle>
            <div className="flex gap-3">
              <Badge variant="outline" className="font-normal bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
                Current Semester
              </Badge>
              <Badge variant="outline" className="font-normal bg-gray-50/50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-800/50">
                View Analytics
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faculty</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placement</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Research</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {departmentPerformance.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${dept.color}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-gray-900 dark:text-white">{dept.students}</td>
                    <td className="py-4 px-4 text-center font-medium text-gray-900 dark:text-white">{dept.faculty}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                          GPA: {dept.avgGPA}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${dept.placement}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.placement}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline" className="bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50">
                        {dept.research} Projects
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Strategic Alerts */}
      <div className={`professional-card p-10 rounded-2xl ${getThemedClasses(
          isDark,
        "bg-white/80 shadow-2xl border border-gray-200",
        "bg-gray-800/80 border border-gray-700"
        )}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")} mb-2`}>
              Strategic Alerts & Action Items
          </h2>
            <p className={`text-sm ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
              Critical institutional matters requiring executive attention
              </p>
            </div>
          <button className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all glass-morphism ${getThemedClasses(
            isDark,
            "text-blue-600 hover:bg-blue-50",
            "text-blue-400 hover:bg-blue-900/20"
          )}`}>
            View All Alerts
          </button>
        </div>
        
        <div className="space-y-6">
          {strategicAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`alert-card p-8 ${
                alert.priority === 'high' ? 'priority-high' : 'priority-medium'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl ${
                    alert.priority === 'high' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                      <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className={`text-xl font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")} mb-1`}>
                      {alert.title}
                    </h3>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    alert.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {alert.category}
                  </span>
                        <span className={`text-xs ${getThemedClasses(isDark, "text-gray-500", "text-gray-400")}`}>
                          Due: {alert.deadline}
                        </span>
                        <span className={`text-xs ${getThemedClasses(isDark, "text-gray-500", "text-gray-400")}`}>
                          {alert.department}
                        </span>
                        <span className={`text-xs font-semibold ${
                          alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {alert.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-base ${getThemedClasses(isDark, "text-gray-700", "text-gray-300")} ml-16`}>
                    {alert.description}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${getThemedClasses(
                    isDark,
                    "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}`}>
                    Delegate
                  </button>
                  <button className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all glass-morphism ${getThemedClasses(
                    isDark,
                    "text-blue-600 hover:bg-blue-50",
                    "text-blue-400 hover:bg-blue-900/20"
                  )}`}>
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Executive Insights */}
      <div className={`professional-card p-10 rounded-2xl ${getThemedClasses(
        isDark,
        "bg-white/80 shadow-2xl border border-gray-200",
        "bg-gray-800/80 border border-gray-700"
      )}`}>
        <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className={`text-3xl font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")} mb-2`}>
              Strategic Investment Opportunities
          </h2>
            <p className={`text-sm ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
              High-impact initiatives with quantified returns and strategic value
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {executiveInsights.map((insight, index) => (
              <div 
                key={insight.id}
              className={`insight-card p-8 rounded-2xl ${getThemedClasses(
                  isDark,
                "bg-gray-50 border border-gray-200",
                "bg-gray-700/50 border border-gray-600"
                )}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              >
              <div className="flex items-start space-x-4 mb-6">
                <div className="metric-icon" style={{ 
                  '--icon-color-1': insight.iconColor1, 
                  '--icon-color-2': insight.iconColor2 
                } as React.CSSProperties}>
                  <insight.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                  <h3 className={`text-xl font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")} mb-2`}>
                      {insight.title}
                    </h3>
                  <div className={`text-xs px-3 py-1 rounded-full font-semibold inline-block mb-3 ${
                    insight.riskLevel === 'Low' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : insight.riskLevel === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    Risk: {insight.riskLevel}
                  </div>
                </div>
              </div>
              
              <p className={`text-sm ${getThemedClasses(isDark, "text-gray-700", "text-gray-300")} mb-6`}>
                      {insight.description}
                    </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
                    Investment Required:
                  </span>
                  <span className={`text-sm font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")}`}>
                    {insight.investmentRequired}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
                    Implementation Timeline:
                  </span>
                  <span className={`text-sm font-bold ${getThemedClasses(isDark, "text-gray-900", "text-white")}`}>
                    {insight.timeline}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
                    Expected ROI:
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {insight.roi}
                  </span>
                </div>
              </div>
              
              <div className={`text-sm ${getThemedClasses(isDark, "text-blue-600", "text-blue-400")} mb-6 italic p-4 rounded-lg ${getThemedClasses(
                isDark,
                "bg-blue-50",
                "bg-blue-900/20"
              )}`}>
                <strong>Impact:</strong> {insight.impact}
              </div>
              
              <div className="flex space-x-3">
                <button className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${getThemedClasses(
                    isDark,
                        "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      )}`}>
                  Detailed Analysis
                  </button>
                <button className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all glass-morphism ${getThemedClasses(
                    isDark,
                  "text-blue-600 hover:bg-blue-50",
                  "text-blue-400 hover:bg-blue-900/20"
                  )}`}>
                  Approve Initiative
                  </button>
                    </div>
                  </div>
          ))}
                </div>
              </div>
          </div>
  );

  // Department performance data with enhanced metrics and better colors
  const departmentPerformance = [
    { 
      name: "Computer Science", 
      students: 485, 
      faculty: 28, 
      avgGPA: 3.7, 
      placement: 96, 
      research: 12,
      color: "from-blue-500 to-cyan-500",
      badgeColor1: "#3B82F6",
      badgeColor2: "#06B6D4"
    },
    { 
      name: "Electronics", 
      students: 412, 
      faculty: 24, 
      avgGPA: 3.6, 
      placement: 92, 
      research: 8,
      color: "from-green-500 to-emerald-500",
      badgeColor1: "#10B981",
      badgeColor2: "#059669"
    },
    {
      name: "Mechanical", 
      students: 398, 
      faculty: 22, 
      avgGPA: 3.5, 
      placement: 89, 
      research: 6,
      color: "from-purple-500 to-violet-500",
      badgeColor1: "#8B5CF6",
      badgeColor2: "#7C3AED"
    },
    {
      name: "Civil", 
      students: 365, 
      faculty: 20, 
      avgGPA: 3.4, 
      placement: 85, 
      research: 5,
      color: "from-orange-500 to-red-500",
      badgeColor1: "#F97316",
      badgeColor2: "#EF4444"
    },
    {
      name: "Chemical", 
      students: 298, 
      faculty: 18, 
      avgGPA: 3.6, 
      placement: 91, 
      research: 7,
      color: "from-pink-500 to-rose-500",
      badgeColor1: "#EC4899",
      badgeColor2: "#F43F5E"
    },
  ];

  // Enhanced strategic alerts with better categorization
  const strategicAlerts = [
    {
      id: 1,
      title: "NAAC Reaccreditation Due",
      description: "Institutional reaccreditation process must be initiated within 45 days to maintain A+ grade",
      category: "Critical",
      priority: "high",
      deadline: "2024-03-15",
      department: "Administration",
      urgency: "Immediate Action Required"
    },
    {
      id: 2,
      title: "Faculty Recruitment Drive",
      description: "Computer Science department requires 3 additional PhD faculty members for upcoming semester",
      category: "Staffing",
      priority: "medium",
      deadline: "2024-02-28",
      department: "Computer Science",
      urgency: "Plan Required"
    },
    {
      id: 3,
      title: "Lab Infrastructure Upgrade",
      description: "Electronics laboratory equipment modernization project needs budget approval",
      category: "Infrastructure",
      priority: "medium",
      deadline: "2024-04-30",
      department: "Electronics",
      urgency: "Budget Review"
    },
    {
      id: 4,
      title: "Placement Performance Review",
      description: "Civil Engineering placement rate below institutional average - intervention needed",
      category: "Academic Excellence",
      priority: "high",
      deadline: "2024-03-31",
      department: "Civil Engineering",
      urgency: "Strategic Review"
    },
  ];

  // Enhanced executive insights with better ROI calculations
  const executiveInsights = [
    {
      id: 1,
      title: "AI-Powered Learning Ecosystem",
      description: "Deploy comprehensive AI-driven personalized learning platform across all departments",
      impact: "Enhance student engagement by 40%, reduce dropout rates by 25%, improve learning outcomes",
      investmentRequired: "₹3.2 Cr",
      timeline: "8 months",
      roi: "220%",
      riskLevel: "Low",
      icon: SparklesIcon,
      color: "from-blue-500 to-cyan-500",
      iconColor1: "#3B82F6",
      iconColor2: "#06B6D4"
    },
    {
      id: 2,
      title: "Industry 4.0 Partnership Hub",
      description: "Establish strategic partnerships with Fortune 500 companies for research and placement",
      impact: "Achieve 99% placement rate, increase average package by 45%, boost industry relevance",
      investmentRequired: "₹1.8 Cr",
      timeline: "6 months",
      roi: "310%",
      riskLevel: "Medium",
      icon: UserGroupIcon,
      color: "from-green-500 to-emerald-500",
      iconColor1: "#10B981",
      iconColor2: "#059669"
    },
    {
      id: 3,
      title: "Global Research Excellence Centers",
      description: "Establish world-class research facilities in emerging technologies and sustainable innovation",
      impact: "Triple research output, attract international faculty, achieve global ranking boost",
      investmentRequired: "₹7.5 Cr",
      timeline: "18 months",
      roi: "450%",
      riskLevel: "High",
      icon: LightBulbIcon,
      color: "from-purple-500 to-violet-500",
      iconColor1: "#8B5CF6",
      iconColor2: "#7C3AED"
    },
  ];

  return (
    <div className={`min-h-screen ${getThemedClasses(isDark, "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200", "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900")}`}>
      {/* Enhanced Professional Header */}
      <div className={`border-b sticky top-0 z-50 backdrop-blur-xl ${getThemedClasses(
        isDark,
        "bg-white/90 border-gray-200 shadow-lg",
        "bg-gray-800/90 border-gray-700 shadow-lg"
      )}`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Principal Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="font-normal bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
                Academic Year 2023-24
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {renderExecutiveOverview()}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;

