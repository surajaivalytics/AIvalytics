import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
  AcademicCapIcon,
  SparklesIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  mcqService,
  Quiz,
  GenerateGeminiMCQRequest,
  GenerateGeminiMCQFileRequest,
} from "../services/mcqApi";
import TeacherQuizSubmissions from "./TeacherQuizSubmissions";
import QuizVerification from "./QuizVerification";

const GEMINI_KEY_STORAGE = "gemini_api_key";

type InputTab = "text" | "file";

/** Returns a human-readable file size string */
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MCQGenerator: React.FC = () => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Input mode
  const [activeTab, setActiveTab] = useState<InputTab>("text");

  // Gemini API Key — stored in localStorage
  const [apiKeyInput, setApiKeyInput] = useState<string>(
    () => localStorage.getItem(GEMINI_KEY_STORAGE) || ""
  );
  const [savedApiKey, setSavedApiKey] = useState<string>(
    () => localStorage.getItem(GEMINI_KEY_STORAGE) || ""
  );
  const [keySaved, setKeySaved] = useState<boolean>(
    () => !!localStorage.getItem(GEMINI_KEY_STORAGE)
  );
  const [showApiKey, setShowApiKey] = useState(false);

  // Text form
  const [lectureContent, setLectureContent] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [maxScore, setMaxScore] = useState(100);
  const [topics, setTopics] = useState("");

  // File form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sub-views
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuizForSubmissions, setSelectedQuizForSubmissions] = useState<
    string | null
  >(null);
  const [selectedQuizForVerification, setSelectedQuizForVerification] =
    useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await mcqService.getTeacherQuizzes({ page, limit: 10 });
      setQuizzes(response.data.quizzes);
      setPagination(response.data.pagination);
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid Gemini API key");
      return;
    }
    localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
    setSavedApiKey(trimmed);
    setKeySaved(true);
    toast.success("API key saved in your browser");
  };

  const handleClearKey = () => {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
    setApiKeyInput("");
    setSavedApiKey("");
    setKeySaved(false);
  };

  // ── Text generation ──────────────────────────────────────────────────────
  const handleGenerateText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedApiKey.trim()) {
      toast.error("Please save your Gemini API key first");
      return;
    }
    if (lectureContent.trim().length < 20) {
      toast.error("Please enter at least 20 characters of lecture content");
      return;
    }

    try {
      setGenerating(true);
      const payload: GenerateGeminiMCQRequest = {
        course_id: "",
        quiz_name: "",
        lecture_content: lectureContent,
        num_questions: numQuestions,
        max_score: maxScore,
        topics,
        gemini_api_key: savedApiKey,
      };
      await mcqService.generateMCQFromText(payload);
      toast.success(
        "Quiz generated! Verify and activate before students can take it."
      );
      setLectureContent("");
      setTopics("");
      setNumQuestions(10);
      setMaxScore(100);
      loadQuizzes();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate MCQ");
    } finally {
      setGenerating(false);
    }
  };

  // ── File handling ────────────────────────────────────────────────────────
  const validateAndSetFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (
      !ACCEPTED_MIME_TYPES.includes(file.type) &&
      !ACCEPTED_EXTENSIONS.includes(ext)
    ) {
      toast.error("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    // reset value so the same file can be re-selected again
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSetFile(file);
    },
    []
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // File icon by extension
  const fileIcon = selectedFile ? (
    <DocumentTextIcon className="h-8 w-8 text-indigo-500 flex-shrink-0" />
  ) : null;

  // ── File generation ───────────────────────────────────────────────────────
  const handleGenerateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedApiKey.trim()) {
      toast.error("Please save your Gemini API key first");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setGenerating(true);
      const payload: GenerateGeminiMCQFileRequest = {
        file: selectedFile,
        num_questions: numQuestions,
        max_score: maxScore,
        topics,
        gemini_api_key: savedApiKey,
      };
      await mcqService.generateMCQFromFile(payload);
      toast.success(
        "Quiz generated from file! Verify and activate before students can take it."
      );
      setSelectedFile(null);
      setTopics("");
      setNumQuestions(10);
      setMaxScore(100);
      loadQuizzes();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate MCQ from file");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizName: string) => {
    if (!window.confirm(`Delete "${quizName}"?`)) return;
    try {
      await mcqService.deleteQuiz(quizId);
      toast.success("Quiz deleted");
      loadQuizzes();
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  if (selectedQuizForSubmissions) {
    return (
      <TeacherQuizSubmissions
        quizId={selectedQuizForSubmissions}
        onBack={() => setSelectedQuizForSubmissions(null)}
      />
    );
  }

  if (selectedQuizForVerification) {
    return (
      <QuizVerification
        quiz={selectedQuizForVerification}
        onBack={() => setSelectedQuizForVerification(null)}
        onQuizUpdated={() => {
          loadQuizzes();
          setSelectedQuizForVerification(null);
        }}
      />
    );
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${getThemedClasses(
    isDark,
    "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500"
  )}`;

  const labelCls = `block text-sm font-medium mb-1.5 ${getThemedClasses(
    isDark,
    "text-gray-700",
    "text-gray-300"
  )}`;

  const isFileTab = activeTab === "file";

  return (
    <div
      ref={containerRef}
      className={`min-h-screen p-4 sm:p-6 lg:p-8 ${getThemedClasses(
        isDark,
        "bg-gray-50",
        "bg-gray-900"
      )}`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Heading */}
        <h1
          className={`text-2xl font-bold ${getThemedClasses(
            isDark,
            "text-gray-900",
            "text-white"
          )}`}
        >
          AI Quiz Generator
        </h1>

        {/* Generator Card */}
        <div
          className={`rounded-2xl border shadow-sm overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700/50"
          )}`}
        >
          {/* Card Header */}
          <div
            className={`px-6 py-5 border-b ${getThemedClasses(
              isDark,
              "border-gray-100",
              "border-gray-700/50"
            )}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 p-2 rounded-lg ${getThemedClasses(
                  isDark,
                  "bg-indigo-50",
                  "bg-indigo-900/40"
                )}`}
              >
                <SparklesIcon
                  className={`h-5 w-5 ${getThemedClasses(
                    isDark,
                    "text-indigo-600",
                    "text-indigo-400"
                  )}`}
                />
              </div>
              <div>
                <h2
                  className={`text-base font-semibold ${getThemedClasses(
                    isDark,
                    "text-gray-900",
                    "text-white"
                  )}`}
                >
                  AI Quiz Generator
                </h2>
                <p
                  className={`text-sm mt-0.5 ${getThemedClasses(
                    isDark,
                    "text-gray-500",
                    "text-gray-400"
                  )}`}
                >
                  Generate quiz questions from your lecture content or topic
                  description using{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline"
                  >
                    Google's Gemini AI
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Gemini API Key Card */}
            <div
              className={`rounded-xl p-5 border ${getThemedClasses(
                isDark,
                "bg-indigo-50/50 border-indigo-100",
                "bg-indigo-950/20 border-indigo-800/30"
              )}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🔑</span>
                <h3
                  className={`font-semibold text-sm ${getThemedClasses(
                    isDark,
                    "text-gray-800",
                    "text-gray-200"
                  )}`}
                >
                  Gemini API Key Required
                </h3>
                {keySaved && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    ✓ Saved
                  </span>
                )}
              </div>
              <p
                className={`text-xs mb-3 ${getThemedClasses(
                  isDark,
                  "text-gray-500",
                  "text-gray-400"
                )}`}
              >
                To generate AI-powered questions, please enter your Google
                Gemini API key. You can obtain a key from the{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                    placeholder="Enter your Gemini API key"
                    className={`${inputCls} pr-14 font-mono placeholder:font-sans`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-400 hover:text-gray-600",
                      "text-gray-500 hover:text-gray-300"
                    )}`}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
                >
                  Save Key
                </button>
                {keySaved && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className={`px-3 py-2.5 text-sm rounded-lg border transition ${getThemedClasses(
                      isDark,
                      "border-gray-300 text-gray-500 hover:bg-gray-100",
                      "border-gray-600 text-gray-400 hover:bg-gray-700"
                    )}`}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p
                className={`mt-2 text-xs ${getThemedClasses(
                  isDark,
                  "text-gray-400",
                  "text-gray-500"
                )}`}
              >
                Your API key will be stored locally in your browser.
              </p>
            </div>

            {/* Input Mode Tabs */}
            <div
              className={`flex rounded-xl p-1 gap-1 ${getThemedClasses(
                isDark,
                "bg-gray-100",
                "bg-gray-700/50"
              )}`}
            >
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "text"
                  ? getThemedClasses(
                    isDark,
                    "bg-white text-indigo-600 shadow-sm",
                    "bg-gray-800 text-indigo-400 shadow-sm"
                  )
                  : getThemedClasses(
                    isDark,
                    "text-gray-500 hover:text-gray-700",
                    "text-gray-400 hover:text-gray-200"
                  )
                  }`}
              >
                <DocumentTextIcon className="h-4 w-4" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "file"
                  ? getThemedClasses(
                    isDark,
                    "bg-white text-indigo-600 shadow-sm",
                    "bg-gray-800 text-indigo-400 shadow-sm"
                  )
                  : getThemedClasses(
                    isDark,
                    "text-gray-500 hover:text-gray-700",
                    "text-gray-400 hover:text-gray-200"
                  )
                  }`}
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                Upload File
              </button>
            </div>

            {/* ── TEXT TAB ─────────────────────────────────────────────── */}
            {activeTab === "text" && (
              <form onSubmit={handleGenerateText} className="space-y-5">
                {/* Lecture Content */}
                <div>
                  <label className={labelCls}>
                    Lecture Content or Topic Description
                  </label>
                  <textarea
                    rows={7}
                    value={lectureContent}
                    onChange={(e) => setLectureContent(e.target.value)}
                    placeholder="Paste your lecture notes, syllabus content, or describe the topic in detail..."
                    className={`${inputCls} resize-y`}
                    required
                  />
                  <p
                    className={`mt-1 text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-400",
                      "text-gray-500"
                    )}`}
                  >
                    {lectureContent.length} characters · Minimum 20 required
                  </p>
                </div>

                {/* Number of Questions + Max Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="num_questions_text" className={labelCls}>
                      Number of Questions
                    </label>
                    <input
                      id="num_questions_text"
                      type="number"
                      min={1}
                      max={50}
                      value={numQuestions}
                      onChange={(e) =>
                        setNumQuestions(parseInt(e.target.value, 10))
                      }
                      className={inputCls}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      Recommended: 10–25
                    </p>
                  </div>
                  <div>
                    <label htmlFor="max_score_text" className={labelCls}>
                      Maximum Score
                    </label>
                    <input
                      id="max_score_text"
                      type="number"
                      min={1}
                      value={maxScore}
                      onChange={(e) =>
                        setMaxScore(parseInt(e.target.value, 10))
                      }
                      className={inputCls}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      Total points for the quiz
                    </p>
                  </div>
                </div>

                {/* Topics (optional) */}
                <div>
                  <label htmlFor="topics_text" className={labelCls}>
                    Specific Topics{" "}
                    <span
                      className={`font-normal ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="topics_text"
                    type="text"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="e.g. data structures, sorting algorithms..."
                    className={inputCls}
                  />
                  <p
                    className={`mt-1 text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-400",
                      "text-gray-500"
                    )}`}
                  >
                    Leave empty to cover all content
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <GenerateButton generating={generating} />
                </div>
              </form>
            )}

            {/* ── FILE TAB ─────────────────────────────────────────────── */}
            {activeTab === "file" && (
              <form onSubmit={handleGenerateFile} className="space-y-5">
                {/* Drop zone */}
                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 px-6 cursor-pointer transition-all ${isDragging
                      ? getThemedClasses(
                        isDark,
                        "border-indigo-400 bg-indigo-50",
                        "border-indigo-500 bg-indigo-900/20"
                      )
                      : getThemedClasses(
                        isDark,
                        "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40",
                        "border-gray-600 hover:border-indigo-500 hover:bg-indigo-900/10"
                      )
                      }`}
                  >
                    <div
                      className={`p-3 rounded-full ${getThemedClasses(
                        isDark,
                        "bg-indigo-100",
                        "bg-indigo-900/40"
                      )}`}
                    >
                      <DocumentArrowUpIcon
                        className={`h-7 w-7 ${getThemedClasses(
                          isDark,
                          "text-indigo-600",
                          "text-indigo-400"
                        )}`}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={`font-semibold text-sm ${getThemedClasses(
                          isDark,
                          "text-gray-700",
                          "text-gray-200"
                        )}`}
                      >
                        {isDragging
                          ? "Drop your file here"
                          : "Drag & drop or click to upload"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${getThemedClasses(
                          isDark,
                          "text-gray-400",
                          "text-gray-500"
                        )}`}
                      >
                        Supports PDF, DOCX, TXT — max 10 MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </div>
                ) : (
                  // File preview card
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${getThemedClasses(
                      isDark,
                      "bg-indigo-50 border-indigo-100",
                      "bg-indigo-950/20 border-indigo-800/30"
                    )}`}
                  >
                    {fileIcon}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${getThemedClasses(
                          isDark,
                          "text-gray-800",
                          "text-gray-200"
                        )}`}
                      >
                        {selectedFile.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${getThemedClasses(
                          isDark,
                          "text-gray-500",
                          "text-gray-400"
                        )}`}
                      >
                        {formatBytes(selectedFile.size)} ·{" "}
                        {selectedFile.name.split(".").pop()?.toUpperCase()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      title="Remove file"
                      className={`p-1.5 rounded-lg transition ${getThemedClasses(
                        isDark,
                        "text-gray-400 hover:text-red-500 hover:bg-red-50",
                        "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                      )}`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Number of Questions + Max Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="num_questions_file" className={labelCls}>
                      Number of Questions
                    </label>
                    <input
                      id="num_questions_file"
                      type="number"
                      min={1}
                      max={50}
                      value={numQuestions}
                      onChange={(e) =>
                        setNumQuestions(parseInt(e.target.value, 10))
                      }
                      className={inputCls}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      Recommended: 10–25
                    </p>
                  </div>
                  <div>
                    <label htmlFor="max_score_file" className={labelCls}>
                      Maximum Score
                    </label>
                    <input
                      id="max_score_file"
                      type="number"
                      min={1}
                      value={maxScore}
                      onChange={(e) =>
                        setMaxScore(parseInt(e.target.value, 10))
                      }
                      className={inputCls}
                    />
                    <p
                      className={`mt-1 text-xs ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      Total points for the quiz
                    </p>
                  </div>
                </div>

                {/* Topics (optional) */}
                <div>
                  <label htmlFor="topics_file" className={labelCls}>
                    Specific Topics{" "}
                    <span
                      className={`font-normal ${getThemedClasses(
                        isDark,
                        "text-gray-400",
                        "text-gray-500"
                      )}`}
                    >
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="topics_file"
                    type="text"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="e.g. data structures, sorting algorithms..."
                    className={inputCls}
                  />
                  <p
                    className={`mt-1 text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-400",
                      "text-gray-500"
                    )}`}
                  >
                    Leave empty to cover all content
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <GenerateButton
                    generating={generating}
                    disabled={!selectedFile}
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quiz List */}
        <div
          className={`rounded-2xl border shadow-sm overflow-hidden ${getThemedClasses(
            isDark,
            "bg-white border-gray-200",
            "bg-gray-800 border-gray-700/50"
          )}`}
        >
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${getThemedClasses(
              isDark,
              "border-gray-100",
              "border-gray-700/50"
            )}`}
          >
            <div className="flex items-center gap-2">
              <QuestionMarkCircleIcon
                className={`h-5 w-5 ${getThemedClasses(
                  isDark,
                  "text-teal-600",
                  "text-teal-400"
                )}`}
              />
              <h2
                className={`text-base font-semibold ${getThemedClasses(
                  isDark,
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                Generated Quizzes
              </h2>
            </div>
            {loading && (
              <svg
                className={`animate-spin h-4 w-4 ${getThemedClasses(
                  isDark,
                  "text-gray-400",
                  "text-gray-500"
                )}`}
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>

          <div className="p-6 space-y-3">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={handleDeleteQuiz}
                  onViewDetails={(q) => {
                    setSelectedQuiz(q);
                    setShowQuizDetails(true);
                  }}
                  onVerify={(q) => setSelectedQuizForVerification(q)}
                  onViewSubmissions={(id) => setSelectedQuizForSubmissions(id)}
                />
              ))
            ) : (
              <div
                className={`text-center py-10 rounded-xl ${getThemedClasses(
                  isDark,
                  "bg-gray-50",
                  "bg-gray-700/30"
                )}`}
              >
                <QuestionMarkCircleIcon
                  className={`mx-auto h-10 w-10 mb-2 ${getThemedClasses(
                    isDark,
                    "text-gray-300",
                    "text-gray-600"
                  )}`}
                />
                <p
                  className={`font-medium ${getThemedClasses(
                    isDark,
                    "text-gray-600",
                    "text-gray-400"
                  )}`}
                >
                  No quizzes yet
                </p>
                <p
                  className={`text-sm mt-0.5 ${getThemedClasses(
                    isDark,
                    "text-gray-400",
                    "text-gray-500"
                  )}`}
                >
                  Generate a quiz above to get started.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-1.5 pt-2">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadQuizzes(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === p
                      ? "bg-indigo-600 text-white"
                      : getThemedClasses(
                        isDark,
                        "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Details Modal */}
      {showQuizDetails && selectedQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowQuizDetails(false)}
        >
          <div
            className={`max-w-2xl w-full mx-4 p-6 rounded-2xl shadow-2xl ${getThemedClasses(
              isDark,
              "bg-white",
              "bg-gray-800"
            )}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-xl font-bold mb-4 ${getThemedClasses(
                isDark,
                "text-gray-900",
                "text-white"
              )}`}
            >
              {selectedQuiz.name}
            </h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedQuiz.question_json?.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg ${getThemedClasses(
                    isDark,
                    "bg-gray-50",
                    "bg-gray-700"
                  )}`}
                >
                  <p
                    className={`font-semibold text-sm mb-2 ${getThemedClasses(
                      isDark,
                      "text-gray-800",
                      "text-gray-200"
                    )}`}
                  >
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt, oIdx) => (
                      <p
                        key={oIdx}
                        className={`text-xs ${oIdx === q.correct_answer
                          ? getThemedClasses(
                            isDark,
                            "text-green-700 font-semibold",
                            "text-green-400 font-semibold"
                          )
                          : getThemedClasses(
                            isDark,
                            "text-gray-500",
                            "text-gray-400"
                          )
                          }`}
                      >
                        {oIdx === q.correct_answer ? "✓ " : "· "}
                        {opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowQuizDetails(false)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${getThemedClasses(
                  isDark,
                  "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  "bg-gray-700 text-white hover:bg-gray-600"
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

// ─── Shared Generate Button ───────────────────────────────────────────────────
const GenerateButton: React.FC<{
  generating: boolean;
  disabled?: boolean;
}> = ({ generating, disabled = false }) => (
  <button
    type="submit"
    disabled={generating || disabled}
    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition shadow-sm"
  >
    {generating ? (
      <>
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Generating...
      </>
    ) : (
      <>
        <SparklesIcon className="h-4 w-4" />
        Generate with Gemini AI
      </>
    )}
  </button>
);

// ─── QuizCard ────────────────────────────────────────────────────────────────

const QuizCard: React.FC<{
  quiz: Quiz;
  onDelete: (id: string, name: string) => void;
  onViewDetails: (quiz: Quiz) => void;
  onVerify: (quiz: Quiz) => void;
  onViewSubmissions: (id: string) => void;
}> = ({ quiz, onDelete, onViewDetails, onVerify, onViewSubmissions }) => {
  const { isDark } = useTheme();

  const statusPill = (
    status: "draft" | "active" | "inactive" | undefined
  ) => {
    const base = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    if (status === "active")
      return (
        <span
          className={`${base} ${getThemedClasses(
            isDark,
            "bg-green-100 text-green-700",
            "bg-green-900/50 text-green-300"
          )}`}
        >
          Active
        </span>
      );
    if (status === "draft")
      return (
        <span
          className={`${base} ${getThemedClasses(
            isDark,
            "bg-yellow-100 text-yellow-700",
            "bg-yellow-900/50 text-yellow-300"
          )}`}
        >
          Draft
        </span>
      );
    return (
      <span
        className={`${base} ${getThemedClasses(
          isDark,
          "bg-gray-100 text-gray-600",
          "bg-gray-700 text-gray-400"
        )}`}
      >
        Inactive
      </span>
    );
  };

  return (
    <div
      className={`p-5 rounded-xl border transition hover:shadow-md group ${getThemedClasses(
        isDark,
        "bg-white border-gray-200 hover:border-gray-300",
        "bg-gray-800/50 border-gray-700 hover:border-gray-600"
      )}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm truncate group-hover:text-indigo-500 transition-colors ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            {quiz.name}
          </h3>
          <div
            className={`flex items-center gap-1.5 text-xs mt-0.5 ${getThemedClasses(
              isDark,
              "text-gray-400",
              "text-gray-500"
            )}`}
          >
            <ClockIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {new Date(quiz.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">{statusPill(quiz.status)}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          {
            Icon: AcademicCapIcon,
            label: "Course",
            value: quiz.course?.name || "General",
          },
          {
            Icon: QuestionMarkCircleIcon,
            label: "Questions",
            value: String(quiz.question_count || 0),
          },
          {
            Icon: ChartBarIcon,
            label: "Max Score",
            value: String(quiz.max_score),
          },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 min-w-0">
            <div>
              <p
                className={`text-xs ${getThemedClasses(
                  isDark,
                  "text-gray-400",
                  "text-gray-500"
                )}`}
              >
                {label}
              </p>
              <p
                className={`text-sm font-medium truncate ${getThemedClasses(
                  isDark,
                  "text-gray-800",
                  "text-gray-200"
                )}`}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`border-t pt-3 flex items-center justify-between ${getThemedClasses(
          isDark,
          "border-gray-100",
          "border-gray-700/50"
        )}`}
      >
        <div
          className={`flex items-center gap-1 text-xs ${getThemedClasses(
            isDark,
            "text-gray-400",
            "text-gray-500"
          )}`}
        >
          <UserGroupIcon className="h-3.5 w-3.5" />
          <span>Submissions</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onViewDetails(quiz)}
            title="View Details"
            className={`p-1.5 rounded-lg transition ${getThemedClasses(
              isDark,
              "text-blue-500 hover:bg-blue-50",
              "text-blue-400 hover:bg-blue-500/10"
            )}`}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {quiz.status === "draft" && (
            <button
              onClick={() => onVerify(quiz)}
              title="Verify & Activate"
              className={`p-1.5 rounded-lg transition ${getThemedClasses(
                isDark,
                "text-orange-500 hover:bg-orange-50",
                "text-orange-400 hover:bg-orange-500/10"
              )}`}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
          )}
          {quiz.status === "active" && (
            <button
              onClick={() => onViewSubmissions(quiz.id)}
              title="View Submissions"
              className={`p-1.5 rounded-lg transition ${getThemedClasses(
                isDark,
                "text-green-600 hover:bg-green-50",
                "text-green-400 hover:bg-green-500/10"
              )}`}
            >
              <UserGroupIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(quiz.id, quiz.name)}
            title="Delete"
            className={`p-1.5 rounded-lg transition ${getThemedClasses(
              isDark,
              "text-red-500 hover:bg-red-50",
              "text-red-400 hover:bg-red-500/10"
            )}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCQGenerator;
