import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
 const [feedbackType, setFeedbackType] = useState('Suggestion');
 const [feedbackText, setFeedbackText] = useState('');

 if (!isOpen) return null;

 const feedbackTypes = ['Suggestion', 'Bug Report', 'Feature Request', 'Other'];

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
 onClick={onClose}
 ></div>

 {/* Modal Content */}
 <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200/50 dark:border-gray-800/50 overflow-hidden mt-8 md:mt-0">
 {/* Header */}
 <div className="p-6 border-b border-gray-100 dark:border-gray-800">
 <div className="flex justify-between items-start">
 <div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Your Feedback</h2>
 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
 Help us improve AIValytics by sharing your thoughts
 </p>
 </div>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 </div>

 {/* Body */}
 <div className="p-6 space-y-6">
 {/* Feedback Type */}
 <div>
 <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
 Feedback Type
 </label>
 <div className="space-y-3">
 {feedbackTypes.map((type) => (
 <label key={type} className="flex items-center cursor-pointer group">
 <div className="relative flex items-center justify-center">
 <input
 type="radio"
 name="feedbackType"
 value={type}
 checked={feedbackType === type}
 onChange={(e) => setFeedbackType(e.target.value)}
 className="sr-only"
 />
 <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${feedbackType === type
 ? 'border-purple-600 dark:border-purple-400'
 : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-500'
 }`}>
 {feedbackType === type && (
 <div className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400" />
 )}
 </div>
 </div>
 <span className={`ml-3 text-sm ${feedbackType === type
 ? 'text-gray-900 dark:text-white font-medium'
 : 'text-gray-600 dark:text-gray-400'
 }`}>
 {type}
 </span>
 </label>
 ))}
 </div>
 </div>

 {/* Feedback Details */}
 <div>
 <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
 Your Feedback
 </label>
 <textarea
 rows={4}
 className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
 placeholder="Please describe your feedback in detail..."
 value={feedbackText}
 onChange={(e) => setFeedbackText(e.target.value)}
 />
 </div>
 </div>

 {/* Footer Actions */}
 <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
 <button
 onClick={onClose}
 className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 // Submission logic would go here
 onClose();
 }}
 className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm shadow-purple-500/20"
 >
 Submit Feedback
 </button>
 </div>
 </div>
 </div>
 );
};

export default FeedbackModal;
