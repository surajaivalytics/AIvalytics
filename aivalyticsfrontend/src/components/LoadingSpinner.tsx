import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  message?: string;
  fullScreen?: boolean;
  showOverlay?: boolean;
  className?: string;
  sciFi?: boolean;
}

const sizeClasses = {
  xs: "h-3 w-3 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-12 w-12 border-4",
  xl: "h-16 w-16 border-4",
};

const sciFiSizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

const variantClasses = {
  primary:
    "border-t-blue-600 border-r-blue-500 border-b-blue-400 border-l-blue-300",
  secondary:
    "border-t-purple-600 border-r-purple-500 border-b-purple-400 border-l-purple-300",
  success:
    "border-t-emerald-600 border-r-emerald-500 border-b-emerald-400 border-l-emerald-300",
  danger: "border-t-red-600 border-r-red-500 border-b-red-400 border-l-red-300",
  warning:
    "border-t-amber-600 border-r-amber-500 border-b-amber-400 border-l-amber-300",
  info: "border-t-cyan-600 border-r-cyan-500 border-b-cyan-400 border-l-cyan-300",
  light:
    "border-t-gray-400 border-r-gray-300 border-b-gray-200 border-l-gray-100",
  dark: "border-t-gray-700 border-r-gray-600 border-b-gray-500 border-l-gray-400",
};

const sciFiVariantClasses = {
  primary: "from-blue-500 to-cyan-400",
  secondary: "from-purple-500 to-pink-400",
  success: "from-emerald-500 to-green-400",
  danger: "from-red-500 to-orange-400",
  warning: "from-amber-500 to-yellow-400",
  info: "from-cyan-500 to-blue-400",
  light: "from-gray-400 to-gray-300",
  dark: "from-gray-600 to-gray-500",
};

const getMessageClasses = (variant: string, isDark: boolean) => {
  const baseClasses = {
    primary: "text-blue-600",
    secondary: "text-purple-600",
    success: "text-emerald-600",
    danger: "text-red-600",
    warning: "text-amber-600",
    info: "text-cyan-600",
    light: isDark ? "text-gray-300" : "text-gray-600",
    dark: isDark ? "text-gray-400" : "text-gray-800",
  };
  return (
    baseClasses[variant as keyof typeof baseClasses] || baseClasses.primary
  );
};

const SciFiSpinner: React.FC<{
  size: string;
  variant: string;
  className?: string;
}> = ({ size, variant, className = "" }) => {
  const sizeClass = sciFiSizeClasses[size as keyof typeof sciFiSizeClasses];
  const gradientClass =
    sciFiVariantClasses[variant as keyof typeof sciFiVariantClasses];

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Outer rotating ring */}
      <div className="absolute inset-0 animate-spin">
        <div
          className={`w-full h-full rounded-full border-2 border-transparent bg-gradient-to-r ${gradientClass} opacity-60`}
          style={{
            background: `conic-gradient(from 0deg, transparent, var(--tw-gradient-stops))`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
          }}
        ></div>
      </div>

      {/* Inner pulsing core */}
      <div className="absolute inset-2 animate-pulse">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-r ${gradientClass} opacity-80 blur-sm`}
        ></div>
      </div>

      {/* Center dot */}
      <div className="absolute inset-1/3 animate-ping">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-r ${gradientClass}`}
        ></div>
      </div>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradientClass} opacity-20 blur-md animate-pulse`}
      ></div>
    </div>
  );
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "primary",
  message,
  fullScreen = false,
  showOverlay = false,
  className = "",
  sciFi = false,
}) => {
  const { isDark } = useTheme();

  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center";

  const overlayClass = showOverlay
    ? getThemedClasses(
        isDark,
        "bg-white/80 backdrop-blur-sm",
        "bg-gray-900/80 backdrop-blur-sm"
      )
    : "";

  if (sciFi) {
    return (
      <div className={`${containerClass} ${overlayClass} ${className}`}>
        <SciFiSpinner size={size} variant={variant} />

        {message && (
          <div className="mt-6 text-center">
            <p
              className={`font-medium text-sm tracking-wide ${getMessageClasses(
                variant,
                isDark
              )}`}
            >
              {message}
            </p>
            {/* Animated dots */}
            <div className="flex justify-center mt-2 space-x-1">
              <div
                className={`w-1 h-1 rounded-full bg-gradient-to-r ${
                  sciFiVariantClasses[
                    variant as keyof typeof sciFiVariantClasses
                  ]
                } animate-pulse`}
              ></div>
              <div
                className={`w-1 h-1 rounded-full bg-gradient-to-r ${
                  sciFiVariantClasses[
                    variant as keyof typeof sciFiVariantClasses
                  ]
                } animate-pulse`}
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className={`w-1 h-1 rounded-full bg-gradient-to-r ${
                  sciFiVariantClasses[
                    variant as keyof typeof sciFiVariantClasses
                  ]
                } animate-pulse`}
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${containerClass} ${overlayClass} ${className}`}>
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-50 ${variantClasses[variant]}`}
        ></div>

        {/* Spinner */}
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} shadow-lg`}
        ></div>
      </div>

      {message && (
        <div className="mt-4 text-center">
          <p className={`font-medium ${getMessageClasses(variant, isDark)}`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

// Preset spinner variants
export const FullPageSpinner: React.FC<{
  message?: string;
  sciFi?: boolean;
}> = ({ message, sciFi = true }) => {
  return (
    <LoadingSpinner
      size="lg"
      fullScreen={true}
      showOverlay={true}
      message={message || "Loading content..."}
      sciFi={sciFi}
      variant="primary"
    />
  );
};

export const ButtonSpinner: React.FC<{
  variant?: LoadingSpinnerProps["variant"];
  sciFi?: boolean;
}> = ({ variant = "light", sciFi = false }) => (
  <LoadingSpinner
    size="xs"
    variant={variant}
    className="m-0 p-0"
    sciFi={sciFi}
  />
);

export const InlineSpinner: React.FC<{
  message?: string;
  variant?: LoadingSpinnerProps["variant"];
  sciFi?: boolean;
}> = ({ message, variant = "primary", sciFi = true }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <LoadingSpinner size="sm" variant={variant} sciFi={sciFi} />
      {message && (
        <span
          className={`text-sm font-medium tracking-wide ${getMessageClasses(
            variant,
            isDark
          )}`}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
