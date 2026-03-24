import React, { useState, useEffect } from "react";
import {
 AcademicCapIcon,
 BookOpenIcon,
 ChartBarIcon,
 ClipboardDocumentListIcon,
 PlusIcon,
 XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { obeApi } from "../services/obeApi";
import { courseService } from "../services/courseApi";

interface OBEManagementProps {}

const OBEManagement: React.FC<OBEManagementProps> = () => {
 const { user } = useAuth();
 const { isDark } = useTheme();

 // Simple theme classes (replaces getThemeClasses usage)
 const themeClasses = {
 background: isDark ? "bg-gray-900" : "bg-white",
 text: isDark ? "text-white" : "text-gray-900",
 textSecondary: isDark ? "text-gray-300" : "text-gray-600",
 card: isDark
 ? "bg-gray-800 border border-gray-700"
 : "bg-white border border-gray-200",
 input: isDark
 ? "bg-gray-800 border-gray-600 text-white"
 : "bg-white border-gray-300 text-gray-900",
 border: isDark ? "border-gray-700" : "border-gray-200",
 };

 // State management
 const [loading, setLoading] = useState(true);
 const [selectedCourse, setSelectedCourse] = useState<any>(null);
 const [courses, setCourses] = useState<any[]>([]);
 const [clos, setCLOs] = useState<any[]>([]);
 const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
 const [courseMappings, setCourseMappings] = useState<any[]>([]);
 const [assessmentRecords, setAssessmentRecords] = useState<any[]>([]);
 const [activeTab, setActiveTab] = useState("overview");

 // Modal states
 const [showCLOModal, setShowCLOModal] = useState(false);
 const [showMappingModal, setShowMappingModal] = useState(false);
 const [showAssessmentModal, setShowAssessmentModal] = useState(false);

 // Form states
 const [cloForm, setCLOForm] = useState({
 outcome_number: 1,
 title: "",
 description: "",
 bloom_level: "Remember",
 });

 const [mappingForm, setMappingForm] = useState({
 clo_id: "",
 assessment_type_id: "",
 coverage_level: 1,
 weight_percentage: 0,
 });

 const [assessmentForm, setAssessmentForm] = useState({
 assessment_type_id: "",
 title: "",
 description: "",
 max_marks: 0,
 weight_percentage: 0,
 assessment_date: "",
 due_date: "",
 });

 // Load initial data
 useEffect(() => {
 loadInitialData();
 }, []);

 const loadInitialData = async () => {
 try {
 setLoading(true);

 // Load courses
 const coursesResponse = await courseService.getCourses();
 if (coursesResponse.success) {
 setCourses(
 coursesResponse.courses.filter(
 (course: any) => course.created_by === user?.id
 )
 );
 }

 // Load assessment types
 const assessmentTypesResponse = await obeApi.getAssessmentTypes();
 if (assessmentTypesResponse.success) {
 setAssessmentTypes(assessmentTypesResponse.data);
 }

 setLoading(false);
 } catch (error) {
 console.error("Error loading initial data:", error);
 setLoading(false);
 }
 };

 // Load course-specific data when course is selected
 useEffect(() => {
 if (selectedCourse) {
 loadCourseData();
 }
 }, [selectedCourse]);

 const loadCourseData = async () => {
 if (!selectedCourse) return;

 try {
 // Load CLOs for the selected course
 const closResponse = await obeApi.getCLOs();
 if (closResponse.success) {
 setCLOs(
 closResponse.data.filter(
 (clo: any) => clo.course_id === selectedCourse.id
 )
 );
 }

 // Load course mappings
 const mappingsResponse = await obeApi.getCourseMappings();
 if (mappingsResponse.success) {
 const courseClos = clos.filter(
 (clo: any) => clo.course_id === selectedCourse.id
 );
 const cloIds = courseClos.map((clo: any) => clo.id);
 setCourseMappings(
 mappingsResponse.data.filter((mapping: any) =>
 cloIds.includes(mapping.clo_id)
 )
 );
 }

 // Load assessment records
 const assessmentsResponse = await obeApi.getAssessmentRecords();
 if (assessmentsResponse.success) {
 setAssessmentRecords(
 assessmentsResponse.data.filter(
 (assessment: any) => assessment.course_id === selectedCourse.id
 )
 );
 }
 } catch (error) {
 console.error("Error loading course data:", error);
 }
 };

 // Handle CLO creation
 const handleCreateCLO = async () => {
 if (!selectedCourse || !cloForm.title || !cloForm.description) {
 alert("Please fill in all required fields");
 return;
 }

 try {
 const response = await obeApi.createCLO({
 course_id: selectedCourse.id,
 ...cloForm,
 is_active: true,
 });

 if (response.success) {
 setCLOs([...clos, response.data]);
 setCLOForm({
 outcome_number: 1,
 title: "",
 description: "",
 bloom_level: "Remember",
 });
 setShowCLOModal(false);
 } else {
 alert("Failed to create CLO");
 }
 } catch (error) {
 console.error("Error creating CLO:", error);
 alert("Error creating CLO");
 }
 };

 // Handle CLO deletion
 const handleDeleteCLO = async (cloId: string) => {
 if (!window.confirm("Are you sure you want to delete this CLO?")) return;

 try {
 const response = await obeApi.deleteCLO(cloId);
 if (response.success) {
 setCLOs(clos.filter((clo) => clo.id !== cloId));
 } else {
 alert("Failed to delete CLO");
 }
 } catch (error) {
 console.error("Error deleting CLO:", error);
 alert("Error deleting CLO");
 }
 };

 // Handle mapping creation
 const handleCreateMapping = async () => {
 if (!mappingForm.clo_id || !mappingForm.assessment_type_id) {
 alert("Please select both CLO and Assessment Type");
 return;
 }

 try {
 const response = await obeApi.createCourseMapping(mappingForm);

 if (response.success) {
 setCourseMappings([...courseMappings, response.data]);
 setMappingForm({
 clo_id: "",
 assessment_type_id: "",
 coverage_level: 1,
 weight_percentage: 0,
 });
 setShowMappingModal(false);
 } else {
 alert("Failed to create mapping");
 }
 } catch (error) {
 console.error("Error creating mapping:", error);
 alert("Error creating mapping");
 }
 };

 // Handle assessment creation
 const handleCreateAssessment = async () => {
 if (
 !selectedCourse ||
 !assessmentForm.title ||
 !assessmentForm.assessment_type_id
 ) {
 alert("Please fill in all required fields");
 return;
 }

 try {
 const response = await obeApi.createAssessmentRecord({
 course_id: selectedCourse.id,
 created_by: user?.id || "",
 ...assessmentForm,
 is_active: true,
 });

 if (response.success) {
 setAssessmentRecords([...assessmentRecords, response.data]);
 setAssessmentForm({
 assessment_type_id: "",
 title: "",
 description: "",
 max_marks: 0,
 weight_percentage: 0,
 assessment_date: "",
 due_date: "",
 });
 setShowAssessmentModal(false);
 } else {
 alert("Failed to create assessment");
 }
 } catch (error) {
 console.error("Error creating assessment:", error);
 alert("Error creating assessment");
 }
 };

 // Handle assessment deletion
 const handleDeleteAssessment = async (assessmentId: string) => {
 if (!window.confirm("Are you sure you want to delete this assessment?"))
 return;

 try {
 const response = await obeApi.deleteAssessmentRecord(assessmentId);
 if (response.success) {
 setAssessmentRecords(
 assessmentRecords.filter(
 (assessment) => assessment.id !== assessmentId
 )
 );
 } else {
 alert("Failed to delete assessment");
 }
 } catch (error) {
 console.error("Error deleting assessment:", error);
 alert("Error deleting assessment");
 }
 };

 if (loading) {
 return (
 <div
 className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center`}
 >
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4">Loading OBE Management...</p>
 </div>
 </div>
 );
 }

 return (
 <div
 className={`min-h-screen ${themeClasses.background} ${themeClasses.text}`}
 >
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <div className="flex items-center justify-between">
 <div>
 <h1 className={`text-3xl font-bold ${themeClasses.text}`}>
 OBE Management
 </h1>
 <p className={`mt-2 ${themeClasses.textSecondary}`}>
 Manage Course Learning Outcomes, Assessment Mapping, and Outcome
 Tracking
 </p>
 </div>
 </div>
 </div>

 {/* Course Selection */}
 <div className="mb-6">
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-2`}
 >
 Select Course
 </label>
 <select
 value={selectedCourse?.id || ""}
 onChange={(e) => {
 const course = courses.find((c) => c.id === e.target.value);
 setSelectedCourse(course || null);
 }}
 className={`w-full max-w-md px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value="">Select a course...</option>
 {courses.map((course) => (
 <option key={course.id} value={course.id}>
 {course.name}
 </option>
 ))}
 </select>
 </div>

 {selectedCourse && (
 <>
 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center">
 <div className="p-2 bg-blue-100 rounded-lg">
 <BookOpenIcon className="h-6 w-6 text-blue-600" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${themeClasses.textSecondary}`}
 >
 Total CLOs
 </p>
 <p className={`text-2xl font-bold ${themeClasses.text}`}>
 {clos.length}
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center">
 <div className="p-2 bg-green-100 rounded-lg">
 <ChartBarIcon className="h-6 w-6 text-green-600" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${themeClasses.textSecondary}`}
 >
 Mapped CLOs
 </p>
 <p className={`text-2xl font-bold ${themeClasses.text}`}>
 {courseMappings.length}
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center">
 <div className="p-2 bg-yellow-100 rounded-lg">
 <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${themeClasses.textSecondary}`}
 >
 Assessments
 </p>
 <p className={`text-2xl font-bold ${themeClasses.text}`}>
 {assessmentRecords.length}
 </p>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center">
 <div className="p-2 bg-purple-100 rounded-lg">
 <AcademicCapIcon className="h-6 w-6 text-purple-600" />
 </div>
 <div className="ml-4">
 <p
 className={`text-sm font-medium ${themeClasses.textSecondary}`}
 >
 Course
 </p>
 <p className={`text-2xl font-bold ${themeClasses.text}`}>
 {selectedCourse.name}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Tab Navigation */}
 <div className="mb-6">
 <nav className="flex space-x-8">
 {[
 { id: "overview", name: "Overview", icon: AcademicCapIcon },
 { id: "clos", name: "CLOs", icon: BookOpenIcon },
 { id: "mapping", name: "Mapping", icon: ChartBarIcon },
 {
 id: "assessments",
 name: "Assessments",
 icon: ClipboardDocumentListIcon,
 },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
 activeTab === tab.id
 ? "bg-blue-100 text-blue-700"
 : `${themeClasses.textSecondary} hover:${themeClasses.text}`
 }`}
 >
 <tab.icon className="h-5 w-5" />
 <span>{tab.name}</span>
 </button>
 ))}
 </nav>
 </div>

 {/* Tab Content */}
 <div className="mt-6">
 {activeTab === "overview" && (
 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <h3
 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}
 >
 Course Overview: {selectedCourse.name}
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h4 className={`font-medium mb-3 ${themeClasses.text}`}>
 Course Learning Outcomes
 </h4>
 <div className="space-y-2">
 {clos.map((clo) => (
 <div
 key={clo.id}
 className={`p-3 rounded border ${themeClasses.border}`}
 >
 <div className="flex items-center justify-between">
 <div>
 <p
 className={`font-medium ${themeClasses.text}`}
 >
 CLO {clo.outcome_number}
 </p>
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 {clo.title}
 </p>
 </div>
 <button
 onClick={() => handleDeleteCLO(clo.id)}
 className="text-red-600 hover:text-red-800"
 >
 <XMarkIcon className="h-4 w-4" />
 </button>
 </div>
 </div>
 ))}
 {clos.length === 0 && (
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 No CLOs defined yet.
 </p>
 )}
 </div>
 </div>

 <div>
 <h4 className={`font-medium mb-3 ${themeClasses.text}`}>
 Recent Assessments
 </h4>
 <div className="space-y-2">
 {assessmentRecords.slice(0, 3).map((assessment) => (
 <div
 key={assessment.id}
 className={`p-3 rounded border ${themeClasses.border}`}
 >
 <p className={`font-medium ${themeClasses.text}`}>
 {assessment.title}
 </p>
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 {new Date(
 assessment.assessment_date
 ).toLocaleDateString()}
 </p>
 </div>
 ))}
 {assessmentRecords.length === 0 && (
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 No assessments created yet.
 </p>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === "clos" && (
 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center justify-between mb-6">
 <h3
 className={`text-lg font-semibold ${themeClasses.text}`}
 >
 Course Learning Outcomes
 </h3>
 <button
 onClick={() => setShowCLOModal(true)}
 className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
 >
 <PlusIcon className="h-4 w-4" />
 <span>Add CLO</span>
 </button>
 </div>

 <div className="space-y-4">
 {clos.map((clo) => (
 <div
 key={clo.id}
 className={`p-4 rounded-lg border ${themeClasses.border}`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-2 mb-2">
 <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
 CLO {clo.outcome_number}
 </span>
 <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
 {clo.bloom_level}
 </span>
 </div>
 <h4
 className={`font-semibold mb-2 ${themeClasses.text}`}
 >
 {clo.title}
 </h4>
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 {clo.description}
 </p>
 </div>
 <button
 onClick={() => handleDeleteCLO(clo.id)}
 className="text-red-600 hover:text-red-800 ml-4"
 >
 <XMarkIcon className="h-5 w-5" />
 </button>
 </div>
 </div>
 ))}
 {clos.length === 0 && (
 <div
 className={`text-center py-8 ${themeClasses.textSecondary}`}
 >
 <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
 <p>No Course Learning Outcomes defined yet.</p>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === "mapping" && (
 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center justify-between mb-6">
 <h3
 className={`text-lg font-semibold ${themeClasses.text}`}
 >
 Outcome Mapping
 </h3>
 <button
 onClick={() => setShowMappingModal(true)}
 className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
 >
 <PlusIcon className="h-4 w-4" />
 <span>Add Mapping</span>
 </button>
 </div>

 <div className="space-y-4">
 {courseMappings.map((mapping) => {
 const clo = clos.find((c) => c.id === mapping.clo_id);
 const assessmentType = assessmentTypes.find(
 (at) => at.id === mapping.assessment_type_id
 );
 return (
 <div
 key={mapping.id}
 className={`p-4 rounded-lg border ${themeClasses.border}`}
 >
 <div className="flex items-center justify-between">
 <div>
 <p className={`font-medium ${themeClasses.text}`}>
 {clo?.title || "Unknown CLO"} →
 {assessmentType?.name || "Unknown Assessment"}
 </p>
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 Coverage: {mapping.coverage_level}/5 | Weight:
 {mapping.weight_percentage}%
 </p>
 </div>
 <button
 onClick={() => {
 // Handle mapping deletion
 }}
 className="text-red-600 hover:text-red-800"
 >
 <XMarkIcon className="h-5 w-5" />
 </button>
 </div>
 </div>
 );
 })}
 {courseMappings.length === 0 && (
 <div
 className={`text-center py-8 ${themeClasses.textSecondary}`}
 >
 <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
 <p>No outcome mappings defined yet.</p>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === "assessments" && (
 <div className={`p-6 rounded-lg ${themeClasses.card}`}>
 <div className="flex items-center justify-between mb-6">
 <h3
 className={`text-lg font-semibold ${themeClasses.text}`}
 >
 Assessment Records
 </h3>
 <button
 onClick={() => setShowAssessmentModal(true)}
 className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
 >
 <PlusIcon className="h-4 w-4" />
 <span>Add Assessment</span>
 </button>
 </div>

 <div className="space-y-4">
 {assessmentRecords.map((assessment) => {
 const assessmentType = assessmentTypes.find(
 (at) => at.id === assessment.assessment_type_id
 );
 return (
 <div
 key={assessment.id}
 className={`p-4 rounded-lg border ${themeClasses.border}`}
 >
 <div className="flex items-center justify-between">
 <div>
 <p className={`font-medium ${themeClasses.text}`}>
 {assessment.title}
 </p>
 <p
 className={`text-sm ${themeClasses.textSecondary}`}
 >
 {assessmentType?.name} • Max Marks:
 {assessment.max_marks} • Date:
 {new Date(
 assessment.assessment_date
 ).toLocaleDateString()}
 </p>
 {assessment.description && (
 <p
 className={`text-sm mt-1 ${themeClasses.textSecondary}`}
 >
 {assessment.description}
 </p>
 )}
 </div>
 <button
 onClick={() =>
 handleDeleteAssessment(assessment.id)
 }
 className="text-red-600 hover:text-red-800"
 >
 <XMarkIcon className="h-5 w-5" />
 </button>
 </div>
 </div>
 );
 })}
 {assessmentRecords.length === 0 && (
 <div
 className={`text-center py-8 ${themeClasses.textSecondary}`}
 >
 <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
 <p>No assessment records created yet.</p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </>
 )}

 {/* CLO Modal */}
 {showCLOModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div
 className={`w-full max-w-md p-6 rounded-lg ${themeClasses.card}`}
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
 Add CLO
 </h3>
 <button
 onClick={() => setShowCLOModal(false)}
 className="text-gray-400 hover:text-gray-600"
 >
 <XMarkIcon className="h-6 w-6" />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Outcome Number
 </label>
 <input
 type="number"
 value={cloForm.outcome_number}
 onChange={(e) =>
 setCLOForm({
 ...cloForm,
 outcome_number: parseInt(e.target.value),
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Title
 </label>
 <input
 type="text"
 value={cloForm.title}
 onChange={(e) =>
 setCLOForm({ ...cloForm, title: e.target.value })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 placeholder="Enter CLO title"
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Description
 </label>
 <textarea
 value={cloForm.description}
 onChange={(e) =>
 setCLOForm({ ...cloForm, description: e.target.value })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 rows={3}
 placeholder="Enter CLO description"
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Bloom's Taxonomy Level
 </label>
 <select
 value={cloForm.bloom_level}
 onChange={(e) =>
 setCLOForm({ ...cloForm, bloom_level: e.target.value })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value="Remember">Remember</option>
 <option value="Understand">Understand</option>
 <option value="Apply">Apply</option>
 <option value="Analyze">Analyze</option>
 <option value="Evaluate">Evaluate</option>
 <option value="Create">Create</option>
 </select>
 </div>

 <div className="flex space-x-3 pt-4">
 <button
 onClick={handleCreateCLO}
 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
 >
 Create CLO
 </button>
 <button
 onClick={() => setShowCLOModal(false)}
 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Mapping Modal */}
 {showMappingModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div
 className={`w-full max-w-md p-6 rounded-lg ${themeClasses.card}`}
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
 Add Mapping
 </h3>
 <button
 onClick={() => setShowMappingModal(false)}
 className="text-gray-400 hover:text-gray-600"
 >
 <XMarkIcon className="h-6 w-6" />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Course Learning Outcome
 </label>
 <select
 value={mappingForm.clo_id}
 onChange={(e) =>
 setMappingForm({ ...mappingForm, clo_id: e.target.value })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value="">Select CLO</option>
 {clos.map((clo) => (
 <option key={clo.id} value={clo.id}>
 CLO {clo.outcome_number}: {clo.title}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Assessment Type
 </label>
 <select
 value={mappingForm.assessment_type_id}
 onChange={(e) =>
 setMappingForm({
 ...mappingForm,
 assessment_type_id: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value="">Select Assessment Type</option>
 {assessmentTypes.map((type) => (
 <option key={type.id} value={type.id}>
 {type.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Coverage Level
 </label>
 <select
 value={mappingForm.coverage_level}
 onChange={(e) =>
 setMappingForm({
 ...mappingForm,
 coverage_level: parseInt(e.target.value),
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value={1}>Very Low</option>
 <option value={2}>Low</option>
 <option value={3}>Medium</option>
 <option value={4}>High</option>
 <option value={5}>Very High</option>
 </select>
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Weight Percentage
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={mappingForm.weight_percentage}
 onChange={(e) =>
 setMappingForm({
 ...mappingForm,
 weight_percentage: parseInt(e.target.value),
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>

 <div className="flex space-x-3 pt-4">
 <button
 onClick={handleCreateMapping}
 className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
 >
 Create Mapping
 </button>
 <button
 onClick={() => setShowMappingModal(false)}
 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Assessment Modal */}
 {showAssessmentModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div
 className={`w-full max-w-md p-6 rounded-lg ${themeClasses.card}`}
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
 Add Assessment
 </h3>
 <button
 onClick={() => setShowAssessmentModal(false)}
 className="text-gray-400 hover:text-gray-600"
 >
 <XMarkIcon className="h-6 w-6" />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Assessment Type
 </label>
 <select
 value={assessmentForm.assessment_type_id}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 assessment_type_id: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 >
 <option value="">Select Assessment Type</option>
 {assessmentTypes.map((type) => (
 <option key={type.id} value={type.id}>
 {type.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Title
 </label>
 <input
 type="text"
 value={assessmentForm.title}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 title: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 placeholder="Enter assessment title"
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Description
 </label>
 <textarea
 value={assessmentForm.description}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 description: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 rows={3}
 placeholder="Enter assessment description"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Max Marks
 </label>
 <input
 type="number"
 min="0"
 value={assessmentForm.max_marks}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 max_marks: parseInt(e.target.value),
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Weight %
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={assessmentForm.weight_percentage}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 weight_percentage: parseInt(e.target.value),
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Assessment Date
 </label>
 <input
 type="date"
 value={assessmentForm.assessment_date}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 assessment_date: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>

 <div>
 <label
 className={`block text-sm font-medium ${themeClasses.text} mb-1`}
 >
 Due Date
 </label>
 <input
 type="date"
 value={assessmentForm.due_date}
 onChange={(e) =>
 setAssessmentForm({
 ...assessmentForm,
 due_date: e.target.value,
 })
 }
 className={`w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
 />
 </div>
 </div>

 <div className="flex space-x-3 pt-4">
 <button
 onClick={handleCreateAssessment}
 className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700"
 >
 Create Assessment
 </button>
 <button
 onClick={() => setShowAssessmentModal(false)}
 className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default OBEManagement;
