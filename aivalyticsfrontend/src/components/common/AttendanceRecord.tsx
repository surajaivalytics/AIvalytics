import React from 'react';

interface AttendanceRecordProps {
 attendedClasses: number;
 totalClasses: number;
 missedSessions?: number;
}

const AttendanceRecord: React.FC<AttendanceRecordProps> = ({ 
 attendedClasses, 
 totalClasses,
 missedSessions = 0
}) => {
 // Calculate attendance percentage
 const attendancePercentage = Math.round((attendedClasses / totalClasses) * 100);
 
 // Determine rating text based on percentage
 const getRatingText = (percentage: number) => {
 if (percentage >= 95) return 'Excellent';
 if (percentage >= 85) return 'Very Good';
 if (percentage >= 75) return 'Good';
 if (percentage >= 60) return 'Satisfactory';
 return 'Needs Improvement';
 };
 
 // Determine color based on percentage
 const getCircleColor = (percentage: number) => {
 if (percentage >= 95) return 'bg-green-400 ';
 if (percentage >= 85) return 'bg-green-500 ';
 if (percentage >= 75) return 'bg-teal-500 ';
 if (percentage >= 60) return 'bg-yellow-400 ';
 return 'bg-red-500 ';
 };

 return (
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
 <div className="flex items-center mb-6">
 <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
 <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-white font-primary">Attendance Record</h3>
 </div>
 
 <div className="flex flex-col items-center font-secondary">
 {/* Circular progress indicator */}
 <div className="relative w-36 h-36">
 {/* Background circle */}
 <div className="absolute inset-0 rounded-full bg-gray-700"></div>
 
 {/* Progress circle with gradient */}
 <div 
 className="absolute inset-0 rounded-full bg-green-400 "
 style={{ 
 clipPath: `polygon(50% 50%, 50% 0%, ${attendancePercentage >= 25 ? '100% 0%' : `${50 + 50 * Math.sin(attendancePercentage / 100 * Math.PI * 2)}% ${50 - 50 * Math.cos(attendancePercentage / 100 * Math.PI * 2)}%`}, ${attendancePercentage >= 50 ? '100% 100%' : `${50 + 50 * Math.sin(attendancePercentage / 100 * Math.PI * 2)}% ${50 - 50 * Math.cos(attendancePercentage / 100 * Math.PI * 2)}%`}, ${attendancePercentage >= 75 ? '0% 100%' : `${50 + 50 * Math.sin(attendancePercentage / 100 * Math.PI * 2)}% ${50 - 50 * Math.cos(attendancePercentage / 100 * Math.PI * 2)}%`}, ${attendancePercentage >= 100 ? '0% 0%' : `${50 + 50 * Math.sin(attendancePercentage / 100 * Math.PI * 2)}% ${50 - 50 * Math.cos(attendancePercentage / 100 * Math.PI * 2)}%`})` 
 }}
 ></div>
 
 {/* Inner white circle with percentage */}
 <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
 <div className="flex flex-col items-center">
 <div className="flex items-center">
 <span className="text-4xl font-bold text-white font-primary">{attendancePercentage}</span>
 <span className="text-lg text-gray-300">%</span>
 </div>
 <div className="text-center mt-1">
 <span className="text-yellow-400 text-2xl">😊</span>
 </div>
 </div>
 </div>
 </div>
 
 <div className="mt-4 text-center">
 <div className="text-lg text-white">
 {attendedClasses} of {totalClasses} classes attended
 </div>
 <div className="text-sm text-green-400 font-medium">
 {getRatingText(attendancePercentage)}
 </div>
 
 {missedSessions > 0 && (
 <div className="flex items-center justify-center mt-2 text-sm text-red-400">
 <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 {missedSessions} missed {missedSessions === 1 ? 'session' : 'sessions'}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default React.memo(AttendanceRecord); 