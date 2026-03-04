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
  ChevronLeftIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

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
        {item.current && !isCollapsed && (
          <span className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-md"></span>
        )}
        <Icon
          className={classNamesFn(
            item.current
              ? "text-blue-500 dark:text-blue-400"
              : isDark
                ? "text-gray-400 group-hover:text-gray-300"
                : "text-gray-500 group-hover:text-gray-700",
            "flex-shrink-0 h-6 w-6",
            isCollapsed ? "mx-auto" : "mr-3"
          )}
          aria-hidden="true"
        />
        {!isCollapsed && (
          <>
            <span className="truncate">{item.name}</span>
            {item.current && (
              <span className="ml-auto">
                <ChevronRightIcon
                  className="h-4 w-4 text-blue-500 dark:text-blue-400"
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
      className={`flex items-center rounded-lg transition-colors duration-300 ${isCollapsed ? 'justify-center p-1' : 'p-2 ' + (isDark ? "bg-gray-800" : "bg-gray-100")
        }`}
    >
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-sm font-bold text-white font-primary">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </span>
      </div>
      {!isCollapsed && (
        <div className="ml-3 overflow-hidden">
          <p
            className={`text-sm font-medium truncate transition-colors duration-300 font-primary ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            {user?.username || "User"}
          </p>
          <p
            className={`text-xs truncate transition-colors duration-300 font-secondary ${isDark ? "text-gray-300" : "text-gray-600"
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
      )}
      {!isCollapsed && (
        <button
          onClick={handleLogout}
          className={`ml-auto flex-shrink-0 transition-colors duration-200 p-1 rounded-md ${isDark
            ? "text-gray-400 hover:text-white hover:bg-gray-700"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
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
  )
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

    // Teacher specific navigation
    if (user?.role === "teacher") {
      navItems.push({
        name: "Academic Management",
        href: "/academic-management",
        icon: BookOpenIcon,
        current: location.pathname === "/academic-management",
      });
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
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div
          className={`flex min-h-0 flex-1 flex-col border-r transition-colors duration-300 overflow-hidden ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            }`}
        >
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div
              className={`flex justify-between items-center h-16 flex-shrink-0 px-4 transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-white"
                }`}
            >
              {/* Left side (Logo & Text) */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg leading-tight">AIValytics</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm leading-tight">Teacher</span>
                  </div>
                )}
              </div>

              {/* Right side (Collapse Arrow) */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1 transition-all duration-300 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
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
            className={`fixed inset-y-0 left-0 flex max-w-xs w-full flex-col transform transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-white"
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
              className={`flex justify-between items-center h-16 flex-shrink-0 px-4 transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-white"
                }`}
            >
              {/* Left side (Logo & Text) */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg leading-tight">AIValytics</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm leading-tight">Teacher</span>
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
        <header className={`sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 h-16 transition-colors duration-300`}>
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
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden flex-shrink-0">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="hidden md:flex items-center gap-2 flex-nowrap whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Dr. Smith</span>
                  <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-semibold rounded-full">Teacher</span>
                </div>
              </Menu.Button>
            </Menu>
          </div>
        </header>

        {/* Main content area - improved scrolling */}
        <main
          className={`flex-1 overflow-y-auto relative transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-gray-50"
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

// Export memoized component to prevent unnecessary re-renders
export default memo(Layout);
