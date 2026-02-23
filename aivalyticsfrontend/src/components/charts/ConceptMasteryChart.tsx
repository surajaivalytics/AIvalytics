import React from "react";

interface ConceptMasteryProps {
  concepts?: {
    name: string;
    mastery: number;
  }[];
}

const ConceptMasteryChart: React.FC<ConceptMasteryProps> = ({
  concepts = [],
}) => {
  // Check if data exists and has elements
  if (!concepts || concepts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
            <svg
              className="h-4 w-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white font-primary">
            Concept Mastery
          </h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p>No concept data available</p>
        </div>
      </div>
    );
  }

  // Sort concepts by mastery level (optional)
  // const sortedConcepts = [...concepts].sort((a, b) => b.mastery - a.mastery);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
          <svg
            className="h-4 w-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white font-primary">
          Concept Mastery
        </h3>
      </div>

      <div className="space-y-4 font-secondary">
        {concepts.map((concept, index) => (
          <div key={index} className="flex items-center">
            <div className="w-32 text-sm text-gray-300 truncate mr-4">
              {concept.name}
            </div>

            <div className="flex-1 relative h-6">
              {/* Background bar */}
              <div className="absolute inset-0 bg-gray-700 rounded-full"></div>

              {/* Progress bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${concept.mastery}%` }}
              ></div>

              {/* Tick marks */}
              <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                {[0, 25, 50, 75, 100].map((tick) => (
                  <div key={tick} className="h-full flex items-center">
                    <div className="h-2 w-0.5 bg-gray-600"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Percentage text */}
            <div className="w-10 text-right text-sm font-medium text-white ml-2">
              {concept.mastery}%
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400 font-secondary">
        <div>0</div>
        <div>25</div>
        <div>50</div>
        <div>75</div>
        <div>100</div>
      </div>
    </div>
  );
};

export default React.memo(ConceptMasteryChart);
