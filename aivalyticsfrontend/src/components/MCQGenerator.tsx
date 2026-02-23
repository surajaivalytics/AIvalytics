import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
  CloudArrowUpIcon,
  AcademicCapIcon,
  SparklesIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { courseService } from "../services/courseApi";
import { mcqService, Quiz } from "../services/mcqApi";
import { Course } from "../types/course";
import TeacherQuizSubmissions from "./TeacherQuizSubmissions";
import QuizVerification from "./QuizVerification";

const MCQGenerator: React.FC = () => {
  const { isDark } = useTheme();

  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Cursor following effect states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    course_id: "",
    quiz_name: "",
    num_questions: 20,
    max_score: 100,
    topics: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Modal states
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuizForSubmissions, setSelectedQuizForSubmissions] = useState<
    string | null
  >(null);

  // Quiz verification states
  const [selectedQuizForVerification, setSelectedQuizForVerification] =
    useState<Quiz | null>(null);

  // Mouse move handler for cursor following effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    loadCourses();
    loadQuizzes();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getTeacherCourses({
        page: 1,
        limit: 100,
      });
      setCourses(response.courses || []);
    } catch (error: any) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await mcqService.getTeacherQuizzes({ page, limit: 10 });
      setQuizzes(response.data.quizzes);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, PPTX, DOCX, or TXT file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleGenerateMCQ = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!formData.course_id) {
      toast.error("Please select a course");
      return;
    }

    if (!formData.quiz_name.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }

    try {
      setGenerating(true);
      await mcqService.generateMCQ({
        ...formData,
        file: selectedFile,
      });

      toast.success(
        "MCQ quiz generated successfully! Please verify and activate the quiz before students can take it."
      );

      // Reset form
      setFormData({
        course_id: "",
        quiz_name: "",
        num_questions: 20,
        max_score: 100,
        topics: "",
      });
      setSelectedFile(null);

      // Reload quizzes
      loadQuizzes();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate MCQ");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${quizName}"?`)) {
      return;
    }

    try {
      await mcqService.deleteQuiz(quizId);
      toast.success("Quiz deleted successfully");
      loadQuizzes();
    } catch (error: any) {
      toast.error("Failed to delete quiz");
      loadQuizzes();
    }
  };

  const handleViewQuizDetails = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizDetails(true);
  };

  const viewQuizSubmissions = (quizId: string) => {
    setSelectedQuizForSubmissions(quizId);
  };

  const handleBackFromSubmissions = () => {
    setSelectedQuizForSubmissions(null);
  };

  const handleVerifyQuiz = (quiz: Quiz) => {
    setSelectedQuizForVerification(quiz);
  };

  const handleBackFromVerification = () => {
    setSelectedQuizForVerification(null);
  };

  const handleQuizUpdated = () => {
    loadQuizzes();
    setSelectedQuizForVerification(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "pptx":
        return "📊";
      case "docx":
        return "📝";
      case "txt":
        return "📄";
      default:
        return "📄";
    }
  };

  // If viewing submissions, show the submissions component
  if (selectedQuizForSubmissions) {
    return (
      <TeacherQuizSubmissions
        quizId={selectedQuizForSubmissions}
        onBack={handleBackFromSubmissions}
      />
    );
  }

  // If viewing quiz verification, show the verification component
  if (selectedQuizForVerification) {
    return (
      <QuizVerification
        quiz={selectedQuizForVerification}
        onBack={handleBackFromVerification}
        onQuizUpdated={handleQuizUpdated}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden ${getThemedClasses(
        isDark,
        "bg-gray-50",
        "bg-gray-900"
      )}`}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1), transparent 40%)`,
          }}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="space-y-12">
          {/* Quiz Generation Form */}
          <div
            className={`relative rounded-2xl p-6 sm:p-8 border shadow-lg ${getThemedClasses(
              isDark,
              "bg-white/70 border-gray-200 shadow-gray-200/40",
              "bg-gray-800/60 border-gray-700/50 shadow-black/20"
            )}`}
          >
            <div
              className={`absolute inset-0 bg-grid-pattern opacity-10 ${getThemedClasses(
                isDark,
                "text-gray-300",
                "text-gray-600"
              )}`}
              style={{
                maskImage:
                  "linear-gradient(to bottom, white 10%, transparent 80%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center mb-6">
                <div
                  className={`p-3 rounded-lg mr-4 ${getThemedClasses(
                    isDark,
                    "bg-indigo-100",
                    "bg-indigo-900/50"
                  )}`}
                >
                  <AcademicCapIcon
                    className={`h-6 w-6 ${getThemedClasses(
                      isDark,
                      "text-indigo-600",
                      "text-indigo-300"
                    )}`}
                  />
                </div>
                <h1
                  className={`text-2xl font-bold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  Generate New Quiz
                </h1>
              </div>

              <form onSubmit={handleGenerateMCQ} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Course Selection */}
                  <div>
                    <label
                      htmlFor="course_id"
                      className={`block text-sm font-medium mb-2 ${getThemedClasses(
                        isDark,
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      Select Course <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="course_id"
                        value={formData.course_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            course_id: e.target.value,
                          })
                        }
                        className={`w-full appearance-none pl-3 pr-10 py-2.5 text-base border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${getThemedClasses(
                          isDark,
                          "bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
                          "bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50"
                        )}`}
                        required
                      >
                        <option value="" disabled>
                          Choose a course...
                        </option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <div
                        className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${getThemedClasses(
                          isDark,
                          "text-gray-700",
                          "text-gray-300"
                        )}`}
                      >
                        <ChevronDownIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Quiz Name */}
                  <div>
                    <label
                      htmlFor="quiz_name"
                      className={`block text-sm font-medium mb-2 ${getThemedClasses(
                        isDark,
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      Quiz Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="quiz_name"
                      value={formData.quiz_name}
                      onChange={(e) =>
                        setFormData({ ...formData, quiz_name: e.target.value })
                      }
                      placeholder="Enter quiz name..."
                      className={`w-full px-3 py-2.5 text-base border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${getThemedClasses(
                        isDark,
                        "bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
                        "bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50"
                      )}`}
                      required
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${getThemedClasses(
                      isDark,
                      "text-gray-700",
                      "text-gray-300"
                    )}`}
                  >
                    Upload Course Material{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                      dragActive
                        ? getThemedClasses(
                            isDark,
                            "border-indigo-600 bg-indigo-50",
                            "border-indigo-400 bg-gray-700/50"
                          )
                        : getThemedClasses(
                            isDark,
                            "border-gray-300 bg-white hover:bg-gray-50",
                            "border-gray-600 bg-gray-700/20 hover:bg-gray-700/40"
                          )
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <CloudArrowUpIcon
                        className={`w-10 h-10 mb-3 ${getThemedClasses(
                          isDark,
                          "text-gray-400",
                          "text-gray-500"
                        )}`}
                      />
                      <p
                        className={`mb-2 text-sm ${getThemedClasses(
                          isDark,
                          "text-gray-500",
                          "text-gray-400"
                        )}`}
                      >
                        <span className="font-semibold">
                          Drop your file here
                        </span>
                        , or{" "}
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p
                        className={`text-xs ${getThemedClasses(
                          isDark,
                          "text-gray-500",
                          "text-gray-400"
                        )}`}
                      >
                        Supports PDF, PPTX, DOCX, TXT files up to 10MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </div>
                  {selectedFile && (
                    <div
                      className={`mt-3 flex items-center justify-between p-3 rounded-lg ${getThemedClasses(
                        isDark,
                        "bg-gray-100",
                        "bg-gray-700"
                      )}`}
                    >
                      <div className="flex items-center">
                        {getFileIcon(selectedFile.name)}
                        <span
                          className={`ml-2 text-sm font-medium ${getThemedClasses(
                            isDark,
                            "text-gray-700",
                            "text-gray-200"
                          )}`}
                        >
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className={`p-1 rounded-full ${getThemedClasses(
                          isDark,
                          "text-gray-400 hover:bg-gray-200",
                          "text-gray-500 hover:bg-gray-600"
                        )}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Questions */}
                  <div>
                    <label
                      htmlFor="num_questions"
                      className={`block text-sm font-medium mb-2 ${getThemedClasses(
                        isDark,
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      id="num_questions"
                      value={formData.num_questions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          num_questions: parseInt(e.target.value, 10),
                        })
                      }
                      className={`w-full px-3 py-2.5 text-base border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${getThemedClasses(
                        isDark,
                        "bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
                        "bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50"
                      )}`}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Recommended: 10-25 questions
                    </p>
                  </div>

                  {/* Maximum Score */}
                  <div>
                    <label
                      htmlFor="max_score"
                      className={`block text-sm font-medium mb-2 ${getThemedClasses(
                        isDark,
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      Maximum Score
                    </label>
                    <input
                      type="number"
                      id="max_score"
                      value={formData.max_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_score: parseInt(e.target.value, 10),
                        })
                      }
                      className={`w-full px-3 py-2.5 text-base border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${getThemedClasses(
                        isDark,
                        "bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
                        "bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50"
                      )}`}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Total points for the quiz
                    </p>
                  </div>
                </div>

                {/* Specific Topics */}
                <div>
                  <label
                    htmlFor="topics"
                    className={`block text-sm font-medium mb-2 ${getThemedClasses(
                      isDark,
                      "text-gray-700",
                      "text-gray-300"
                    )}`}
                  >
                    Specific Topics (Optional)
                  </label>
                  <textarea
                    id="topics"
                    rows={3}
                    value={formData.topics}
                    onChange={(e) =>
                      setFormData({ ...formData, topics: e.target.value })
                    }
                    placeholder="Enter specific topics to focus on (e.g., 'data structures, algorithms, complexity analysis')..."
                    className={`w-full px-3 py-2.5 text-base border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${getThemedClasses(
                      isDark,
                      "bg-white text-gray-900 border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
                      "bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50"
                    )}`}
                  />
                  <p
                    className={`mt-1 text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Leave empty to generate questions from all content
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={generating}
                    className={`inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      generating
                        ? "bg-gray-500"
                        : getThemedClasses(
                            isDark,
                            "bg-indigo-600 hover:bg-indigo-700",
                            "bg-indigo-500 hover:bg-indigo-600"
                          )
                    }`}
                  >
                    {generating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Generate AI Quiz
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Generated Quizzes List */}
          <div
            className={`relative rounded-2xl p-6 sm:p-8 border shadow-lg ${getThemedClasses(
              isDark,
              "bg-white/70 border-gray-200 shadow-gray-200/40",
              "bg-gray-800/60 border-gray-700/50 shadow-black/20"
            )}`}
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-lg mr-4 ${getThemedClasses(
                      isDark,
                      "bg-teal-100",
                      "bg-teal-900/50"
                    )}`}
                  >
                    <QuestionMarkCircleIcon
                      className={`h-6 w-6 ${getThemedClasses(
                        isDark,
                        "text-teal-600",
                        "text-teal-300"
                      )}`}
                    />
                  </div>
                  <h1
                    className={`text-2xl font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    Generated Quizzes
                  </h1>
                </div>
                {loading && (
                  <div className="flex items-center text-sm">
                    <svg
                      className={`animate-spin h-5 w-5 mr-2 ${getThemedClasses(
                        isDark,
                        "text-gray-600",
                        "text-gray-300"
                      )}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Loading...</span>
                  </div>
                )}
              </div>
              {/* Quiz List */}
              <div className="space-y-4">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onDelete={handleDeleteQuiz}
                      onViewDetails={handleViewQuizDetails}
                      onVerify={handleVerifyQuiz}
                      onViewSubmissions={viewQuizSubmissions}
                    />
                  ))
                ) : (
                  <div
                    className={`text-center py-10 px-6 rounded-lg ${getThemedClasses(
                      isDark,
                      "bg-gray-50",
                      "bg-gray-700/50"
                    )}`}
                  >
                    <QuestionMarkCircleIcon
                      className={`mx-auto h-12 w-12 ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    />
                    <h3
                      className={`mt-2 text-lg font-medium ${getThemedClasses(
                        isDark,
                        "text-gray-900",
                        "text-white"
                      )}`}
                    >
                      No quizzes found
                    </h3>
                    <p
                      className={`mt-1 text-sm ${getThemedClasses(
                        isDark,
                        "text-gray-500",
                        "text-gray-400"
                      )}`}
                    >
                      Generate a new quiz to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Details Modal */}
      {showQuizDetails && selectedQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => setShowQuizDetails(false)}
        >
          <div
            className={`max-w-2xl w-full p-6 rounded-2xl shadow-2xl transform transition-all duration-300 scale-95 hover:scale-100 ${getThemedClasses(
              isDark,
              "bg-white",
              "bg-gray-800"
            )}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              {selectedQuiz.name}
            </h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              {selectedQuiz.question_json?.map((q, index) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg ${getThemedClasses(
                    isDark,
                    "bg-gray-100",
                    "bg-gray-700"
                  )}`}
                >
                  <p
                    className={`font-semibold ${getThemedClasses(
                      isDark,
                      "text-gray-800",
                      "text-gray-200"
                    )}`}
                  >
                    {index + 1}. {q.question}
                  </p>
                  <div className="mt-2 space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <p
                        key={optIndex}
                        className={`${
                          optIndex === q.correct_answer
                            ? getThemedClasses(
                                isDark,
                                "text-green-700 font-bold",
                                "text-green-400 font-bold"
                              )
                            : getThemedClasses(
                                isDark,
                                "text-gray-600",
                                "text-gray-300"
                              )
                        }`}
                      >
                        - {opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowQuizDetails(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${getThemedClasses(
                  isDark,
                  "bg-gray-200 text-gray-800 hover:bg-gray-300",
                  "bg-gray-600 text-white hover:bg-gray-500"
                )}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuizCard: React.FC<{
  quiz: Quiz;
  onDelete: (quizId: string, quizName: string) => Promise<void>;
  onViewDetails: (quiz: Quiz) => void;
  onVerify: (quiz: Quiz) => void;
  onViewSubmissions: (quizId: string) => void;
}> = ({ quiz, onDelete, onViewDetails, onVerify, onViewSubmissions }) => {
  const { isDark } = useTheme();

  const handleDelete = async () => {
    onDelete(quiz.id, quiz.name);
  };

  const handleViewDetails = () => {
    onViewDetails(quiz);
  };

  const handleVerify = () => {
    onVerify(quiz);
  };

  const handleViewSubmissions = () => {
    onViewSubmissions(quiz.id);
  };

  const statusPill = (status: "draft" | "active" | "inactive" | undefined) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case "active":
        return (
          <span
            className={`${baseClasses} ${getThemedClasses(
              isDark,
              "bg-green-100 text-green-800",
              "bg-green-900/50 text-green-300"
            )}`}
          >
            Active
          </span>
        );
      case "draft":
        return (
          <span
            className={`${baseClasses} ${getThemedClasses(
              isDark,
              "bg-yellow-100 text-yellow-800",
              "bg-yellow-900/50 text-yellow-300"
            )}`}
          >
            Draft
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} ${getThemedClasses(
              isDark,
              "bg-gray-100 text-gray-800",
              "bg-gray-700 text-gray-300"
            )}`}
          >
            Inactive
          </span>
        );
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${getThemedClasses(
        isDark,
        "bg-white/50 border-gray-200/80 hover:border-gray-300",
        "bg-gray-800/50 border-gray-700/60 hover:border-gray-600"
      )}`}
    >
      {/* Header section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className={`font-bold text-lg mb-2 group-hover:text-indigo-500 transition-colors duration-200 ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            {quiz.name}
          </h3>
          <div
            className={`flex items-center gap-2 text-xs ${getThemedClasses(
              isDark,
              "text-gray-500",
              "text-gray-400"
            )}`}
          >
            <ClockIcon className="h-4 w-4" />
            <span>
              Created:{" "}
              {new Date(quiz.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">{statusPill(quiz.status)}</div>
      </div>

      {/* Info section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${getThemedClasses(
              isDark,
              "bg-blue-100",
              "bg-blue-900/50"
            )}`}
          >
            <AcademicCapIcon
              className={`h-5 w-5 ${getThemedClasses(
                isDark,
                "text-blue-600",
                "text-blue-300"
              )}`}
            />
          </div>
          <div>
            <p
              className={`text-xs font-medium ${getThemedClasses(
                isDark,
                "text-gray-500",
                "text-gray-400"
              )}`}
            >
              Course
            </p>
            <p
              className={`font-semibold ${getThemedClasses(
                isDark,
                "text-gray-800",
                "text-gray-200"
              )}`}
            >
              {quiz.course?.name || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${getThemedClasses(
              isDark,
              "bg-green-100",
              "bg-green-900/50"
            )}`}
          >
            <QuestionMarkCircleIcon
              className={`h-5 w-5 ${getThemedClasses(
                isDark,
                "text-green-600",
                "text-green-300"
              )}`}
            />
          </div>
          <div>
            <p
              className={`text-xs font-medium ${getThemedClasses(
                isDark,
                "text-gray-500",
                "text-gray-400"
              )}`}
            >
              Questions
            </p>
            <p
              className={`font-semibold ${getThemedClasses(
                isDark,
                "text-gray-800",
                "text-gray-200"
              )}`}
            >
              {quiz.question_count || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${getThemedClasses(
              isDark,
              "bg-purple-100",
              "bg-purple-900/50"
            )}`}
          >
            <ChartBarIcon
              className={`h-5 w-5 ${getThemedClasses(
                isDark,
                "text-purple-600",
                "text-purple-300"
              )}`}
            />
          </div>
          <div>
            <p
              className={`text-xs font-medium ${getThemedClasses(
                isDark,
                "text-gray-500",
                "text-gray-400"
              )}`}
            >
              Max Score
            </p>
            <p
              className={`font-semibold ${getThemedClasses(
                isDark,
                "text-gray-800",
                "text-gray-200"
              )}`}
            >
              {quiz.max_score}
            </p>
          </div>
        </div>
      </div>

      {/* Footer with actions */}
      <div
        className={`border-t pt-4 mt-4 flex items-center justify-between ${getThemedClasses(
          isDark,
          "border-gray-200",
          "border-gray-700/50"
        )}`}
      >
        <div
          className={`flex items-center text-sm font-medium ${getThemedClasses(
            isDark,
            "text-gray-600",
            "text-gray-400"
          )}`}
        >
          <UserGroupIcon className="h-4 w-4 mr-2" />
          <span>Submissions: N/A</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            title="View Details"
            className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
              isDark,
              "text-blue-600 hover:bg-blue-100",
              "text-blue-400 hover:bg-blue-500/20"
            )}`}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {quiz.status === "draft" && (
            <button
              onClick={handleVerify}
              title="Verify Quiz"
              className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
                isDark,
                "text-orange-600 hover:bg-orange-100",
                "text-orange-400 hover:bg-orange-500/20"
              )}`}
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          )}
          {quiz.status === "active" && (
            <button
              onClick={handleViewSubmissions}
              title="View Submissions"
              className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
                isDark,
                "text-green-600 hover:bg-green-100",
                "text-green-400 hover:bg-green-500/20"
              )}`}
            >
              <UserGroupIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete Quiz"
            className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
              isDark,
              "text-red-600 hover:bg-red-100",
              "text-red-400 hover:bg-red-500/20"
            )}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCQGenerator;
