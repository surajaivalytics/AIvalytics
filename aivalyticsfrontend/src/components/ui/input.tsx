import React, { forwardRef, useState } from "react";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success = false,
      icon,
      rightIcon,
      onRightIconClick,
      containerClassName = "",
      labelClassName = "",
      errorClassName = "",
      className = "",
      hint,
      onFocus,
      onBlur,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    };

    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-") || "field"}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const getInputClasses = () => {
      const baseClasses = `block w-full ${
        icon ? "pl-12" : "pl-4"
      } ${
        rightIcon || (success && !error) ? "pr-12" : "pr-4"
      } py-3.5 text-sm rounded-xl placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        props.disabled ? "opacity-50 cursor-not-allowed" : ""
      }`;

      if (error) {
        return `${baseClasses} border-2 border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 dark:focus:border-red-400`;
      }

      if (success) {
        return `${baseClasses} border-2 border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/20 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400`;
      }

      if (isFocused) {
        return `${baseClasses} border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm`;
      }

      return `${baseClasses} border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400`;
    };

    const getIconColor = () => {
      if (error) return "text-red-500 dark:text-red-400";
      if (success) return "text-green-500 dark:text-green-400";
      if (isFocused) return "text-blue-600 dark:text-blue-400";
      return "text-gray-400 dark:text-gray-500";
    };

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200 ${labelClassName}`}
          >
            {label}
            {props.required && (
              <span className="text-red-500 dark:text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${getIconColor()}`}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={getInputClasses()}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            aria-required={props.required}
            {...props}
          />

          {success && !error && !rightIcon && (
            <div
              className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
          )}

          {rightIcon && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md"
              onClick={onRightIconClick}
              aria-label={props.type === "password" ? "Toggle password visibility" : "Toggle visibility"}
              tabIndex={0}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {hint && !error && (
          <p
            id={hintId}
            className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200"
          >
            {hint}
          </p>
        )}

        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
          >
            <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export default Input;
