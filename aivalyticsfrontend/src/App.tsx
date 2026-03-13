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
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCoursesPage";
import StudentQuizzesPage from "./pages/StudentQuizzesPage";
import Reports from "./pages/Reports";
import Unauthorized from "./pages/Unauthorized";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import ClassManagementPage from "./pages/ClassManagementPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import StudentAttendanceDashboard from "./pages/StudentAttendanceDashboard";
import TeacherAcademicManagement from "./pages/TeacherAcademicManagement";
import TeacherPerformance from "./pages/TeacherPerformance";
import TeacherReports from "./pages/TeacherReports";
import TeacherAlerts from "./pages/TeacherAlerts";

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

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Courses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/academic-management/*"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "hod", "principal"]}>
                    <AcademicManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/academic-management"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <TeacherAcademicManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/performance"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <TeacherPerformance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher-reports"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <TeacherReports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/alerts"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <TeacherAlerts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz-generator"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "hod", "principal"]}>
                    <QuizGeneratorPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/class-management"
                element={
                  <ProtectedRoute allowedRoles={["hod"]}>
                    <ClassManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/departments"
                element={
                  <ProtectedRoute allowedRoles={["principal"]}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Courses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentQuizzesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentAttendanceDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;