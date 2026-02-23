import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import MetaBalls from "./MetaBalls";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  icon,
  footer,
}) => {
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Left Column with MetaBalls */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="absolute inset-0">
          <MetaBalls
            color="#3B82F6"
            cursorBallColor="#8B5CF6"
            speed={0.4}
            enableMouseInteraction={true}
            hoverSmoothness={0.08}
            animationSize={25}
            ballCount={12}
            clumpFactor={0.8}
            cursorBallSize={4}
            enableTransparency={true}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center w-full h-full px-8">
          <div className="text-center max-w-lg">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300 ring-4 ring-blue-200/50 dark:ring-blue-800/50">
              {icon || <AcademicCapIcon className="h-12 w-12 text-white" />}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">
              Welcome Back
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-md mx-auto leading-relaxed transition-colors duration-300">
              Experience the future of learning with our innovative educational
              platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Column with Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-all duration-300 ring-4 ring-blue-100/50 dark:ring-blue-900/50">
              {icon || <AcademicCapIcon className="h-10 w-10 text-white" />}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg transition-colors duration-300">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 transition-all duration-300">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm transition-colors duration-300">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
