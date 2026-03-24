import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { RegisterData } from "../types/auth";
import { AuthLayout } from "../components/ui/auth-layout";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterData>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const password = watch("password");

  // Validation functions
  const validateUsername = (value: string) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    return true;
  };

  const validateRollNumber = (value: string) => {
    if (!value) return "USN/ID is required";
    if (!/^[A-Z0-9]+$/.test(value)) return "USN/ID can only contain uppercase letters and numbers";
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return true;
  };

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      
      let destination = "/dashboard";
      if (data.role === "teacher") destination = "/teacher/dashboard";
      else if (data.role === "hod") destination = "/hod/dashboard";
      else if (data.role === "principal") destination = "/principal/dashboard";
      
      navigate(destination);
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error.message || "Registration failed.",
      });
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      }
      onGoogleSignIn={signInWithGoogle}
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label className="font-medium text-sm">Username</label>
            <input
              type="text"
              placeholder="Username"
              className={`w-full mt-1 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.username ? "border-red-500 focus:border-red-500" : "border-gray-200"
              }`}
              {...register("username", { validate: validateUsername })}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          {/* USN/ID */}
          <div>
            <label className="font-medium text-sm">USN/ID</label>
            <input
              type="text"
              placeholder="USN/ID"
              className={`w-full mt-1 px-3 py-2 text-gray-500 bg-transparent uppercase outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.rollNumber ? "border-red-500 focus:border-red-500" : "border-gray-200"
              }`}
              {...register("rollNumber", { validate: validateRollNumber })}
            />
            {errors.rollNumber && <p className="text-xs text-red-500 mt-1">{errors.rollNumber.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="font-medium text-sm">Email (Optional)</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full mt-1 px-3 py-2 text-gray-500 bg-transparent outline-none border border-gray-200 focus:border-indigo-600 shadow-sm rounded-lg"
            {...register("email")}
          />
        </div>

        {/* Role & Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-sm">Role</label>
            <select
              className={`w-full mt-1 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.role ? "border-red-500" : "border-gray-200"
              }`}
              {...register("role", { required: "Role is required" })}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="hod">HOD</option>
              <option value="principal">Principal</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="font-medium text-sm">Age</label>
            <input
              type="number"
              placeholder="Age"
              className="w-full mt-1 px-3 py-2 text-gray-500 bg-transparent outline-none border border-gray-200 focus:border-indigo-600 shadow-sm rounded-lg"
              {...register("age", { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="font-medium text-sm">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200"
              }`}
              {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="font-medium text-sm">Confirm Password</label>
          <div className="relative mt-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg ${
                errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-gray-200"
              }`}
              {...register("confirmPassword", { validate: validateConfirmPassword })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {errors.root && (
          <p className="text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded-lg py-2">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 px-4 py-3 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 shadow-sm disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </AuthLayout>
  );
}
