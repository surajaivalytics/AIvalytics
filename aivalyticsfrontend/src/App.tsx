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
import AcademicManagement from "./pages/AcademicManagement/AcademicManagement";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemedToaster />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Layout Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              <Route
                path="/academic-management/*"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "hod", "principal"]}>
                    <AcademicManagement />
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