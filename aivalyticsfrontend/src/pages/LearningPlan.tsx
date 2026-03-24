import React from 'react';
import { CalendarIcon, ClockIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LearningPlan: React.FC = () => {
 // Sample data
 const learningPlan = [
 {
 id: 1,
 title: 'Data Structures Fundamentals',
 description: 'Learn the basics of data structures including arrays, linked lists, stacks, and queues.',
 deadline: '2023-08-15',
 status: 'completed',
 progress: 100,
 },
 {
 id: 2,
 title: 'Algorithm Analysis',
 description: 'Understanding time and space complexity, Big O notation, and algorithm efficiency.',
 deadline: '2023-09-10',
 status: 'in-progress',
 progress: 65,
 },
 {
 id: 3,
 title: 'Advanced Data Structures',
 description: 'Explore trees, graphs, heaps, and hash tables with practical applications.',
 deadline: '2023-10-05',
 status: 'upcoming',
 progress: 0,
 },
 {
 id: 4,
 title: 'Machine Learning Basics',
 description: 'Introduction to machine learning concepts, supervised and unsupervised learning.',
 deadline: '2023-11-20',
 status: 'upcoming',
 progress: 0,
 }
 ];

 return (
 <>
 <div className="max-w-6xl mx-auto">
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
 <CalendarIcon className="h-6 w-6 text-white" />
 </div>
 <h1 className="text-2xl font-bold text-white">Learning Plan</h1>
 </div>
 
 <div className="flex space-x-2">
 <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
 This Month
 </button>
 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
 View Calendar
 </button>
 </div>
 </div>
 </div>

 {/* Learning Plan Timeline */}
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
 <h2 className="text-xl font-semibold text-white mb-6">Your Learning Timeline</h2>
 
 <div className="space-y-6">
 {learningPlan.map((item) => (
 <div 
 key={item.id} 
 className="relative flex bg-gray-700 rounded-xl p-5 border border-gray-600"
 >
 {/* Status indicator */}
 <div className={`absolute -left-3 top-5 h-6 w-6 rounded-full flex items-center justify-center ${
 item.status === 'completed' 
 ? 'bg-green-500' 
 : item.status === 'in-progress' 
 ? 'bg-yellow-500' 
 : 'bg-gray-500'
 }`}>
 {item.status === 'completed' && (
 <CheckCircleIcon className="h-4 w-4 text-white" />
 )}
 {item.status === 'in-progress' && (
 <ClockIcon className="h-4 w-4 text-white" />
 )}
 {item.status === 'upcoming' && (
 <BookOpenIcon className="h-4 w-4 text-white" />
 )}
 </div>
 
 <div className="flex-1">
 <div className="flex justify-between items-center mb-2">
 <h3 className="text-lg font-medium text-white">{item.title}</h3>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
 item.status === 'completed' 
 ? 'bg-green-900 text-green-300' 
 : item.status === 'in-progress' 
 ? 'bg-yellow-900 text-yellow-300' 
 : 'bg-gray-600 text-gray-300'
 }`}>
 {item.status === 'completed' ? 'Completed' : 
 item.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
 </span>
 </div>
 
 <p className="text-gray-300 text-sm mb-4">{item.description}</p>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center text-sm text-gray-400">
 <CalendarIcon className="h-4 w-4 mr-1" />
 <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
 </div>
 
 {item.progress > 0 && (
 <div className="flex items-center">
 <div className="w-32 h-2 bg-gray-600 rounded-full mr-2">
 <div 
 className="h-full bg-indigo-500 rounded-full" 
 style={{ width: `${item.progress}%` }}
 ></div>
 </div>
 <span className="text-xs text-gray-300">{item.progress}%</span>
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 
 {/* Add more button */}
 <div className="mt-6 text-center">
 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
 View Complete Learning Path
 </button>
 </div>
 </div>
 </div>
 </>
 );
};

export default LearningPlan; 