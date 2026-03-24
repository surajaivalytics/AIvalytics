// Theme utility functions for consistent styling across the application

export const getThemeClasses = (isDark: boolean) => ({
 // Background colors
 bg: {
 primary: isDark ? 'bg-gray-900' : 'bg-white',
 secondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
 tertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
 card: isDark ? 'bg-gray-800' : 'bg-white',
 hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
 active: isDark ? 'bg-gray-700' : 'bg-gray-50',
 },
 
 // Text colors
 text: {
 primary: isDark ? 'text-white' : 'text-gray-900',
 secondary: isDark ? 'text-gray-300' : 'text-gray-600',
 tertiary: isDark ? 'text-gray-400' : 'text-gray-500',
 muted: isDark ? 'text-gray-500' : 'text-gray-400',
 accent: 'text-blue-500',
 success: 'text-green-500',
 warning: 'text-yellow-500',
 error: 'text-red-500',
 },
 
 // Border colors
 border: {
 primary: isDark ? 'border-gray-700' : 'border-gray-200',
 secondary: isDark ? 'border-gray-600' : 'border-gray-300',
 accent: 'border-blue-500',
 focus: isDark ? 'focus:border-blue-400' : 'focus:border-blue-500',
 },
 
 // Ring colors for focus states
 ring: {
 primary: isDark ? 'focus:ring-blue-400' : 'focus:ring-blue-500',
 offset: isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white',
 },
 
 // Button styles
 button: {
 primary: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`,
 secondary: isDark 
 ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
 : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
 ghost: isDark
 ? 'text-gray-300 hover:text-white hover:bg-gray-800'
 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
 },
 
 // Input styles
 input: isDark
 ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400'
 : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
 
 // Card styles
 card: isDark
 ? 'bg-gray-800 border border-gray-700 shadow-lg'
 : 'bg-white border border-gray-200 shadow-sm',
 
 // Modal/overlay styles
 overlay: 'bg-black bg-opacity-50',
 modal: isDark
 ? 'bg-gray-800 border border-gray-700'
 : 'bg-white border border-gray-200',
});

// Helper function that matches the expected signature used by components
export const getThemedClasses = (isDark: boolean, lightClass: string, darkClass: string) => {
 return isDark ? darkClass : lightClass;
};

// Utility function to combine theme classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
 return classes.filter(Boolean).join(' ');
};

export const getThemedBackground = (isDark: boolean) => {
 return isDark ? 'bg-brand-navy' : 'bg-brand-light';
};

export const getThemedText = (isDark: boolean) => {
 return isDark ? 'text-brand-cream' : 'text-brand-dark';
};

export const getThemedBorder = (isDark: boolean) => {
 return isDark ? 'border-brand-gold/20' : 'border-brand-beige/20';
};

export const getThemedCard = (isDark: boolean) => {
 return `${isDark ? 'bg-brand-navy/50' : 'bg-brand-cream/50'} backdrop-blur-xl border ${getThemedBorder(isDark)} shadow-xl`;
};

export const getThemedGradient = (isDark: boolean) => {
 return isDark ? 'bg-navy-gradient' : 'bg-gold-gradient';
}; 