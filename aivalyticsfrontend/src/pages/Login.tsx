import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types/auth";
import WorkspaceIllustration from "../components/WorkspaceIllustration";

const WorkspaceSection: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-pink-900/30 transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-200/40 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/30 dark:bg-pink-800/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Workspace Illustration */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <WorkspaceIllustration 
          imageSrc="/image/workspace.webp" 
          alt="Person working at standing desk in a modern office workspace"
        />
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAttempt, setLoginAttempt] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    setError,
    reset,
    watch,
  } = useForm<LoginCredentials>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const username = watch("username");
  const password = watch("password");

  const from = location.state?.from?.pathname || "/dashboard";

  // Clear form when user changes
  useEffect(() => {
    if (loginAttempt > 0) {
      reset();
      setLoginAttempt(0);
    }
  }, [reset, loginAttempt]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔐 User already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setLoginAttempt((prev) => prev + 1);
      console.log("🔐 Login attempt:", loginAttempt + 1);

      await login(data);

      // Login successful, redirect will be handled by useEffect
      console.log("🔐 Login successful, user:", user);
    } catch (error: any) {
      console.error("🔐 Login failed:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Login failed. Please check your credentials and try again.",
      });
    }
  };

  const getUsernameSuccess = (): boolean => {
    return !!(touchedFields.username && username && username.length >= 3 && !errors.username);
  };

  const getPasswordSuccess = (): boolean => {
    return !!(touchedFields.password && password && password.length >= 8 && !errors.password);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 transition-colors duration-300">
            Welcome back!
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
             Please enter your credentials to continue.
            </p>
          </div>

          {/* Form Card - subtle glassmorphism */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 border border-white/60 dark:border-gray-700/60">
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              aria-label="Login form"
            >
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200"
                >
                  Username <span className="text-red-500 dark:text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <UserIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={`w-full pl-11 px-4 py-3.5 ${getUsernameSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.username
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500 shadow-sm"
                        : getUsernameSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500 shadow-sm"
                        : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:shadow"
                    }`}
                    aria-invalid={errors.username ? "true" : "false"}
                    aria-describedby={
                      errors.username
                        ? "username-error"
                        : getUsernameSuccess()
                        ? "username-success"
                        : "username-hint"
                    }
                    aria-required="true"
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: "Username can only contain letters, numbers, and underscores",
                      },
                    })}
                  />
                  {getUsernameSuccess() && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                {!errors.username && !getUsernameSuccess() && !touchedFields.username && (
                  <p
                    id="username-hint"
                    className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200"
                  >
                    Enter your username to continue
                  </p>
                )}
                {errors.username && (
                  <p
                    id="username-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                    aria-live="polite"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {errors.username.message}
                  </p>
                )}
                {getUsernameSuccess() && (
                  <p
                    id="username-success"
                    className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Username looks good
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200"
                >
                  Password <span className="text-red-500 dark:text-red-400" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`w-full pl-11 px-4 py-3.5 ${getPasswordSuccess() ? "pr-20" : "pr-12"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.password
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500 shadow-sm"
                        : getPasswordSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500 shadow-sm"
                        : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500 focus:shadow"
                    }`}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password
                        ? "password-error"
                        : getPasswordSuccess()
                        ? "password-success"
                        : "password-hint"
                    }
                    aria-required="true"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 gap-2">
                    {getPasswordSuccess() && (
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {!errors.password && !getPasswordSuccess() && !touchedFields.password && (
                  <p
                    id="password-hint"
                    className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200"
                  >
                    Enter your password to continue
                  </p>
                )}
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                    aria-live="polite"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {errors.password.message}
                  </p>
                )}
                {getPasswordSuccess() && (
                  <p
                    id="password-success"
                    className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Password looks good
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errors.root && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm"
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

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1.5 py-0.5"
                  aria-label="Forgot your password? Click to reset your password"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
                aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                      aria-hidden="true"
                    />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  "SIGN IN"
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  No account yet?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1.5 py-0.5"
                    aria-label="Create a new account"
                  >
                    Register here
                  </Link>
                </p>
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

export default Login;
