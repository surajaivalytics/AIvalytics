import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  ChartBarIcon,
  UserGroupIcon,
  EyeIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  mcqService,
  QuizSubmissionsResponse,
  QuizSubmission,
} from "../services/mcqApi";

interface TeacherQuizSubmissionsProps {
  quizId: string;
  onBack: () => void;
}

const TeacherQuizSubmissions: React.FC<TeacherQuizSubmissionsProps> = ({
  quizId,
  onBack,
}) => {
  const { isDark } = useTheme();

  // Utility function for theme-based classes
  const getThemeClass = (lightClass: string, darkClass: string) =>
    isDark ? darkClass : lightClass;

  const [submissionsData, setSubmissionsData] =
    useState<QuizSubmissionsResponse | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId, currentPage]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await mcqService.getQuizSubmissions(quizId, currentPage, 20);
      setSubmissionsData(data);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);

      let errorMessage = "Failed to load quiz submissions";
      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmissionDetails = (submission: QuizSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
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
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80)
      return getThemeClass("bg-green-100", "bg-green-900/20");
    if (percentage >= 60)
      return getThemeClass("bg-yellow-100", "bg-yellow-900/20");
    return getThemeClass("bg-red-100", "bg-red-900/20");
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-64 ${getThemeClass(
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !submissionsData) {
    return (
      <div
        className={`space-y-4 p-6 ${getThemeClass(
          "bg-gray-50",
          "bg-gray-900"
        )}`}
      >
        <button
          onClick={onBack}
          className={`flex items-center transition-colors duration-200 ${getThemeClass(
            "text-blue-600 hover:text-blue-800",
            "text-blue-400 hover:text-blue-300"
          )}`}
        >
          ← Back to Quizzes
        </button>
        <div
          className={`border rounded-md p-4 ${getThemeClass(
            "bg-red-50 border-red-200",
            "bg-red-900/20 border-red-700"
          )}`}
        >
          <p className={getThemeClass("text-red-600", "text-red-400")}>
            {error || "Failed to load submissions"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 p-6 min-h-screen transition-colors duration-300 ${getThemeClass(
        "bg-gray-50",
        "bg-gray-900"
      )}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className={`flex items-center mb-2 transition-colors duration-200 ${getThemeClass(
              "text-blue-600 hover:text-blue-800",
              "text-blue-400 hover:text-blue-300"
            )}`}
          >
            ← Back to Quizzes
          </button>
          <h2
            className={`text-2xl font-bold flex items-center ${getThemeClass(
              "text-gray-900",
              "text-white"
            )}`}
          >
            <UserGroupIcon className="h-8 w-8 mr-3 text-blue-600" />
            {submissionsData.quiz.name} - Student Submissions
          </h2>
          <p
            className={`mt-1 ${getThemeClass(
              "text-gray-600",
              "text-gray-400"
            )}`}
          >
            {submissionsData.quiz.course.name} •{" "}
            {submissionsData.quiz.total_questions} questions • Max Score:{" "}
            {submissionsData.quiz.max_score}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          className={`p-4 rounded-lg shadow border transition-colors duration-200 ${getThemeClass(
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Total Submissions
              </p>
              <p
                className={`text-2xl font-bold ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {submissionsData.statistics.total_submissions}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg shadow border transition-colors duration-200 ${getThemeClass(
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Average Score
              </p>
              <p
                className={`text-2xl font-bold ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {submissionsData.statistics.average_score}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg shadow border transition-colors duration-200 ${getThemeClass(
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Highest Score
              </p>
              <p
                className={`text-2xl font-bold ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {submissionsData.statistics.highest_score}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg shadow border transition-colors duration-200 ${getThemeClass(
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Pass Rate
              </p>
              <p
                className={`text-2xl font-bold ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {submissionsData.statistics.pass_rate}%
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg shadow border transition-colors duration-200 ${getThemeClass(
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Lowest Score
              </p>
              <p
                className={`text-2xl font-bold ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {submissionsData.statistics.lowest_score}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissionsData.submissions.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon
            className={`mx-auto h-12 w-12 ${getThemeClass(
              "text-gray-400",
              "text-gray-600"
            )}`}
          />
          <h3
            className={`mt-2 text-sm font-medium ${getThemeClass(
              "text-gray-900",
              "text-white"
            )}`}
          >
            No submissions yet
          </h3>
          <p
            className={`mt-1 text-sm ${getThemeClass(
              "text-gray-500",
              "text-gray-400"
            )}`}
          >
            No students have taken this quiz yet.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`rounded-lg shadow border overflow-hidden transition-colors duration-200 ${getThemeClass(
              "bg-white border-gray-200",
              "bg-gray-800 border-gray-700"
            )}`}
          >
            <div
              className={`px-6 py-4 border-b ${getThemeClass(
                "border-gray-200",
                "border-gray-700"
              )}`}
            >
              <h3
                className={`text-lg font-medium ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                Student Submissions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={getThemeClass("bg-gray-50", "bg-gray-900")}>
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClass(
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Student
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClass(
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Score
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClass(
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Percentage
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClass(
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Submitted At
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClass(
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${getThemeClass(
                    "bg-white divide-gray-200",
                    "bg-gray-800 divide-gray-700"
                  )}`}
                >
                  {submissionsData.submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className={getThemeClass(
                        "hover:bg-gray-50",
                        "hover:bg-gray-700"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div
                            className={`text-sm font-medium ${getThemeClass(
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            {submission.student.name}
                          </div>
                          <div
                            className={`text-sm ${getThemeClass(
                              "text-gray-500",
                              "text-gray-400"
                            )}`}
                          >
                            {submission.student.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${getThemeClass(
                            "text-gray-900",
                            "text-white"
                          )}`}
                        >
                          {submission.marks}/{submission.max_score}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBgColor(
                            submission.percentage
                          )} ${getScoreColor(submission.percentage)}`}
                        >
                          {submission.percentage}%
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClass(
                          "text-gray-500",
                          "text-gray-400"
                        )}`}
                      >
                        {formatDate(submission.submitted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewSubmissionDetails(submission)}
                          className={`flex items-center transition-colors duration-200 ${getThemeClass(
                            "text-blue-600 hover:text-blue-900",
                            "text-blue-400 hover:text-blue-300"
                          )}`}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {submissionsData.pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${getThemeClass(
                  "border-gray-300 hover:bg-gray-50 text-gray-700",
                  "border-gray-600 hover:bg-gray-700 text-gray-300"
                )}`}
              >
                Previous
              </button>
              <span
                className={`px-3 py-2 text-sm ${getThemeClass(
                  "text-gray-600",
                  "text-gray-400"
                )}`}
              >
                Page {currentPage} of {submissionsData.pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, submissionsData.pagination.totalPages)
                  )
                }
                disabled={currentPage === submissionsData.pagination.totalPages}
                className={`px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${getThemeClass(
                  "border-gray-300 hover:bg-gray-50 text-gray-700",
                  "border-gray-600 hover:bg-gray-700 text-gray-300"
                )}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Submission Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-200 ${getThemeClass(
              "bg-white",
              "bg-gray-800"
            )}`}
          >
            <div
              className={`p-6 border-b ${getThemeClass(
                "border-gray-200",
                "border-gray-700"
              )}`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-semibold ${getThemeClass(
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  {selectedSubmission.student.name}'s Submission
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`transition-colors duration-200 ${getThemeClass(
                    "text-gray-400 hover:text-gray-600",
                    "text-gray-400 hover:text-gray-200"
                  )}`}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4 flex items-center space-x-6">
                <div
                  className={`px-4 py-2 rounded-lg ${getScoreBgColor(
                    selectedSubmission.percentage
                  )} ${getScoreColor(selectedSubmission.percentage)}`}
                >
                  <span className="font-semibold">
                    Score: {selectedSubmission.marks}/
                    {selectedSubmission.max_score} (
                    {selectedSubmission.percentage}%)
                  </span>
                </div>
                <div
                  className={`text-sm ${getThemeClass(
                    "text-gray-600",
                    "text-gray-400"
                  )}`}
                >
                  Submitted: {formatDate(selectedSubmission.submitted_at)}
                </div>
                <div
                  className={`text-sm ${getThemeClass(
                    "text-gray-600",
                    "text-gray-400"
                  )}`}
                >
                  Student: {selectedSubmission.student.email}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4
                className={`text-lg font-semibold mb-4 ${getThemeClass(
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                Question-by-Question Breakdown
              </h4>

              {selectedSubmission.response?.answers &&
              selectedSubmission.response.answers.length > 0 ? (
                <div className="space-y-4">
                  {selectedSubmission.response.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-colors duration-200 ${
                        answer.is_correct
                          ? getThemeClass(
                              "bg-green-50 border-green-200",
                              "bg-green-900/20 border-green-700"
                            )
                          : getThemeClass(
                              "bg-red-50 border-red-200",
                              "bg-red-900/20 border-red-700"
                            )
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5
                            className={`font-medium mb-2 ${getThemeClass(
                              "text-gray-900",
                              "text-white"
                            )}`}
                          >
                            Question {index + 1}
                          </h5>
                          <p
                            className={`text-sm mb-3 ${getThemeClass(
                              "text-gray-700",
                              "text-gray-300"
                            )}`}
                          >
                            {answer.question}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <span
                                className={`text-xs font-medium ${getThemeClass(
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Student Answer:
                              </span>
                              <p
                                className={`text-sm ${getThemeClass(
                                  "text-gray-800",
                                  "text-gray-200"
                                )}`}
                              >
                                Option {answer.selected_answer + 1}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`text-xs font-medium ${getThemeClass(
                                  "text-gray-600",
                                  "text-gray-400"
                                )}`}
                              >
                                Correct Answer:
                              </span>
                              <p
                                className={`text-sm ${getThemeClass(
                                  "text-gray-800",
                                  "text-gray-200"
                                )}`}
                              >
                                Option {answer.correct_answer + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {answer.is_correct ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className={`text-center py-8 ${getThemeClass(
                    "text-gray-500",
                    "text-gray-400"
                  )}`}
                >
                  No detailed answers available for this submission.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizSubmissions;
