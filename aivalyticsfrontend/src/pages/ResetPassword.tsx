import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
 KeyIcon,
 ExclamationTriangleIcon,
 ArrowLeftIcon,
 CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { ResetPasswordData } from "../types/auth";
import WorkspaceIllustration from "../components/WorkspaceIllustration";

type FormValues = {
 token: string;
 newPassword: string;
 confirmPassword: string;
};

const WorkspaceSection: React.FC = () => {
 return (
 <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-purple-100 dark: transition-colors duration-300">
 <div className="absolute inset-0">
 <div className="absolute top-20 left-20 w-64 h-64 dark: rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute bottom-20 right-20 w-80 h-80 dark: rounded-full blur-3xl animate-pulse delay-1000"></div>
 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 dark: rounded-full blur-3xl animate-pulse delay-2000"></div>
 </div>
 <div className="relative z-10 flex items-center justify-center w-full h-full">
 <WorkspaceIllustration imageSrc="/image/workspace.webp" alt="Reset password workspace" />
 </div>
 </div>
 );
};

const ResetPassword: React.FC = () => {
 const { resetPassword, isLoading } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const {
 register,
 handleSubmit,
 formState: { errors, touchedFields },
 setError,
 watch,
 } = useForm<FormValues>({
 mode: "onBlur",
 reValidateMode: "onChange",
 defaultValues: {
 token: new URLSearchParams(location.search).get("token") || "",
 },
 });

 const newPassword = watch("newPassword");
 const confirmPassword = watch("confirmPassword");

 const onSubmit = async (data: FormValues) => {
 if (data.newPassword !== data.confirmPassword) {
 setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
 return;
 }
 try {
 const payload: ResetPasswordData = {
 token: data.token,
 newPassword: data.newPassword,
 confirmPassword: data.confirmPassword,
 };
 await resetPassword(payload);
 navigate("/login", { replace: true });
 } catch (error: any) {
 setError("root", {
 type: "manual",
 message: error.message || "Password reset failed. Please try again.",
 });
 }
 };

 const getPasswordSuccess = (): boolean => {
 return !!(touchedFields.newPassword && newPassword && newPassword.length >= 8 && !errors.newPassword);
 };

 const getConfirmPasswordSuccess = (): boolean => {
 return !!(
 touchedFields.confirmPassword &&
 confirmPassword &&
 confirmPassword.length >= 8 &&
 confirmPassword === newPassword &&
 !errors.confirmPassword
 );
 };

 return (
 <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
 <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 min-h-screen">
 <div className="w-full max-w-md space-y-6">
 <div className="mb-6 sm:mb-8">
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 transition-colors duration-300">
 Set a new password
 </h1>
 <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
 Paste the reset token from your email and choose a strong password.
 </p>
 </div>

 <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 border border-white/60 dark:border-gray-700/60">
 <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
 <div className="space-y-2">
 <label htmlFor="token" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
 Reset token <span className="text-red-500" aria-label="required">*</span>
 </label>
 <input
 id="token"
 type="text"
 placeholder="Paste token"
 className={`w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
 errors.token
 ? "border-red-400 dark:border-red-500 bg-gray-50/50 dark: focus:ring-red-500 focus:border-red-500"
 : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
 }`}
 aria-invalid={errors.token ? "true" : "false"}
 {...register("token", { required: "Reset token is required" })}
 />
 {errors.token && (
 <p id="token-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2" role="alert">
 <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
 {errors.token.message}
 </p>
 )}
 </div>

 <div className="space-y-2">
 <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
 New password <span className="text-red-500">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
 <KeyIcon className="h-5 w-5" aria-hidden="true" />
 </div>
 <input
 id="newPassword"
 type="password"
 placeholder="Enter new password"
 autoComplete="new-password"
 className={`w-full pl-11 px-4 py-3.5 ${getPasswordSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
 errors.newPassword
 ? "border-red-400 dark:border-red-500 bg-gray-50/50 dark: focus:ring-red-500 focus:border-red-500"
 : getPasswordSuccess()
 ? "border-green-400 dark:border-green-500 bg-gray-50/30 dark: focus:ring-green-500 focus:border-green-500"
 : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 hover:border-gray-300 dark:hover;border-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
 }`}
 aria-invalid={errors.newPassword ? "true" : "false"}
 {...register("newPassword", {
 required: "Password is required",
 minLength: { value: 8, message: "Password must be at least 8 characters" },
 })}
 />
 {getPasswordSuccess() && (
 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
 <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
 </div>
 )}
 </div>
 {errors.newPassword && (
 <p id="newPassword-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2" role="alert">
 <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
 {errors.newPassword.message}
 </p>
 )}
 </div>

 <div className="space-y-2">
 <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
 Confirm password <span className="text-red-500">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
 <KeyIcon className="h-5 w-5" aria-hidden="true" />
 </div>
 <input
 id="confirmPassword"
 type="password"
 placeholder="Confirm new password"
 autoComplete="new-password"
 className={`w-full pl-11 px-4 py-3.5 ${getConfirmPasswordSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
 errors.confirmPassword
 ? "border-red-400 dark:border-red-500 bg-gray-50/50 dark: focus:ring-red-500 focus:border-red-500"
 : getConfirmPasswordSuccess()
 ? "border-green-400 dark:border-green-500 bg-gray-50/30 dark: focus:ring-green-500 focus:border-green-500"
 : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
 }`}
 aria-invalid={errors.confirmPassword ? "true" : "false"}
 {...register("confirmPassword", { required: "Please confirm your password" })}
 />
 {getConfirmPasswordSuccess() && (
 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
 <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
 </div>
 )}
 </div>
 {errors.confirmPassword && (
 <p id="confirmPassword-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2" role="alert">
 <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
 {errors.confirmPassword.message}
 </p>
 )}
 </div>

 {errors.root && (
 <div role="alert" aria-live="assertive" className="rounded-lg bg-gray-50 dark: border-2 border-red-200 dark:border-red-800 p-4">
 <div className="flex items-start gap-3">
 <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
 <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errors.root.message}</p>
 </div>
 </div>
 )}

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled: text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2"
 aria-label={isLoading ? "Resetting..." : "Reset password"}
 >
 {isLoading ? (
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" aria-hidden="true" />
 <span>RESETTING...</span>
 </>
 ) : (
 "RESET PASSWORD"
 )}
 </button>

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
 <WorkspaceSection />
 </div>
 );
};

export default ResetPassword;


