import React from "react";

interface WorkspaceIllustrationProps {
 imageSrc?: string;
 alt?: string;
}

const WorkspaceIllustration: React.FC<WorkspaceIllustrationProps> = ({ 
 imageSrc, 
 alt = "Workspace illustration showing a person working at a desk" 
}) => {
 // If an image source is provided, use it instead of the CSS illustration
 if (imageSrc) {
 return (
 <div className="relative w-full flex items-center justify-center p-4 sm:p-6">
 <div className="relative w-full max-w-2xl aspect-video">
 <img
 src={imageSrc}
 alt={alt}
 className="w-full h-full object-contain rounded-3xl shadow-2xl"
 />
 </div>
 </div>
 );
 }

 // Default CSS illustration
 return (
 <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-8">
 <div className="relative w-full max-w-lg aspect-square">
 {/* Main Workspace Container - Light Purple Background */}
 <div className="relative w-full h-full bg-gray-50 dark: rounded-3xl p-4 sm:p-6 shadow-2xl border border-purple-200/30 dark:border-purple-700/20 overflow-hidden">
 
 {/* White Back Wall */}
 <div className="absolute inset-0 bg-white dark:bg-gray-50 rounded-3xl z-0"></div>
 
 {/* Light Purple Floor with Blue Border */}
 <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-purple-100 dark: rounded-b-3xl border-t-4 border-blue-400 dark:border-blue-500 z-10"></div>
 
 {/* Window with Light Blue Blinds (Left side of wall) */}
 <div className="absolute top-10 left-5 sm:left-6 w-20 sm:w-24 h-32 sm:h-36 bg-white dark:bg-gray-50 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-700 z-20">
 <div className="w-full h-full p-2 space-y-1.5">
 {[0, 1, 2, 3, 4, 5].map((i) => (
 <div key={i} className="w-full h-1 bg-blue-200 dark:bg-blue-500 rounded-full"></div>
 ))}
 </div>
 {/* Bright White Light from Window */}
 <div className="absolute inset-0 bg-white/60 dark:bg-white/30 rounded-lg"></div>
 </div>
 
 {/* Shelves (Right side of wall, to the right of window) */}
 <div className="absolute top-12 right-6 sm:right-8 space-y-4 z-20">
 {/* Top Shelf */}
 <div className="flex items-end gap-3">
 {/* Two Purple Vases - Tall and Slender, Shorter and Wider */}
 <div className="flex flex-col gap-1.5 items-center">
 <div className="w-5 h-14 bg-purple-400 dark:bg-purple-600 rounded-t-full shadow-md"></div>
 <div className="w-7 h-11 bg-purple-500 dark:bg-purple-700 rounded-t-full shadow-md"></div>
 </div>
 {/* Two Framed Pictures */}
 <div className="flex gap-2">
 <div className="w-8 h-10 bg-blue-100 dark: rounded border-2 border-blue-300 dark:border-blue-600 shadow-sm"></div>
 <div className="w-8 h-10 bg-purple-100 dark: rounded border-2 border-purple-300 dark:border-purple-600 shadow-sm"></div>
 </div>
 </div>
 
 {/* Top Shelf Bar */}
 <div className="w-32 sm:w-36 h-1.5 bg-gray-400 dark:bg-gray-600 rounded shadow-md"></div>
 
 {/* Bottom Shelf - Books Stack (5 books) */}
 <div className="flex items-end gap-1">
 <div className="w-2 bg-orange-300 dark:bg-orange-700 rounded-sm shadow-sm" style={{ height: '14px' }}></div>
 <div className="w-2 bg-pink-200 dark:bg-pink-600 rounded-sm shadow-sm" style={{ height: '16px' }}></div>
 <div className="w-2 bg-white dark:bg-gray-200 rounded-sm shadow-sm border border-gray-200 dark:border-gray-300" style={{ height: '12px' }}></div>
 <div className="w-2 bg-blue-200 dark:bg-blue-600 rounded-sm shadow-sm" style={{ height: '15px' }}></div>
 <div className="w-2 bg-orange-300 dark:bg-orange-700 rounded-sm shadow-sm" style={{ height: '13px' }}></div>
 </div>
 
 {/* Bottom Shelf Bar */}
 <div className="w-32 sm:w-36 h-1.5 bg-gray-400 dark:bg-gray-600 rounded shadow-md"></div>
 </div>
 
 {/* Floor Lamp (Far Right side of scene) */}
 <div className="absolute bottom-36 right-5 sm:right-6 flex flex-col items-center z-20">
 {/* Conical White Shade */}
 <div className="w-11 h-14 bg-white dark:bg-gray-200 rounded-t-full shadow-xl border-2 border-gray-200 dark:border-gray-300 relative">
 {/* Warm Glow */}
 <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 dark: rounded-full blur-xl"></div>
 </div>
 {/* Silver Pole */}
 <div className="w-1.5 h-24 bg-gray-400 dark:bg-gray-500 rounded-full shadow-md"></div>
 {/* Silver Circular Base */}
 <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-full shadow-lg border-2 border-gray-400 dark:border-gray-500"></div>
 </div>
 
 {/* Standing Desk */}
 <div className="absolute bottom-16 left-6 sm:left-10 right-6 sm:right-10 z-30">
 {/* White Desk Top */}
 <div className="bg-white dark:bg-gray-50 rounded-xl shadow-2xl border-2 border-gray-100 dark:border-gray-200 relative overflow-visible" style={{ height: '72px' }}>
 {/* Desktop Items */}
 <div className="absolute inset-0 p-3 sm:p-4 flex items-center justify-between">
 {/* Left Side: Cactus */}
 <div className="flex items-end">
 {/* Green Cactus in Terracotta Pot */}
 <div className="relative">
 <div className="w-4 h-6 bg-amber-700 dark:bg-amber-800 rounded-t-full shadow-sm"></div>
 <div className="w-6 h-3 bg-green-500 dark:bg-green-600 rounded-full -mt-1 shadow-sm"></div>
 </div>
 </div>
 
 {/* Center: Monitor, Keyboard, Mouse */}
 <div className="flex items-center gap-2 sm:gap-3">
 {/* Dark Purple Monitor */}
 <div className="w-24 sm:w-28 h-16 sm:h-20 bg-purple-700 dark:bg-purple-800 rounded-lg shadow-xl border-2 border-purple-800 dark:border-purple-900 relative">
 <div className="w-full h-full rounded-lg flex items-center justify-center p-1">
 <div className="w-full h-full dark: rounded"></div>
 </div>
 </div>
 
 {/* White Keyboard */}
 <div className="w-20 sm:w-24 h-6 sm:h-7 bg-white dark:bg-gray-200 rounded shadow-md border border-gray-200 dark:border-gray-300"></div>
 
 {/* White Mouse */}
 <div className="w-7 sm:w-8 h-7 sm:h-8 bg-white dark:bg-gray-200 rounded-full shadow-md border border-gray-200 dark:border-gray-300"></div>
 </div>
 
 {/* Right Side: Books and Cup */}
 <div className="flex items-end gap-2">
 <div className="space-y-1">
 <div className="w-4 h-3 bg-white dark:bg-gray-200 rounded-sm shadow-sm border border-gray-200 dark:border-gray-300"></div>
 <div className="w-4 h-3 bg-pink-100 dark:bg-pink-200 rounded-sm shadow-sm"></div>
 </div>
 <div className="w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-sm border border-gray-200 dark:border-gray-300"></div>
 </div>
 </div>
 </div>
 
 {/* Silver Desk Legs with Bases */}
 <div className="flex justify-center gap-8 sm:gap-12 mt-2">
 <div className="flex flex-col items-center">
 <div className="w-1.5 h-8 sm:h-10 bg-gray-400 dark:bg-gray-500 rounded-full shadow-md"></div>
 <div className="w-6 h-2 bg-gray-400 dark:bg-gray-600 rounded-full shadow-md -mt-1"></div>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-1.5 h-8 sm:h-10 bg-gray-400 dark:bg-gray-500 rounded-full shadow-md"></div>
 <div className="w-6 h-2 bg-gray-400 dark:bg-gray-600 rounded-full shadow-md -mt-1"></div>
 </div>
 </div>
 </div>
 
 {/* Character - Man with Beard Standing at Desk */}
 <div className="absolute bottom-24 left-8 sm:left-12 z-40">
 <div className="relative">
 {/* Head with Dark Curly Hair and Beard */}
 <div className="relative w-12 sm:w-14 h-12 sm:h-14">
 {/* Head */}
 <div className="w-full h-full bg-amber-200 dark:bg-amber-800 rounded-full border-2 border-amber-300 dark:border-amber-700 shadow-xl relative">
 {/* Dark Curly Hair */}
 <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 sm:w-12 h-7 sm:h-8 bg-gray-800 dark:bg-gray-900 rounded-t-full"></div>
 {/* Neatly Trimmed Beard */}
 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-9 h-6 sm:h-7 bg-amber-300 dark:bg-amber-900 rounded-b-full border border-amber-400 dark:border-amber-800"></div>
 </div>
 </div>
 
 {/* Orange T-Shirt */}
 <div className="absolute top-12 sm:top-14 left-1/2 transform -translate-x-1/2 w-14 sm:w-16 bg-orange-400 dark:bg-orange-600 rounded-xl shadow-xl" style={{ height: '64px' }}>
 {/* Right Arm - On Mouse (Extended forward) */}
 <div className="absolute top-2 -right-2 w-4 h-12 bg-orange-400 dark:bg-orange-600 rounded-full transform rotate-12 shadow-lg"></div>
 
 {/* Left Arm - Holding White Coffee Mug (Extended outward) */}
 <div className="absolute top-2 -left-2 w-4 h-12 bg-orange-400 dark:bg-orange-600 rounded-full transform -rotate-12 shadow-lg">
 {/* White Coffee Mug */}
 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-6 bg-white dark:bg-gray-100 rounded-t-full border border-gray-200 dark:border-gray-300 shadow-md"></div>
 </div>
 </div>
 
 {/* Light Gray Pants */}
 <div className="absolute top-28 sm:top-32 left-1/2 transform -translate-x-1/2 w-12 sm:w-14 bg-gray-300 dark:bg-gray-500 rounded-xl shadow-xl" style={{ height: '76px' }}></div>
 
 {/* White Sneakers */}
 <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-2.5" style={{ top: '104px' }}>
 <div className="w-6 sm:w-7 h-3 sm:h-3.5 bg-white dark:bg-gray-100 rounded-full shadow-lg border border-gray-200 dark:border-gray-300"></div>
 <div className="w-6 sm:w-7 h-3 sm:h-3.5 bg-white dark:bg-gray-100 rounded-full shadow-lg border border-gray-200 dark:border-gray-300"></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default WorkspaceIllustration;
