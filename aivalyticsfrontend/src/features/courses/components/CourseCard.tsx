import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Course } from "../../../types/course";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemedClasses } from "../../../utils/themeUtils";
import {
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  TrophyIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

interface CourseCardProps {
  course: Course;
  showCreateQuiz?: boolean;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  compact?: boolean;
  showRank?: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  enrolling?: boolean;
  showTeacherActions?: boolean;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  deleting?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  showCreateQuiz = false,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  compact = false,
  showRank,
  isEnrolled,
  onEnroll,
  enrolling = false,
  showTeacherActions = false,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        text: "Active",
        classes: getThemedClasses(
          isDark,
          "bg-green-100 text-green-800 border-green-200",
          "bg-green-900/70 text-green-300 border-green-700"
        ),
        icon: CheckCircleIcon,
      },
      upcoming: {
        text: "Upcoming",
        classes: getThemedClasses(
          isDark,
          "bg-blue-100 text-blue-800 border-blue-200",
          "bg-blue-900/70 text-blue-300 border-blue-700"
        ),
        icon: ClockIcon,
      },
      completed: {
        text: "Completed",
        classes: getThemedClasses(
          isDark,
          "bg-gray-100 text-gray-800 border-gray-200",
          "bg-gray-900/70 text-gray-300 border-gray-700"
        ),
        icon: TrophyIcon,
      },
      unknown: {
        text: "Available",
        classes: getThemedClasses(
          isDark,
          "bg-purple-100 text-purple-800 border-purple-200",
          "bg-purple-900/70 text-purple-300 border-purple-700"
        ),
        icon: BookOpenIcon,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${getThemedClasses(
        isDark,
        "bg-white border border-gray-200 hover:border-gray-300",
        "bg-gray-800 border border-gray-700 hover:border-gray-600"
      )}`}
      onMouseMove={onMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Course Header */}
      <div
        className={`relative ${
          compact ? "h-24" : "h-32"
        } bg-gradient-to-r from-indigo-900/90 to-purple-900/90 overflow-hidden`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500 rounded-full filter blur-3xl opacity-20 -translate-x-20 -translate-y-20 animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-20 translate-x-20 translate-y-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Course Status Badge with Glow */}
        <div className="absolute top-4 right-4 backdrop-blur-md">
          {isEnrolled ? (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getThemedClasses(
                isDark,
                "bg-green-100 text-green-800 border-green-200",
                "bg-green-900/70 text-green-300 border-green-700"
              )}`}
            >
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Enrolled
            </span>
          ) : (
            getStatusBadge(course.timelineStatus || "unknown")
          )}
        </div>

        {/* Rank Badge */}
        {showRank && (
          <div className="absolute top-4 left-4 backdrop-blur-md">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {showRank}
            </div>
          </div>
        )}

        {/* Course Title with Sci-fi Styling */}
        <div className="absolute bottom-4 left-4 right-16">
          <h4 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors duration-200 tracking-wide">
            {course.name}
          </h4>
          <div className="flex items-center text-xs text-gray-300">
            <span className="flex items-center text-cyan-400">
              <ClockIcon className="h-3 w-3 mr-1" />
              {course.duration_months || 0} months
            </span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="flex items-center text-purple-400">
              <UserGroupIcon className="h-3 w-3 mr-1" />
              {course.enrollmentCount || 0} students
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div
        className={`relative h-1.5 ${getThemedClasses(
          isDark,
          "bg-gray-200",
          "bg-gray-800/50"
        )}`}
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 relative overflow-hidden"
          style={{
            width: `${Math.min(course.progress_percentage || 0, 100)}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Course Content with Enhanced Styling */}
      <div className="p-6 relative z-10">
        {!compact && (
          <p
            className={`text-sm mb-4 line-clamp-2 group-hover:text-opacity-80 transition-colors duration-200 ${getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-400"
            )}`}
          >
            {course.about || "No description provided for this course."}
          </p>
        )}

        {/* Stats Row */}
        {!compact && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div
              className={`p-3 rounded-lg border backdrop-blur-sm group-hover:border-opacity-50 transition-colors duration-200 ${getThemedClasses(
                isDark,
                "bg-gray-50 border-gray-200 hover:border-cyan-300",
                "bg-gray-800/30 border-gray-700/50 hover:border-cyan-500/30"
              )}`}
            >
              <div
                className={`text-xs mb-1 ${getThemedClasses(
                  isDark,
                  "text-gray-500",
                  "text-gray-400"
                )}`}
              >
                Students Enrolled
              </div>
              <div className="text-lg font-bold text-cyan-400">
                {course.enrollmentCount || 0}
              </div>
            </div>
            <div
              className={`p-3 rounded-lg border backdrop-blur-sm group-hover:border-opacity-50 transition-colors duration-200 ${getThemedClasses(
                isDark,
                "bg-gray-50 border-gray-200 hover:border-purple-300",
                "bg-gray-800/30 border-gray-700/50 hover:border-purple-500/30"
              )}`}
            >
              <div
                className={`text-xs mb-1 ${getThemedClasses(
                  isDark,
                  "text-gray-500",
                  "text-gray-400"
                )}`}
              >
                Course Progress
              </div>
              <div className="flex items-end">
                <span className="text-lg font-bold text-purple-400">
                  {course.progress_percentage || 0}%
                </span>
                <span
                  className={`text-xs ml-1 mb-1 ${getThemedClasses(
                    isDark,
                    "text-gray-400",
                    "text-gray-500"
                  )}`}
                >
                  complete
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showCreateQuiz && (
          <div className="flex justify-center">
            <Link
              to={`/quiz-generator?courseId=${course.id}`}
              className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium backdrop-blur-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <SparklesIcon className="h-4 w-4 mr-2 text-purple-400" />
              Create Quiz
            </Link>
          </div>
        )}

        {/* Enrollment Button */}
        {onEnroll && (
          <div className="flex justify-center mt-4">
            {isEnrolled ? (
              <button
                onClick={onEnroll}
                disabled={enrolling}
                className="w-full py-2 px-3 bg-gradient-to-r from-red-600/50 to-red-700/50 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium backdrop-blur-sm group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                {enrolling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <XCircleIcon className="h-4 w-4 mr-2 text-red-400" />
                )}
                {enrolling ? "Unenrolling..." : "Unenroll"}
              </button>
            ) : (
              <button
                onClick={onEnroll}
                disabled={enrolling || course.enrollmentOpen === false}
                className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium backdrop-blur-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {enrolling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : course.enrollmentOpen === false ? (
                  "Enrollment Closed"
                ) : (
                  <>
                    <PlusCircleIcon className="h-4 w-4 mr-2 text-purple-400" />
                    Enroll Now
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Teacher Actions */}
        {showTeacherActions && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit?.(course)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium backdrop-blur-sm group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <PencilIcon className="h-4 w-4 mr-2 text-blue-400" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(course.id);
              }}
              disabled={deleting}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-red-600/50 to-red-700/50 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium backdrop-blur-sm group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <TrashIcon className="h-4 w-4 mr-2 text-red-400" />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
