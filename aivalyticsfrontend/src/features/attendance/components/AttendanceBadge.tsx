import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";

interface AttendanceBadgeProps {
 status: "present" | "absent" | "late" | "excused";
 size?: "sm" | "md" | "lg";
 showIcon?: boolean;
 showText?: boolean;
 variant?: "solid" | "outline" | "soft";
 className?: string;
}

const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({
 status,
 size = "md",
 showIcon = true,
 showText = true,
 variant = "solid",
 className = "",
}) => {
 const { theme } = useTheme();

 const statusConfig = {
 present: {
 label: "Present",
 icon: "✓",
 colors: {
 solid: "bg-green-500 text-white",
 outline: "border-green-500 text-green-500 bg-transparent",
 soft:
 theme === "dark"
 ? "bg-green-900 text-green-300"
 : "bg-green-100 text-green-800",
 },
 },
 absent: {
 label: "Absent",
 icon: "✗",
 colors: {
 solid: "bg-red-500 text-white",
 outline: "border-red-500 text-red-500 bg-transparent",
 soft:
 theme === "dark"
 ? "bg-red-900 text-red-300"
 : "bg-red-100 text-red-800",
 },
 },
 late: {
 label: "Late",
 icon: "⏰",
 colors: {
 solid: "bg-yellow-500 text-white",
 outline: "border-yellow-500 text-yellow-500 bg-transparent",
 soft:
 theme === "dark"
 ? "bg-yellow-900 text-yellow-300"
 : "bg-yellow-100 text-yellow-800",
 },
 },
 excused: {
 label: "Excused",
 icon: "📋",
 colors: {
 solid: "bg-blue-500 text-white",
 outline: "border-blue-500 text-blue-500 bg-transparent",
 soft:
 theme === "dark"
 ? "bg-blue-900 text-blue-300"
 : "bg-blue-100 text-blue-800",
 },
 },
 };

 const sizeConfig = {
 sm: {
 padding: "px-2 py-1",
 text: "text-xs",
 icon: "text-xs",
 },
 md: {
 padding: "px-3 py-1",
 text: "text-sm",
 icon: "text-sm",
 },
 lg: {
 padding: "px-4 py-2",
 text: "text-base",
 icon: "text-base",
 },
 };

 const config = statusConfig[status];
 const sizeStyles = sizeConfig[size];
 const colorStyles = config.colors[variant];

 return (
 <span
 className={`
 inline-flex items-center space-x-1 rounded-full font-medium
 ${sizeStyles.padding}
 ${sizeStyles.text}
 ${colorStyles}
 ${variant === "outline" ? "border" : ""}
 ${className}
 `}
 >
 {showIcon && <span className={sizeStyles.icon}>{config.icon}</span>}
 {showText && <span>{config.label}</span>}
 </span>
 );
};

export default AttendanceBadge;
