import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { RegisterData } from "../types/auth";

// Left Illustration: Premium AI & Data theme
const IllustrationLeft = () => (
  <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-[40%] hidden lg:block opacity-60">
    <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Stylized Neural Network Structure */}
      <circle cx="200" cy="300" r="100" stroke="#ff5c35" strokeWidth="0.5" strokeDasharray="4 4" />
      <circle cx="200" cy="300" r="150" stroke="#ff5c35" strokeWidth="0.2" strokeDasharray="8 8" />

      {/* Central Node */}
      <circle cx="200" cy="300" r="40" fill="#ff5c35" fillOpacity="0.05" />
      <circle cx="200" cy="300" r="4" fill="#ff5c35" />

      {/* Connected Nodes */}
      <g>
        <circle cx="100" cy="200" r="3" fill="#ff5c35" />
        <path d="M200 300 L100 200" stroke="#ff5c35" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="300" cy="220" r="3" fill="#ff5c35" />
        <path d="M200 300 L300 220" stroke="#ff5c35" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="280" cy="400" r="3" fill="#ff5c35" />
        <path d="M200 300 L280 400" stroke="#ff5c35" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="120" cy="420" r="3" fill="#ff5c35" />
        <path d="M200 300 L120 420" stroke="#ff5c35" strokeWidth="0.5" strokeOpacity="0.3" />
      </g>

      {/* Abstract Data Waves */}
      <path d="M50 450 Q 125 400, 200 450 T 350 450" stroke="#ff5c35" strokeWidth="1" strokeOpacity="0.2" fill="none" />
      <path d="M50 470 Q 125 420, 200 470 T 350 470" stroke="#ff5c35" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />

      {/* Floating Geometric Particles */}
      <rect x="80" y="150" width="10" height="10" rx="2" fill="#ff5c35" fillOpacity="0.2" transform="rotate(15 80 150)" />
      <circle cx="320" cy="300" r="6" fill="#ff5c35" fillOpacity="0.1" />
      <path d="M150 500 L160 510 L140 510 Z" fill="#ff5c35" fillOpacity="0.15" />
    </svg>
  </div>
);

// Right Illustration: Abstract Data Elements theme
const IllustrationRight = () => (
  <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 w-[35%] hidden lg:block opacity-60">
    <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Stylized Data Blocks / Nodes */}
      <rect x="250" y="100" width="80" height="20" rx="10" fill="#ff5c35" fillOpacity="0.05" stroke="#ff5c35" strokeWidth="0.5" />
      <circle cx="265" cy="110" r="4" fill="#ff5c35" />
      <rect x="275" y="108" width="40" height="4" rx="2" fill="#ff5c35" fillOpacity="0.3" />

      <rect x="220" y="250" width="100" height="30" rx="15" fill="#ff5c35" fillOpacity="0.05" stroke="#ff5c35" strokeWidth="0.5" />
      <circle cx="240" cy="265" r="5" fill="#ff5c35" />
      <rect x="255" y="263" width="50" height="4" rx="2" fill="#ff5c35" fillOpacity="0.3" />

      {/* Floating Orbital Path */}
      <ellipse cx="200" cy="300" rx="180" ry="120" stroke="#ff5c35" strokeWidth="0.2" strokeOpacity="0.3" />
      <circle cx="350" cy="230" r="4" fill="#ff5c35" />
      <circle cx="50" cy="370" r="4" fill="#ff5c35" fillOpacity="0.5" />

      {/* Vertical Connection Lines */}
      <line x1="100" y1="100" x2="100" y2="500" stroke="#ff5c35" strokeWidth="0.2" strokeDasharray="10 5" strokeOpacity="0.2" />
      <line x1="300" y1="50" x2="300" y2="550" stroke="#ff5c35" strokeWidth="0.2" strokeDasharray="5 5" strokeOpacity="0.2" />

      {/* Dot Matrix Decoration */}
      <g opacity="0.1">
        {[0, 1, 2, 3].map(i => (
          [0, 1, 2, 3].map(j => (
            <circle key={`${i}-${j}`} cx={320 + i * 15} cy={400 + j * 15} r="2" fill="#ff5c35" />
          ))
        ))}
      </g>
    </svg>
  </div>
);

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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
    <div className="min-h-screen bg-[#f2f4f7] flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-12 py-6 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-[#ff5c35] rounded-full"></div>
          <span className="text-xl font-bold tracking-tight">Aivalytics.</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-6">
        <IllustrationLeft />
        <IllustrationRight />

        {/* Register Card */}
        <div className="bg-white w-full max-w-[520px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-12 z-20 relative">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight">
              Join Our Platform
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Enter your details to register
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-medium text-sm disabled:opacity-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>{isLoading ? "Processing..." : "Sign up with Google"}</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-300">Or</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm ${errors.username ? "ring-2 ring-red-400" : ""}`}
                  {...register("username", { validate: validateUsername })}
                />
                {errors.username && <p className="text-[10px] text-red-500 ml-2">{errors.username.message}</p>}
              </div>

              {/* USN/ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">USN/ID</label>
                <input
                  type="text"
                  placeholder="USN/ID"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm uppercase ${errors.rollNumber ? "ring-2 ring-red-400" : ""}`}
                  {...register("rollNumber", { validate: validateRollNumber })}
                />
                {errors.rollNumber && <p className="text-[10px] text-red-500 ml-2">{errors.rollNumber.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm`}
                {...register("email")}
              />
            </div>

            {/* Role & Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Role</label>
                <select
                  {...register("role", { required: "Role is required" })}
                  className="w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm appearance-none"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  className="w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm"
                  {...register("age", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm ${errors.password ? "ring-2 ring-red-400" : ""}`}
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-gray-500">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 ml-2">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all text-sm ${errors.confirmPassword ? "ring-2 ring-red-400" : ""}`}
                  {...register("confirmPassword", { validate: validateConfirmPassword })}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-gray-500">
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-2">{errors.confirmPassword.message}</p>}
            </div>

            {errors.root && <p className="text-sm text-red-500 text-center">{errors.root.message}</p>}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff5c35] hover:bg-[#e64a19] text-white font-bold py-5 rounded-3xl mt-6 shadow-[0_10px_20px_-5px_rgba(255,92,53,0.3)] transition-all disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="text-center pt-8">
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <Link to="/login" className="text-sm font-bold text-[#ff5c35] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
