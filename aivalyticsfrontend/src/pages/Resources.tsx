import React from 'react';
import { 
 DocumentTextIcon, 
 VideoCameraIcon, 
 BookOpenIcon, 
 PuzzlePieceIcon,
 ArrowDownTrayIcon,
 LinkIcon,
 StarIcon
} from '@heroicons/react/24/outline';

const Resources: React.FC = () => {
 // Sample resources data
 const resources = [
 {
 id: 1,
 title: 'Data Structures Handbook',
 type: 'document',
 format: 'PDF',
 size: '2.4 MB',
 rating: 4.8,
 downloads: 1245,
 link: '#',
 },
 {
 id: 2,
 title: 'Algorithm Analysis Lecture Series',
 type: 'video',
 format: 'MP4',
 size: '450 MB',
 rating: 4.9,
 downloads: 876,
 link: '#',
 },
 {
 id: 3,
 title: 'Machine Learning Fundamentals',
 type: 'book',
 format: 'EPUB',
 size: '5.7 MB',
 rating: 4.7,
 downloads: 2130,
 link: '#',
 },
 {
 id: 4,
 title: 'Neural Networks Interactive Tutorial',
 type: 'interactive',
 format: 'HTML',
 size: 'Online',
 rating: 4.5,
 downloads: 1532,
 link: '#',
 },
 {
 id: 5,
 title: 'Statistics Practice Problems',
 type: 'document',
 format: 'PDF',
 size: '1.8 MB',
 rating: 4.6,
 downloads: 987,
 link: '#',
 }
 ];

 // Get icon based on resource type
 const getResourceIcon = (type: string) => {
 switch (type) {
 case 'document':
 return <DocumentTextIcon className="h-8 w-8 text-blue-400" />;
 case 'video':
 return <VideoCameraIcon className="h-8 w-8 text-red-400" />;
 case 'book':
 return <BookOpenIcon className="h-8 w-8 text-green-400" />;
 case 'interactive':
 return <PuzzlePieceIcon className="h-8 w-8 text-purple-400" />;
 default:
 return <DocumentTextIcon className="h-8 w-8 text-gray-400" />;
 }
 };

 // Get background color based on resource type
 const getResourceBgColor = (type: string) => {
 switch (type) {
 case 'document':
 return '';
 case 'video':
 return '';
 case 'book':
 return '';
 case 'interactive':
 return '';
 default:
 return 'bg-gray-700';
 }
 };

 return (
 <>
 <div className="max-w-6xl mx-auto">
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
 <DocumentTextIcon className="h-6 w-6 text-white" />
 </div>
 <h1 className="text-2xl font-bold text-white">Learning Resources</h1>
 </div>
 
 <div className="flex space-x-2">
 <div className="relative">
 <input
 type="text"
 placeholder="Search resources..."
 className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
 />
 <button className="absolute right-2 top-2 text-gray-400">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </button>
 </div>
 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
 Filter
 </button>
 </div>
 </div>
 </div>

 {/* Resource Categories */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
 <div className=" rounded-xl p-4 border border-blue-800/50 flex items-center justify-between">
 <div className="flex items-center">
 <DocumentTextIcon className="h-6 w-6 text-blue-400 mr-3" />
 <span className="text-white font-medium">Documents</span>
 </div>
 <span className=" text-blue-300 rounded-full px-2 py-1 text-xs">24</span>
 </div>
 
 <div className=" rounded-xl p-4 border border-red-800/50 flex items-center justify-between">
 <div className="flex items-center">
 <VideoCameraIcon className="h-6 w-6 text-red-400 mr-3" />
 <span className="text-white font-medium">Videos</span>
 </div>
 <span className=" text-red-300 rounded-full px-2 py-1 text-xs">16</span>
 </div>
 
 <div className=" rounded-xl p-4 border border-green-800/50 flex items-center justify-between">
 <div className="flex items-center">
 <BookOpenIcon className="h-6 w-6 text-green-400 mr-3" />
 <span className="text-white font-medium">Books</span>
 </div>
 <span className=" text-green-300 rounded-full px-2 py-1 text-xs">8</span>
 </div>
 
 <div className=" rounded-xl p-4 border border-purple-800/50 flex items-center justify-between">
 <div className="flex items-center">
 <PuzzlePieceIcon className="h-6 w-6 text-purple-400 mr-3" />
 <span className="text-white font-medium">Interactive</span>
 </div>
 <span className=" text-purple-300 rounded-full px-2 py-1 text-xs">12</span>
 </div>
 </div>

 {/* Resources List */}
 <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
 <h2 className="text-xl font-semibold text-white mb-6">Recommended Resources</h2>
 
 <div className="space-y-4">
 {resources.map((resource) => (
 <div 
 key={resource.id} 
 className={`flex items-center rounded-xl p-4 border ${
 resource.type === 'document' ? 'border-blue-800/50' : 
 resource.type === 'video' ? 'border-red-800/50' : 
 resource.type === 'book' ? 'border-green-800/50' : 
 'border-purple-800/50'
 } ${getResourceBgColor(resource.type)}`}
 >
 <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
 {getResourceIcon(resource.type)}
 </div>
 
 <div className="flex-1">
 <h3 className="text-lg font-medium text-white">{resource.title}</h3>
 <div className="flex items-center mt-1">
 <span className="text-xs text-gray-400 mr-3">{resource.format}</span>
 <span className="text-xs text-gray-400 mr-3">{resource.size}</span>
 <div className="flex items-center text-yellow-400 mr-3">
 <StarIcon className="h-3 w-3 mr-1" />
 <span className="text-xs">{resource.rating}</span>
 </div>
 <div className="flex items-center text-gray-400">
 <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
 <span className="text-xs">{resource.downloads}</span>
 </div>
 </div>
 </div>
 
 <div className="flex space-x-2">
 <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm flex items-center">
 <LinkIcon className="h-4 w-4 mr-1" />
 Preview
 </button>
 <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center">
 <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
 Download
 </button>
 </div>
 </div>
 ))}
 </div>
 
 {/* View more button */}
 <div className="mt-6 text-center">
 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
 View All Resources
 </button>
 </div>
 </div>
 </div>
 </>
 );
};

export default Resources; 