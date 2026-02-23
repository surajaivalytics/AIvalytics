import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import StudentQuizzes from "../components/StudentQuizzes";
import StudentPastQuizzes from "../components/StudentPastQuizzes";
import { courseService } from "../services/courseApi";
import { mcqService, MCQQuestion, QuizResult, QuizAnswer } from "../services/mcqApi";
import { toast } from "react-hot-toast";
import {
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  BarChart2,
  Activity,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  History,
  HelpCircle
} from 'lucide-react';
import { Course } from "../types/course";

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

const StudentQuizzesPage: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"available" | "past">("available");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Quiz taking state
  const [takingQuiz, setTakingQuiz] = useState<QuizForTaking | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState("");
  const [detailedExplanations, setDetailedExplanations] = useState<{
    [key: number]: string;
  }>({});
  const [explanationLoading, setExplanationLoading] = useState<{
    [key: number]: boolean;
  }>({});

  const tabs = [
    { id: "available", name: "Available Quizzes", icon: Play },
    { id: "past", name: "Past Quizzes", icon: BarChart2 },
  ];

  useEffect(() => {
    loadEnrolledCoursesAndQuizzes(false);
  }, []);

  const handleSubmitQuiz = useCallback(async () => {
    if (!takingQuiz) return;

    try {
      setSubmitting(true);

      // Convert answers to the expected format
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedAnswer]) => ({
          question_id: parseInt(questionId),
          selected_answer: selectedAnswer,
        })
      );

      const data = await mcqService.submitQuizAnswers(
        takingQuiz.quiz.id,
        formattedAnswers
      );
      setQuizResult(data.data);
      setTakingQuiz(null);
      toast.success("Quiz submitted successfully!");

      // Refresh the quiz list to remove the completed quiz from available quizzes
      await loadEnrolledCoursesAndQuizzes();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }, [takingQuiz, answers]);

  // Timer for quiz
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (takingQuiz && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (takingQuiz && timeLeft === 0) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }
    // Stop speech synthesis on component unmount or state change
    window.speechSynthesis.cancel();

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [timeLeft, takingQuiz, handleSubmitQuiz]);

  const handleGetDetailedExplanation = async (
    questionId: number,
    originalExplanation: string,
    context: string
  ) => {
    setExplanationLoading((prev) => ({ ...prev, [questionId]: true }));
    try {
      const data = await mcqService.getDetailedExplanation({
        text: originalExplanation,
        context: context,
      });
      setDetailedExplanations((prev) => ({
        ...prev,
        [questionId]: data.explanation,
      }));
    } catch (error: any) {
      toast.error(error.message || "Failed to generate explanation");
    } finally {
      setExplanationLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleSpeech = (text: string) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setSpeaking(false);
        setCurrentSpokenText("");
      };
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
      setCurrentSpokenText(text);
    }
  };

  const loadEnrolledCoursesAndQuizzes = async (showSuccessMessage = false) => {
    try {
      setLoading(true);

      // Get enrolled courses
      const coursesResponse = await courseService.getCourses({ limit: 50 });
      if (coursesResponse.success) {
        const enrolled = coursesResponse.courses.filter(
          (course) => course.isEnrolled
        );
        setEnrolledCourses(enrolled);

        // Load quizzes for all enrolled courses
        const allQuizzesPromises = enrolled.map(async (course) => {
          try {
            const quizResponse = await mcqService.getCourseQuizzes(course.id);
            return quizResponse.data.quizzes.map((quiz) => ({
              ...quiz,
              course: {
                id: course.id,
                name: course.name,
              },
            }));
          } catch (error) {
            console.error(
              `Failed to load quizzes for course ${course.name}:`,
              error
            );
            return [];
          }
        });

        const quizResults = await Promise.all(allQuizzesPromises);
        const flatQuizzes = quizResults.flat();
        setAllQuizzes(flatQuizzes);

        // Show success message only for manual refreshes
        if (showSuccessMessage) {
          toast.success("Quiz list refreshed successfully!");
        }
      }
    } catch (error: any) {
      toast.error("Failed to load courses and quizzes");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const response = await mcqService.getQuizForTaking(quizId);
      setTakingQuiz(response.data);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(20 * 60); // 20 minutes for quiz
      toast.success("Quiz started! You have 20 minutes to complete it.");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to start quiz";
      toast.error(errorMessage);

      // If the error is about already taking the quiz, refresh the quiz list
      if (errorMessage.includes("already taken")) {
        toast("Refreshing quiz list...", { icon: "ℹ️" });
        await loadEnrolledCoursesAndQuizzes();
      }
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (takingQuiz && currentQuestionIndex < takingQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  // Enhanced quiz card component with modern design
  const QuizCard = ({ quiz, onStart }: { quiz: Quiz; onStart: () => void }) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl blur-xl transition-all duration-300 group-hover:scale-105 opacity-0 group-hover:opacity-100"></div>
      <div className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] to-purple-500/[0.05] dark:from-blue-500/[0.02] dark:to-purple-500/[0.02]"></div>
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2.5">
              <Brain className="w-full h-full text-white" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {quiz.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quiz.course?.name}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-medium bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100/50 dark:border-blue-800/50">
                  {quiz.question_count} Questions
                </span>
                <span className="px-2.5 py-1 text-xs font-medium bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full border border-purple-100/50 dark:border-purple-800/50">
                  {quiz.max_score} Points
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                20 mins
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                {quiz.max_score} points
              </span>
            </div>
            <button
              onClick={onStart}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced quiz result display
  if (quizResult) {
    return (
      <Layout>
        <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-br from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 blur-3xl transform -translate-y-1/4 translate-x-1/4 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 blur-3xl transform translate-y-1/4 -translate-x-1/4 rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative z-10">
            <div className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              {/* Success Banner */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                <div className="relative px-8 py-12 text-center">
                  <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3">
                    Quiz Completed!
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    Excellent work! Here's how you performed.
                  </p>
                </div>
              </div>

              {/* Results Grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Score Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                          <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {quizResult.final_score}
                    </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                      Final Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Correct Answers Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl blur-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                          <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                        <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {quizResult.correct_answers}
                    </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                      Correct Answers
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                          <Trophy className="h-6 w-6 text-white" />
                    </div>
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {Math.round(quizResult.score_percentage)}%
                    </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                      Achievement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setQuizResult(null);
                      setActiveTab("past");
                      loadEnrolledCoursesAndQuizzes();
                    }}
                    className="group relative inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <History className="h-5 w-5 mr-2 relative" />
                    <span className="relative">View All Results</span>
                  </button>
                </div>
              </div>

              {/* Detailed Results */}
              {showResults && (
                <div className="border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Detailed Answer Review
                  </h2>
                  <div className="space-y-6">
                    {quizResult.results.map((result, index) => {
                      const questionData = takingQuiz?.questions.find(
                        (q) => q.id === result.question_id
                      ) || { options: [] };

                      return (
                        <div
                          key={index}
                            className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
                            <div className="relative">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {index + 1}
                                  </span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {result.question}
                          </h3>
                              </div>

                          <div className="space-y-3 mb-4">
                                {questionData.options.map((option: string, i: number) => (
                              <div
                                key={i}
                                    className={`
                                      p-3 rounded-lg border-2 transition-all duration-300
                                      ${i === result.correct_answer
                                        ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                        : i === result.selected_answer
                                        ? "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                                        : "bg-gray-50/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                      }
                                    `}
                                  >
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                                        {i === result.correct_answer ? (
                                          <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                                        ) : i === result.selected_answer ? (
                                          <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                        ) : (
                                          <span className="text-gray-400 dark:text-gray-500">
                                            {String.fromCharCode(65 + i)}
                                          </span>
                                        )}
                                      </div>
                                      <span>{option}</span>
                                    </div>
                              </div>
                            ))}
                          </div>

                              {result.explanation && (
                                <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-blue-700 dark:text-blue-300">
                                  Explanation
                                </h4>
                                      <button
                                      onClick={() => handleSpeech(result.explanation || "")}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                      {speaking && currentSpokenText === result.explanation ? (
                                        <VolumeX className="h-5 w-5" />
                                    ) : (
                                        <Volume2 className="h-5 w-5" />
                                    )}
                                  </button>
                                </div>
                                  <p className="text-blue-600 dark:text-blue-400">
                                    {result.explanation}
                              </p>
                            </div>
                          )}
                            </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz Taking Interface
  if (takingQuiz) {
    const currentQuestion = takingQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / takingQuiz.questions.length) * 100;

    return (
      <Layout>
        <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-br from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 blur-3xl transform -translate-y-1/4 translate-x-1/4 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 blur-3xl transform translate-y-1/4 -translate-x-1/4 rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative z-10 space-y-6">
            {/* Quiz Header */}
            <div className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/0 dark:from-blue-500/[0.05] dark:to-purple-500/0"></div>
              <div className="relative p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                      {takingQuiz.quiz.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {takingQuiz.quiz.course.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Timer Card */}
                    <div className="relative overflow-hidden bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          timeLeft < 300
                            ? "text-red-500 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}>
                        {formatTime(timeLeft)}
                      </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                        Time Remaining
                        </div>
                      </div>
                    </div>
                    {/* Progress Card */}
                    <div className="relative overflow-hidden bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {getAnsweredCount()}/{takingQuiz.questions.length}
                      </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                        Questions Answered
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Question {currentQuestionIndex + 1} of {takingQuiz.questions.length}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/0 dark:from-blue-500/[0.05] dark:to-purple-500/0"></div>
              <div className="relative p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {currentQuestion.question}
              </h2>
                </div>

              <div className="space-y-4">
                  {currentQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`
                        group relative w-full p-4 rounded-xl border-2 transition-all duration-300
                        ${answers[currentQuestion.id] === index
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                        }
                      `}
                  >
                    <div className="flex items-center">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all duration-300
                          ${answers[currentQuestion.id] === index
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }
                        `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                        <span className={`
                          flex-grow text-left font-medium
                          ${answers[currentQuestion.id] === index
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                          }
                        `}>
                        {option}
                      </span>
                      {answers[currentQuestion.id] === index && (
                          <CheckCircle className="h-6 w-6 text-blue-500 dark:text-blue-400 ml-4" />
                      )}
                    </div>
                  </button>
                ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`
                  group relative inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300
                  ${currentQuestionIndex === 0
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow"
                  }
                `}
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </button>

              {currentQuestionIndex === takingQuiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="group relative inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span className="relative">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 relative" />
                      <span className="relative">Submit Quiz</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="group relative inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative">Next Question</span>
                  <ChevronRight className="h-5 w-5 ml-2 relative" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl transform -translate-y-1/4 translate-x-1/4 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl transform translate-y-1/4 -translate-x-1/4 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 space-y-8 relative z-10">
          {/* Header */}
          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/0 dark:from-blue-500/[0.05] dark:to-purple-500/0"></div>
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                      Student Quizzes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Take quizzes from your enrolled courses and track your progress
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => loadEnrolledCoursesAndQuizzes(true)}
                  disabled={loading}
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span className="relative">Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 relative" />
                      <span className="relative">Refresh Quizzes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
            <div className="relative p-1">
              <nav className="grid grid-cols-2 gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as "available" | "past")}
                      className={`
                        flex items-center justify-center px-6 py-4 text-sm font-medium rounded-lg transition-all duration-300
                        ${activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-300"
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 mr-2 ${
                          activeTab === tab.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 group-hover:text-gray-500"
                      }`} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-500/0 dark:from-white/[0.02] dark:to-white/0"></div>
            <div className="relative p-6">
              {activeTab === "available" ? (
                <StudentQuizzes
                  enrolledCourses={enrolledCourses}
                  allQuizzes={allQuizzes}
                  loading={loading}
                  onStartQuiz={startQuiz}
                  selectedCourse={selectedCourse}
                  onSelectCourse={setSelectedCourse}
                />
              ) : (
                <StudentPastQuizzes />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentQuizzesPage;
