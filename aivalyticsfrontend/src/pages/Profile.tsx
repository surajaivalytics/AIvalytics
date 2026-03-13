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
  EnvelopeIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import apiService from "../services/api";
// import Layout from "../components/Layout";
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
      console.log("Fetching profile data...", { retryCount });
      console.log("Current user from context:", user);
      console.log("Access token:", localStorage.getItem("accessToken"));

      const response = await apiService.getProfile();
      console.log("Profile response:", response);
      if (response.success && response.user) {
        setProfile(response.user);
        setEditForm({
          username: response.user.username || "",
          rollNumber: response.user.rollNumber || "",
        });
        console.log("Profile data loaded successfully:", response.user);
      } else {
        console.error("Profile response missing user data:", response);
        toast.error("Failed to load profile data - invalid response");
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        retryCount,
      });

      // If it's an authentication error, the token might be invalid or profile missing
      if (error.response?.status === 401) {
        const errorCode = error.response?.data?.code;
        if (errorCode === "PROFILE_NOT_FOUND") {
          console.log("Profile not found in backend - user may need to re-sync or complete setup");
          toast.error("User profile not found. Please try logging out and in again.");
        } else {
          console.log("Authentication failed - likely invalid token");
          toast.error("Session expired or invalid. Please refresh.");
        }
      } else if (error.response?.status >= 500 && retryCount < 2) {
        // Retry on server errors (up to 2 retries)
        console.log(`Server error, retrying... (attempt ${retryCount + 1})`);
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

    // Validation
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
      console.log("Updating profile with data:", editForm);

      const response = await apiService.updateProfile(editForm);
      console.log("Profile update response:", response);

      if (response.success) {
        // Refetch the profile to get the latest data
        await fetchProfile();
        setEditing(false);
        toast.success("Profile updated successfully");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      console.error("Update error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Failed to update profile";

      // Handle specific error types
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

      // Handle validation errors
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

    // Validation
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
      console.error("Failed to change password:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);

      // Handle validation errors
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
        return "from-blue-500 to-cyan-500";
      case "teacher":
        return "from-green-500 to-emerald-500";
      case "hod":
        return "from-purple-500 to-violet-500";
      case "principal":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return "👨‍🎓";
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
      <div className={`min-h-screen flex justify-center items-center ${
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
      <div className={`min-h-screen flex justify-center items-center ${getThemedClasses(
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

  return (
    <>
      <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        getThemedClasses(
          isDark,
          "bg-gray-50",
          "bg-gray-900"
        )
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className={`mb-8 ${
            getThemedClasses(
              isDark,
              "bg-white shadow-sm",
              "bg-gray-800"
            )
          } rounded-xl p-6`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 ${
                    profile?.role === "student" ? "border-blue-400" :
                    profile?.role === "teacher" ? "border-emerald-400" :
                    profile?.role === "hod" ? "border-purple-400" :
                    "border-gray-400"
                  }`}>
                    {profile?.profilePic ? (
                      <img 
                        src={profile.profilePic} 
                        alt={profile.username} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile?.username}&background=random`;
                        }}
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${
                        profile?.role === "student" ? "from-blue-500 to-indigo-600" :
                        profile?.role === "teacher" ? "from-emerald-500 to-green-600" :
                        profile?.role === "hod" ? "from-purple-500 to-violet-600" :
                        "from-gray-500 to-gray-600"
                      } flex items-center justify-center`}>
                        <span className="text-4xl">{getRoleIcon(profile?.role || "unknown")}</span>
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-7 w-7 bg-green-500 rounded-full border-2 ${
                    getThemedClasses(isDark, "border-white", "border-gray-800")
                  } flex items-center justify-center shadow-sm`}>
                    <div className="h-2.5 w-2.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div>
                  <h1 className={`text-2xl font-bold mb-2 ${
                    getThemedClasses(isDark, "text-gray-900", "text-white")
                  }`}>
                    {profile?.username || "User Profile"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getThemedClasses(
                        isDark,
                        "bg-primary-50 text-primary-700",
                        "bg-primary-900/30 text-primary-400"
                      )
                    }`}>
                      <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
                      {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Unknown Role"}
                    </span>
                    <span className={`text-sm ${
                      getThemedClasses(isDark, "text-gray-500", "text-gray-400")
                    }`}>
                      Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setChangingPassword(true)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    getThemedClasses(
                      isDark,
                      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                      "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                    )
                  }`}
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          username: profile?.username || "",
                          rollNumber: profile?.rollNumber || "",
                        });
                        setErrors({});
                      }}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        getThemedClasses(
                          isDark,
                          "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                          "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                        )
                      }`}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSubmit}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className={`${
            getThemedClasses(
              isDark,
              "bg-white shadow-sm",
              "bg-gray-800"
            )
          } rounded-xl p-6`}>
            {editing ? (
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className={`block text-sm font-medium mb-2 ${
                        getThemedClasses(isDark, "text-gray-700", "text-gray-300")
                      }`}
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className={`h-5 w-5 ${
                          getThemedClasses(isDark, "text-gray-400", "text-gray-500")
                        }`} />
                      </div>
                      <input
                        type="text"
                        id="username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          getThemedClasses(
                            isDark,
                            "bg-white border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500",
                            "bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500"
                          )
                        } ${errors.username ? "border-red-500" : ""}`}
                        placeholder="Enter username"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="rollNumber"
                      className={`block text-sm font-medium mb-2 ${
                        getThemedClasses(isDark, "text-gray-700", "text-gray-300")
                      }`}
                    >
                      Roll Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className={`h-5 w-5 ${
                          getThemedClasses(isDark, "text-gray-400", "text-gray-500")
                        }`} />
                      </div>
                      <input
                        type="text"
                        id="rollNumber"
                        value={editForm.rollNumber}
                        onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                        className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          getThemedClasses(
                            isDark,
                            "bg-white border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500",
                            "bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500"
                          )
                        } ${errors.rollNumber ? "border-red-500" : ""}`}
                        placeholder="Enter roll number"
                      />
                    </div>
                    {errors.rollNumber && (
                      <p className="mt-2 text-sm text-red-500">{errors.rollNumber}</p>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProfileCard
                  icon={<UserIcon className="h-6 w-6 text-primary-500" />}
                  title="Username"
                  value={profile?.username || "N/A"}
                  isDark={isDark}
                />
                <ProfileCard
                  icon={<IdentificationIcon className="h-6 w-6 text-green-500" />}
                  title="Roll Number"
                  value={profile?.rollNumber || "N/A"}
                  isDark={isDark}
                />
                <ProfileCard
                  icon={<ShieldCheckIcon className="h-6 w-6 text-purple-500" />}
                  title="Role"
                  value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "N/A"}
                  isDark={isDark}
                />
                <ProfileCard
                  icon={<CalendarIcon className="h-6 w-6 text-blue-500" />}
                  title="Member Since"
                  value={profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                  isDark={isDark}
                />
                <ProfileCard
                  icon={<ClockIcon className="h-6 w-6 text-amber-500" />}
                  title="Last Updated"
                  value={profile?.updatedAt ? formatDate(profile.updatedAt) : "N/A"}
                  isDark={isDark}
                />
                {profile?.class && (
                  <ProfileCard
                    icon={<BuildingLibraryIcon className="h-6 w-6 text-indigo-500" />}
                    title="Department"
                    value={profile.class.department || "N/A"}
                    isDark={isDark}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {changingPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md rounded-xl shadow-xl ${
              getThemedClasses(
                isDark,
                "bg-white",
                "bg-gray-800"
              )
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                      <KeyIcon className="h-5 w-5 text-primary-500" />
                    </div>
                    <h3 className={`text-xl font-semibold ${
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
                    className={`rounded-lg p-1 hover:bg-gray-100 ${
                      getThemedClasses(
                        isDark,
                        "text-gray-400 hover:text-gray-500",
                        "text-gray-500 hover:text-gray-400 hover:bg-gray-700"
                      )
                    }`}
                  >
                    <XMarkIcon className="h-6 w-6" />
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
                    label="Confirm New Password"
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

                  <div className="flex justify-end gap-3 pt-4">
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        getThemedClasses(
                          isDark,
                          "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
                          "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                        )
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all duration-200"
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
    </>
  );
};

// Profile Card Component
interface ProfileCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  isDark: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ icon, title, value, isDark }) => {
  return (
    <div className={`rounded-lg p-4 border ${
      getThemedClasses(
        isDark,
        "bg-gray-50 border-gray-200",
        "bg-gray-700/50 border-gray-600"
      )
    }`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className={`text-sm font-medium ${
          getThemedClasses(isDark, "text-gray-600", "text-gray-300")
        }`}>
          {title}
        </h3>
      </div>
      <p className={`text-lg font-semibold ${
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LockClosedIcon className={`h-5 w-5 ${
            getThemedClasses(isDark, "text-gray-400", "text-gray-500")
          }`} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          className={`block w-full pl-10 pr-12 py-2.5 rounded-lg border ${
            getThemedClasses(
              isDark,
              "bg-white border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500",
              "bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500"
            )
          } ${error ? "border-red-500" : ""}`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeSlashIcon className={`h-5 w-5 ${
              getThemedClasses(isDark, "text-gray-400", "text-gray-500")
            }`} />
          ) : (
            <EyeIcon className={`h-5 w-5 ${
              getThemedClasses(isDark, "text-gray-400", "text-gray-500")
            }`} />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Profile;
