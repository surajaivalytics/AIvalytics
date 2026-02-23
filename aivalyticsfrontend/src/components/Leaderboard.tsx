import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getThemedClasses } from "../utils/themeUtils";
import { TrophyIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";
import dashboardService from "../services/dashboardApi";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  quizCount: number;
  averageScore: number;
  highestScore: number;
  overallPercentage: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank?: {
    rank: number;
    user: any;
  };
}

interface LeaderboardProps {
  title?: string;
  maxItems?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  title = "Leaderboard",
  maxItems = 5,
}) => {
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [maxItems]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug authentication status but don't block the request
      console.log("🔐 Authentication status:", { isAuthenticated, user });

      const response = await dashboardService.getLeaderboard(maxItems);

      if (response.success && response.data) {
        setLeaderboardData(response.data);
      } else {
        // Handle specific authentication errors
        if (
          response.message?.includes("token") ||
          response.message?.includes("unauthorized")
        ) {
          setError("Session expired. Please log in again.");
          // Optionally redirect to login
          // window.location.href = '/login';
        } else {
          setError(response.message || "Failed to load leaderboard");
        }
      }
    } catch (err: any) {
      console.error("Leaderboard error:", err);

      // Handle authentication errors
      if (
        err.message?.includes("token") ||
        err.message?.includes("401") ||
        err.message?.includes("unauthorized")
      ) {
        setError("Session expired. Please log in again.");
      } else {
        setError(err.message || "Failed to load leaderboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <TrophyIcon className="h-5 w-5 text-gray-400" />;
      case 3:
        return <TrophyIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getThemedClasses(
              isDark,
              "bg-gray-100 text-gray-600",
              "bg-gray-700 text-gray-300"
            )}`}
          >
            {rank}
          </div>
        );
    }
  };

  const getRankBgColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return getThemedClasses(
        isDark,
        "bg-yellow-50 border-yellow-200",
        "bg-yellow-900/20 border-yellow-700"
      );
    }

    switch (rank) {
      case 1:
        return getThemedClasses(
          isDark,
          "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
          "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-700"
        );
      case 2:
        return getThemedClasses(
          isDark,
          "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
          "bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-gray-600"
        );
      case 3:
        return getThemedClasses(
          isDark,
          "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200",
          "bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700"
        );
      default:
        return getThemedClasses(
          isDark,
          "bg-white border-gray-200 hover:bg-gray-50",
          "bg-gray-800 border-gray-700 hover:bg-gray-750"
        );
    }
  };

  if (loading) {
    return (
      <div
        className={`rounded-2xl shadow-lg border p-6 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="flex items-center mb-4">
          <TrophyIcon className="h-5 w-5 mr-2 text-indigo-500" />
          <h3
            className={`text-lg font-semibold ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            {title}
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`h-12 rounded-lg animate-pulse ${getThemedClasses(
                isDark,
                "bg-gray-200",
                "bg-gray-700"
              )}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl shadow-lg border p-6 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="flex items-center mb-4">
          <TrophyIcon className="h-5 w-5 mr-2 text-red-500" />
          <h3
            className={`text-lg font-semibold ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            {title}
          </h3>
        </div>
        <p
          className={`text-sm ${getThemedClasses(
            isDark,
            "text-red-600",
            "text-red-400"
          )}`}
        >
          {error}
        </p>
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
    return (
      <div
        className={`rounded-2xl shadow-lg border p-6 ${getThemedClasses(
          isDark,
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div className="flex items-center mb-4">
          <TrophyIcon className="h-5 w-5 mr-2 text-indigo-500" />
          <h3
            className={`text-lg font-semibold ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            {title}
          </h3>
        </div>
        <div className="text-center py-8">
          <UserIcon
            className={`h-12 w-12 mx-auto mb-4 ${getThemedClasses(
              isDark,
              "text-gray-400",
              "text-gray-500"
            )}`}
          />
          <p
            className={`text-sm ${getThemedClasses(
              isDark,
              "text-gray-600",
              "text-gray-400"
            )}`}
          >
            No leaderboard data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl shadow-lg border overflow-hidden ${getThemedClasses(
        isDark,
        "bg-white border-gray-200",
        "bg-gray-800 border-gray-700"
      )}`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b ${getThemedClasses(
          isDark,
          "border-gray-200",
          "border-gray-700"
        )}`}
      >
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-semibold flex items-center ${getThemedClasses(
              isDark,
              "text-gray-900",
              "text-white"
            )}`}
          >
            <TrophyIcon className="h-5 w-5 mr-2 text-indigo-500" />
            {title}
          </h3>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-6 space-y-3">
        {leaderboardData.leaderboard.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${getRankBgColor(
              entry.rank,
              entry.isCurrentUser
            )}`}
          >
            <div className="flex items-center space-x-3">
              {/* Rank */}
              <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <p
                    className={`text-sm font-medium truncate ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {entry.isCurrentUser ? "You" : entry.name}
                  </p>
                  {entry.isCurrentUser && (
                    <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                {entry.rank <= 3 && (
                  <p
                    className={`text-xs ${getThemedClasses(
                      isDark,
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    {entry.quizCount} quizzes • {entry.overallPercentage}%
                    overall
                  </p>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="flex items-center space-x-2">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <span
                className={`text-sm font-bold ${getThemedClasses(
                  isDark,
                  "text-gray-900",
                  "text-white"
                )}`}
              >
                {entry.points} points
              </span>
            </div>
          </div>
        ))}

        {/* Current User Rank (if not in top results) */}
        {leaderboardData.currentUserRank &&
          leaderboardData.currentUserRank.rank > maxItems && (
            <>
              <div
                className={`flex items-center justify-center py-2 ${getThemedClasses(
                  isDark,
                  "text-gray-400",
                  "text-gray-500"
                )}`}
              >
                <div className="flex-1 border-t border-dashed"></div>
                <span className="px-3 text-xs">...</span>
                <div className="flex-1 border-t border-dashed"></div>
              </div>
              <div
                className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(
                  leaderboardData.currentUserRank.rank,
                  true
                )}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(leaderboardData.currentUserRank.rank)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p
                        className={`text-sm font-medium ${getThemedClasses(
                          isDark,
                          "text-gray-900",
                          "text-white"
                        )}`}
                      >
                        You
                      </p>
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span
                    className={`text-sm font-bold ${getThemedClasses(
                      isDark,
                      "text-gray-900",
                      "text-white"
                    )}`}
                  >
                    {leaderboardData.currentUserRank.user.points} points
                  </span>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Leaderboard;
