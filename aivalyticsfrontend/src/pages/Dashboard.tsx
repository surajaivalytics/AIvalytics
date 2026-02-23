import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import StudentDashboard from "./dashboards/StudentDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import HodDashboard from "./dashboards/HodDashboard";
import PrincipalDashboard from "./dashboards/PrincipalDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "hod":
        return <HodDashboard />;
      case "principal":
        return <PrincipalDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Unknown Role</h2>
            <p className="mt-2 text-gray-600">
              Please contact administrator for assistance.
            </p>
          </div>
        );
    }
  };

  return <Layout>{renderDashboard()}</Layout>;
};

export default Dashboard;
