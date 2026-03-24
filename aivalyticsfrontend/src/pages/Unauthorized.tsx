import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

const Unauthorized: React.FC = () => {
 const { user, isAuthenticated, clearAuthState } = useAuth();
 const navigate = useNavigate();
 const [isRetrying, setIsRetrying] = useState(false);

 const handleRetry = async () => {
 setIsRetrying(true);
 try {
 // Clear auth state and redirect to login
 clearAuthState();
 navigate("/login", { replace: true });
 } catch (error) {
 console.error("Retry failed:", error);
 } finally {
 setIsRetrying(false);
 }
 };

 const handleGoToDashboard = () => {
 navigate("/dashboard", { replace: true });
 };

 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
 <div className="text-center">
 <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
 <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
 Access Denied
 </h2>
 <p className="mt-2 text-sm text-gray-600">
 {isAuthenticated && user 
 ? `You don't have permission to access this page with your current role (${user.role}).`
 : "You don't have permission to access this page."
 }
 </p>
 
 <div className="mt-6 space-y-3">
 {/* Retry Button */}
 <button
 onClick={handleRetry}
 disabled={isRetrying}
 className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isRetrying ? (
 <>
 <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
 Retrying...
 </>
 ) : (
 "Try Again"
 )}
 </button>

 {/* Dashboard Button */}
 <button
 onClick={handleGoToDashboard}
 className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
 >
 Go to Dashboard
 </button>

 {/* Login Link */}
 <Link
 to="/login"
 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
 >
 Log in with Different Account
 </Link>
 </div>

 {/* Debug Information (Development Only) */}
 {((typeof process !== "undefined" && process.env.NODE_ENV === "development") || (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV)) && (
 <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
 <p><strong>Debug Info:</strong></p>
 <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
 <p>User Role: {user?.role || "None"}</p>
 <p>User ID: {user?.id || "None"}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default Unauthorized;
