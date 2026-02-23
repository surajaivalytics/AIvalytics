import React, { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  BookOpenIcon,
  TrophyIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  mcqService,
  StudentQuizResult as StudentQuizResultType,
} from "../services/mcqApi";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import LoadingSpinner from "./LoadingSpinner";
import StudentQuizResult from "./StudentQuizResult";

interface PastQuiz {
  id: string;
  marks: number;
  quiz: {
    id: string;
    name: string;
    max_score: number;
    course: {
      id: string;
      name: string;
    };
  };
  created_at: string;
  response: {
    answers: any[];
    total_questions: number;
    correct_answers: number;
    score_percentage: number;
  };
}

const StudentPastQuizzes: React.FC = () => {
  const { isDark } = useTheme();
  const [pastQuizzes, setPastQuizzes] = useState<PastQuiz[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<StudentQuizResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cursor following effect states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchPastQuizzes();
  }, [currentPage]);

  // Mouse tracking for glow effect
  React.useEffect(() => {
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

  const fetchPastQuizzes = async () => {
    try {
      setLoading(true);
      const response = await mcqService.getStudentScores(currentPage, 10);
      setPastQuizzes(response.scores);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError("Failed to load past quizzes");
      console.error("Error fetching past quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (quizId: string) => {
    try {
      setLoading(true);
      const result = await mcqService.getStudentQuizResult(quizId);
      setSelectedResult(result);
    } catch (error) {
      console.error("Failed to fetch quiz result:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return isDark ? "text-green-400" : "text-green-600";
    if (percentage >= 60) return isDark ? "text-yellow-400" : "text-yellow-600";
    return isDark ? "text-red-400" : "text-red-600";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80)
      return isDark
        ? "bg-green-900 border-green-700"
        : "bg-green-100 border-green-300";
    if (percentage >= 60)
      return isDark
        ? "bg-yellow-900 border-yellow-700"
        : "bg-yellow-100 border-yellow-300";
    return isDark ? "bg-red-900 border-red-700" : "bg-red-100 border-red-300";
  };

  const getPerformanceIcon = (percentage: number) => {
    const iconClass = isDark ? "" : "";
    if (percentage >= 80)
      return (
        <TrophyIcon
          className={`h-5 w-5 ${isDark ? "text-green-400" : "text-green-600"}`}
        />
      );
    if (percentage >= 60)
      return (
        <CheckCircleIcon
          className={`h-5 w-5 ${
            isDark ? "text-yellow-400" : "text-yellow-600"
          }`}
        />
      );
    return (
      <XCircleIcon
        className={`h-5 w-5 ${isDark ? "text-red-400" : "text-red-600"}`}
      />
    );
  };

  if (loading && pastQuizzes.length === 0) {
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

  if (selectedResult) {
    return (
      <StudentQuizResult
        result={selectedResult}
        onBack={() => setSelectedResult(null)}
      />
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

      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-xl font-bold flex items-center ${getThemedClasses(
            isDark,
            "text-gray-900",
            "text-white"
          )}`}
        >
          <ChartBarIcon
            className={`h-6 w-6 mr-3 ${
              isDark ? "text-purple-400" : "text-purple-600"
            }`}
          />
          Past Quiz Results
        </h2>
      </div>

      {error && (
        <div
          className={`rounded-xl p-4 mb-6 border ${
            isDark ? "bg-red-900 border-red-700" : "bg-red-50 border-red-200"
          }`}
        >
          <p className={isDark ? "text-red-300" : "text-red-700"}>{error}</p>
        </div>
      )}

      {pastQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon
            className={`mx-auto h-16 w-16 mb-4 ${
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
            No past quizzes
          </h3>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            You haven't completed any quizzes yet.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                isDark ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              <thead className={isDark ? "bg-gray-800/50" : "bg-gray-50/50"}>
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Quiz
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View Result</span>
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-gray-800" : "divide-gray-200"
                }`}
              >
                {pastQuizzes.map((quiz) => {
                  const percentage = Math.round(
                    (quiz.marks / quiz.quiz.max_score) * 100
                  );
                  return (
                    <tr
                      key={quiz.id}
                      className={`transition-all duration-300 ${
                        isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-100/60"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getThemedClasses(
                          isDark,
                          "text-gray-900",
                          "text-white"
                        )}`}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            {getPerformanceIcon(percentage)}
                          </div>
                          {quiz.quiz.name}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getThemedClasses(
                          isDark,
                          "text-gray-500",
                          "text-gray-300"
                        )}`}
                      >
                        <div className="flex items-center">
                          <AcademicCapIcon
                            className={`h-5 w-5 mr-2 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          {quiz.quiz.course.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getScoreBgColor(
                            percentage
                          )} ${getScoreColor(percentage)}`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getThemedClasses(
                          isDark,
                          "text-gray-500",
                          "text-gray-300"
                        )}`}
                      >
                        <div className="flex items-center">
                          <CalendarIcon
                            className={`h-5 w-5 mr-2 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          {formatDate(quiz.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewResult(quiz.quiz.id)}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200 ${getThemedClasses(
                            isDark,
                            "text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
                            "text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          )}`}
                        >
                          <EyeIcon className="h-5 w-5 mr-2" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getThemedClasses(
                    isDark,
                    "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
                    "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white"
                  )}`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          pageNum === currentPage
                            ? isDark
                              ? "bg-purple-600 text-white"
                              : "bg-purple-500 text-white"
                            : getThemedClasses(
                                isDark,
                                "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
                                "text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-white"
                              )
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getThemedClasses(
                    isDark,
                    "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
                    "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white"
                  )}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentPastQuizzes;
