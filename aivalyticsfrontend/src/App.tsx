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
import StudentReport from "./pages/StudentReport";
import Reports from "./pages/Reports";
import Unauthorized from "./pages/Unauthorized";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import ClassManagementPage from "./pages/ClassManagementPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import StudentAttendanceDashboard from "./pages/StudentAttendanceDashboard";

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
                path="/quizzes"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentQuizzesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Navigate to="/reports" replace />
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

              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentAttendancePage />
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

              {/* Teacher Routes */}
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <MyCourses />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz-generator"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <QuizGeneratorPage />
                  </ProtectedRoute>
                }
              />

              {/* HOD Routes */}
              <Route
                path="/class-management"
                element={
                  <ProtectedRoute allowedRoles={["hod"]}>
                    <ClassManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Principal Routes */}
              <Route
                path="/departments"
                element={
                  <ProtectedRoute allowedRoles={["principal"]}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Role-specific Protected Routes */}
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "hod", "principal"]}
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hod/*"
                element={
                  <ProtectedRoute allowedRoles={["hod", "principal"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/principal/*"
                element={
                  <ProtectedRoute allowedRoles={["principal"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
