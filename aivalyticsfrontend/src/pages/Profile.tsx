import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  LockClosedIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getThemedClasses } from "../utils/themeUtils";
import apiService from "../services/api";
import { useNavigate, Link } from "react-router-dom";

// Standardizing missing icons
import { MapPin as MapPinIcon, Award as AwardIcon } from "lucide-react"; 

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
  const [activeTab, setActiveTab] = useState("Overview");
  
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
    const token = localStorage.getItem("accessToken");
    if (!token && !user) {
      navigate("/login");
      return;
    }
    if (user || token) {
      fetchProfile();
    } else {
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
        toast.error("Failed to load profile data");
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
    if (!editForm.username.trim()) newErrors.username = "Username is required";
    if (!editForm.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
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
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = "Required";
    if (!passwordForm.newPassword) newErrors.newPassword = "Required";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (passwordForm.newPassword.length < 8) newErrors.newPassword = "At least 8 characters";
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
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password changed successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className={`font-poppins min-h-screen flex justify-center items-center ${getThemedClasses(isDark, "bg-gray-50", "bg-gray-900")}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const token = localStorage.getItem("accessToken");
  if (!token && !user) return null;

  // Real or Display Mocks
  const displayName = profile?.username || "Alex Thompson";
  const title = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Associate Professor";
  const department = profile?.class?.department || "Computer Science";
  const email = profile?.email || "teacher@example.com";
  
  // Specific mock elements per user request
  const experience = "8 years Experience";
  const phone = "+1 (555) 123-4567";
  const room = "Room 204, Engineering Block";
  const teachingRating = "4.7/5.0";

  const mockResearch = {
    publications: [
      { id: 1, title: 'Advanced Machine Learning Techniques in Educational Analytics', source: 'Journal of Educational Technology (2024)', status: 'Published' },
      { id: 2, title: 'Predictive Models for Student Performance Assessment', source: 'IEEE Transactions on Education (2023)', status: 'Published' },
      { id: 3, title: 'AI-Driven Personalized Learning Pathways', source: 'Educational AI Conference (2024)', status: 'Under Review' },
    ],
    projects: [
      { id: 1, name: 'Smart Campus Initiative', year: '2023-2025', status: 'Active', amount: '$150,000' },
      { id: 2, name: 'Student Analytics Platform', year: '2022-2023', status: 'Completed', amount: '$75,000' },
    ],
    grants: [
      { id: 1, name: 'NSF Educational Innovation Grant', amount: '$200,000', year: '2023' },
      { id: 2, name: 'University Research Fund', amount: '$50,000', year: '2022' },
    ]
  };

  const mockProgress = {
    lectureStats: { current: 85, total: 100 },
    certifications: [
      { id: 1, title: 'Advanced Pedagogical Methods', provider: 'Teaching Excellence Center', year: '2024' },
      { id: 2, title: 'AI in Education Certification', provider: 'EdTech Institute', year: '2023' },
      { id: 3, title: 'Research Methodology Workshop', provider: 'Academic Development Unit', year: '2023' }
    ]
  };

  const mockAchievements = [
    { id: 1, title: 'Best Teacher Award', description: 'Excellence in undergraduate teaching', year: '2023' },
    { id: 2, title: 'Research Excellence Award', description: 'Outstanding contribution to research', year: '2022' },
    { id: 3, title: 'Innovation in Education', description: 'Implementation of AI-based learning tools', year: '2021' }
  ];

  return (
    <div className={`font-poppins min-h-screen pb-12 transition-colors duration-300 ${getThemedClasses(isDark, "bg-gray-50", "bg-[#0B0F19]")}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Navigation & Top Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setChangingPassword(true)}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <KeyIcon className="w-4 h-4 mr-2" />
              Change Password
            </button>
            <button 
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 mb-8 p-8 transition-colors">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
            
            {/* Avatar */}
            <div className="relative mb-6 md:mb-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                {profile?.profilePic ? (
                  <img src={profile.profilePic} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              {/* Online Dot */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{displayName}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-semibold rounded-full border border-purple-100 dark:border-purple-800">{title}</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">{department}</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold rounded-full border border-green-100 dark:border-green-800">{experience}</span>
                  </div>
                </div>
                {/* Teaching Rating */}
                <div className="mt-4 md:mt-0 text-center md:text-right">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{teachingRating}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Teaching Rating</div>
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {email}
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {phone}
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {room}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-1">
            {['Overview', 'My Research', 'My Progress', 'Achievements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* About Me Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
                <div className="flex items-center mb-6">
                  <UserIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Passionate educator with expertise in machine learning and data science. 
                  Committed to fostering innovation and critical thinking among students.
                </p>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Specialization</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Machine Learning, Data Science
                  </div>
                </div>
              </div>

              {/* Education Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
                <div className="flex items-center mb-6">
                  <BuildingOfficeIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                </div>
                <div className="space-y-6">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-400 before:rounded-full before:ring-4 before:ring-purple-50 dark:before:ring-purple-900/20">
                    <h3 className="font-bold text-gray-900 dark:text-white">Ph.D. in Computer Science</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>MIT</div>
                      <div className="text-xs">2015</div>
                    </div>
                  </div>
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-400 before:rounded-full before:ring-4 before:ring-purple-50 dark:before:ring-purple-900/20">
                    <h3 className="font-bold text-gray-900 dark:text-white">M.S. in Computer Science</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>Stanford University</div>
                      <div className="text-xs">2010</div>
                    </div>
                  </div>
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-400 before:rounded-full before:ring-4 before:ring-purple-50 dark:before:ring-purple-900/20">
                    <h3 className="font-bold text-gray-900 dark:text-white">B.S. in Computer Engineering</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>UC Berkeley</div>
                      <div className="text-xs">2008</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Semester Overview Footer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
              <div className="flex items-center mb-6">
                <svg className="w-6 h-6 text-gray-900 dark:text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Semester Overview</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100 dark:divide-gray-700/50">
                <div className="text-center px-4">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">3</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Courses Teaching</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">145</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">4.7</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">85%</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Syllabus Complete</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'My Research' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Publications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
                <div className="flex items-center mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publications</h2>
                </div>
                <div className="space-y-6">
                  {mockResearch.publications.map(pub => (
                    <div key={pub.id} className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-900/50">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{pub.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{pub.source}</p>
                      <span className={`inline-block px-3 py-1 text-[10px] font-semibold rounded-full ${
                        pub.status === 'Published' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-yellow-500 text-white dark:bg-yellow-600/90 dark:text-yellow-50'
                      }`}>
                        {pub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Projects */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
                <div className="flex items-center mb-6">
                  <GlobeAltIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Research Projects</h2>
                </div>
                <div className="space-y-6">
                  {mockResearch.projects.map(proj => (
                    <div key={proj.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:border-2 before:border-gray-300 dark:before:border-gray-600 before:bg-transparent before:rounded-full">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{proj.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{proj.year}</p>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-block px-3 py-1 text-[10px] font-semibold rounded-full ${
                          proj.status === 'Active'
                            ? 'bg-purple-700 text-white dark:bg-purple-600 dark:text-purple-50'
                            : 'bg-yellow-400 text-gray-900 dark:bg-yellow-500 dark:text-gray-950'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{proj.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Research Grants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
              <div className="flex items-center mb-6">
                <TrophyIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Research Grants</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockResearch.grants.map(grant => (
                  <div key={grant.id} className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between h-32">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{grant.name}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{grant.amount}</span>
                      <span className="text-sm font-medium text-gray-400">{grant.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'My Progress' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Semester Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
              <div className="flex items-center mb-6">
                <ClockIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Semester Progress</h2>
              </div>
              
              {/* Progress Bar Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Lecture Completion</span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{mockProgress.lectureStats.current}/{mockProgress.lectureStats.total}</span>
                </div>
                <div className="w-full h-4 flex rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-700 dark:bg-purple-600 h-full" 
                    style={{ width: `${(mockProgress.lectureStats.current / mockProgress.lectureStats.total) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-400 dark:bg-yellow-500 h-full" 
                    style={{ width: `${100 - ((mockProgress.lectureStats.current / mockProgress.lectureStats.total) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 flex flex-col items-center justify-center border border-purple-100/50 dark:border-purple-800/30">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">3</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Courses</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 flex flex-col items-center justify-center border border-blue-100/50 dark:border-blue-800/30">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">145</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Students Mentoring</span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-6 flex flex-col items-center justify-center border border-green-100/50 dark:border-green-800/30">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">4.7</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Teaching Rating</span>
                </div>
              </div>
            </div>

            {/* Professional Development */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8">
              <div className="flex items-center mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-gray-900 dark:text-white mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Development</h2>
              </div>
              <div className="space-y-4">
                {mockProgress.certifications.map(cert => (
                  <div key={cert.id} className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-900/30 rounded-xl p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{cert.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cert.provider}</p>
                    </div>
                    <span className="inline-flex items-center justify-center px-4 py-1 bg-yellow-400 text-gray-900 dark:bg-yellow-500 dark:text-gray-950 text-xs font-bold rounded-full">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
            {mockAchievements.map(achievement => (
              <div key={achievement.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-sm">
                  <AwardIcon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">{achievement.description}</p>
                <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-800">
                  {achievement.year}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Existing Update Profile Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${getThemedClasses(isDark, "bg-white", "bg-gray-800")}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
                  <input 
                    type="text" 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" 
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Employee ID / Roll Number</label>
                  <input 
                    type="text" 
                    value={editForm.rollNumber} 
                    onChange={e => setEditForm({...editForm, rollNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" 
                  />
                  {errors.rollNumber && <p className="text-sm text-red-500 mt-1">{errors.rollNumber}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Password Modal */}
        {changingPassword && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${getThemedClasses(isDark, "bg-white", "bg-gray-800")}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Change Password</h3>
                <button onClick={() => setChangingPassword(false)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <PasswordInput 
                  id="currentPassword" label="Current Password" value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  showPassword={showCurrentPassword} onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)} 
                  error={errors.currentPassword} isDark={isDark} 
                />
                <PasswordInput 
                  id="newPassword" label="New Password" value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  showPassword={showNewPassword} onTogglePassword={() => setShowNewPassword(!showNewPassword)} 
                  error={errors.newPassword} isDark={isDark} 
                />
                <PasswordInput 
                  id="confirmPassword" label="Confirm Password" value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} 
                  error={errors.confirmPassword} isDark={isDark} 
                />
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={() => setChangingPassword(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Change Password</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

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

const PasswordInput: React.FC<PasswordInputProps> = ({ id, label, value, onChange, showPassword, onTogglePassword, error, isDark }) => (
  <div>
    <label htmlFor={id} className={`block text-sm font-medium mb-1 ${getThemedClasses(isDark, "text-gray-700", "text-gray-300")}`}>{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <LockClosedIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input type={showPassword ? "text" : "password"} id={id} value={value} onChange={onChange} className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

export default Profile;
