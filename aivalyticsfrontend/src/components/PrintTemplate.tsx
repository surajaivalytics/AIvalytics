import React from "react";
import { StudentPerformanceReport } from "../services/reportApi";

interface PrintTemplateProps {
 report: StudentPerformanceReport;
}

const PrintTemplate: React.FC<PrintTemplateProps> = ({ report }) => {
 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
 };

 const getScoreColor = (score: number) => {
 if (score >= 90) return "#059669";
 if (score >= 80) return "#2563eb";
 if (score >= 70) return "#d97706";
 if (score >= 60) return "#ea580c";
 return "#dc2626";
 };

 const getGradeFromScore = (score: number) => {
 if (score >= 90) return "A+";
 if (score >= 80) return "A";
 if (score >= 70) return "B";
 if (score >= 60) return "C";
 return "D";
 };

 const getPerformanceIcon = (score: number) => {
 if (score >= 90) return "🏆";
 if (score >= 80) return "⭐";
 if (score >= 70) return "👍";
 if (score >= 60) return "📈";
 return "💪";
 };

 return (
 <div
 id="print-template"
 style={{
 fontFamily: "'Arial', sans-serif",
 fontSize: "14px",
 lineHeight: "1.4",
 color: "#000",
 backgroundColor: "#fff",
 margin: "0",
 padding: "15mm",
 width: "210mm",
 minHeight: "297mm",
 boxSizing: "border-box",
 }}
 >
 {/* HEADER - Larger and More Prominent */}
 <div
 style={{
 textAlign: "center",
 marginBottom: "20px",
 background: "#3B82F6",
 color: "white",
 padding: "20px",
 borderRadius: "8px",
 boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
 }}
 >
 <h1
 style={{
 fontSize: "28px",
 fontWeight: "bold",
 margin: "0 0 8px 0",
 letterSpacing: "2px",
 textTransform: "uppercase",
 }}
 >
 📊 ACADEMIC PERFORMANCE REPORT
 </h1>
 <p style={{ fontSize: "16px", margin: "0", opacity: "0.9" }}>
 AI-Powered Analysis & Comprehensive Insights
 </p>
 </div>

 {/* TOP SECTION - Larger Cards */}
 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr 1fr",
 gap: "15px",
 marginBottom: "25px",
 }}
 >
 {/* Student Info */}
 <div
 style={{
 backgroundColor: "#f8fafc",
 padding: "15px",
 border: "2px solid #e2e8f0",
 borderRadius: "8px",
 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
 }}
 >
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#1e40af",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #3b82f6",
 paddingBottom: "5px",
 }}
 >
 👤 STUDENT INFORMATION
 </h3>
 <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
 <div style={{ marginBottom: "5px" }}>
 <strong>Name:</strong> {report.student.username}
 </div>
 <div style={{ marginBottom: "5px" }}>
 <strong>Roll No:</strong> {report.student.rollNumber}
 </div>
 <div>
 <strong>Email:</strong> {report.student.email}
 </div>
 </div>
 </div>

 {/* Report Details */}
 <div
 style={{
 backgroundColor: "#f8fafc",
 padding: "15px",
 border: "2px solid #e2e8f0",
 borderRadius: "8px",
 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
 }}
 >
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#1e40af",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #3b82f6",
 paddingBottom: "5px",
 }}
 >
 📋 REPORT DETAILS
 </h3>
 <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
 <div style={{ marginBottom: "5px" }}>
 <strong>Generated:</strong> {formatDate(report.generatedAt)}
 </div>
 <div style={{ marginBottom: "5px" }}>
 <strong>Academic Year:</strong> {new Date().getFullYear()}
 </div>
 <div>
 <strong>Enrolled Courses:</strong> {report.enrolledCourses}
 </div>
 </div>
 </div>

 {/* Performance Summary */}
 <div
 style={{
 backgroundColor: "#f0f9ff",
 padding: "15px",
 border: "2px solid #3b82f6",
 borderRadius: "8px",
 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
 }}
 >
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#1e40af",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #3b82f6",
 paddingBottom: "5px",
 }}
 >
 📊 PERFORMANCE SUMMARY
 </h3>
 <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
 <div style={{ marginBottom: "5px" }}>
 <strong>Total Quizzes:</strong> {report.totalQuizzesTaken}
 </div>
 <div style={{ marginBottom: "5px" }}>
 <strong>Average Score:</strong>{" "}
 <span
 style={{
 color: getScoreColor(
 report.performance.overallStats.averageScore
 ),
 fontWeight: "bold",
 }}
 >
 {report.performance.overallStats.averageScore.toFixed(1)}%
 </span>
 </div>
 <div>
 <strong>Highest Score:</strong>{" "}
 <span
 style={{
 color: getScoreColor(
 report.performance.overallStats.highestScore
 ),
 fontWeight: "bold",
 }}
 >
 {report.performance.overallStats.highestScore.toFixed(1)}%
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* MAIN CONTENT SECTION */}
 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1.3fr 0.7fr",
 gap: "20px",
 marginBottom: "25px",
 }}
 >
 {/* LEFT COLUMN - Subject Performance */}
 <div>
 {/* Subject Performance Table */}
 {report.performance.subjectPerformance.length > 0 && (
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "18px",
 fontWeight: "bold",
 color: "#1e40af",
 margin: "0 0 12px 0",
 borderBottom: "3px solid #3b82f6",
 paddingBottom: "8px",
 }}
 >
 📚 SUBJECT-WISE PERFORMANCE
 </h3>
 <table
 style={{
 width: "100%",
 borderCollapse: "collapse",
 fontSize: "11px",
 border: "2px solid #e2e8f0",
 borderRadius: "8px",
 overflow: "hidden",
 }}
 >
 <thead>
 <tr style={{ backgroundColor: "#1e40af", color: "white" }}>
 <th
 style={{
 padding: "12px 8px",
 textAlign: "left",
 fontWeight: "bold",
 fontSize: "12px",
 }}
 >
 Subject Name
 </th>
 <th
 style={{
 padding: "12px 8px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "12px",
 }}
 >
 Quizzes
 </th>
 <th
 style={{
 padding: "12px 8px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "12px",
 }}
 >
 Average %
 </th>
 <th
 style={{
 padding: "12px 8px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "12px",
 }}
 >
 Best %
 </th>
 <th
 style={{
 padding: "12px 8px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "12px",
 }}
 >
 Grade
 </th>
 </tr>
 </thead>
 <tbody>
 {report.performance.subjectPerformance.map(
 (subject: any, index: number) => (
 <tr
 key={index}
 style={{
 backgroundColor:
 index % 2 === 0 ? "#f8fafc" : "white",
 borderBottom: "1px solid #e2e8f0",
 }}
 >
 <td
 style={{
 padding: "10px 8px",
 fontWeight: "600",
 fontSize: "11px",
 }}
 >
 {subject.courseName}
 </td>
 <td
 style={{
 padding: "10px 8px",
 textAlign: "center",
 fontSize: "11px",
 }}
 >
 {subject.quizzesTaken}
 </td>
 <td
 style={{
 padding: "10px 8px",
 textAlign: "center",
 fontWeight: "bold",
 color: getScoreColor(subject.averageScore),
 fontSize: "12px",
 }}
 >
 {subject.averageScore.toFixed(1)}%
 </td>
 <td
 style={{
 padding: "10px 8px",
 textAlign: "center",
 fontWeight: "bold",
 color: getScoreColor(subject.highestScore),
 fontSize: "12px",
 }}
 >
 {subject.highestScore.toFixed(1)}%
 </td>
 <td
 style={{
 padding: "10px 8px",
 textAlign: "center",
 fontWeight: "bold",
 color: getScoreColor(subject.averageScore),
 fontSize: "12px",
 }}
 >
 {getGradeFromScore(subject.averageScore)}
 </td>
 </tr>
 )
 )}
 </tbody>
 </table>
 </div>
 )}

 {/* Recent Quiz Performance */}
 {report.performance.recentPerformance.length > 0 && (
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "18px",
 fontWeight: "bold",
 color: "#1e40af",
 margin: "0 0 12px 0",
 borderBottom: "3px solid #3b82f6",
 paddingBottom: "8px",
 }}
 >
 📈 RECENT QUIZ PERFORMANCE
 </h3>
 <table
 style={{
 width: "100%",
 borderCollapse: "collapse",
 fontSize: "10px",
 border: "2px solid #e2e8f0",
 borderRadius: "8px",
 overflow: "hidden",
 }}
 >
 <thead>
 <tr style={{ backgroundColor: "#1e40af", color: "white" }}>
 <th
 style={{
 padding: "10px 6px",
 textAlign: "left",
 fontWeight: "bold",
 fontSize: "11px",
 }}
 >
 Quiz Name
 </th>
 <th
 style={{
 padding: "10px 6px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "11px",
 }}
 >
 Score
 </th>
 <th
 style={{
 padding: "10px 6px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "11px",
 }}
 >
 Percentage
 </th>
 <th
 style={{
 padding: "10px 6px",
 textAlign: "center",
 fontWeight: "bold",
 fontSize: "11px",
 }}
 >
 Date
 </th>
 </tr>
 </thead>
 <tbody>
 {report.performance.recentPerformance
 .slice(0, 8)
 .map((quiz: any, index: number) => (
 <tr
 key={index}
 style={{
 backgroundColor:
 index % 2 === 0 ? "#f8fafc" : "white",
 borderBottom: "1px solid #e2e8f0",
 }}
 >
 <td
 style={{
 padding: "8px 6px",
 fontSize: "10px",
 maxWidth: "120px",
 overflow: "hidden",
 textOverflow: "ellipsis",
 whiteSpace: "nowrap",
 }}
 >
 {quiz.quizName}
 </td>
 <td
 style={{
 padding: "8px 6px",
 textAlign: "center",
 fontSize: "10px",
 }}
 >
 {quiz.score}/{quiz.maxScore}
 </td>
 <td
 style={{
 padding: "8px 6px",
 textAlign: "center",
 fontWeight: "bold",
 color: getScoreColor(quiz.percentage),
 fontSize: "11px",
 }}
 >
 {quiz.percentage.toFixed(1)}%
 </td>
 <td
 style={{
 padding: "8px 6px",
 textAlign: "center",
 fontSize: "10px",
 }}
 >
 {new Date(quiz.date).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 })}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* RIGHT COLUMN - Strengths, Weaknesses, AI Assessment */}
 <div>
 {/* AI Assessment */}
 {report.aiSuggestions && (
 <div
 style={{
 backgroundColor: "#faf5ff",
 padding: "15px",
 border: "2px solid #e9d5ff",
 borderRadius: "8px",
 marginBottom: "15px",
 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
 }}
 >
 <h3
 style={{
 fontSize: "14px",
 fontWeight: "bold",
 color: "#7c3aed",
 margin: "0 0 8px 0",
 }}
 >
 🤖 AI ASSESSMENT
 </h3>
 <p
 style={{
 fontSize: "11px",
 color: "#6b46c1",
 lineHeight: "1.4",
 margin: "0",
 }}
 >
 {report.aiSuggestions.overallAssessment}
 </p>
 </div>
 )}

 {/* Strengths */}
 <div style={{ marginBottom: "15px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#059669",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #10b981",
 paddingBottom: "5px",
 }}
 >
 💪 KEY STRENGTHS
 </h3>
 {report.performance.strengths &&
 report.performance.strengths.length > 0 ? (
 <div
 style={{ display: "flex", flexDirection: "column", gap: "8px" }}
 >
 {report.performance.strengths
 .slice(0, 3)
 .map((strength: any, index: number) => (
 <div
 key={index}
 style={{
 padding: "10px",
 border: "2px solid #10b981",
 borderRadius: "6px",
 backgroundColor: "#ecfdf5",
 fontSize: "10px",
 }}
 >
 <div
 style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: "4px",
 }}
 >
 <span
 style={{
 fontWeight: "bold",
 color: "#065f46",
 fontSize: "11px",
 }}
 >
 ✨ {strength.area}
 </span>
 <span
 style={{
 backgroundColor: "#059669",
 color: "white",
 padding: "2px 6px",
 borderRadius: "8px",
 fontSize: "9px",
 fontWeight: "bold",
 }}
 >
 {typeof strength.score === "number" &&
 strength.score <= 100
 ? `${strength.score.toFixed(1)}%`
 : strength.score}
 </span>
 </div>
 <div
 style={{
 fontSize: "9px",
 color: "#047857",
 lineHeight: "1.3",
 }}
 >
 {strength.reason}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div
 style={{
 padding: "12px",
 textAlign: "center",
 color: "#6b7280",
 fontStyle: "italic",
 border: "2px dashed #d1d5db",
 borderRadius: "6px",
 backgroundColor: "#f9fafb",
 fontSize: "11px",
 }}
 >
 🌱 Keep working to discover your strengths!
 </div>
 )}
 </div>

 {/* Weaknesses */}
 <div style={{ marginBottom: "15px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#dc2626",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #ef4444",
 paddingBottom: "5px",
 }}
 >
 🎯 GROWTH AREAS
 </h3>
 {report.performance.weaknesses &&
 report.performance.weaknesses.length > 0 ? (
 <div
 style={{ display: "flex", flexDirection: "column", gap: "8px" }}
 >
 {report.performance.weaknesses
 .slice(0, 3)
 .map((weakness: any, index: number) => (
 <div
 key={index}
 style={{
 padding: "10px",
 border: "2px solid #ef4444",
 borderRadius: "6px",
 backgroundColor: "#fef2f2",
 fontSize: "10px",
 }}
 >
 <div
 style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: "4px",
 }}
 >
 <span
 style={{
 fontWeight: "bold",
 color: "#991b1b",
 fontSize: "11px",
 }}
 >
 📈 {weakness.area}
 </span>
 <span
 style={{
 backgroundColor: "#dc2626",
 color: "white",
 padding: "2px 6px",
 borderRadius: "8px",
 fontSize: "9px",
 fontWeight: "bold",
 }}
 >
 {weakness.score.toFixed(1)}%
 </span>
 </div>
 <div
 style={{
 fontSize: "9px",
 color: "#b91c1c",
 lineHeight: "1.3",
 }}
 >
 {weakness.reason}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div
 style={{
 padding: "12px",
 textAlign: "center",
 color: "#6b7280",
 fontStyle: "italic",
 border: "2px dashed #d1d5db",
 borderRadius: "6px",
 backgroundColor: "#f9fafb",
 fontSize: "11px",
 }}
 >
 🎉 No significant weaknesses identified!
 </div>
 )}
 </div>

 {/* Performance Trend */}
 <div
 style={{
 textAlign: "center",
 padding: "12px",
 backgroundColor:
 report.performance.performanceTrend === "improving"
 ? "#ecfdf5"
 : report.performance.performanceTrend === "declining"
 ? "#fef2f2"
 : "#f8fafc",
 border: `2px solid ${
 report.performance.performanceTrend === "improving"
 ? "#10b981"
 : report.performance.performanceTrend === "declining"
 ? "#ef4444"
 : "#64748b"
 }`,
 borderRadius: "8px",
 marginBottom: "15px",
 }}
 >
 <h4
 style={{
 fontSize: "13px",
 fontWeight: "bold",
 color:
 report.performance.performanceTrend === "improving"
 ? "#065f46"
 : report.performance.performanceTrend === "declining"
 ? "#991b1b"
 : "#374151",
 margin: "0 0 4px 0",
 }}
 >
 📈 PERFORMANCE TREND:{" "}
 {report.performance.performanceTrend === "improving"
 ? "IMPROVING"
 : report.performance.performanceTrend === "declining"
 ? "NEEDS ATTENTION"
 : "STABLE"}
 </h4>
 <p
 style={{
 fontSize: "10px",
 color:
 report.performance.performanceTrend === "improving"
 ? "#047857"
 : report.performance.performanceTrend === "declining"
 ? "#b91c1c"
 : "#4b5563",
 margin: "0",
 lineHeight: "1.3",
 }}
 >
 {report.performance.performanceTrend === "improving"
 ? "Excellent progress! Keep up the great work."
 : report.performance.performanceTrend === "declining"
 ? "Focus needed. Review your study strategies."
 : "Consistent performance. Maintain current approach."}
 </p>
 </div>
 </div>
 </div>

 {/* BOTTOM SECTION - AI Recommendations */}
 {report.aiSuggestions && (
 <div
 style={{
 marginBottom: "20px",
 pageBreakBefore: "always",
 paddingTop: "20px",
 }}
 >
 <h3
 style={{
 fontSize: "20px",
 fontWeight: "bold",
 color: "#7c3aed",
 margin: "0 0 15px 0",
 borderBottom: "3px solid #a855f7",
 paddingBottom: "8px",
 textAlign: "center",
 }}
 >
 🤖 AI-POWERED RECOMMENDATIONS
 </h3>

 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr 1fr",
 gap: "15px",
 }}
 >
 {/* Study Recommendations */}
 {report.aiSuggestions.studyRecommendations &&
 report.aiSuggestions.studyRecommendations.length > 0 && (
 <div>
 <h4
 style={{
 fontSize: "14px",
 fontWeight: "bold",
 color: "#6366f1",
 margin: "0 0 8px 0",
 textAlign: "center",
 }}
 >
 📚 STUDY STRATEGIES
 </h4>
 <div
 style={{
 display: "flex",
 flexDirection: "column",
 gap: "6px",
 }}
 >
 {report.aiSuggestions.studyRecommendations
 .slice(0, 3)
 .map((rec: any, index: number) => (
 <div
 key={index}
 style={{
 padding: "8px",
 border: "2px solid #c7d2fe",
 borderRadius: "6px",
 backgroundColor: "#f1f5f9",
 fontSize: "9px",
 }}
 >
 <div
 style={{
 fontWeight: "bold",
 color: "#4338ca",
 marginBottom: "3px",
 fontSize: "10px",
 }}
 >
 💡 {rec.recommendation}
 </div>
 <div
 style={{
 color: "#64748b",
 fontSize: "8px",
 lineHeight: "1.3",
 }}
 >
 {rec.reason}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Action Plan */}
 {report.aiSuggestions.nextSteps &&
 report.aiSuggestions.nextSteps.length > 0 && (
 <div>
 <h4
 style={{
 fontSize: "14px",
 fontWeight: "bold",
 color: "#059669",
 margin: "0 0 8px 0",
 textAlign: "center",
 }}
 >
 🎯 ACTION PLAN
 </h4>
 <div
 style={{
 display: "flex",
 flexDirection: "column",
 gap: "6px",
 }}
 >
 {report.aiSuggestions.nextSteps
 .slice(0, 4)
 .map((step: string, index: number) => (
 <div
 key={index}
 style={{
 padding: "8px",
 border: "2px solid #a7f3d0",
 borderRadius: "6px",
 backgroundColor: "#ecfdf5",
 fontSize: "9px",
 color: "#065f46",
 display: "flex",
 alignItems: "flex-start",
 gap: "4px",
 }}
 >
 <span
 style={{
 fontWeight: "bold",
 color: "#059669",
 fontSize: "10px",
 }}
 >
 {index + 1}.
 </span>
 <span style={{ fontSize: "9px", lineHeight: "1.3" }}>
 {step}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Motivational Message */}
 {report.aiSuggestions.motivationalMessage && (
 <div>
 <h4
 style={{
 fontSize: "14px",
 fontWeight: "bold",
 color: "#d97706",
 margin: "0 0 8px 0",
 textAlign: "center",
 }}
 >
 💌 MESSAGE FOR YOU
 </h4>
 <div
 style={{
 padding: "12px",
 border: "2px solid #f59e0b",
 borderRadius: "6px",
 backgroundColor: "#fffbeb",
 textAlign: "center",
 minHeight: "80px",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 }}
 >
 <p
 style={{
 fontSize: "10px",
 color: "#92400e",
 lineHeight: "1.4",
 margin: "0",
 fontStyle: "italic",
 fontWeight: "500",
 }}
 >
 {report.aiSuggestions.motivationalMessage}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* FOOTER */}
 <div
 style={{
 marginTop: "auto",
 paddingTop: "15px",
 borderTop: "2px solid #e2e8f0",
 textAlign: "center",
 color: "#64748b",
 fontSize: "11px",
 }}
 >
 <p style={{ margin: "0", fontWeight: "500" }}>
 📊 Generated by Academic Performance Analysis System • 🤖 AI-Powered
 Insights • 📅 {formatDate(report.generatedAt)} • ✨ Keep Learning,
 Keep Growing!
 </p>
 </div>
 </div>
 );
};

export default PrintTemplate;
