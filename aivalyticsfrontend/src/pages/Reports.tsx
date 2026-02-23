import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  FileText,
  Download,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  UserIcon,
  ChartBarIcon,
  SparklesIcon,
  BookOpenIcon,
} from "lucide-react";
import {
  generateAndStoreReport,
  getStudentReports,
  getReportById,
  Report,
  ReportGenerationRequest,
  ReportsResponse,
} from "../services/reportApi";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (params: any = {}) => {
    try {
      setLoading(true);
      const response: ReportsResponse = await getStudentReports(params);

      console.log("📊 Reports API Response:", response);
      console.log("📊 Reports array:", response.reports);
      console.log("📊 Pagination:", response.pagination);

      // Add null checks for response data
      if (response && response.reports) {
        setReports(response.reports);
      } else {
        setReports([]);
      }

      if (response && response.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination({
          total: 0,
          limit: 10,
          offset: 0,
          hasMore: false,
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
      // Set default values on error
      setReports([]);
      setPagination({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (
    reportType:
      | "performance"
      | "attendance"
      | "comprehensive"
      | "all" = "performance"
  ) => {
    try {
      setGenerating(true);

      // Convert "all" to "comprehensive" to avoid database constraint violation
      const validReportType =
        reportType === "all" ? "comprehensive" : reportType;

      const request: ReportGenerationRequest = {
        report_type: validReportType,
      };

      const response = await generateAndStoreReport(request);

      if (response.success) {
        toast.success("Report generated and stored successfully!");
        fetchReports(); // Refresh the reports list
      } else {
        toast.error(response.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = async (report: Report) => {
    try {
      const fullReport = await getReportById(report.id);
      setSelectedReport(fullReport);
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error("Failed to load report details");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <TrendingUp className="h-4 w-4" />;
      case "attendance":
        return <Calendar className="h-4 w-4" />;
      case "comprehensive":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const filteredReports = (reports || []).filter((report) => {
    if (activeTab === "all") return true;
    return report.report_type === activeTab;
  });

  console.log("📊 Active Tab:", activeTab);
  console.log("📊 All Reports:", reports);
  console.log("📊 Filtered Reports:", filteredReports);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and generate your performance and attendance reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateReport("performance")}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Generate Performance Report
            </Button>
          </div>
        </div>

        {/* Report Types Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    {activeTab === "all"
                      ? "You haven't generated any reports yet."
                      : `You haven't generated any ${activeTab} reports yet.`}
                  </p>
                  <Button
                    onClick={() =>
                      handleGenerateReport(
                        activeTab === "all" ? "performance" : (activeTab as any)
                      )
                    }
                    disabled={generating}
                    className="flex items-center gap-2"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Generate Your First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.report_type)}
                          <CardTitle className="text-lg">
                            {report.name}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {formatDate(report.created_at)}
                      </div>

                      {report.course && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Course: {report.course.name}
                        </div>
                      )}

                      {report.accuracy !== undefined && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Accuracy:{" "}
                          </span>
                          <span className="font-medium">
                            {report.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {!loading && pagination && pagination.total > pagination.limit && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.offset === 0}
              onClick={() =>
                fetchReports({
                  offset: Math.max(0, pagination.offset - pagination.limit),
                })
              }
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {Math.floor(pagination.offset / (pagination.limit || 1)) + 1}{" "}
              of {Math.ceil(pagination.total / (pagination.limit || 1))}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasMore}
              onClick={() =>
                fetchReports({ offset: pagination.offset + pagination.limit })
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedReport.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Generated on {formatDate(selectedReport.created_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Close
                </Button>
              </div>

              {/* Report Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Type
                    </span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 mt-1 capitalize">
                    {selectedReport.report_type}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      Status
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 mt-1 capitalize">
                    {selectedReport.status}
                  </p>
                </div>

                {selectedReport.accuracy !== undefined && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        Accuracy
                      </span>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 mt-1">
                      {selectedReport.accuracy.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Report Content */}
              {selectedReport.report_data && (
                <div className="space-y-6">
                  {/* Student Information */}
                  {selectedReport.report_data.student && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Student Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Name:
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {selectedReport.report_data.student.username}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Roll Number:
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {selectedReport.report_data.student.rollNumber}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Email:
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {selectedReport.report_data.student.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Member Since:
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(
                              selectedReport.report_data.student.memberSince
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Overview */}
                  {selectedReport.report_data.performance && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Performance Overview
                      </h3>

                      {selectedReport.report_data.performance.overallStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedReport.report_data.performance
                                .overallStats.totalQuizzes || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Quizzes
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {selectedReport.report_data.performance.overallStats.averageScore?.toFixed(
                                1
                              ) || 0}
                              %
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Average Score
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {selectedReport.report_data.performance
                                .overallStats.highestScore || 0}
                              %
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Highest Score
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {selectedReport.report_data.performance.overallStats.passRate?.toFixed(
                                1
                              ) || 0}
                              %
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Pass Rate
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Strengths */}
                      {selectedReport.report_data.performance.strengths &&
                        selectedReport.report_data.performance.strengths
                          .length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Strengths
                            </h4>
                            <div className="space-y-2">
                              {selectedReport.report_data.performance.strengths.map(
                                (strength: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-green-100 dark:bg-green-800/30 p-3 rounded-lg"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-green-800 dark:text-green-200">
                                        {strength.area}
                                      </span>
                                      <span className="text-sm text-green-600 dark:text-green-400">
                                        {strength.score}%
                                      </span>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                      {strength.reason}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Weaknesses */}
                      {selectedReport.report_data.performance.weaknesses &&
                        selectedReport.report_data.performance.weaknesses
                          .length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Areas for Improvement
                            </h4>
                            <div className="space-y-2">
                              {selectedReport.report_data.performance.weaknesses.map(
                                (weakness: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-red-100 dark:bg-red-800/30 p-3 rounded-lg"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-red-800 dark:text-red-200">
                                        {weakness.area}
                                      </span>
                                      <span className="text-sm text-red-600 dark:text-red-400">
                                        {weakness.score}%
                                      </span>
                                    </div>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                      {weakness.reason}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {selectedReport.report_data.aiSuggestions && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5" />
                        AI Insights & Recommendations
                      </h3>

                      {selectedReport.report_data.aiSuggestions
                        .overallAssessment && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                            Overall Assessment
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {
                              selectedReport.report_data.aiSuggestions
                                .overallAssessment
                            }
                          </p>
                        </div>
                      )}

                      {selectedReport.report_data.aiSuggestions
                        .studyRecommendations &&
                        selectedReport.report_data.aiSuggestions
                          .studyRecommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                              Study Recommendations
                            </h4>
                            <div className="space-y-2">
                              {selectedReport.report_data.aiSuggestions.studyRecommendations.map(
                                (rec: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-purple-100 dark:bg-purple-800/30 p-3 rounded-lg"
                                  >
                                    <p className="font-medium text-purple-800 dark:text-purple-200">
                                      {rec.recommendation}
                                    </p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                      {rec.reason}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                      Timeframe: {rec.timeframe}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {selectedReport.report_data.aiSuggestions
                        .motivationalMessage && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-800/30 rounded-lg">
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                            💪 Motivational Message
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 italic">
                            "
                            {
                              selectedReport.report_data.aiSuggestions
                                .motivationalMessage
                            }
                            "
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Course Information */}
                  {selectedReport.report_data.courseDetails &&
                    selectedReport.report_data.courseDetails.length > 0 && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <BookOpenIcon className="h-5 w-5" />
                          Enrolled Courses (
                          {selectedReport.report_data.enrolledCourses ||
                            selectedReport.report_data.courseDetails.length}
                          )
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedReport.report_data.courseDetails.map(
                            (course: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white dark:bg-gray-700 p-3 rounded-lg border"
                              >
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {course.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Duration: {course.duration_months} months
                                </p>
                                {course.about && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {course.about}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Fallback for raw data */}
              {!selectedReport.report_data && (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Report Data
                  </h3>
                  <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedReport, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
