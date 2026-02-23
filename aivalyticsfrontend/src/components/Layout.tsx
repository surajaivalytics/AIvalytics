import React, { Fragment, useState, useCallback, useMemo, memo } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  BuildingLibraryIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

// Memoized SVG component for the logo
const LogoSVG = memo(() => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
));

// Memoized navigation item component
const NavItem = memo(
  ({
    item,
    onClick,
    classNamesFn,
    isDark,
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
  }) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        to={item.href}
        className={classNamesFn(
          item.current
            ? isDark
              ? "bg-gray-800 text-white"
              : "bg-blue-50 text-blue-700"
            : isDark
            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer font-secondary"
        )}
        onClick={onClick}
      >
        <Icon
          className={classNamesFn(
            item.current
              ? "text-blue-400"
              : isDark
              ? "text-gray-400 group-hover:text-gray-300"
              : "text-gray-500 group-hover:text-gray-700",
            "mr-3 flex-shrink-0 h-6 w-6"
          )}
          aria-hidden="true"
        />
        {item.name}
        {item.current && (
          <span className="ml-auto">
            <ChevronRightIcon
              className="h-4 w-4 text-blue-400"
              aria-hidden="true"
            />
          </span>
        )}
      </Link>
    );
  }
);

// Memoized user profile component
const UserProfile = memo(
  ({
    user,
    handleLogout,
    getRoleColor,
    isDark,
  }: {
    user: any;
    handleLogout: () => void;
    getRoleColor: (role: string) => string;
    isDark: boolean;
  }) => (
    <div
      className={`flex items-center p-2 rounded-lg transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-white font-primary">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </span>
      </div>
      <div className="ml-3">
        <p
          className={`text-sm font-medium transition-colors duration-300 font-primary ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {user?.username || "User"}
        </p>
        <p
          className={`text-xs transition-colors duration-300 font-secondary ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
              user?.role || "unknown"
            )}`}
          >
            {user?.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "Loading..."}
          </span>
        </p>
      </div>
      <button
        onClick={handleLogout}
        className={`ml-auto transition-colors duration-200 p-1 rounded-md ${
          isDark
            ? "text-gray-400 hover:text-white hover:bg-gray-700"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
        }`}
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
    </div>
  )
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  // Memoized sidebar toggle handlers
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Memoized navigation items that only update when user or location changes
  const navigation = useMemo(() => {
    const navItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
        current: location.pathname === "/dashboard",
      },
      {
        name: "Profile",
        href: "/profile",
        icon: UserIcon,
        current: location.pathname === "/profile",
      },
    ];

    // Add role-specific navigation items
    if (user?.role === "student") {
      navItems.push({
        name: "Courses",
        href: "/courses",
        icon: BookOpenIcon,
        current: location.pathname === "/courses",
      });
      navItems.push({
        name: "Quizzes",
        href: "/quizzes",
        icon: DocumentTextIcon,
        current: location.pathname === "/quizzes",
      });
      navItems.push({
        name: "Attendance",
        href: "/attendance",
        icon: CalendarIcon,
        current: location.pathname === "/attendance",
      });
      navItems.push({
        name: "Reports",
        href: "/reports",
        icon: ChartBarIcon,
        current: location.pathname === "/reports",
      });
    }

    // Only teachers get "My Courses" - exclude HOD and Principal
    if (user?.role === "teacher") {
      navItems.push({
        name: "My Courses",
        href: "/my-courses",
        icon: BookOpenIcon,
        current: location.pathname === "/my-courses",
      });
    }

    // Only HOD gets "Class Management"
    if (user?.role === "hod") {
      navItems.push({
        name: "Class Management",
        href: "/class-management",
        icon: AcademicCapIcon,
        current: location.pathname === "/class-management",
      });
    }

    // Principal gets department management only
    if (user?.role === "principal") {
      navItems.push({
        name: "Department Management",
        href: "/departments",
        icon: BuildingLibraryIcon,
        current: location.pathname === "/departments",
      });
    }

    return navItems;
  }, [user?.role, location.pathname]);

  // Memoized user navigation items
  const userNavigation = useMemo(
    () => [
      { name: "Your Profile", href: "/profile" },
      { name: "Settings", href: "/settings" },
    ],
    []
  );

  // Memoized utility function
  const classNames = useCallback((...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
  }, []);

  // Memoized role color function
  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case "student":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg";
      case "teacher":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg";
      case "hod":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg";
      case "principal":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }
  }, []);

  // Memoized current page title
  const currentPageTitle = useMemo(
    () => navigation.find((item) => item.current)?.name || "Dashboard",
    [navigation]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-secondary">
      {/* Sidebar for desktop - fixed positioning */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <div
          className={`flex min-h-0 flex-1 flex-col border-r transition-colors duration-300 ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div
              className={`flex items-center h-16 flex-shrink-0 px-4 transition-colors duration-300 ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <LogoSVG />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AIValytics
              </span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
            <nav className="mt-5 flex flex-col px-2 space-y-1 flex-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  classNamesFn={classNames}
                  isDark={isDark}
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
            className={`fixed inset-y-0 left-0 flex max-w-xs w-full flex-col transform transition-all duration-300 ${
              isDark ? "bg-gray-900" : "bg-white"
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
              className={`flex items-center h-16 flex-shrink-0 px-4 transition-colors duration-300 ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <LogoSVG />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AIValytics
              </span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
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
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Mobile menu button - floating for mobile only */}
        <button
          type="button"
          className={`md:hidden fixed top-4 left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md focus:outline-none transition-all duration-200 shadow-lg ${
            isDark
              ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
          }`}
          onClick={openSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Main content area - improved scrolling */}
        <main
          className={`flex-1 overflow-y-auto relative transition-colors duration-300 ${
            isDark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="h-full">
            <div className="px-6 py-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(Layout);
