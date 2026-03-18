import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log("🔐 User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but has no role assigned (new social login)
  if (isAuthenticated && user && !user.role && location.pathname !== "/select-role") {
    console.log("🔐 User has no role, redirecting to select-role");
    return <Navigate to="/select-role" replace />;
  }

  // If user is authenticated but doesn't have required role
  if (isAuthenticated && allowedRoles.length > 0 && user) {
    const hasRequiredRole = user.role ? allowedRoles.includes(user.role) : false;

    console.log("🔐 Role check:", {
      userRole: user.role,
      allowedRoles,
      hasRequiredRole,
      retryCount,
    });

    if (!hasRequiredRole) {
      // If this is a retry and we're still getting unauthorized, redirect to unauthorized page
      if (retryCount > 0) {
        console.log(
          "🔐 Role check failed after retry, redirecting to unauthorized"
        );
        return <Navigate to="/unauthorized" replace />;
      }

      // First time role check failed, try to refresh user data
      if (!isRetrying) {
        setIsRetrying(true);
        console.log("🔐 Role check failed, attempting to refresh user data...");

        // Simulate a brief delay to allow for potential state updates
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          setIsRetrying(false);
        }, 1000);

        return <LoadingSpinner />;
      }
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
