import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendLabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  className,
}) => {
  const isTrendPositive = trend?.startsWith("+");
  const isTrendNegative = trend?.startsWith("-");

  return (
    <Card
      className={cn(
        "overflow-hidden border-gray-100 dark:border-gray-800 hover:shadow-md transition-all",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-secondary">
            {title}
          </p>
          {icon && (
            <div className="text-gray-600 dark:text-gray-400">{icon}</div>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-primary">
            {value}
          </h2>
          {(description || trend) && (
            <div className="mt-2 font-secondary">
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    isTrendPositive && "text-green-600 dark:text-green-500",
                    isTrendNegative && "text-red-600 dark:text-red-500",
                    !isTrendPositive &&
                      !isTrendNegative &&
                      "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {trend}
                </span>
              )}
              {trend && trendLabel && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {" "}
                  {trendLabel}
                </span>
              )}
              {description && !trend && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
              {description && trend && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
