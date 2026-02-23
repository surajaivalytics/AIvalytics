import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
  LockClosedIcon,
  KeyIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { RegisterData, UserRole } from "../types/auth";
import WorkspaceIllustration from "../components/WorkspaceIllustration";

const WorkspaceSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-pink-900/30 transition-colors duration-300 rounded-3xl mb-6 sm:mb-8">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-48 h-48 bg-purple-200/40 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200/30 dark:bg-pink-800/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
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

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, touchedFields },
    setError,
  } = useForm<RegisterData>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const password = watch("password");
  const username = watch("username");
  const email = watch("email");
  const rollNumber = watch("rollNumber");
  const confirmPassword = watch("confirmPassword");
  const age = watch("age");
  const role = watch("role");

  // Password strength calculator
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        label: "",
        color: "gray",
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      };
    }

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>\[\]_\-+=~`]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["red", "orange", "yellow", "blue", "green"];

    return {
      score,
      label: labels[score - 1] || "",
      color: colors[score - 1] || "gray",
      checks,
    };
  }, [password]);

  // Enhanced validation functions
  const validateUsername = (value: string) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 50) return "Username must be less than 50 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return true;
  };

  const validateEmail = (value: string | undefined) => {
    if (!value) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    // More comprehensive email validation
    if (value.length > 254) return "Email address is too long";
    const [localPart, domain] = value.split("@");
    if (localPart.length > 64) return "Email username part is too long";
    if (domain && domain.length > 255) return "Email domain is too long";
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (value.length > 128) return "Password must be less than 128 characters";
    if (passwordStrength.score < 3) {
      return "Password is too weak. Include uppercase, lowercase, numbers, and special characters";
    }
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return true;
  };

  const validateRollNumber = (value: string) => {
    if (!value) return "USN/ID is required";
    if (value.length < 3) return "USN/ID must be at least 3 characters";
    if (value.length > 20) return "USN/ID must be less than 20 characters";
    if (!/^[A-Z0-9]+$/.test(value))
      return "USN/ID can only contain uppercase letters and numbers";
    return true;
  };

  const validateAge = (value: number | undefined) => {
    if (!value) return true; // Age is optional
    if (isNaN(value) || value < 16) return "Age must be at least 16";
    if (value > 100) return "Age must be less than 100";
    return true;
  };

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error.message || "Registration failed. Please check your information and try again.",
      });
    }
  };

  // Success state checkers
  const getUsernameSuccess = (): boolean => {
    return !!(touchedFields.username && username && username.length >= 3 && !errors.username);
  };

  const getEmailSuccess = (): boolean => {
    return !!(touchedFields.email && email && !errors.email);
  };

  const getRollNumberSuccess = (): boolean => {
    return !!(touchedFields.rollNumber && rollNumber && rollNumber.length >= 3 && !errors.rollNumber);
  };

  const getPasswordSuccess = (): boolean => {
    return !!(touchedFields.password && password && password.length >= 8 && passwordStrength.score >= 3 && !errors.password);
  };

  const getConfirmPasswordSuccess = (): boolean => {
    return !!(touchedFields.confirmPassword && confirmPassword && confirmPassword === password && !errors.confirmPassword);
  };

  const getAgeSuccess = (): boolean => {
    return !!(touchedFields.age && age && !isNaN(age) && age >= 16 && age <= 100 && !errors.age);
  };

  // Trigger confirm password validation when password changes
  useEffect(() => {
    if (touchedFields.confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, trigger, touchedFields.confirmPassword]);

  const roleDescriptions = {
    student: "Access courses, assignments, and grades",
    teacher: "Manage courses, create assignments, and grade students",
    hod: "Department management and faculty oversight",
    principal: "Institution-wide management and administration",
  };

  const roleIcons = {
    student: "👨‍🎓",
    teacher: "👨‍🏫",
    hod: "👨‍🏼",
    principal: "👨‍💻",
  };

  const getStrengthColor = (color: string) => {
    const colors: Record<string, string> = {
      red: "bg-red-500 dark:bg-red-400",
      orange: "bg-orange-500 dark:bg-orange-400",
      yellow: "bg-yellow-500 dark:bg-yellow-400",
      blue: "bg-blue-500 dark:bg-blue-400",
      green: "bg-green-500 dark:bg-green-400",
      gray: "bg-gray-300 dark:bg-gray-600",
    };
    return colors[color] || colors.gray;
  };

  const getStrengthTextColor = (color: string) => {
    const colors: Record<string, string> = {
      red: "text-red-600 dark:text-red-400",
      orange: "text-orange-600 dark:text-orange-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      gray: "text-gray-500 dark:text-gray-400",
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      {/* Left Section - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 lg:px-16 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
              Join Our Platform
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
              Create your account to start learning and discover how we can help you design workspace for your team.
            </p>
          </div>

          {/* Form Card - subtle glassmorphism */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 transition-all duration-300 border border-white/60 dark:border-gray-700/60">
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              aria-label="Registration form"
            >
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <UserIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username (3-50 characters)"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={`w-full pl-11 px-4 py-3.5 ${getUsernameSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm ${
                      errors.username
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getUsernameSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.username ? "true" : "false"}
                    aria-describedby={
                      errors.username
                        ? "username-error"
                        : getUsernameSuccess()
                        ? "username-success"
                        : "username-hint"
                    }
                    {...register("username", { validate: validateUsername })}
                  />
                  {getUsernameSuccess() && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {!errors.username && !getUsernameSuccess() && !touchedFields.username && (
                  <p id="username-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Username must be 3-50 characters, letters, numbers, and underscores only
                  </p>
                )}
                {errors.username && (
                  <p
                    id="username-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.username.message}
                  </p>
                )}
                {getUsernameSuccess() && (
                  <p id="username-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Username is valid
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className={`w-full pl-11 px-4 py-3.5 ${getEmailSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.email
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getEmailSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : getEmailSuccess()
                        ? "email-success"
                        : "email-hint"
                    }
                    {...register("email", { validate: validateEmail })}
                  />
                  {getEmailSuccess() && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {!errors.email && !getEmailSuccess() && (
                  <p id="email-hint" className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                    <InformationCircleIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>Used for password reset and notifications</span>
                  </p>
                )}
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
                {getEmailSuccess() && (
                  <p id="email-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Email is valid
                  </p>
                )}
              </div>

              {/* USN/ID */}
              <div className="space-y-2">
                <label htmlFor="rollNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  USN/ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <IdentificationIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="rollNumber"
                    type="text"
                    placeholder="Enter your USN/ID"
                    autoComplete="off"
                    autoCapitalize="characters"
                    className={`w-full pl-11 px-4 py-3.5 ${getRollNumberSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 uppercase ${
                      errors.rollNumber
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getRollNumberSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.rollNumber ? "true" : "false"}
                    aria-describedby={
                      errors.rollNumber
                        ? "rollNumber-error"
                        : getRollNumberSuccess()
                        ? "rollNumber-success"
                        : "rollNumber-hint"
                    }
                    {...register("rollNumber", { validate: validateRollNumber })}
                  />
                  {getRollNumberSuccess() && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {!errors.rollNumber && !getRollNumberSuccess() && !touchedFields.rollNumber && (
                  <p id="rollNumber-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    USN/ID must be 3-20 characters, uppercase letters and numbers only
                  </p>
                )}
                {errors.rollNumber && (
                  <p
                    id="rollNumber-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.rollNumber.message}
                  </p>
                )}
                {getRollNumberSuccess() && (
                  <p id="rollNumber-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    USN/ID is valid
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className={`w-full pl-11 px-4 py-3.5 ${getPasswordSuccess() ? "pr-20" : "pr-12"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.password
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getPasswordSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password
                        ? "password-error"
                        : password
                        ? "password-strength"
                        : "password-hint"
                    }
                    {...register("password", { validate: validatePassword })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 gap-2">
                    {getPasswordSuccess() && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {!errors.password && !password && !touchedFields.password && (
                  <p id="password-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                  </p>
                )}
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.password.message}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div
                    id="password-strength"
                    className="space-y-2"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                      {passwordStrength.label && (
                        <span className={`font-semibold ${getStrengthTextColor(passwordStrength.color)}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.color)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(passwordStrength.checks).map(([key, met]) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                            met
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {met ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-current" aria-hidden="true" />
                          )}
                          <span className="capitalize">
                            {key === "length" ? "8+ characters" : key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <KeyIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={`w-full pl-11 px-4 py-3.5 ${getConfirmPasswordSuccess() ? "pr-20" : "pr-12"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.confirmPassword
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getConfirmPasswordSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : getConfirmPasswordSuccess()
                        ? "confirmPassword-success"
                        : "confirmPassword-hint"
                    }
                    {...register("confirmPassword", {
                      validate: validateConfirmPassword,
                    })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 gap-2">
                    {getConfirmPasswordSuccess() && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {!errors.confirmPassword && !getConfirmPasswordSuccess() && !touchedFields.confirmPassword && (
                  <p id="confirmPassword-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Re-enter your password to confirm
                  </p>
                )}
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.confirmPassword.message}
                  </p>
                )}
                {getConfirmPasswordSuccess() && (
                  <p id="confirmPassword-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="role"
                    {...register("role", { required: "Please select a role" })}
                    className={`block w-full px-4 py-3.5 ${touchedFields.role && role && !errors.role ? "pr-10" : "pr-4"} border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white backdrop-blur-sm ${
                      errors.role
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : touchedFields.role && role && !errors.role
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    }`}
                    aria-invalid={errors.role ? "true" : "false"}
                    aria-describedby={
                      errors.role
                        ? "role-error"
                        : touchedFields.role && role && !errors.role
                        ? "role-success"
                        : "role-hint"
                    }
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-gray-800">
                      Select your role
                    </option>
                    {Object.entries(roleDescriptions).map(([roleKey, description]) => (
                      <option key={roleKey} value={roleKey} className="bg-white dark:bg-gray-800">
                        {roleIcons[roleKey as keyof typeof roleIcons]}{" "}
                        {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} - {description}
                      </option>
                    ))}
                  </select>
                  {touchedFields.role && role && !errors.role && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {!errors.role && !touchedFields.role && (
                  <p id="role-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Please select your role to continue
                  </p>
                )}
                {errors.role && (
                  <p
                    id="role-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.role.message}
                  </p>
                )}
                {touchedFields.role && role && !errors.role && (
                  <p id="role-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Role selected
                  </p>
                )}
              </div>

              {/* Age (Optional) */}
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Age <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <HashtagIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="age"
                    type="number"
                    min="16"
                    max="100"
                    placeholder="Enter your age"
                    autoComplete="off"
                    className={`w-full pl-11 px-4 py-3.5 ${getAgeSuccess() ? "pr-10" : "pr-4"} rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.age
                        ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                        : getAgeSuccess()
                        ? "border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200/50 dark:border-gray-600/50 bg-white/20 dark:bg-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-sm"
                    }`}
                    aria-invalid={errors.age ? "true" : "false"}
                    aria-describedby={
                      errors.age
                        ? "age-error"
                        : getAgeSuccess()
                        ? "age-success"
                        : "age-hint"
                    }
                    {...register("age", {
                      validate: validateAge,
                      valueAsNumber: true,
                    })}
                  />
                  {getAgeSuccess() && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {!errors.age && !getAgeSuccess() && !touchedFields.age && (
                  <p id="age-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    Optional: Age must be between 16 and 100
                  </p>
                )}
                {errors.age && (
                  <p
                    id="age-error"
                    className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    role="alert"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {errors.age.message}
                  </p>
                )}
                {getAgeSuccess() && (
                  <p id="age-success" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Age is valid
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errors.root && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                aria-label={isLoading ? "Creating account..." : "Create account"}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>CREATING...</span>
                  </>
                ) : (
                  "CREATE ACCOUNT"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                    aria-label="Sign in to existing account"
                  >
                    Sign in here
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

export default Register;
