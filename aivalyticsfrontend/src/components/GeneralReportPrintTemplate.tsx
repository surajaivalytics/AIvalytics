import React from "react";
import { Report } from "../services/reportApi";

interface GeneralReportPrintTemplateProps {
 report: Report;
}

const GeneralReportPrintTemplate: React.FC<GeneralReportPrintTemplateProps> = ({
 report,
}) => {
 console.log("GeneralReportPrintTemplate rendered with report:", report);

 // Validate report data
 if (!report) {
 console.error("No report provided to GeneralReportPrintTemplate");
 return <div>Error: No report data</div>;
 }

 if (!report.report_data) {
 console.warn("Report has no report_data:", report);
 }
 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const getReportTypeIcon = (type: string) => {
 switch (type) {
 case "performance":
 return "📊";
 case "attendance":
 return "📅";
 case "comprehensive":
 return "📋";
 case "custom":
 return "⚙️";
 default:
 return "📄";
 }
 };

 const getReportTypeColor = (type: string) => {
 switch (type) {
 case "performance":
 return "#1e40af";
 case "attendance":
 return "#059669";
 case "comprehensive":
 return "#7c3aed";
 case "custom":
 return "#d97706";
 default:
 return "#64748b";
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case "completed":
 return "#059669";
 case "failed":
 return "#dc2626";
 case "processing":
 return "#2563eb";
 default:
 return "#d97706";
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "completed":
 return "✅";
 case "failed":
 return "❌";
 case "processing":
 return "⏳";
 default:
 return "⏸️";
 }
 };

 const renderReportContent = () => {
 if (!report.report_data) {
 return (
 <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
 <p>No detailed report data available</p>
 <p>Report ID: {report.id}</p>
 <p>Report Name: {report.name}</p>
 <p>Report Type: {report.report_type}</p>
 <p>Status: {report.status}</p>
 </div>
 );
 }

 // Handle different report types
 switch (report.report_type) {
 case "performance":
 return renderPerformanceContent();
 case "attendance":
 return renderAttendanceContent();
 case "comprehensive":
 return renderComprehensiveContent();
 default:
 return renderGenericContent();
 }
 };

 const renderPerformanceContent = () => {
 const data = report.report_data;
 return (
 <div>
 {data.overallStats && (
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#1e40af",
 marginBottom: "10px",
 }}
 >
 📊 Performance Overview
 </h3>
 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr",
 gap: "10px",
 }}
 >
 <div
 style={{
 padding: "10px",
 backgroundColor: "#f0f9ff",
 borderRadius: "6px",
 border: "1px solid #3b82f6",
 }}
 >
 <strong>Total Quizzes:</strong>{" "}
 {data.overallStats?.totalQuizzes || 0}
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#f0f9ff",
 borderRadius: "6px",
 border: "1px solid #3b82f6",
 }}
 >
 <strong>Average Score:</strong>{" "}
 {data.overallStats?.averageScore?.toFixed(1) || 0}%
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#f0f9ff",
 borderRadius: "6px",
 border: "1px solid #3b82f6",
 }}
 >
 <strong>Highest Score:</strong>{" "}
 {data.overallStats?.highestScore?.toFixed(1) || 0}%
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#f0f9ff",
 borderRadius: "6px",
 border: "1px solid #3b82f6",
 }}
 >
 <strong>Pass Rate:</strong>{" "}
 {data.overallStats?.passRate?.toFixed(1) || 0}%
 </div>
 </div>
 </div>
 )}

 {data.subjectPerformance && data.subjectPerformance.length > 0 && (
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#1e40af",
 marginBottom: "10px",
 }}
 >
 📚 Subject Performance
 </h3>
 <table
 style={{
 width: "100%",
 borderCollapse: "collapse",
 fontSize: "11px",
 }}
 >
 <thead>
 <tr style={{ backgroundColor: "#1e40af", color: "white" }}>
 <th
 style={{
 padding: "8px",
 textAlign: "left",
 border: "1px solid #e2e8f0",
 }}
 >
 Subject
 </th>
 <th
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 Quizzes
 </th>
 <th
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 Average
 </th>
 <th
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 Best
 </th>
 </tr>
 </thead>
 <tbody>
 {data.subjectPerformance.map((subject: any, index: number) => (
 <tr
 key={index}
 style={{
 backgroundColor: index % 2 === 0 ? "#f8fafc" : "white",
 }}
 >
 <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
 {subject.courseName}
 </td>
 <td
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 {subject.quizzesTaken}
 </td>
 <td
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 {subject.averageScore?.toFixed(1)}%
 </td>
 <td
 style={{
 padding: "8px",
 textAlign: "center",
 border: "1px solid #e2e8f0",
 }}
 >
 {subject.highestScore?.toFixed(1)}%
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
 };

 const renderAttendanceContent = () => {
 const data = report.report_data;
 return (
 <div>
 {data.attendanceStats && (
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#059669",
 marginBottom: "10px",
 }}
 >
 📅 Attendance Overview
 </h3>
 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr",
 gap: "10px",
 }}
 >
 <div
 style={{
 padding: "10px",
 backgroundColor: "#ecfdf5",
 borderRadius: "6px",
 border: "1px solid #10b981",
 }}
 >
 <strong>Total Classes:</strong>{" "}
 {data.attendanceStats?.totalClasses || 0}
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#ecfdf5",
 borderRadius: "6px",
 border: "1px solid #10b981",
 }}
 >
 <strong>Present:</strong> {data.attendanceStats?.present || 0}
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#ecfdf5",
 borderRadius: "6px",
 border: "1px solid #10b981",
 }}
 >
 <strong>Absent:</strong> {data.attendanceStats?.absent || 0}
 </div>
 <div
 style={{
 padding: "10px",
 backgroundColor: "#ecfdf5",
 borderRadius: "6px",
 border: "1px solid #10b981",
 }}
 >
 <strong>Attendance Rate:</strong>{" "}
 {data.attendanceStats?.attendanceRate?.toFixed(1) || 0}%
 </div>
 </div>
 </div>
 )}
 </div>
 );
 };

 const renderComprehensiveContent = () => {
 const data = report.report_data;
 return (
 <div>
 <div style={{ marginBottom: "20px" }}>
 <h3
 style={{
 fontSize: "16px",
 fontWeight: "bold",
 color: "#7c3aed",
 marginBottom: "10px",
 }}
 >
 📋 Comprehensive Analysis
 </h3>
 <p style={{ fontSize: "12px", lineHeight: "1.4", color: "#6b7280" }}>
 This comprehensive report includes detailed analysis across multiple
 dimensions including performance, attendance, and behavioral
 metrics.
 </p>
 </div>

 {/* Include both performance and attendance sections */}
 {renderPerformanceContent()}
 {renderAttendanceContent()}
 </div>
 );
 };

 const renderGenericContent = () => {
 return (
 <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
 <p>
 Custom report data - refer to the digital version for detailed
 information
 </p>
 </div>
 );
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
 {/* HEADER */}
 <div
 style={{
 textAlign: "center",
 marginBottom: "20px",
 background: `#3B82F6}, #7c3aed)`,
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
 {getReportTypeIcon(report.report_type)}{" "}
 {report.report_type.toUpperCase()} REPORT
 </h1>
 <p style={{ fontSize: "16px", margin: "0", opacity: "0.9" }}>
 {report.name || "Academic Analysis Report"}
 </p>
 </div>

 {/* TOP SECTION - Report Info Cards */}
 <div
 style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr 1fr",
 gap: "15px",
 marginBottom: "25px",
 }}
 >
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
 <strong>Name:</strong> {report.name}
 </div>
 <div style={{ marginBottom: "5px" }}>
 <strong>Type:</strong> {report.report_type}
 </div>
 <div>
 <strong>Generated:</strong> {formatDate(report.date_created)}
 </div>
 </div>
 </div>

 {/* Status */}
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
 📊 STATUS
 </h3>
 <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
 <div style={{ marginBottom: "5px" }}>
 <strong>Status:</strong>{" "}
 <span
 style={{
 color: getStatusColor(report.status),
 fontWeight: "bold",
 }}
 >
 {getStatusIcon(report.status)} {report.status}
 </span>
 </div>
 {report.accuracy && (
 <div style={{ marginBottom: "5px" }}>
 <strong>Accuracy:</strong> {report.accuracy.toFixed(1)}%
 </div>
 )}
 <div>
 <strong>Created:</strong> {formatDate(report.created_at)}
 </div>
 </div>
 </div>

 {/* Course Info (if available) */}
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
 📚 COURSE INFO
 </h3>
 <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
 {report.course ? (
 <>
 <div style={{ marginBottom: "5px" }}>
 <strong>Course:</strong> {report.course.name}
 </div>
 <div>
 <strong>Course ID:</strong> {report.course.id}
 </div>
 </>
 ) : (
 <div style={{ color: "#6b7280", fontStyle: "italic" }}>
 General report (no specific course)
 </div>
 )}
 </div>
 </div>
 </div>

 {/* MAIN CONTENT */}
 <div style={{ marginBottom: "25px" }}>{renderReportContent()}</div>

 {/* SUGGESTIONS SECTION */}
 {report.suggestions && (
 <div
 style={{
 marginBottom: "20px",
 padding: "15px",
 backgroundColor: "#faf5ff",
 border: "2px solid #e9d5ff",
 borderRadius: "8px",
 }}
 >
 <h3
 style={{
 fontSize: "18px",
 fontWeight: "bold",
 color: "#7c3aed",
 margin: "0 0 10px 0",
 borderBottom: "2px solid #a855f7",
 paddingBottom: "5px",
 }}
 >
 💡 RECOMMENDATIONS & SUGGESTIONS
 </h3>
 <div
 style={{
 fontSize: "12px",
 lineHeight: "1.5",
 color: "#6b46c1",
 }}
 >
 {report.suggestions}
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
 📊 Generated by Academic Management System • 📅{" "}
 {formatDate(report.date_created)} • ✨ Report ID: {report.id}
 </p>
 </div>
 </div>
 );
};

export default GeneralReportPrintTemplate;
