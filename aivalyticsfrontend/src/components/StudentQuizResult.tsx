import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import {
 CheckCircleIcon,
 XCircleIcon,
 ArrowLeftIcon,
 SpeakerWaveIcon,
 SpeakerXMarkIcon,
 SparklesIcon,
} from "@heroicons/react/24/outline";
import {
 StudentQuizResult as StudentQuizResultType,
 getDetailedExplanation,
} from "../services/mcqApi";
import LoadingSpinner from "./LoadingSpinner";

interface StudentQuizResultProps {
 result: StudentQuizResultType;
 onBack: () => void;
}

const StudentQuizResult: React.FC<StudentQuizResultProps> = ({
 result,
 onBack,
}) => {
 const { isDark } = useTheme();
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [speakingQuestionId, setSpeakingQuestionId] = useState<number | null>(
 null
 );
 const [detailedExplanations, setDetailedExplanations] = useState<{
 [key: number]: string;
 }>({});
 const [isLoadingExplanation, setIsLoadingExplanation] = useState<
 number | null
 >(null);

 useEffect(() => {
 return () => {
 if (window.speechSynthesis.speaking) {
 window.speechSynthesis.cancel();
 }
 };
 }, []);

 const handleGenerateDetailedExplanation = async (
 questionId: number,
 explanation: string
 ) => {
 if (detailedExplanations[questionId]) return;

 setIsLoadingExplanation(questionId);
 try {
 const data = await getDetailedExplanation(explanation);
 setDetailedExplanations((prev) => ({
 ...prev,
 [questionId]: data.explanation,
 }));
 } catch (error) {
 console.error("Failed to get detailed explanation:", error);
 setDetailedExplanations((prev) => ({
 ...prev,
 [questionId]:
 "Sorry, we couldn't generate a more detailed explanation at this time.",
 }));
 } finally {
 setIsLoadingExplanation(null);
 }
 };

 const handleToggleSpeech = (questionId: number, text: string) => {
 if (isSpeaking && speakingQuestionId === questionId) {
 window.speechSynthesis.cancel();
 setIsSpeaking(false);
 setSpeakingQuestionId(null);
 } else {
 if (window.speechSynthesis.speaking) {
 window.speechSynthesis.cancel();
 }
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.onend = () => {
 setIsSpeaking(false);
 setSpeakingQuestionId(null);
 };
 window.speechSynthesis.speak(utterance);
 setIsSpeaking(true);
 setSpeakingQuestionId(questionId);
 }
 };

 const getOptionStyle = (questionId: number, optionIndex: number) => {
 const userAnswer = result.response.answers.find(
 (ans) => ans.question_id === questionId
 );
 const isCorrectAnswer =
 result.quiz.question_json.find((q) => q.id === questionId)
 ?.correct_answer === optionIndex;

 if (isCorrectAnswer) {
 return "bg-green-100 dark: border-green-500 text-green-800 dark:text-green-200";
 }
 if (
 userAnswer?.selected_answer === optionIndex &&
 !userAnswer?.is_correct
 ) {
 return "bg-red-100 dark: border-red-500 text-red-800 dark:text-red-200";
 }
 return "bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200";
 };

 return (
 <div
 className={`min-h-screen p-4 sm:p-6 lg:p-8 ${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 <div className="max-w-4xl mx-auto">
 <button
 onClick={onBack}
 className="mb-6 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
 >
 <ArrowLeftIcon className="h-5 w-5 mr-2" />
 Back to Past Quizzes
 </button>

 <header className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-8 text-center">
 <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
 {result.quiz.name}
 </h1>
 <p className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">
 Final Score:{" "}
 <span
 className={
 result.score > result.max_score / 2
 ? "text-green-500"
 : "text-red-500"
 }
 >
 {result.score}
 </span>{" "}
 / {result.max_score}
 </p>
 <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
 Questions Answered: {result.response.answers.length} / {result.quiz.question_json.length}
 </p>
 </header>

 <div className="space-y-8">
 {result.quiz.question_json
 .filter((question) => {
 // Only show questions that the student actually answered
 const userAnswer = result.response.answers.find(
 (ans) => ans.question_id === question.id
 );
 return userAnswer && userAnswer.selected_answer !== null;
 })
 .map((question, index) => {
 const userAnswer = result.response.answers.find(
 (ans) => ans.question_id === question.id
 );
 const isAnswered =
 userAnswer && userAnswer.selected_answer !== null;

 return (
 <div
 key={question.id}
 className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-shadow duration-300 hover:shadow-xl"
 >
 <div className="flex justify-between items-start mb-4">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex-1">
 <span className="text-gray-500 dark:text-gray-400">
 Question {index + 1}:
 </span>{" "}
 {question.question}
 </h2>
 {userAnswer?.is_correct ? (
 <div className="flex-shrink-0 ml-4 p-2 bg-green-100 dark: rounded-full">
 <CheckCircleIcon className="h-8 w-8 text-green-500" />
 </div>
 ) : (
 <div className="flex-shrink-0 ml-4 p-2 bg-red-100 dark: rounded-full">
 <XCircleIcon className="h-8 w-8 text-red-500" />
 </div>
 )}
 </div>

 <div className="space-y-3 mb-6">
 {question.options.map((option, optionIndex) => (
 <div
 key={optionIndex}
 className={`p-4 rounded-lg border-2 flex items-center transition-all duration-200 ${getOptionStyle(
 question.id,
 optionIndex
 )}`}
 >
 <p className="font-medium flex-1">{option}</p>
 {userAnswer?.selected_answer === optionIndex &&
 !userAnswer?.is_correct && (
 <XCircleIcon className="h-6 w-6 text-red-500 ml-3" />
 )}
 {question.correct_answer === optionIndex && (
 <CheckCircleIcon className="h-6 w-6 text-green-500 ml-3" />
 )}
 </div>
 ))}
 </div>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
 <p className="font-semibold text-gray-800 dark:text-gray-200">
 Your Answer
 </p>
 <p className="text-gray-600 dark:text-gray-300 mt-1">
 {isAnswered
 ? question.options[userAnswer.selected_answer!]
 : "Not answered"}
 </p>
 </div>
 <div className="bg-gray-50 dark: p-3 rounded-lg">
 <p className="font-semibold text-green-800 dark:text-green-200">
 Correct Answer
 </p>
 <p className="text-green-700 dark:text-green-300 mt-1">
 {question.options[question.correct_answer]}
 </p>
 </div>
 </div>

 {question.explanation && (
 <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border-l-4 border-blue-500">
 <div className="flex justify-between items-center">
 <h3 className="font-semibold text-blue-800 dark:text-blue-200">
 Explanation
 </h3>
 <div className="flex items-center space-x-2">
 <button
 onClick={() =>
 handleGenerateDetailedExplanation(
 question.id,
 question.explanation || ""
 )
 }
 className="flex items-center px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark: rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
 disabled={
 !!detailedExplanations[question.id] ||
 isLoadingExplanation === question.id
 }
 >
 {isLoadingExplanation === question.id ? (
 <LoadingSpinner className="h-4 w-4 mr-1" />
 ) : (
 <SparklesIcon className="h-4 w-4 mr-1" />
 )}
 Detailed Explanation
 </button>
 <button
 onClick={() =>
 handleToggleSpeech(
 question.id,
 detailedExplanations[question.id] ||
 question.explanation ||
 ""
 )
 }
 className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors"
 aria-label={
 isSpeaking && speakingQuestionId === question.id
 ? "Stop reading"
 : "Read explanation"
 }
 >
 {isSpeaking &&
 speakingQuestionId === question.id ? (
 <SpeakerXMarkIcon className="h-6 w-6" />
 ) : (
 <SpeakerWaveIcon className="h-6 w-6" />
 )}
 </button>
 </div>
 </div>
 <p className="text-blue-700 dark:text-blue-300 mt-2">
 {question.explanation}
 </p>
 {isLoadingExplanation === question.id && (
 <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
 Generating a more detailed explanation...
 </div>
 )}
 {detailedExplanations[question.id] && (
 <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
 <h4 className="font-semibold text-blue-800 dark:text-blue-200">
 In-depth Explanation
 </h4>
 <p className="text-blue-700 dark:text-blue-300 mt-1 whitespace-pre-wrap">
 {detailedExplanations[question.id]}
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
};

export default StudentQuizResult;
