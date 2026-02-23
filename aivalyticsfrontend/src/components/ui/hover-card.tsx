import React from 'react';

interface HoverCardProps {
  children: React.ReactNode;
}

export const HoverCard = ({ children }: HoverCardProps) => {
  return <div className="hover-card relative">{children}</div>;
};

export const HoverCardTrigger = ({ children }: HoverCardProps) => {
  return <div className="hover-card-trigger">{children}</div>;
};

export const HoverCardContent = ({ children }: HoverCardProps) => {
  return (
    <div className="hover-card-content p-3 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}; 