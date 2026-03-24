import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
 EnvelopeIcon,
 ArrowLeftIcon,
 ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { ForgotPasswordData } from "../types/auth";
import WorkspaceIllustration from "../components/WorkspaceIllustration";

const WorkspaceSection: React.FC = () => {
 return (
 <div className="relative overflow-hidden bg-purple-100 dark: transition-colors duration-300 rounded-3xl mb-6 sm:mb-8">
 {/* Decorative Background Elements */}
 <div className="absolute inset-0">
 <div className="absolute top-10 left-10 w-48 h-48 dark: rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-10 right-10 w-64 h-64 dark: rounded-full blur-3xl animate-pulse delay-1000"></div>
 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 dark: rounded-full blur-3xl animate-pulse delay-2000"></div>
 </div>

 {/* Glassmorphism Card - Illustration Container */}
 <div className="relative z-10 backdrop-blur-lg bg-white/20 dark:bg-gray-900/30 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl">
 {/* Workspace Illustration */}
 <div className="flex items-center justify-center w-full py-6 sm:py-8">
 <WorkspaceIllustration 
 imageSrc="/image/workspace.webp" 
 alt="Person working at standing desk in a modern office workspace"
 />
 </div>
 </div>
 </div>
 );
};

const ForgotPassword: React.FC = () => {
 const { forgotPassword, isLoading } = useAuth();

 const {
 register,
 handleSubmit,
 formState: { errors, touchedFields },
 setError,
 } = useForm<ForgotPasswordData>({
 mode: "onBlur",
 reValidateMode: "onChange",
 });

 const onSubmit = async (data: ForgotPasswordData) => {
 try {
 await forgotPassword(data);
 } catch (error: any) {
 setError("root", {
 type: "manual",
 message:
 error.message || "Failed to send reset email. Please try again.",
 });
 }
 };

 const getEmailSuccess = (): boolean => {
 return !!(touchedFields.email && !errors.email);
 };

 return (
 <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
 {/* Left Section - Forgot Password Form */}
 <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 lg:px-16 py-12">
 <div className="w-full max-w-md">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
 Reset Password
 </h1>
 <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
 Enter your email address and we'll send you a link to reset your password.
 </p>
 </div>

 {/* Form Card - subtle glassmorphism */}
 <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 transition-all duration-300 border border-white/60 dark:border-gray-700/60">
 <form
 className="space-y-6"
 onSubmit={handleSubmit(onSubmit)}
 noValidate
 aria-label="Forgot password form"
 >
 {/* Email Field */}
 <div className="space-y-2">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
 <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
 </div>
 <input
 id="email"
 type="email"
 placeholder="Enter your email address"
 autoComplete="email"
 className={`w-full pl-12 pr-4 py-3.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm ${
 errors.email
 ? "border-red-400 dark:border-red-500 bg-gray-50/50 dark: focus:ring-red-500 focus:border-red-500"
 : touchedFields.email && !errors.email
 ? "border-green-400 dark:border-green-500 bg-gray-50/30 dark: focus:ring-green-500 focus:border-green-500"
 : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
 }`}
 aria-invalid={errors.email ? "true" : "false"}
 aria-describedby={errors.email ? "email-error" : undefined}
 {...register("email", {
 required: "Email is required",
 pattern: {
 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 message: "Invalid email address",
 },
 })}
 />
 </div>
 {errors.email && (
 <p
 id="email-error"
 className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
 role="alert"
 >
 <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
 {errors.email.message}
 </p>
 )}
 </div>

 {/* Error Message */}
 {errors.root && (
 <div
 role="alert"
 aria-live="assertive"
 className="rounded-lg bg-gray-50 dark: border border-red-200 dark:border-red-800 p-4 animate-in fade-in slide-in-bg-top-2 duration-300"
 >
 <div className="flex items-start gap-3">
 <ExclamationTriangleIcon
 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
 aria-hidden="true"
 />
 <p className="text-sm text-red-700 dark:text-red-300 font-medium">
 {errors.root.message}
 </p>
 </div>
 </div>
 )}

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled: text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
 aria-label={isLoading ? "Sending reset link..." : "Send reset link"}
 >
 {isLoading ? (
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
 <span>SENDING...</span>
 </>
 ) : (
 "SEND RESET LINK"
 )}
 </button>

 {/* Back to Login Link */}
 <div className="text-center pt-2">
 <Link
 to="/login"
 className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
 aria-label="Back to sign in"
 >
 <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
 Back to sign in
 </Link>
 </div>
 </form>
 </div>
 </div>
 </div>
 {/* Right Section - Illustration Area */}
 <WorkspaceSection />
 </div>
 );
};

export default ForgotPassword;
