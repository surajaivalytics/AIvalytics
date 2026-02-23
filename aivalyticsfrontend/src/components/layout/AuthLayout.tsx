import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import MetaBalls from "../MetaBalls";

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
    <div className="min-h-screen flex">
      {/* Left Column with MetaBalls */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="text-center text-gray-900">
            <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              {icon || <AcademicCapIcon className="h-10 w-10 text-white" />}
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Welcome to Our Platform
            </h1>
            <p className="text-xl text-gray-700 max-w-md mx-auto">
              Experience the future of learning with our innovative educational
              platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Column with Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
              {icon || <AcademicCapIcon className="h-8 w-8 text-white" />}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 text-lg">{subtitle}</p>
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            {children}
          </div>

          {/* Footer */}
          {footer && <div className="text-center">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
