import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  onGoogleSignIn: () => void;
  isLoading: boolean;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  onGoogleSignIn,
  isLoading,
}: AuthLayoutProps) {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#f9fafb]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-gray-600 space-y-8">
        {/* Logo and heading */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm mb-4">
            AI
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">AIValytics</h2>
          <div className="mt-2 space-y-2">
            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
              {title}
            </h3>
            <div className="text-sm">
              {subtitle}
            </div>
          </div>
        </div>

        {/* Form Content */}
        {children}

        {/* Divider */}
        <div className="relative">
          <span className="block w-full h-px bg-gray-200"></span>
          <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto text-gray-400">
            Or continue with
          </p>
        </div>

        {/* Social buttons */}
        <div className="space-y-4 text-sm font-medium">
          {/* Google */}
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-x-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h146.9c-6.3 33.9-25 62.5-53.2 81.8v68.1h85.8c50.2-46.3 82-114.6 82-194.7z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c71.6 0 131.7-23.7 175.7-64.2l-85.8-68.1c-23.8 16-54.1 25.4-89.9 25.4-69.1 0-127.6-46.6-148.4-109.3h-89.6v68.9C77.7 480.5 168.5 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M123.6 328.1c-10.8-32.1-10.8-66.9 0-99l-89.6-68.9c-39.1 77.6-39.1 168.3 0 245.9l89.6-68z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c37.4-.6 73.5 13.2 101.1 38.7l75.4-75.4C403.4 24.5 341.4 0 272 0 168.5 0 77.7 63.8 34 159.2l89.6 68.9C144.4 154.3 202.9 107.7 272 107.7z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
