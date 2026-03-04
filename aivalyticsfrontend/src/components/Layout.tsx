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
  BuildingLibraryIcon,
  CalendarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

const LogoSVG = memo(() => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
));

const NavItem = memo(
  ({ item, onClick, classNamesFn, isDark }: { item: any; onClick?: () => void; classNamesFn: any; isDark: boolean; }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        className={classNamesFn(
          item.current
            ? isDark ? "bg-gray-800 text-white" : "bg-blue-50 text-blue-700"
            : isDark ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 font-secondary"
        )}
        onClick={onClick}
      >
        <Icon
          className={classNamesFn(
            item.current ? "text-blue-400" : isDark ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-700",
            "mr-3 flex-shrink-0 h-6 w-6"
          )}
        />
        {item.name}
        {item.current && (
          <span className="ml-auto">
            <ChevronRightIcon className="h-4 w-4 text-blue-400" />
          </span>
        )}
      </Link>
    );
  }
);

const UserProfile = memo(({ user, handleLogout, getRoleColor, isDark }: any) => (
  <div className={`flex items-center p-2 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <span className="text-sm font-bold text-white uppercase">{user?.username?.charAt(0)}</span>
    </div>
    <div className="ml-3 flex-1 overflow-hidden">
      <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user?.username || "User"}</p>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${getRoleColor(user?.role)}`}>
        {user?.role?.toUpperCase()}
      </span>
    </div>
    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-1"><XMarkIcon className="h-5 w-5" /></button>
  </div>
));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const classNames = useCallback((...classes: string[]) => classes.filter(Boolean).join(" "), []);

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case "student": return "bg-blue-500/10 text-blue-500";
      case "teacher": return "bg-green-500/10 text-green-500";
      case "hod": return "bg-purple-500/10 text-purple-500";
      case "principal": return "bg-red-500/10 text-red-500";
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

    if (user?.role === "student") {
      navItems.push(
        { name: "Courses", href: "/courses", icon: BookOpenIcon, current: location.pathname === "/courses" },
        { name: "Attendance", href: "/attendance", icon: CalendarIcon, current: location.pathname === "/attendance" },
        { name: "Reports", href: "/reports", icon: ChartBarIcon, current: location.pathname === "/reports" }
      );
    }

    if (user?.role === "teacher") {
      navItems.push({ name: "My Courses", href: "/my-courses", icon: BookOpenIcon, current: location.pathname === "/my-courses" });
    }

    return navItems;
  }, [user?.role, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <LogoSVG />
            </div>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIValytics</span>
            <div className="ml-auto"><ThemeToggle /></div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} classNamesFn={classNames} isDark={isDark} />
            ))}
          </nav>
          {user && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <UserProfile user={user} handleLogout={handleLogout} getRoleColor={getRoleColor} isDark={isDark} />
            </div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        <header className="md:hidden flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button onClick={() => setSidebarOpen(true)} className="p-2"><Bars3Icon className="h-6 w-6" /></button>
          <span className="ml-4 font-bold dark:text-white">AIValytics</span>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default memo(Layout);