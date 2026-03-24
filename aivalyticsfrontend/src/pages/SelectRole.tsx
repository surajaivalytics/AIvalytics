import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
 AcademicCapIcon, 
 UserGroupIcon, 
 BriefcaseIcon, 
 BuildingLibraryIcon 
} from '@heroicons/react/24/outline';

interface RoleCardProps { 
 role: UserRole; 
 title: string; 
 description: string; 
 icon: any; 
 onClick: (role: UserRole) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
 role, 
 title, 
 description, 
 icon: Icon, 
 onClick 
}) => (
 <button
 onClick={() => onClick(role)}
 className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-[#ff5c35] dark:hover:border-[#ff5c35] hover:shadow-md transition-all group"
 >
 <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-[#ff5c35]/10 transition-colors">
 <Icon className="w-8 h-8 text-gray-400 group-hover:text-[#ff5c35] transition-colors" />
 </div>
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
 <p className="text-sm text-gray-500 text-center">{description}</p>
 </button>
);

const SelectRole: React.FC = () => {
 const { user, logout, refreshUser } = useAuth();
 const navigate = useNavigate();

 const handleRoleSelection = async (role: UserRole) => {
 if (!user) return;

 try {
 await updateDoc(doc(db, "users", user.id), {
 role: role,
 updatedAt: new Date().toISOString()
 });
 
 // Refresh user data in context to ensure role is updated locally
 await refreshUser();
 
 toast.success(`Role set as ${role}`);
 
 // Redirect based on role
 let destination = '/dashboard';
 if (role === 'teacher') destination = '/teacher/dashboard';
 else if (role === 'hod') destination = '/hod/dashboard';
 else if (role === 'principal') destination = '/principal/dashboard';
 
 navigate(destination);
 } catch (error) {
 console.error("Error setting role:", error);
 toast.error("Failed to set role. Please try again.");
 }
 };

 return (
 <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-900 flex flex-col font-sans">
 <header className="w-full flex justify-between items-center px-12 py-6">
 <div className="flex items-center space-x-2">
 <div className="w-2.5 h-2.5 bg-[#ff5c35] rounded-full"></div>
 <span className="text-xl font-bold tracking-tight dark:text-white">Aivalytics.</span>
 </div>
 <button 
 onClick={() => logout()}
 className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 >
 Logout
 </button>
 </header>

 <main className="flex-1 flex flex-col items-center justify-center px-6">
 <div className="max-w-4xl w-full text-center mb-12">
 <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Aivalytics</h1>
 <p className="text-lg text-gray-600 dark:text-gray-400">Please select your role to personalize your experience.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
 <RoleCard 
 role="student"
 title="Student"
 description="Access courses and take quizzes"
 icon={AcademicCapIcon}
 onClick={handleRoleSelection}
 />
 <RoleCard 
 role="teacher"
 title="Teacher"
 description="Create courses and manage quizzes"
 icon={UserGroupIcon}
 onClick={handleRoleSelection}
 />
 <RoleCard 
 role="hod"
 title="HOD"
 description="Manage departments and faculty"
 icon={BriefcaseIcon}
 onClick={handleRoleSelection}
 />
 <RoleCard 
 role="principal"
 title="Principal"
 description="Oversee the entire institution"
 icon={BuildingLibraryIcon}
 onClick={handleRoleSelection}
 />
 </div>
 </main>
 </div>
 );
};

export default SelectRole;
