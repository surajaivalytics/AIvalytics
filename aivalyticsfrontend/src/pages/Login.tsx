import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types/auth";

// Left Illustration: Dynamic Lottie Animation
const IllustrationLeft = () => (
  <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[45%] hidden lg:block opacity-60">
    <DotLottieReact
      src="https://lottie.host/157e19f5-3943-4f6b-b180-5752dd6ddf69/fCrmdQVFNU.lottie"
      loop
      autoplay
    />
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

const SocialIcons: React.FC = () => (
  <div className="flex items-center space-x-4 opacity-40">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
  </div>
);

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, user } = useAuth();
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
      navigate(from, { replace: true });
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
    <div className="min-h-screen bg-[#f2f4f7] flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-12 py-6 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-[#ff5c35] rounded-full"></div>
          <span className="text-xl font-bold tracking-tight">Aivalytics.</span>
        </div>
        <SocialIcons />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-6">
        <IllustrationLeft />
        <IllustrationRight />

        {/* Login Card */}
        <div className="bg-white w-full max-w-[440px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-12 z-30 relative">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight">
              Lets Start Learning
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Login with social or e-mail
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Google Login Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-medium text-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Login with Google</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-300">Or</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 ml-1">
                E-mail address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all placeholder-gray-400 text-sm ${errors.username ? "ring-2 ring-red-400" : ""
                    }`}
                  {...register("username", { required: "Email is required" })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" title="Click to reset password" className="text-xs font-medium text-gray-300 hover:text-gray-500 transition-colors">
                  Forget password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-[#f0f2f5] border-none rounded-2xl focus:ring-2 focus:ring-[#ff5c35] transition-all placeholder-gray-400 text-sm ${errors.password ? "ring-2 ring-red-400" : ""
                    }`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {errors.root && (
              <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff5c35] hover:bg-[#e64a19] text-white font-bold py-5 rounded-3xl mt-6 shadow-[0_10px_20px_-5px_rgba(255,92,53,0.3)] transition-all disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center pt-8">
              <span className="text-gray-400 text-sm">Create an account? </span>
              <Link to="/register" className="text-sm font-bold text-[#ff5c35] hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
