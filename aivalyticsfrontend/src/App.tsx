import React from "react";
import {
 BrowserRouter as Router,
 Routes,
 Route,
 Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ThemedToaster from "./components/ThemedToaster";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SelectRole from "./pages/SelectRole";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Courses from "./pages/student/Courses";
import MyCourses from "./pages/teacher/MyCoursesPage";
import StudentQuizzesPage from "./pages/student/StudentQuizzesPage";
import Reports from "./pages/student/Reports";
import Unauthorized from "./pages/Unauthorized";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import ClassManagementPage from "./pages/hod/ClassManagementPage";
import DepartmentsPage from "./pages/principal/DepartmentsPage";
import StudentAttendanceDashboard from "./pages/student/StudentAttendanceDashboard";
import TeacherAcademicManagement from "./pages/teacher/TeacherAcademicManagement";
import TeacherPerformance from "./pages/teacher/TeacherPerformance";
import TeacherReports from "./pages/teacher/TeacherReports";
import TeacherAlerts from "./pages/teacher/TeacherAlerts";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";
import AcademicManagement from "./pages/AcademicManagement/AcademicManagement";
import TeacherUploadContent from "./pages/teacher/TeacherUploadContent";

const ProtectedLayout = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => (
 <ProtectedRoute allowedRoles={allowedRoles}>
 <Layout>
 {children}
 </Layout>
 </ProtectedRoute>
);

function App() {
 return (
 <ThemeProvider>
 <AuthProvider>
 <Router>
 <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
 <ThemedToaster />

 <Routes>
 {/* Public Routes */}
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 <Route path="/forgot-password" element={<ForgotPassword />} />
 <Route path="/reset-password" element={<ResetPassword />} />
 <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
 <Route path="/unauthorized" element={<Unauthorized />} />

 {/* Protected Routes with Layout */}
 <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
 <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

 {/* Student Routes */}
 <Route path="/courses" element={<ProtectedLayout allowedRoles={["student"]}><Courses /></ProtectedLayout>} />
 <Route path="/attendance" element={<ProtectedLayout allowedRoles={["student"]}><StudentAttendanceDashboard /></ProtectedLayout>} />
 <Route path="/reports" element={<ProtectedLayout allowedRoles={["student"]}><Reports /></ProtectedLayout>} />
 <Route path="/quizzes" element={<ProtectedLayout allowedRoles={["student"]}><StudentQuizzesPage /></ProtectedLayout>} />

 {/* Teacher/HOD/Principal Routes */}
 <Route path="/academic-management/*" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><AcademicManagement /></ProtectedLayout>} />
 <Route path="/academic-management" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherAcademicManagement /></ProtectedLayout>} />
  <Route path="/students" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherStudentsPage /></ProtectedLayout>} />
 <Route path="/performance" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherPerformance /></ProtectedLayout>} />
 <Route path="/teacher-reports" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherReports /></ProtectedLayout>} />
 <Route path="/alerts" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherAlerts /></ProtectedLayout>} />
 <Route path="/quiz-generator" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><QuizGeneratorPage /></ProtectedLayout>} />
 
 {/* Teacher Specific Routes */}
 <Route path="/my-courses" element={<ProtectedLayout allowedRoles={["teacher"]}><MyCourses /></ProtectedLayout>} />
 <Route path="/upload-content" element={<ProtectedLayout allowedRoles={["teacher", "hod", "principal"]}><TeacherUploadContent /></ProtectedLayout>} />

 {/* HOD Routes */}
 <Route path="/class-management" element={<ProtectedLayout allowedRoles={["hod"]}><ClassManagementPage /></ProtectedLayout>} />

 {/* Principal Routes */}
 <Route path="/departments" element={<ProtectedLayout allowedRoles={["principal"]}><DepartmentsPage /></ProtectedLayout>} />

 {/* Redirects */}
 <Route path="/" element={<Navigate to="/dashboard" replace />} />
 <Route path="*" element={<Navigate to="/dashboard" replace />} />
 </Routes>
 </div>
 </Router>
 </AuthProvider>
 </ThemeProvider>
 );
}

export default App;