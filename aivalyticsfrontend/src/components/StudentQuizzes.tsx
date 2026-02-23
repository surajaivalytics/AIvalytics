import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  HomeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { mcqService, MCQQuestion, QuizResult } from "../services/mcqApi";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import { Course } from "../types/course";
import StudentPastQuizzes from "./StudentPastQuizzes";

interface Quiz {
  id: string;
  name: string;
  max_score: number;
  created_at: string;
  course?: {
    id: string;
    name: string;
  };
  question_count?: number;
}

interface QuizForTaking {
  quiz: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
    max_score: number;
    total_questions: number;
  };
  questions: MCQQuestion[];
}

interface StudentQuizzesProps {
  enrolledCourses: Course[];
  allQuizzes: Quiz[];
  loading: boolean;
  onStartQuiz: (quizId: string) => void;
  selectedCourse: Course | null;
  onSelectCourse: (course: Course | null) => void;
}

const StudentQuizzes: React.FC<StudentQuizzesProps> = ({
  enrolledCourses,
  allQuizzes,
  loading,
  onStartQuiz,
  selectedCourse,
  onSelectCourse,
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);

  // Cursor following effect states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const handleStartQuiz = async (quizId: string) => {
    setStartingQuizId(quizId);
    try {
      await onStartQuiz(quizId);
    } finally {
      setStartingQuizId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-purple-400" : "border-purple-600"
          }`}
        ></div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="p-12 text-center">
        <BookOpenIcon
          className={`h-16 w-16 mx-auto mb-4 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-xl font-semibold mb-2 ${getThemedClasses(
            isDark,
            "text-gray-900",
            "text-white"
          )}`}
        >
          No Enrolled Courses
        </h3>
        <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          You need to enroll in courses to access quizzes.
        </p>
        <button
          onClick={() => navigate("/courses")}
          className={`px-6 py-3 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isDark
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 focus:ring-offset-gray-800"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 focus:ring-offset-white"
          }`}
        >
          Browse Courses
        </button>
      </div>
    );
  }

  if (allQuizzes.length === 0) {
    return (
      <div className="p-12 text-center">
        <QuestionMarkCircleIcon
          className={`h-16 w-16 mx-auto mb-4 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-xl font-semibold mb-2 ${getThemedClasses(
            isDark,
            "text-gray-900",
            "text-white"
          )}`}
        >
          No Quizzes Available
        </h3>
        <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Either your teachers haven't created any quizzes yet, or you have
          completed all available quizzes for your enrolled courses.
        </p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Check the "Past Quizzes" tab to see your completed quizzes.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`p-6 relative ${getThemedClasses(
        isDark,
        "bg-gray-50",
        "bg-gray-900"
      )}`}
    >
      {/* Cursor following glow effect */}
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1), transparent 40%)`,
          }}
        />
      )}

      {/* Course Filter */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-3 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Filter by Course
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCourse(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              !selectedCourse
                ? isDark
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-purple-500 text-white shadow-lg"
                : getThemedClasses(
                    isDark,
                    "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300",
                    "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  )
            }`}
          >
            All Courses
          </button>
          {enrolledCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCourse?.id === course.id
                  ? isDark
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-purple-500 text-white shadow-lg"
                  : getThemedClasses(
                      isDark,
                      "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300",
                      "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                    )
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes by Course */}
      <div className="space-y-6 group">
        {enrolledCourses
          .filter(
            (course) => !selectedCourse || course.id === selectedCourse.id
          )
          .map((course) => {
            const courseQuizzes = allQuizzes.filter(
              (quiz) => quiz.course?.id === course.id
            );

            if (courseQuizzes.length === 0) return null;

            return (
              <div
                key={course.id}
                className={`rounded-2xl border overflow-hidden relative group/course ${getThemedClasses(
                  isDark,
                  "bg-white border-gray-200",
                  "bg-gray-800 border-gray-700"
                )}`}
              >
                {/* Course glow effect */}
                {isDark && (
                  <div className="absolute inset-0 opacity-0 group-hover/course:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent rounded-2xl" />
                  </div>
                )}

                {/* Course Header */}
                <div
                  className={`border-b p-6 relative z-10 ${getThemedClasses(
                    isDark,
                    "bg-gray-50 border-gray-200",
                    "bg-gray-750 border-gray-600"
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpenIcon
                        className={`h-6 w-6 mr-3 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <div>
                        <h3
                          className={`text-lg font-semibold ${getThemedClasses(
                            isDark,
                            "text-gray-900",
                            "text-white"
                          )}`}
                        >
                          {course.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {courseQuizzes.length} quiz
                          {courseQuizzes.length !== 1 ? "es" : ""} available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          isDark
                            ? "bg-blue-900 text-blue-300 border-blue-700"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        <AcademicCapIcon className="h-3 w-3 mr-1" />
                        {courseQuizzes.length} Quiz
                        {courseQuizzes.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`border rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group/quiz ${getThemedClasses(
                          isDark,
                          "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-gray-200/20",
                          "bg-gray-800 border-gray-600 hover:border-gray-500 hover:shadow-purple-500/10"
                        )}`}
                      >
                        {/* Quiz card glow effect */}
                        {isDark && (
                          <div className="absolute inset-0 opacity-0 group-hover/quiz:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent rounded-xl" />
                          </div>
                        )}

                        {/* Quiz Header */}
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <h4
                            className={`font-semibold text-sm line-clamp-2 ${getThemedClasses(
                              isDark,
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {quiz.name}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ml-2 ${
                              isDark
                                ? "bg-purple-900 text-purple-300 border-purple-700"
                                : "bg-purple-100 text-purple-700 border-purple-200"
                            }`}
                          >
                            {quiz.max_score} pts
                          </span>
                        </div>

                        {/* Quiz Meta */}
                        <div
                          className={`space-y-2 text-xs mb-4 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-2" />
                            <span>
                              Created:{" "}
                              {new Date(quiz.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {quiz.question_count && (
                            <div className="flex items-center">
                              <QuestionMarkCircleIcon className="h-3 w-3 mr-2" />
                              <span>{quiz.question_count} questions</span>
                            </div>
                          )}
                        </div>

                        {/* Start Quiz Button */}
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          disabled={startingQuizId === quiz.id}
                          className={`w-full px-4 py-3 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center relative z-10 ${
                            isDark
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 focus:ring-offset-gray-800 disabled:from-gray-600 disabled:to-gray-700"
                              : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 focus:ring-offset-white disabled:from-gray-400 disabled:to-gray-500"
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                          {startingQuizId === quiz.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Starting...
                            </>
                          ) : (
                            <>
                              <PlayIcon className="h-4 w-4 mr-2" />
                              Start Quiz
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default StudentQuizzes;
