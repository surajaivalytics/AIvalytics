import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  SparklesIcon,
  UserGroupIcon,
  HomeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Extracted NavItem component to optimize rendering
const NavItem = React.memo(
  ({
    item,
  }: {
    item: {
      name: string;
      href: string;
      icon: React.ElementType;
      current: boolean;
    };
  }) => {
    const Icon = item.icon;

    return (
      <li>
        <Link
          to={item.href}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-secondary ${
            item.current
              ? "bg-purple-700 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">{item.name}</span>
          {item.current && (
            <div className="ml-auto w-1.5 h-5 bg-indigo-400 rounded-full"></div>
          )}
        </Link>
      </li>
    );
  }
);

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Memoize navigation items to prevent unnecessary recalculations
  const navigation = useMemo(() => {
    // Base navigation items for all users
    const baseNavigation = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
        current: isActive("/dashboard"),
      },
      {
        name: "Learning Plan",
        href: "/learning-plan",
        icon: ClockIcon,
        current: isActive("/learning-plan"),
      },
      {
        name: "Resources",
        href: "/resources",
        icon: DocumentTextIcon,
        current: isActive("/resources"),
      },
      {
        name: "Achievements",
        href: "/achievements",
        icon: AcademicCapIcon,
        current: isActive("/achievements"),
      },
    ];

    // Add Quiz Generator for teachers at the top
    if (user?.role === "teacher" || user?.role === "principal") {
      baseNavigation.push({
        name: "Quiz Generator",
        href: "/quiz-generator",
        icon: SparklesIcon,
        current: isActive("/quiz-generator"),
      });
    }

    // Add role-specific navigation items
    if (user?.role === "student") {
      baseNavigation.push({
        name: "Courses",
        href: "/courses",
        icon: BookOpenIcon,
        current: isActive("/courses"),
      });
      baseNavigation.push({
        name: "Quizzes",
        href: "/quizzes",
        icon: DocumentTextIcon,
        current: isActive("/quizzes"),
      });
      baseNavigation.push({
        name: "Attendance",
        href: "/attendance",
        icon: CalendarIcon,
        current: isActive("/attendance"),
      });
      baseNavigation.push({
        name: "Reports",
        href: "/reports",
        icon: ClipboardDocumentListIcon,
        current: isActive("/reports"),
      });
    }

    // Only teachers get these navigation items - exclude principals
    if (user?.role === "teacher") {
      baseNavigation.push({
        name: "My Courses",
        href: "/my-courses",
        icon: BookOpenIcon,
        current: isActive("/my-courses"),
      });
      baseNavigation.push({
        name: "Students",
        href: "/students",
        icon: UserGroupIcon,
        current: isActive("/students"),
      });
      baseNavigation.push({
        name: "Analytics",
        href: "/analytics",
        icon: ChartBarIcon,
        current: isActive("/analytics"),
      });
      baseNavigation.push({
        name: "Generate Reports",
        href: "/report-generation",
        icon: ClipboardDocumentListIcon,
        current: isActive("/report-generation"),
      });
    }

    return baseNavigation;
  }, [user?.role, location.pathname]);

  // Memoize user info to prevent unnecessary re-renders
  const userInfo = useMemo(() => {
    return {
      initial: user?.username?.charAt(0).toUpperCase() || "U",
      username: user?.username || "User",
      role: user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "Loading...",
    };
  }, [user?.username, user?.role]);

  return (
    <div className="h-full w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center space-x-3">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-primary">
            AIValytics
          </span>
          <p className="text-xs text-gray-400 font-secondary">
            {user?.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white font-primary">
              {userInfo.initial}
            </span>
          </div>
          <div>
            <p className="font-medium text-white font-primary">
              {userInfo.username}
            </p>
            <p className="text-xs text-gray-400 font-secondary">
              {userInfo.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-700 font-secondary">
        <Link
          to="/profile"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-sm">Profile</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
