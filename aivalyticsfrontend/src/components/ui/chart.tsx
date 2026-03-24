import React from 'react';

export interface ChartProps {
 children: React.ReactNode;
}

export const ChartContainer = ({ children }: ChartProps) => {
 return <div className="relative">{children}</div>;
};

export const ChartTooltip = ({ children }: ChartProps) => {
 return <div className="chart-tooltip">{children}</div>;
};

export const ChartTooltipContent = ({ children }: ChartProps) => {
 return <div className="chart-tooltip-content p-2 bg-white dark:bg-gray-800 rounded shadow-lg">{children}</div>;
}; 