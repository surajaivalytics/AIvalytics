import React, { Fragment, useState, useCallback, useMemo, memo } from "react";
import {
 Bars3Icon,
 XMarkIcon,
 HomeIcon,
 UserIcon,
 BookOpenIcon,
 AcademicCapIcon,
 DocumentTextIcon,
 ChartBarIcon,
 Cog6ToothIcon,
 ChevronRightIcon,
 ChevronLeftIcon,
 BuildingLibraryIcon,
 CalendarIcon,
 QuestionMarkCircleIcon,
 BellIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

interface LayoutProps {
 children: React.ReactNode;
}

const LogoSVG = memo(() => (
 <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
));

const NavItem = memo(
 ({
 item,
 onClick,
 classNamesFn,
 isDark,
 isCollapsed = false,
 }: {
 item: {
 name: string;
 href: string;
 icon: React.ComponentType<any>;
 current: boolean;
 };
 onClick?: () => void;
 classNamesFn: (...classes: string[]) => string;
 isDark: boolean;
 isCollapsed?: boolean;
 }) => {
 const Icon = item.icon;
 return (
 <Link
 to={item.href}
 className={classNamesFn(
 item.current
 ? isDark
 ? "bg-primary-500/10 text-primary-400"
 : "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500/10"
 : isDark
 ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
 : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900",
 "group flex items-center px-3 py-2.5 mx-2 my-0.5 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer font-secondary relative overflow-hidden"
 )}
 onClick={onClick}
 >
 {item.current && !isCollapsed && (
 <span className="absolute inset-y-0 left-0 w-1 bg-primary-400 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
 )}
 <Icon
 className={classNamesFn(
 item.current
 ? "text-primary-600 dark:text-primary-400"
 : isDark
 ? "text-gray-500 group-hover:text-gray-300"
 : "text-gray-400 group-hover:text-gray-600",
 "flex-shrink-0 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
 isCollapsed ? "mx-auto" : "mr-3"
 )}
 />
 {!isCollapsed && (
 <>
 <span className="truncate">{item.name}</span>
 {item.current && (
 <span className="ml-auto opacity-100 transition-opacity duration-300">
 <ChevronRightIcon
 className="h-4 w-4 text-primary-500 dark:text-primary-400"
 aria-hidden="true"
 />
 </span>
 )}
 {!item.current && (
 <span className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
 <ChevronRightIcon
 className="h-4 w-4 text-gray-400"
 aria-hidden="true"
 />
 </span>
 )}
 </>
 )}
 </Link>
 );
 }
);

// Memoized user profile component
// Memoized user profile component
const UserProfile = memo(
 ({
 user,
 handleLogout,
 getRoleColor,
 isDark,
 isCollapsed = false,
 }: {
 user: any;
 handleLogout: () => void;
 getRoleColor: (role: string) => string;
 isDark: boolean;
 isCollapsed?: boolean;
 }) => (
 <div
 className={`flex items-center rounded-2xl transition-all duration-300 ${isCollapsed ? 'justify-center p-1.5' : 'p-3 ' + (isDark ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" : "bg-white border border-gray-200/80 shadow-sm hover:shadow-md")}
 `}
 >
 {user?.profilePic ? (
 <img
 src={user.profilePic}
 alt={user.username || "User"}
 className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary-500/30 transition-all duration-300"
 referrerPolicy="no-referrer"
 onError={(e) => {
 const target = e.target;
 if (!target.src.includes('ui-avatars.com')) {
 target.src = `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`;
 }
 }}
 />
 ) : (
 <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-500 flex items-center justify-center shadow-inner">
 <span className="text-sm font-bold text-white font-primary">
 {user?.username?.charAt(0).toUpperCase() || "U"}
 </span>
 </div>
 )}
 {!isCollapsed && (
 <div className="ml-3 overflow-hidden flex-1">
 <p
 className={`text-sm font-bold truncate transition-colors duration-300 font-primary ${isDark ? "text-gray-100" : "text-gray-900"
 }`}
 >
 {user?.username || "User"}
 </p>
 <p
 className={`text-xs truncate transition-colors duration-300 mt-0.5 font-secondary`}
 >
 <span
 className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleColor(
 user?.role || "unknown"
 )}`}
 >
 {user?.role
 ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
 : "Loading..."}
 </span>
 </p>
 </div>
 )}
 {!isCollapsed && (
 <button
 onClick={handleLogout}
 className={`ml-auto flex-shrink-0 transition-all duration-200 p-2 rounded-xl ${isDark
 ? "text-gray-400 hover:text-rose-400 hover:bg-rose-400/10"
 : "text-gray-500 hover:text-rose-600 hover:bg-rose-50"
 }`}
 title="Logout"
 >
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="h-5 w-5"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
 />
 </svg>
 </button>
 )}
 </div>
 ));

const Layout: React.FC<LayoutProps> = ({ children }) => {
 const { user, logout } = useAuth();
 const { isDark } = useTheme();
 const navigate = useNavigate();
 const location = useLocation();
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

 const openSidebar = useCallback(() => setSidebarOpen(true), []);
 const closeSidebar = useCallback(() => setSidebarOpen(false), []);

 const handleLogout = useCallback(async () => {
 await logout();
 navigate("/login");
 }, [logout, navigate]);

 const classNames = useCallback((...classes: string[]) => classes.filter(Boolean).join(" "), []);

 const getRoleColor = useCallback((role: string) => {
 switch (role) {
 case "student": return " text-blue-500";
 case "teacher": return " text-green-500";
 case "hod": return " text-purple-500";
 case "principal": return " text-red-500";
 default: return "bg-gray-500/10 text-gray-500";
 }
 }, []);

 const navigation = useMemo(() => {
 const navItems = [
 { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: location.pathname === "/dashboard" },
 { name: "Profile", href: "/profile", icon: UserIcon, current: location.pathname === "/profile" },
 ];

 // Standard single link for Academic Management
 if (user?.role === "teacher" || user?.role === "hod" || user?.role === "principal") {
 navItems.push({
 name: "Academic Management",
 href: "/academic-management",
 icon: AcademicCapIcon,
 current: location.pathname.startsWith("/academic-management"),
 });
 }

 // Teacher specific navigation
 if (user?.role === "teacher") {
 navItems.push({
 name: "Performance",
 href: "/performance",
 icon: ChartBarIcon,
 current: location.pathname === "/performance",
 });
 navItems.push({
 name: "Reports",
 href: "/teacher-reports",
 icon: DocumentTextIcon,
 current: location.pathname === "/teacher-reports",
 });
 navItems.push({
 name: "Alerts",
 href: "/alerts",
 icon: BellIcon,
 current: location.pathname === "/alerts",
 });
 }

 if (user?.role === "student") {
 navItems.push(
 { name: "Courses", href: "/courses", icon: BookOpenIcon, current: location.pathname === "/courses" },
 { name: "Quizzes", href: "/quizzes", icon: QuestionMarkCircleIcon, current: location.pathname === "/quizzes" },
 { name: "Attendance", href: "/attendance", icon: CalendarIcon, current: location.pathname === "/attendance" },
 { name: "Reports", href: "/reports", icon: ChartBarIcon, current: location.pathname === "/reports" }
 );
 }

 if (user?.role === "teacher") {
 navItems.push({ name: "My Courses", href: "/my-courses", icon: BookOpenIcon, current: location.pathname === "/my-courses" });
 }

 return navItems;
 }, [user?.role, location.pathname]);

 const currentPageTitle = useMemo(() => {
 const currentItem = navigation.find(item => item.current);
 return currentItem ? currentItem.name : "Dashboard";
 }, [navigation]);

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] font-secondary">
 {/* Sidebar for desktop - fixed positioning */}
 <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
 <div
 className={`flex min-h-0 flex-1 flex-col border-r transition-colors duration-300 overflow-hidden ${isDark ? "bg-[#0B0F19] border-gray-800/50" : "bg-gray-50/80 border-gray-200/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)]"
 }`}
 >
 <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
 <div
 className={`flex justify-between items-center h-16 flex-shrink-0 transition-colors duration-300 ${
 isCollapsed ? "px-2" : "px-4"
 } ${isDark ? "bg-[#0B0F19]" : "bg-transparent"}`}
 >
 {/* Left side (Logo & Text) */}
 <div className="flex items-center gap-3 overflow-hidden">
 <div className={`flex items-center justify-center rounded-full bg-blue-600 shadow-sm transition-all duration-300 flex-shrink-0 ${isCollapsed ? "h-8 w-8" : "h-10 w-10"}`}>
 <span className={`text-white font-bold ${isCollapsed ? "text-sm" : "text-lg"}`}>AI</span>
 </div>
 {!isCollapsed && (
 <div className="flex flex-col whitespace-nowrap">
 <span className="text-blue-600 dark:text-blue-400 font-bold text-lg leading-tight">AIValytics</span>
 <span className="text-gray-500 dark:text-gray-400 text-sm leading-tight">
 {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Loading..."}
 </span>
 </div>
 )}
 </div>

 {/* Right side (Collapse Arrow) */}
 <button
 onClick={() => setIsCollapsed(!isCollapsed)}
 className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-300 flex-shrink-0 ${isCollapsed ? "p-0 ml-1" : "p-1"}`}
 aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
 >
 <ChevronLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
 </button>
 </div>
 <nav className="mt-5 flex flex-col px-2 space-y-1 flex-1">
 {navigation.map((item) => (
 <NavItem
 key={item.name}
 item={item}
 classNamesFn={classNames}
 isDark={isDark}
 isCollapsed={isCollapsed}
 />
 ))}
 </nav>
 {user && (
 <div className="mt-auto p-4 flex-shrink-0">
 <UserProfile
 user={user}
 handleLogout={handleLogout}
 getRoleColor={getRoleColor}
 isDark={isDark}
 isCollapsed={isCollapsed}
 />
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Mobile sidebar overlay */}
 {sidebarOpen && (
 <div className="fixed inset-0 z-50 md:hidden">
 <div
 className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
 onClick={closeSidebar}
 aria-hidden="true"
 />
 <div
 className={`fixed inset-y-0 left-0 flex max-w-xs w-full flex-col transform transition-all duration-300 ${isDark ? "bg-[#0B0F19]" : "bg-gray-50"
 }`}
 >
 <div className="absolute top-0 right-0 -mr-12 pt-2">
 <button
 type="button"
 className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-gray-300 hover:text-white transition-colors duration-200"
 onClick={closeSidebar}
 >
 <span className="sr-only">Close sidebar</span>
 <XMarkIcon className="h-6 w-6" aria-hidden="true" />
 </button>
 </div>
 <div
 className={`flex justify-between items-center h-16 flex-shrink-0 px-4 transition-colors duration-300 ${isDark ? "bg-[#0B0F19]" : "bg-transparent"
 }`}
 >
 {/* Left side (Logo & Text) */}
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 shadow-sm flex-shrink-0">
 <span className="text-white font-bold text-lg">AI</span>
 </div>
 <div className="flex flex-col">
 <span className="text-blue-600 dark:text-blue-400 font-bold text-lg leading-tight">AIValytics</span>
 <span className="text-gray-500 dark:text-gray-400 text-sm leading-tight">
 {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Loading..."}
 </span>
 </div>
 </div>

 {/* Right side (Collapse Arrow) */}
 <button
 onClick={closeSidebar}
 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1 transition-colors"
 >
 <ChevronLeftIcon className="h-5 w-5" />
 </button>
 </div>
 <nav className="mt-5 flex flex-1 flex-col overflow-y-auto px-2 space-y-1">
 {navigation.map((item) => (
 <NavItem
 key={item.name}
 item={item}
 onClick={closeSidebar}
 classNamesFn={classNames}
 isDark={isDark}
 />
 ))}
 </nav>
 {user && (
 <div className="p-4 flex-shrink-0">
 <UserProfile
 user={user}
 handleLogout={handleLogout}
 getRoleColor={getRoleColor}
 isDark={isDark}
 />
 </div>
 )}
 </div>
 </div>
 )}

 {/* Main content - adjusted for fixed sidebar */}
 <div className={`flex flex-1 flex-col min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>

 {/* Global Top Navbar */}
 <header className={`sticky top-0 z-40 ${isDark ? 'bg-[#0B0F19]/70 border-gray-800/50' : 'bg-white/70 border-gray-200/60 shadow-sm'} backdrop-blur-xl border-b flex items-center justify-between px-4 sm:px-6 h-16 transition-colors duration-300`}>
 {/* Left Side */}
 <div className="flex items-center gap-3 overflow-hidden">
 <button
 onClick={openSidebar}
 className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
 >
 <Bars3Icon className="h-6 w-6" />
 </button>
 <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
 <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">Home</span>
 <ChevronRightIcon className="h-4 w-4 text-gray-400 hidden sm:block flex-shrink-0 mx-0.5" />
 <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{currentPageTitle}</span>
 </div>
 </div>

 {/* Right Side */}
 <div className="flex items-center gap-2 sm:gap-3">
 <div className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center p-1">
 <ThemeToggle />
 </div>

 <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:flex items-center justify-center">
 <QuestionMarkCircleIcon className="h-5 w-5" />
 </button>

 <Menu as="div" className="relative">
 <Menu.Button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center outline-none">
 <BellIcon className="h-5 w-5" />
 <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
 </Menu.Button>
 <Transition
 as={Fragment}
 enter="transition ease-out duration-100"
 enterFrom="transform opacity-0 scale-95"
 enterTo="transform opacity-100 scale-100"
 leave="transition ease-in duration-75"
 leaveFrom="transform opacity-100 scale-100"
 leaveTo="transform opacity-0 scale-95"
 >
 <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-100 dark:border-slate-700 overflow-hidden">
 <div className="p-4 border-b border-gray-100 dark:border-slate-700">
 <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
 </div>
 <div className="max-h-80 overflow-y-auto">
 {[
 { title: "Low engagement in Section C", time: "5 minutes ago", critical: true },
 { title: "Quiz not sent for yesterday's lecture", time: "1 hour ago", critical: false },
 { title: "7 students missed 2+ lectures", time: "2 hours ago", critical: true }
 ].map((notification, idx) => (
 <Menu.Item key={idx}>
 {({ active }) => (
 <div className={`p-4 border-b border-gray-50 dark:border-slate-700/50 cursor-pointer block transition-colors ${active ? 'bg-gray-50 dark:bg-slate-700/50' : ''}`}>
 <p className={`text-sm font-medium ${notification.critical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
 {notification.title}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
 </div>
 )}
 </Menu.Item>
 ))}
 </div>
 <div className="p-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-center">
 <Menu.Item>
 {({ active }) => (
 <Link
 to="/alerts"
 className={`text-sm font-medium transition-colors ${active ? 'text-purple-700 dark:text-purple-300' : 'text-purple-600 dark:text-purple-400'}`}
 >
 View all notifications
 </Link>
 )}
 </Menu.Item>
 </div>
 </Menu.Items>
 </Transition>
 </Menu>

 <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

 <Menu as="div" className="relative">
 <Menu.Button className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors outline-none flex-nowrap whitespace-nowrap">
 {user?.profilePic ? (
 <img
 src={user.profilePic}
 alt={user.username || "User"}
 className="h-8 w-8 flex-shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
 referrerPolicy="no-referrer"
 onError={(e) => {
 const target = e.target as HTMLImageElement;
 if (!target.src.includes('ui-avatars.com')) {
 target.src = `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`;
 }
 }}
 />
 ) : (
 <div className="h-8 w-8 rounded-full bg-blue-100 dark: flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden flex-shrink-0">
 <UserIcon className="h-5 w-5" />
 </div>
 )}
 <div className="hidden md:flex items-center gap-2 flex-nowrap whitespace-nowrap">
 <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username || "User"}</span>
 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user?.role === 'student' ? 'bg-blue-100 text-blue-700 dark: dark:text-blue-300' : 'bg-purple-100 dark: text-purple-700 dark:text-purple-300'}`}>
 {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Loading..."}
 </span>
 </div>
 </Menu.Button>
 </Menu>
 </div>
 </header>

 {/* Main content area - improved scrolling */}
 <main
 className={`flex-1 overflow-y-auto relative transition-colors duration-300 ${isDark ? "bg-[#0B0F19]" : "bg-gray-50/50"
 }`}
 >
 <div className="h-full">
 <div className="px-6 py-6">{children}</div>
 </div>
 </main>
 </div>

 {/* Global Feedback Floating Button */}
 <button
 onClick={() => setIsFeedbackOpen(true)}
 className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all hover:-translate-y-1"
 >
 <MessageSquare className="h-5 w-5" />
 <span className="font-medium text-sm pr-1">Give Feedback</span>
 </button>

 {/* Feedback Modal */}
 <FeedbackModal
 isOpen={isFeedbackOpen}
 onClose={() => setIsFeedbackOpen(false)}
 />
 </div>
 );
};

export default memo(Layout);