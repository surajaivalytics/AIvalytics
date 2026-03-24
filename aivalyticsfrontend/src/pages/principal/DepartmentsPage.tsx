import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemedClasses } from "../../utils/themeUtils";
import DepartmentManagement from "../../components/DepartmentManagement";
import { 
 BuildingOffice2Icon, 
 ChartBarIcon, 
 UsersIcon, 
 AcademicCapIcon,
 ArrowTrendingUpIcon,
 BookOpenIcon,
 BeakerIcon,
 UserGroupIcon,
 CalendarIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// Enhanced professional styles
const styles = `
 @keyframes fadeInUp {
 from {
 opacity: 0;
 transform: translateY(20px);
 }
 to {
 opacity: 1;
 transform: translateY(0);
 }
 }
 
 @keyframes shimmer {
 0% { background-position: -200% 0; }
 100% { background-position: 200% 0; }
 }

 @keyframes float {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-5px); }
 }

 @keyframes gradientFlow {
 0% { background-position: 0% 50%; }
 50% { background-position: 100% 50%; }
 100% { background-position: 0% 50%; }
 }
 
 .departments-header {
 background: rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%);
 backdrop-filter: blur(20px);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 24px;
 padding: 2.5rem;
 margin-bottom: 2rem;
 animation: fadeInUp 0.6s ease-out;
 position: relative;
 overflow: hidden;
 }

 .departments-header::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 height: 2px;
 background: #3B82F6;
 background-size: 200% auto;
 animation: gradientFlow 4s ease infinite;
 }
 
 .dark .departments-header {
 background: rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.7) 100%);
 border: 1px solid rgba(255, 255, 255, 0.05);
 }
 
 .header-icon {
 background: #3B82F6;
 border-radius: 20px;
 padding: 16px;
 box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
 transition: all 0.3s ease;
 animation: float 3s ease-in-out infinite;
 }
 
 .header-icon:hover {
 transform: scale(1.05) translateY(-5px);
 box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3);
 }
 
 .departments-content {
 animation: fadeInUp 1s ease-out;
 }
 
 .professional-card {
 background: rgba(255, 255, 255, 0.8);
 backdrop-filter: blur(20px);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 24px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
 transition: all 0.3s ease;
 }
 
 .dark .professional-card {
 background: rgba(17, 24, 39, 0.8);
 border: 1px solid rgba(255, 255, 255, 0.05);
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
 }
 
 .professional-card:hover {
 transform: translateY(-2px);
 box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
 }
 
 .dark .professional-card:hover {
 box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
 }
 
 .breadcrumb {
 background: rgba(255, 255, 255, 0.05);
 backdrop-filter: blur(10px);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 16px;
 padding: 0.75rem 1.5rem;
 margin-bottom: 1.5rem;
 animation: fadeInUp 0.4s ease-out;
 }
 
 .dark .breadcrumb {
 background: rgba(17, 24, 39, 0.6);
 border: 1px solid rgba(255, 255, 255, 0.05);
 }

 .stat-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
 gap: 1.5rem;
 margin-bottom: 2rem;
 }

 .stat-card {
 position: relative;
 overflow: hidden;
 border-radius: 24px;
 transition: all 0.3s ease;
 }

 .stat-card::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 height: 2px;
 background: #3B82F6, var(--stat-color-2));
 opacity: 0;
 transition: opacity 0.3s ease;
 }

 .stat-card:hover::before {
 opacity: 1;
 }

 .stat-icon {
 background: #3B82F6, var(--stat-color-2));
 border-radius: 16px;
 padding: 12px;
 width: fit-content;
 box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
 transition: all 0.3s ease;
 }
 
 .stat-icon:hover {
 transform: scale(1.1) rotate(5deg);
 box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
 }
`;

const DepartmentsPage: React.FC = () => {
 const { user } = useAuth();
 const { isDark } = useTheme();

 // Enhanced quick stats data
 const quickStats = [
 {
 title: "Total Departments",
 value: "8",
 change: "+2 this year",
 trend: "up",
 icon: BuildingOffice2Icon,
 color1: "#3B82F6",
 color2: "#1D4ED8",
 description: "Active academic departments"
 },
 {
 title: "Faculty Members",
 value: "156",
 change: "+12 this semester",
 trend: "up",
 icon: UsersIcon,
 color1: "#10B981",
 color2: "#047857",
 description: "Full-time teaching staff"
 },
 {
 title: "Academic Programs",
 value: "24",
 change: "+3 new programs",
 trend: "up",
 icon: AcademicCapIcon,
 color1: "#8B5CF6",
 color2: "#7C3AED",
 description: "Undergraduate & Graduate"
 },
 {
 title: "Research Projects",
 value: "47",
 change: "+8 this quarter",
 trend: "up",
 icon: BeakerIcon,
 color1: "#F59E0B",
 color2: "#D97706",
 description: "Ongoing research initiatives"
 }
 ];

 return (
 <>
 <style>{styles}</style>
 <>
 <div className={`min-h-screen ${getThemedClasses(isDark, " bg-gray-50 ", " bg-gray-900 ")}`}>
 {/* Enhanced Breadcrumb */}
 <div className="breadcrumb">
 <div className="flex items-center space-x-3">
 <span className={`text-sm font-medium ${getThemedClasses(isDark, "text-gray-600", "text-gray-400")}`}>
 Dashboard
 </span>
 <span className={`text-sm ${getThemedClasses(isDark, "text-gray-400", "text-gray-500")}`}>
 /
 </span>
 <span className="text-sm font-semibold text-blue-600 dark:bg-blue-400 ">
 Department Management
 </span>
 </div>
 </div>

 {/* Enhanced Header */}
 <div className="departments-header">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
 <div className="flex items-start gap-6">
 <div className="header-icon">
 <BuildingOffice2Icon className="h-8 w-8 text-white" />
 </div>
 <div>
 <h1 className="text-3xl font-bold text-gray-900 dark:bg-white tracking-tight mb-2">
 Department Management
 </h1>
 <p className="text-base text-gray-600 dark:text-gray-300">
 Comprehensive oversight and management of all institutional departments
 </p>
 </div>
 </div>
 <div className="flex flex-wrap gap-4">
 <Badge variant="outline" className="py-2 px-4 bg-gray-50/50 dark: text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50">
 <CalendarIcon className="h-4 w-4 mr-2" />
 Academic Year 2023-24
 </Badge>
 <Badge variant="outline" className="py-2 px-4 bg-gray-50/50 dark: text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-800/50">
 <div className="flex items-center">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
 All Departments Active
 </div>
 </Badge>
 </div>
 </div>
 </div>

 {/* Enhanced Stats Grid */}
 <div className="stat-grid">
 {quickStats.map((stat, index) => (
 <Card
 key={index}
 className="stat-card bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
 style={{
 '--stat-color-1': stat.color1,
 '--stat-color-2': stat.color2,
 animationDelay: `${index * 0.1}s`
 } as React.CSSProperties}
 >
 <CardHeader className="p-6">
 <div className="flex items-center justify-between">
 <div className="stat-icon">
 <stat.icon className="h-5 w-5 text-white" />
 </div>
 <Badge variant="outline" className={`font-normal bg-${stat.trend === 'up' ? 'green' : 'red'}-50/50 dark:bg-${stat.trend === 'up' ? 'green' : 'red'}-900/20 text-${stat.trend === 'up' ? 'green' : 'red'}-700 dark:text-${stat.trend === 'up' ? 'green' : 'red'}-300 border-${stat.trend === 'up' ? 'green' : 'red'}-200/50 dark:border-${stat.trend === 'up' ? 'green' : 'red'}-800/50`}>
 {stat.change}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="p-6 pt-0">
 <div className="space-y-1">
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
 {stat.title}
 </p>
 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
 {stat.value}
 </h3>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 {stat.description}
 </p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Enhanced Department Management Section */}
 <Card className="departments-content bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
 <CardContent className="p-8">
 <DepartmentManagement />
 </CardContent>
 </Card>
 </div>
 </>
 </>
 );
};

export default DepartmentsPage; 