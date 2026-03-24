import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
 UserIcon,
 PencilIcon,
 CheckIcon,
 XMarkIcon,
 EyeIcon,
 EyeSlashIcon,
 KeyIcon,
 IdentificationIcon,
 CalendarIcon,
 ShieldCheckIcon,
 ClockIcon,
 LockClosedIcon,
 BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import apiService from "../services/api";
import { useNavigate } from "react-router-dom";

interface ProfileData {
 id: string;
 username: string;
 role: string;
 rollNumber: string;
 createdAt?: string;
 updatedAt?: string;
 email?: string;
 age?: number;
 profilePic?: string;
 class?: {
 id: string;
 name: string;
 department?: string;
 };
}

interface UpdateProfileData {
 username: string;
 rollNumber: string;
}

interface ChangePasswordData {
 currentPassword: string;
 newPassword: string;
 confirmPassword: string;
}

const Profile: React.FC = () => {
 const { user } = useAuth();
 const { isDark } = useTheme();
 const [profile, setProfile] = useState<ProfileData | null>(null);
 const [loading, setLoading] = useState(true);
 const [editing, setEditing] = useState(false);
 const [changingPassword, setChangingPassword] = useState(false);
 const [showCurrentPassword, setShowCurrentPassword] = useState(false);
 const [showNewPassword, setShowNewPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 const [editForm, setEditForm] = useState<UpdateProfileData>({
 username: "",
 rollNumber: "",
 });

 const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });

 const [errors, setErrors] = useState<Record<string, string>>({});

 const navigate = useNavigate();

 useEffect(() => {
 // Check if user is authenticated
 const token = localStorage.getItem("accessToken");
 if (!token && !user) {
 console.log("No authentication token found, redirecting to login");
 navigate("/login");
 return;
 }

 // Only fetch profile if user is authenticated
 if (user || token) {
 fetchProfile();
 } else {
 console.log("No user or token found, skipping profile fetch");
 setLoading(false);
 }
 }, [user, navigate]);

 const fetchProfile = async (retryCount = 0) => {
 try {
 setLoading(true);
 const response = await apiService.getProfile();
 if (response.success && response.user) {
 setProfile(response.user);
 setEditForm({
 username: response.user.username || "",
 rollNumber: response.user.rollNumber || "",
 });
 } else {
 toast.error("Failed to load profile data - invalid response");
 }
 } catch (error: any) {
 if (error.response?.status === 401) {
 toast.error("Session expired or invalid. Please refresh.");
 } else if (error.response?.status >= 500 && retryCount < 2) {
 setTimeout(() => fetchProfile(retryCount + 1), 1000);
 return;
 } else {
 toast.error("Failed to load profile data");
 }
 } finally {
 setLoading(false);
 }
 };

 const handleEditSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrors({});

 const newErrors: Record<string, string> = {};
 if (!editForm.username.trim()) {
 newErrors.username = "Username is required";
 }
 if (!editForm.rollNumber.trim()) {
 newErrors.rollNumber = "Roll number is required";
 }

 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }

 try {
 setLoading(true);
 const response = await apiService.updateProfile(editForm);

 if (response.success) {
 await fetchProfile();
 setEditing(false);
 toast.success("Profile updated successfully");
 } else {
 throw new Error(response.message || "Failed to update profile");
 }
 } catch (error: any) {
 let errorMessage = "Failed to update profile";
 if (error.response?.status === 401) {
 errorMessage = "Authentication failed. Token may be invalid.";
 } else if (error.response?.status === 409) {
 errorMessage =
 error.response?.data?.message ||
 "Username or roll number already exists";
 } else if (error.response?.data?.message) {
 errorMessage = error.response.data.message;
 } else if (error.message) {
 errorMessage = error.message;
 }
 toast.error(errorMessage);

 if (error.response?.data?.errors) {
 const validationErrors: Record<string, string> = {};
 error.response.data.errors.forEach((err: any) => {
 validationErrors[err.field] = err.message;
 });
 setErrors(validationErrors);
 }
 } finally {
 setLoading(false);
 }
 };

 const handlePasswordSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrors({});

 const newErrors: Record<string, string> = {};
 if (!passwordForm.currentPassword) {
 newErrors.currentPassword = "Current password is required";
 }
 if (!passwordForm.newPassword) {
 newErrors.newPassword = "New password is required";
 }
 if (passwordForm.newPassword !== passwordForm.confirmPassword) {
 newErrors.confirmPassword = "Passwords do not match";
 }
 if (passwordForm.newPassword.length < 8) {
 newErrors.newPassword = "Password must be at least 8 characters long";
 }

 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }

 try {
 setLoading(true);
 const response = await apiService.changePassword({
 currentPassword: passwordForm.currentPassword,
 newPassword: passwordForm.newPassword,
 confirmPassword: passwordForm.confirmPassword,
 });

 if (response.success) {
 setChangingPassword(false);
 setPasswordForm({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });
 toast.success("Password changed successfully");
 }
 } catch (error: any) {
 const errorMessage =
 error.response?.data?.message || "Failed to change password";
 toast.error(errorMessage);

 if (error.response?.data?.errors) {
 const validationErrors: Record<string, string> = {};
 error.response.data.errors.forEach((err: any) => {
 validationErrors[err.field] = err.message;
 });
 setErrors(validationErrors);
 }
 } finally {
 setLoading(false);
 }
 };

 const getRoleColor = (role: string) => {
 switch (role) {
 case "student":
 return "bg-blue-500 ";
 case "teacher":
 return "bg-green-500 ";
 case "hod":
 return "bg-purple-500 ";
 case "principal":
 return "bg-red-500 ";
 default:
 return "bg-gray-500 ";
 }
 };

 const getRoleIcon = (role: string) => {
 switch (role) {
 case "student":
 return "🎓";
 case "teacher":
 return "👨‍🏫";
 case "hod":
 return "👨‍💼";
 case "principal":
 return "👨‍💻";
 default:
 return "👤";
 }
 };

 const formatDate = (dateString?: string) => {
 if (!dateString) return "Unknown";
 return new Date(dateString).toLocaleDateString("en-US", {
 year: "numeric",
 month: "long",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 if (loading && !profile) {
 return (
 <div className={`font-poppins min-h-screen flex justify-center items-center ${
 getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )
 }`}>
 <div className="flex flex-col items-center space-y-4">
 <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
 <p className={getThemedClasses(isDark, "text-gray-600", "text-gray-300")}> 
 Loading profile...
 </p>
 </div>
 </div>
 );
 }

 // Don't render if no token and no user (will redirect)
 const token = localStorage.getItem("accessToken");
 if (!token && !user) {
 return (
 <div className={`font-poppins min-h-screen flex justify-center items-center ${getThemedClasses(
 isDark,
 "bg-gray-50",
 "bg-gray-900"
 )}`}
 >
 <div
 className={`${getThemedClasses(
 isDark,
 "text-gray-600",
 "text-gray-300"
 )}`}
 >
 Redirecting to login...
 </div>
 </div>
 );
 }

 const isEmployee = profile?.role === 'teacher' || profile?.role === 'hod' || profile?.role === 'principal';
 const idLabel = isEmployee ? "Employee ID" : "Roll Number";

 return (
 <div className={`font-poppins min-h-screen pb-12 mt-32 ${getThemedClasses(isDark, "bg-gray-50", "bg-[#0B0F19]")}`}>
 {/* Premium Banner */}
 {/* <div className={`h-64 w-full relative overflow-hidden ${
 profile?.role === "student" ? "bg-blue-600" :
 profile?.role === "teacher" ? "bg-emerald-600" :
 profile?.role === "hod" ? "bg-purple-600" :
 profile?.role === "principal" ? "bg-rose-600" :
 "bg-gray-700"
 }`}>
 <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] mix-blend-overlay"></div> */}
 {/* Animated Orbs */}
 {/* <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
 <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
 </div> */}

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10 w-full animate-in fade-in slide-in-bg-bottom-8 duration-700">
 {/* Profile Header Card */}
 <div className={`mb-8 ${getThemedClasses(isDark, "bg-white/80 backdrop-blur-2xl shadow-xl ring-1 ring-black/5", "bg-gray-800/80 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10")} rounded-3xl p-6 sm:p-10 transition-all duration-300`}>
 <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
 <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
 <div className="relative group">
 <div className={`h-36 w-36 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl ring-4 ${getThemedClasses(isDark, "ring-white", "ring-gray-800")} transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]`}>
 {profile?.profilePic ? (
 <img 
 src={profile.profilePic} 
 alt={profile.username} 
 className="h-full w-full object-cover"
 referrerPolicy="no-referrer"
 onError={(e) => {
 const target = e.target as HTMLImageElement;
 if (!target.src.includes('ui-avatars.com')) {
 target.src = `https://ui-avatars.com/api/?name=${profile?.username || "User"}&background=random`;
 }
 }}
 />
 ) : (
 <div className={`h-full w-full ${
 profile?.role === "student" ? "bg-blue-500" :
 profile?.role === "teacher" ? "bg-emerald-500" :
 profile?.role === "hod" ? "bg-purple-500" :
 "bg-gray-500"
 } flex items-center justify-center`}>
 <span className="text-5xl">{getRoleIcon(profile?.role || "unknown")}</span>
 </div>
 )}
 </div>
 <div className={`absolute -bottom-2 -right-2 h-10 w-10 bg-green-500 rounded-full ring-4 ${getThemedClasses(isDark, "ring-white", "ring-gray-800")} flex items-center justify-center shadow-xl`}>
 <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
 </div>
 </div>
 
 <div className="pt-2 md:pt-4">
 <h1 className={`text-3xl md:text-4xl font-semibold tracking-wide tracking-tight mb-3 ${getThemedClasses(isDark, "text-gray-900", "text-white")}`}>
 {profile?.username || "User Profile"}
 </h1>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
 <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
 getThemedClasses(
 isDark,
 "bg-primary-50 text-primary-700 ring-1 ring-primary-200",
 "bg-primary-900/40 text-primary-300 ring-1 ring-primary-700/50"
 )
 }`}>
 <ShieldCheckIcon className="h-4 w-4 mr-2" />
 {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Unknown Role"}
 </span>
 <span className={`text-sm font-medium ${getThemedClasses(isDark, "text-gray-500", "text-gray-400")}`}>
 Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Unknown"}
 </span>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto mt-4 md:mt-0">
 <button
 onClick={() => setChangingPassword(true)}
 className={`flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
 getThemedClasses(
 isDark,
 "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5",
 "bg-gray-800/80 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:shadow-md hover:-translate-y-0.5"
 )
 }`}
 >
 <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
 Change Password
 </button>
 
 {!editing ? (
 <button
 onClick={() => setEditing(true)}
 className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ring-1 ring-primary-500/50"
 >
 <PencilIcon className="h-4 w-4 mr-2 text-white/80" />
 Edit Profile
 </button>
 ) : (
 <div className="flex flex-col sm:flex-row flex-1 md:flex-none gap-3 w-full md:w-auto">
 <button
 onClick={() => {
 setEditing(false);
 setEditForm({
 username: profile?.username || "",
 rollNumber: profile?.rollNumber || "",
 });
 setErrors({});
 }}
 className={`flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
 getThemedClasses(
 isDark,
 "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5",
 "bg-gray-800/80 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:-translate-y-0.5"
 )
 }`}
 >
 <XMarkIcon className="h-4 w-4 mr-2 text-gray-400" />
 Cancel
 </button>
 <button
 onClick={handleEditSubmit}
 disabled={loading}
 className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ring-1 ring-emerald-500/50"
 >
 <CheckIcon className="h-4 w-4 mr-2 text-white/80" />
 {loading ? "Saving..." : "Save Changes"}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Profile Content */}
 <div className={`will-change-transform ${
 getThemedClasses(
 isDark,
 "bg-white/70 backdrop-blur-2xl shadow-xl ring-1 ring-black/5",
 "bg-gray-800/70 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10"
 )
 } rounded-3xl p-6 sm:p-10 transition-all duration-500 animate-in fade-in slide-in-bg-bottom-8`} style={{ animationDelay: '150ms' }}>
 {editing ? (
 <form onSubmit={handleEditSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <label
 htmlFor="username"
 className={`block text-sm font-medium mb-2 ${
 getThemedClasses(isDark, "text-gray-700", "text-gray-300")
 }`}
 >
 Username
 </label>
 <div className="relative group">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
 <UserIcon className={`h-5 w-5 ${
 getThemedClasses(isDark, "text-gray-400", "text-gray-500")
 } group-focus-within:text-primary-500 transition-colors`} />
 </div>
 <input
 type="text"
 id="username"
 value={editForm.username}
 onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
 className={`block w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 ring-inset transition-all duration-300 ${
 getThemedClasses(
 isDark,
 "bg-white ring-gray-200 text-gray-900 focus:ring-2 focus:ring-primary-500 shadow-sm hover:ring-gray-300",
 "bg-gray-900/50 ring-gray-700 text-white focus:ring-2 focus:ring-primary-500 shadow-inner hover:ring-gray-600"
 )
 } ${errors.username ? "ring-2 ring-red-500" : ""}`}
 placeholder="Enter username"
 />
 </div>
 {errors.username && (
 <p className="mt-2 text-sm font-medium text-red-500 animate-in slide-in-bg-left-1">{errors.username}</p>
 )}
 </div>

 <div>
 <label
 htmlFor="rollNumber"
 className={`block text-sm font-medium mb-2 ${
 getThemedClasses(isDark, "text-gray-700", "text-gray-300")
 }`}
 >
 {idLabel}
 </label>
 <div className="relative group">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
 <IdentificationIcon className={`h-5 w-5 ${
 getThemedClasses(isDark, "text-gray-400", "text-gray-500")
 } group-focus-within:text-primary-500 transition-colors`} />
 </div>
 <input
 type="text"
 id="rollNumber"
 value={editForm.rollNumber}
 onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
 className={`block w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 ring-inset transition-all duration-300 ${
 getThemedClasses(
 isDark,
 "bg-white ring-gray-200 text-gray-900 focus:ring-2 focus:ring-primary-500 shadow-sm hover:ring-gray-300",
 "bg-gray-900/50 ring-gray-700 text-white focus:ring-2 focus:ring-primary-500 shadow-inner hover:ring-gray-600"
 )
 } ${errors.rollNumber ? "ring-2 ring-red-500" : ""}`}
 placeholder={`Enter ${idLabel.toLowerCase()}`}
 />
 </div>
 {errors.rollNumber && (
 <p className="mt-2 text-sm font-medium text-red-500 animate-in slide-in-bg-left-1">{errors.rollNumber}</p>
 )}
 </div>
 </div>
 </form>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
 <ProfileCard
 icon={<UserIcon className="h-6 w-6 text-blue-500" />}
 title="Username"
 value={profile?.username || "N/A"}
 isDark={isDark}
 bgClass=" dark:"
 />
 <ProfileCard
 icon={<IdentificationIcon className="h-6 w-6 text-emerald-500" />}
 title={idLabel}
 value={profile?.rollNumber || "N/A"}
 isDark={isDark}
 bgClass="bg-emerald-500/10 dark:bg-emerald-500/20"
 />
 <ProfileCard
 icon={<ShieldCheckIcon className="h-6 w-6 text-purple-500" />}
 title="Role"
 value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "N/A"}
 isDark={isDark}
 bgClass=" dark:"
 />
 <ProfileCard
 icon={<CalendarIcon className="h-6 w-6 text-indigo-500" />}
 title="Member Since"
 value={profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
 isDark={isDark}
 bgClass=" dark:"
 />
 <ProfileCard
 icon={<ClockIcon className="h-6 w-6 text-amber-500" />}
 title="Last Updated"
 value={profile?.updatedAt ? formatDate(profile.updatedAt) : "N/A"}
 isDark={isDark}
 bgClass="bg-amber-500/10 dark:bg-amber-500/20"
 />
 {profile?.class && (
 <ProfileCard
 icon={<BuildingLibraryIcon className="h-6 w-6 text-rose-500" />}
 title="Department"
 value={profile.class.department || "N/A"}
 isDark={isDark}
 bgClass="bg-rose-500/10 dark:bg-rose-500/20"
 />
 )}
 </div>
 )}
 </div>
 </div>

 {/* Password Change Modal */}
 {changingPassword && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
 <div className={`w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-bg-bottom-4 duration-300 ${
 getThemedClasses(
 isDark,
 "bg-white ring-1 ring-black/5",
 "bg-gray-800 ring-1 ring-white/10"
 )
 }`}>
 <div className="p-8">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-2xl bg-primary-500/10 flex items-center justify-center rotate-3 border border-primary-500/20 shadow-sm">
 <KeyIcon className="h-6 w-6 text-primary-500 -rotate-3" />
 </div>
 <h3 className={`text-2xl font-semibold tracking-wide tracking-tight ${
 getThemedClasses(isDark, "text-gray-900", "text-white")
 }`}>
 Change Password
 </h3>
 </div>
 <button
 onClick={() => {
 setChangingPassword(false);
 setPasswordForm({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });
 setErrors({});
 }}
 className={`rounded-full p-2.5 transition-all duration-200 ${
 getThemedClasses(
 isDark,
 "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
 "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
 )
 }`}
 >
 <XMarkIcon className="h-5 w-5" />
 </button>
 </div>

 <form onSubmit={handlePasswordSubmit} className="space-y-6">
 <PasswordInput
 id="currentPassword"
 label="Current Password"
 value={passwordForm.currentPassword}
 onChange={(e) => setPasswordForm({
 ...passwordForm,
 currentPassword: e.target.value,
 })}
 showPassword={showCurrentPassword}
 onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
 error={errors.currentPassword}
 isDark={isDark}
 />

 <PasswordInput
 id="newPassword"
 label="New Password"
 value={passwordForm.newPassword}
 onChange={(e) => setPasswordForm({
 ...passwordForm,
 newPassword: e.target.value,
 })}
 showPassword={showNewPassword}
 onTogglePassword={() => setShowNewPassword(!showNewPassword)}
 error={errors.newPassword}
 isDark={isDark}
 />

 <PasswordInput
 id="confirmPassword"
 label="Confirm Password"
 value={passwordForm.confirmPassword}
 onChange={(e) => setPasswordForm({
 ...passwordForm,
 confirmPassword: e.target.value,
 })}
 showPassword={showConfirmPassword}
 onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
 error={errors.confirmPassword}
 isDark={isDark}
 />

 <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-100 dark:border-gray-700/50">
 <button
 type="button"
 onClick={() => {
 setChangingPassword(false);
 setPasswordForm({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });
 setErrors({});
 }}
 className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
 getThemedClasses(
 isDark,
 "bg-white text-gray-700 hover:bg-gray-100",
 "bg-gray-800 text-gray-300 hover:bg-gray-700"
 )
 }`}
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300 ring-1 ring-primary-500/50"
 >
 {loading ? "Changing..." : "Change Password"}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

// Profile Card Component
interface ProfileCardProps {
 icon: React.ReactNode;
 title: string;
 value: string;
 isDark: boolean;
 bgClass?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ icon, title, value, isDark, bgClass = "bg-primary-500/10" }) => {
 return (
 <div className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
 getThemedClasses(
 isDark,
 "bg-white border border-gray-100 shadow-sm",
 "bg-gray-800/80 border border-gray-700/50 shadow-md"
 )
 }`}>
 <div className="flex items-center gap-4 mb-4">
 <div className={`p-3 rounded-xl ${bgClass} transition-all duration-300 group-hover:scale-110`}>
 {icon}
 </div>
 <h3 className={`text-xs font-medium tracking-widest uppercase ${
 getThemedClasses(isDark, "text-gray-500", "text-gray-400")
 }`}>
 {title}
 </h3>
 </div>
 <p className={`text-2xl font-semibold tracking-wide tracking-tight pl-1 ${
 getThemedClasses(isDark, "text-gray-900", "text-white")
 }`}>
 {value}
 </p>
 </div>
 );
};

// Password Input Component
interface PasswordInputProps {
 id: string;
 label: string;
 value: string;
 onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 showPassword: boolean;
 onTogglePassword: () => void;
 error?: string;
 isDark: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
 id,
 label,
 value,
 onChange,
 showPassword,
 onTogglePassword,
 error,
 isDark,
}) => {
 return (
 <div>
 <label
 htmlFor={id}
 className={`block text-sm font-medium mb-2 ${
 getThemedClasses(isDark, "text-gray-700", "text-gray-300")
 }`}
 >
 {label}
 </label>
 <div className="relative group">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
 <LockClosedIcon className={`h-5 w-5 ${
 getThemedClasses(isDark, "text-gray-400", "text-gray-500")
 } group-focus-within:text-primary-500 transition-colors`} />
 </div>
 <input
 type={showPassword ? "text" : "password"}
 id={id}
 value={value}
 onChange={onChange}
 className={`block w-full pl-12 pr-12 py-3.5 rounded-xl border-0 ring-1 ring-inset transition-all duration-300 ${
 getThemedClasses(
 isDark,
 "bg-white ring-gray-200 text-gray-900 focus:ring-2 focus:ring-primary-500 shadow-sm hover:ring-gray-300",
 "bg-gray-900/50 ring-gray-700 text-white focus:ring-2 focus:ring-primary-500 shadow-inner hover:ring-gray-600"
 )
 } ${error ? "ring-2 ring-red-500" : ""}`}
 placeholder={`Enter ${label.toLowerCase()}`}
 />
 <button
 type="button"
 onClick={onTogglePassword}
 className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
 getThemedClasses(isDark, "text-gray-400 hover:text-gray-700", "text-gray-500 hover:text-gray-300")
 }`}
 >
 {showPassword ? (
 <EyeSlashIcon className="h-5 w-5" />
 ) : (
 <EyeIcon className="h-5 w-5" />
 )}
 </button>
 </div>
 {error && (
 <p className="mt-2 text-sm font-medium text-red-500 animate-in slide-in-bg-left-1">{error}</p>
 )}
 </div>
 );
};

export default Profile;
