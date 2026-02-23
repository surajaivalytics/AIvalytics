import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        transition-all duration-300 ease-in-out
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDark
            ? "focus:ring-yellow-400 focus:ring-offset-gray-900"
            : "focus:ring-blue-500 focus:ring-offset-white"
        }
        shadow-lg hover:shadow-xl transform hover:scale-105
      `}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative">
        {/* Sun Icon */}
        <SunIcon
          className={`
            h-5 w-5 absolute inset-0 transition-all duration-300 ease-in-out
            ${
              isDark
                ? "opacity-0 rotate-90 scale-0"
                : "opacity-100 rotate-0 scale-100"
            }
          `}
        />

        {/* Moon Icon */}
        <MoonIcon
          className={`
            h-5 w-5  inset-0 transition-all duration-300 ease-in-out
            ${
              isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0"
            }
          `}
        />
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div
          className={`
          absolute inset-0 rounded-lg transition-all duration-200
          ${
            isDark
              ? "bg-yellow-400/10 hover:bg-yellow-400/20"
              : "bg-blue-500/10 hover:bg-blue-500/20"
          }
          opacity-0 hover:opacity-100
        `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
