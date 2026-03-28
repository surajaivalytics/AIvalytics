import React, { useState } from 'react';
import { 
  CloudUpload, 
  FileText, 
  Link as LinkIcon, 
  BookOpen, 
  Calendar, 
  Eye, 
  RefreshCw, 
  Trash2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// MOCK DATA
const mockUploads = [
  { id: 1, name: 'Data_Structures_Notes.pdf', code: 'CS301', type: 'Notes', date: '6/28/2025', status: 'Processed', size: '3.5 MB' },
  { id: 2, name: 'Midterm_Syllabus_2025.docx', code: 'CS301', type: 'Syllabus', date: '6/25/2025', status: 'Processed', size: '1.2 MB' },
  { id: 3, name: 'Lecture_7_Trees.pptx', code: 'CS301', type: 'PPT', date: '6/20/2025', status: 'Failed', size: '12.4 MB' },
  { id: 4, name: 'Algorithm_Analysis.pdf', code: 'CS302', type: 'Notes', date: '6/18/2025', status: 'Processed', size: '4.1 MB' }
];

const TeacherUploadContent = () => {
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [dateFilter, setDateFilter] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 dark:text-gray-100">Upload Content</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Upload Content</h1>
          </div>
        </div>

        {/* Section 1: File Upload Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 mb-8 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload or Add Content</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add lecture slides, notes, or external links to process via AI</p>
            </div>
            <div className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center py-16 px-4 cursor-pointer">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <CloudUpload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Drag & drop file or click to upload</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">PDF, PPT, DOC, XLS, TXT (Max: 50MB)</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <LinkIcon className="w-4 h-4 mr-2" />
              Add URL
            </button>
          </div>
        </div>

        {/* Section 2: Recent Uploads & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 mb-8 transition-colors overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Course Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 w-full md:w-48 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option>All Courses</option>
                    <option>Data Structures (CS301)</option>
                    <option>Algorithm Design (CS302)</option>
                  </select>
                </div>
                {/* Date Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Select Date"
                    className="pl-10 pr-4 py-2 w-full md:w-48 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Uploads</h3>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'Processed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-gray-700 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition-colors" title="Process AI">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mockUploads.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No uploads found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherUploadContent;
