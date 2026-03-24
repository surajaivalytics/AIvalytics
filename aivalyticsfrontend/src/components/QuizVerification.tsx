import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
 CheckCircleIcon,
 PencilIcon,
 TrashIcon,
 PlayIcon,
 ArrowLeftIcon,
 PlusIcon,
} from "@heroicons/react/24/outline";
import { mcqService, Quiz, MCQQuestion } from "../services/mcqApi";

interface QuizVerificationProps {
 quiz: Quiz;
 onBack: () => void;
 onQuizUpdated: () => void;
}

const QuizVerification: React.FC<QuizVerificationProps> = ({
 quiz,
 onBack,
 onQuizUpdated,
}) => {
 const { isDark } = useTheme();
 const [questions, setQuestions] = useState<MCQQuestion[]>(
 quiz.question_json || []
 );
 const [quizName, setQuizName] = useState(quiz.name);
 const [maxScore, setMaxScore] = useState(quiz.max_score);
 const [editingQuestionIndex, setEditingQuestionIndex] = useState<
 number | null
 >(null);
 const [loading, setLoading] = useState(false);
 const [activating, setActivating] = useState(false);

 const handleAddNewQuestion = () => {
 const newQuestion: MCQQuestion = {
 id: Date.now(), // Unique temporary ID
 question: "",
 options: ["", "", "", ""],
 correct_answer: 0,
 explanation: "",
 difficulty: "medium",
 topic: quiz.course?.name || "General",
 };
 const updatedQuestions = [...questions, newQuestion];
 setQuestions(updatedQuestions);
 setEditingQuestionIndex(updatedQuestions.length - 1);
 toast.success("New question added. Please fill in the details.");
 };

 const handleQuestionEdit = (index: number) => {
 setEditingQuestionIndex(index);
 };

 const handleQuestionDelete = (index: number) => {
 if (window.confirm("Are you sure you want to delete this question?")) {
 const newQuestions = questions.filter((_, i) => i !== index);
 setQuestions(newQuestions);
 toast.success("Question deleted");
 }
 };

 const handleQuestionUpdate = (
 index: number,
 updatedQuestion: MCQQuestion
 ) => {
 const newQuestions = [...questions];
 newQuestions[index] = updatedQuestion;
 setQuestions(newQuestions);
 setEditingQuestionIndex(null);
 toast.success("Question updated");
 };

 const handleSaveChanges = async () => {
 if (questions.length < 5) {
 toast.error("Quiz must have at least 5 questions");
 return;
 }

 try {
 setLoading(true);
 await mcqService.updateQuiz({
 quiz_id: quiz.id,
 name: quizName,
 max_score: maxScore,
 question_json: questions,
 });
 toast.success("Quiz updated successfully");
 onQuizUpdated();
 } catch (error: any) {
 toast.error(error.message || "Failed to update quiz");
 } finally {
 setLoading(false);
 }
 };

 const handleActivateQuiz = async () => {
 if (questions.length < 5) {
 toast.error("Quiz must have at least 5 questions before activation");
 return;
 }

 try {
 setActivating(true);
 await mcqService.activateQuiz(quiz.id);
 toast.success(
 "Quiz activated successfully! Students can now take this quiz."
 );
 onQuizUpdated();
 } catch (error: any) {
 toast.error(error.message || "Failed to activate quiz");
 } finally {
 setActivating(false);
 }
 };

 const QuestionEditor: React.FC<{
 question: MCQQuestion;
 index: number;
 onSave: (question: MCQQuestion) => void;
 onCancel: () => void;
 }> = ({ question, index, onSave, onCancel }) => {
 const [editedQuestion, setEditedQuestion] = useState<MCQQuestion>(question);

 const handleSave = () => {
 if (!editedQuestion.question.trim()) {
 toast.error("Question text is required");
 return;
 }
 if (editedQuestion.options.some((opt) => !opt.trim())) {
 toast.error("All options must have text");
 return;
 }
 onSave(editedQuestion);
 };

 return (
 <div
 className={`p-6 rounded-xl border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-700/30 border-gray-600/50"
 )}`}
 >
 <div className="space-y-4">
 <div>
 <label
 className={`block text-sm font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Question {index + 1}
 </label>
 <textarea
 value={editedQuestion.question}
 onChange={(e) =>
 setEditedQuestion((prev) => ({
 ...prev,
 question: e.target.value,
 }))
 }
 className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all duration-200 resize-none ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 rows={3}
 placeholder="Enter question text..."
 />
 </div>

 <div className="space-y-3">
 <label
 className={`block text-sm font-semibold ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Options
 </label>
 {editedQuestion.options.map((option, optionIndex) => (
 <div key={optionIndex} className="flex items-center gap-3">
 <input
 type="radio"
 name={`correct-${index}`}
 checked={editedQuestion.correct_answer === optionIndex}
 onChange={() =>
 setEditedQuestion((prev) => ({
 ...prev,
 correct_answer: optionIndex,
 }))
 }
 className="text-indigo-600 focus:ring-indigo-500"
 />
 <input
 type="text"
 value={option}
 onChange={(e) => {
 const newOptions = [...editedQuestion.options];
 newOptions[optionIndex] = e.target.value;
 setEditedQuestion((prev) => ({
 ...prev,
 options: newOptions,
 }));
 }}
 className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 placeholder={`Option ${optionIndex + 1}`}
 />
 </div>
 ))}
 </div>

 <div>
 <label
 className={`block text-sm font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Explanation (Optional)
 </label>
 <textarea
 value={editedQuestion.explanation || ""}
 onChange={(e) =>
 setEditedQuestion((prev) => ({
 ...prev,
 explanation: e.target.value,
 }))
 }
 className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all duration-200 resize-none ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 rows={2}
 placeholder="Enter explanation for the correct answer..."
 />
 </div>

 <div className="flex justify-end gap-3 pt-4">
 <button
 onClick={onCancel}
 className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200",
 "text-gray-300 bg-gray-600/50 border-gray-500/50 hover:bg-gray-500/50"
 )}`}
 >
 Cancel
 </button>
 <button
 onClick={handleSave}
 className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
 >
 Save Question
 </button>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div
 className={`min-h-screen transition-colors duration-300 ${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-4">
 <button
 onClick={onBack}
 className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
 "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
 )}`}
 >
 <ArrowLeftIcon className="h-6 w-6" />
 </button>
 <div>
 <h1
 className={`text-3xl font-bold ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Quiz Verification
 </h1>
 <p
 className={`text-lg ${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 Review and edit your generated quiz before activating it
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <span
 className={`px-3 py-1 rounded-full text-sm font-medium ${
 quiz.status === "active"
 ? "bg-green-100 text-green-800"
 : "bg-yellow-100 text-yellow-800"
 }`}
 >
 {quiz.status === "active" ? "Active" : "Draft"}
 </span>
 </div>
 </div>

 {/* Quiz Details */}
 <div
 className={`p-6 rounded-2xl shadow-lg border mb-8 ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-800/50 border-gray-700/50"
 )}`}
 >
 <h2
 className={`text-xl font-bold mb-4 ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Quiz Details
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label
 className={`block text-sm font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Quiz Name
 </label>
 <input
 type="text"
 value={quizName}
 onChange={(e) => setQuizName(e.target.value)}
 className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 />
 </div>

 <div>
 <label
 className={`block text-sm font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Max Score
 </label>
 <input
 type="number"
 value={maxScore}
 onChange={(e) => setMaxScore(parseInt(e.target.value))}
 min="10"
 max="1000"
 className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 />
 </div>

 <div>
 <label
 className={`block text-sm font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-200"
 )}`}
 >
 Total Questions
 </label>
 <div
 className={`px-4 py-3 border rounded-xl ${getThemedClasses(
 isDark,
 "bg-gray-50 border-gray-300 text-gray-900",
 "bg-gray-700/50 border-gray-600/50 text-white"
 )}`}
 >
 {questions.length} questions
 </div>
 </div>
 </div>
 </div>

 {/* Questions List */}
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2
 className={`text-2xl font-bold ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Questions ({questions.length})
 </h2>

 <div className="flex gap-3">
 <button
 onClick={handleAddNewQuestion}
 className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200 flex items-center gap-2"
 >
 <PlusIcon className="h-4 w-4" />
 Add Question
 </button>
 <button
 onClick={handleSaveChanges}
 disabled={loading}
 className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {loading ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 Saving...
 </>
 ) : (
 <>
 <CheckCircleIcon className="h-4 w-4" />
 Save Changes
 </>
 )}
 </button>

 {quiz.status !== "active" && (
 <button
 onClick={handleActivateQuiz}
 disabled={activating || questions.length < 5}
 className="px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {activating ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 Activating...
 </>
 ) : (
 <>
 <PlayIcon className="h-4 w-4" />
 Activate Quiz
 </>
 )}
 </button>
 )}
 </div>
 </div>

 {questions.length === 0 ? (
 <div
 className={`text-center py-12 ${getThemedClasses(
 isDark,
 "text-gray-500",
 "text-gray-400"
 )}`}
 >
 No questions available
 </div>
 ) : (
 <div className="space-y-4">
 {questions.map((question, index) => (
 <div key={index}>
 {editingQuestionIndex === index ? (
 <QuestionEditor
 question={question}
 index={index}
 onSave={(updatedQuestion) =>
 handleQuestionUpdate(index, updatedQuestion)
 }
 onCancel={() => {
 setEditingQuestionIndex(null);
 }}
 />
 ) : (
 <div
 className={`p-6 rounded-xl border ${getThemedClasses(
 isDark,
 "bg-white border-gray-200",
 "bg-gray-700/30 border-gray-600/50"
 )}`}
 >
 <div className="flex items-start justify-between mb-4">
 <h3
 className={`font-semibold text-lg ${getThemedClasses(
 isDark,
 "text-gray-900",
 "text-white"
 )}`}
 >
 Question {index + 1}
 </h3>
 <div className="flex gap-2">
 <button
 onClick={() => handleQuestionEdit(index)}
 className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-blue-600 hover:bg-gray-50",
 "text-blue-400 hover:"
 )}`}
 >
 <PencilIcon className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleQuestionDelete(index)}
 className={`p-2 rounded-lg transition-colors duration-200 ${getThemedClasses(
 isDark,
 "text-red-600 hover:bg-gray-50",
 "text-red-400 hover:"
 )}`}
 >
 <TrashIcon className="h-4 w-4" />
 </button>
 </div>
 </div>

 <p
 className={`mb-4 ${getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}`}
 >
 {question.question}
 </p>

 <div className="space-y-2 mb-4">
 {question.options.map((option, optionIndex) => (
 <div
 key={optionIndex}
 className={`flex items-center gap-3 p-3 rounded-lg ${
 question.correct_answer === optionIndex
 ? getThemedClasses(
 isDark,
 "bg-gray-50 border border-green-200",
 " border border-green-500/20"
 )
 : getThemedClasses(
 isDark,
 "bg-gray-50 border border-gray-200",
 "bg-gray-600/50 border border-gray-500/50"
 )
 }`}
 >
 <div
 className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
 question.correct_answer === optionIndex
 ? "bg-green-500 text-white"
 : getThemedClasses(
 isDark,
 "bg-gray-300 text-gray-600",
 "bg-gray-500 text-gray-300"
 )
 }`}
 >
 {String.fromCharCode(65 + optionIndex)}
 </div>
 <span
 className={getThemedClasses(
 isDark,
 "text-gray-700",
 "text-gray-300"
 )}
 >
 {option}
 </span>
 {question.correct_answer === optionIndex && (
 <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
 )}
 </div>
 ))}
 </div>

 {question.explanation && (
 <div
 className={`p-4 rounded-lg ${getThemedClasses(
 isDark,
 "bg-gray-50 border border-blue-200",
 " border border-blue-500/20"
 )}`}
 >
 <h4
 className={`font-semibold mb-2 ${getThemedClasses(
 isDark,
 "text-blue-800",
 "text-blue-300"
 )}`}
 >
 Explanation:
 </h4>
 <p
 className={getThemedClasses(
 isDark,
 "text-blue-700",
 "text-blue-200"
 )}
 >
 {question.explanation}
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default QuizVerification;
