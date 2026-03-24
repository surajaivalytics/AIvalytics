import React from "react";
import { Toaster } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

const ThemedToaster: React.FC = () => {
 const { isDark } = useTheme();

 return (
 <Toaster
 position="top-right"
 toastOptions={{
 duration: 4000,
 style: {
 background: isDark ? "#374151" : "#ffffff",
 color: isDark ? "#ffffff" : "#111827",
 border: isDark ? "1px solid #4B5563" : "1px solid #E5E7EB",
 borderRadius: "8px",
 boxShadow: isDark
 ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
 : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
 },
 success: {
 duration: 3000,
 style: {
 background: "#10B981",
 color: "#ffffff",
 border: "1px solid #059669",
 },
 iconTheme: {
 primary: "#ffffff",
 secondary: "#10B981",
 },
 },
 error: {
 duration: 5000,
 style: {
 background: "#EF4444",
 color: "#ffffff",
 border: "1px solid #DC2626",
 },
 iconTheme: {
 primary: "#ffffff",
 secondary: "#EF4444",
 },
 },
 loading: {
 style: {
 background: isDark ? "#374151" : "#ffffff",
 color: isDark ? "#ffffff" : "#111827",
 border: isDark ? "1px solid #6366F1" : "1px solid #6366F1",
 },
 iconTheme: {
 primary: "#6366F1",
 secondary: isDark ? "#374151" : "#ffffff",
 },
 },
 }}
 />
 );
};

export default ThemedToaster;
