import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types/auth";
import { AuthLayout } from "../components/ui/auth-layout";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, signInWithGoogle, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginAttempt, setLoginAttempt] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginCredentials>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (loginAttempt > 0) {
      reset();
      setLoginAttempt(0);
    }
  }, [reset, loginAttempt]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (from === "/dashboard") {
        let destination = "/dashboard";
        if (user.role === "teacher") destination = "/teacher/dashboard";
        else if (user.role === "hod") destination = "/hod/dashboard";
        else if (user.role === "principal") destination = "/principal/dashboard";
        navigate(destination, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setLoginAttempt((prev) => prev + 1);
      await login(data);
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error.message || "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      }
      onGoogleSignIn={signInWithGoogle}
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
              errors.username ? "border-red-500 focus:border-red-500" : "border-gray-200"
            }`}
            {...register("username", { required: "Email is required" })}
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-medium">Password</label>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200"
              }`}
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded-lg py-2">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 px-4 py-3 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 shadow-sm disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
