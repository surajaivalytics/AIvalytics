import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Course } from "../types/course";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  TrophyIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
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
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
          "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30"
        ),
        icon: CheckCircleIcon,
      },
      upcoming: {
        text: "Upcoming",
        classes: getThemedClasses(
          isDark,
          "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
          "bg-blue-900/30 text-blue-400 ring-1 ring-blue-500/30"
        ),
        icon: CalendarIcon,
      },
      completed: {
        text: "Completed",
        classes: getThemedClasses(
          isDark,
          "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
          "bg-purple-900/30 text-purple-400 ring-1 ring-purple-500/30"
        ),
        icon: TrophyIcon,
      },
      unknown: {
        text: "Available",
        classes: getThemedClasses(
          isDark,
          "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
          "bg-gray-900/30 text-gray-400 ring-1 ring-gray-500/30"
        ),
        icon: BookOpenIcon,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}>
        <IconComponent className="h-3.5 w-3.5 mr-1" />
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
      className={`group relative rounded-xl transition-all duration-300 ${
        getThemedClasses(
          isDark,
          "bg-white border border-gray-200/80 hover:border-gray-300/80 shadow-sm hover:shadow-lg",
          "bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50 shadow-lg hover:shadow-xl"
        )
      }`}
      onMouseMove={onMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Course Header */}
      <div className={`relative ${compact ? "p-4" : "p-6"} border-b ${
        getThemedClasses(
          isDark,
          "border-gray-100",
          "border-gray-700/50"
        )
      }`}>
        <div className="flex justify-between items-start mb-4">
          {/* Course Status */}
          <div className="flex items-center space-x-2">
            {isEnrolled ? (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                getThemedClasses(
                  isDark,
                  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
                  "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30"
                )
              }`}>
                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                Enrolled
              </span>
            ) : (
              getStatusBadge(course.timelineStatus || "unknown")
            )}
          </div>

          {/* Rank Badge */}
          {showRank && (
            <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              getThemedClasses(
                isDark,
                "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
                "bg-amber-900/30 text-amber-400 ring-1 ring-amber-500/30"
              )
            }`}>
              <TrophyIcon className="h-3.5 w-3.5 mr-1" />
              Rank {showRank}
            </div>
          )}
        </div>

        {/* Course Title and Info */}
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold leading-tight ${
            getThemedClasses(isDark, "text-gray-900", "text-white")
          }`}>
            {course.name}
          </h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`flex items-center ${
              getThemedClasses(isDark, "text-gray-600", "text-gray-400")
            }`}>
              <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
              {course.duration_months || 0} months
            </span>
            <span className={`flex items-center ${
              getThemedClasses(isDark, "text-gray-600", "text-gray-400")
            }`}>
              <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-400" />
              {course.enrollmentCount || 0} students
            </span>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      {(course.progress_percentage !== undefined && course.progress_percentage > 0) && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              getThemedClasses(isDark, "text-gray-700", "text-gray-300")
            }`}>
              Course Progress
            </span>
            <span className={`text-sm font-semibold ${
              getThemedClasses(isDark, "text-gray-900", "text-white")
            }`}>
              {course.progress_percentage}%
            </span>
          </div>
          <div className={`h-2 rounded-full ${
            getThemedClasses(isDark, "bg-gray-100", "bg-gray-700")
          }`}>
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${Math.min(course.progress_percentage || 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className={`${compact ? "px-4 pb-4" : "px-6 pb-6"} ${course.progress_percentage ? "pt-2" : "pt-4"}`}>
        {!compact && (
          <>
            <p className={`text-sm mb-6 line-clamp-2 ${
              getThemedClasses(isDark, "text-gray-600", "text-gray-400")
            }`}>
              {course.about || "No description provided for this course."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${
                getThemedClasses(
                  isDark,
                  "bg-gray-50 border border-gray-100",
                  "bg-gray-800/50 border border-gray-700"
                )
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    getThemedClasses(
                      isDark,
                      "bg-blue-50",
                      "bg-blue-900/30"
                    )
                  }`}>
                    <UserGroupIcon className={`h-5 w-5 ${
                      getThemedClasses(isDark, "text-blue-600", "text-blue-400")
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${
                      getThemedClasses(isDark, "text-gray-500", "text-gray-400")
                    }`}>
                      Enrolled Students
                    </p>
                    <p className={`text-lg font-semibold ${
                      getThemedClasses(isDark, "text-gray-900", "text-white")
                    }`}>
                      {course.enrollmentCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                getThemedClasses(
                  isDark,
                  "bg-gray-50 border border-gray-100",
                  "bg-gray-800/50 border border-gray-700"
                )
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    getThemedClasses(
                      isDark,
                      "bg-emerald-50",
                      "bg-emerald-900/30"
                    )
                  }`}>
                    <ChartBarIcon className={`h-5 w-5 ${
                      getThemedClasses(isDark, "text-emerald-600", "text-emerald-400")
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${
                      getThemedClasses(isDark, "text-gray-500", "text-gray-400")
                    }`}>
                      Completion Rate
                    </p>
                    <p className={`text-lg font-semibold ${
                      getThemedClasses(isDark, "text-gray-900", "text-white")
                    }`}>
                      {course.progress_percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {showCreateQuiz && (
            <Link
              to={`/quiz-generator?courseId=${course.id}`}
              className={`w-full py-2.5 px-4 rounded-lg inline-flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                getThemedClasses(
                  isDark,
                  "bg-primary-50 text-primary-700 hover:bg-primary-100",
                  "bg-primary-900/30 text-primary-400 hover:bg-primary-900/50"
                )
              }`}
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          )}

          {onEnroll && (
            <button
              onClick={onEnroll}
              disabled={enrolling || (!isEnrolled && course.enrollmentOpen === false)}
              className={`w-full py-2.5 px-4 rounded-lg inline-flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                isEnrolled
                  ? getThemedClasses(
                      isDark,
                      "bg-red-50 text-red-700 hover:bg-red-100",
                      "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                    )
                  : getThemedClasses(
                      isDark,
                      "bg-primary-600 text-white hover:bg-primary-700",
                      "bg-primary-600 text-white hover:bg-primary-700"
                    )
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {enrolling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  {isEnrolled ? "Unenrolling..." : "Enrolling..."}
                </>
              ) : course.enrollmentOpen === false ? (
                "Enrollment Closed"
              ) : (
                <>
                  {isEnrolled ? (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Unenroll
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Enroll Now
                    </>
                  )}
                </>
              )}
            </button>
          )}

          {showTeacherActions && (
            <div className="flex gap-3">
              <button
                onClick={() => onEdit?.(course)}
                className={`flex-1 py-2.5 px-4 rounded-lg inline-flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  getThemedClasses(
                    isDark,
                    "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )
                }`}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(course.id)}
                disabled={deleting}
                className={`flex-1 py-2.5 px-4 rounded-lg inline-flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  getThemedClasses(
                    isDark,
                    "bg-red-50 text-red-700 hover:bg-red-100",
                    "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                  )
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
