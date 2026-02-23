import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

export const TooltipProvider = ({ children }: TooltipProps) => {
  return <>{children}</>;
};

export const Tooltip = ({ children }: TooltipProps) => {
  return <>{children}</>;
};

export const UITooltip = Tooltip;

export const TooltipTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
  return <div className="inline-block">{children}</div>;
};

export const TooltipContent = ({ 
  children, 
  side = 'top', 
  className = '' 
}: { 
  children: React.ReactNode; 
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) => {
  return (
    <div className={`tooltip-content p-2 bg-white dark:bg-gray-800 rounded shadow-lg ${className}`}>
      {children}
    </div>
  );
}; 