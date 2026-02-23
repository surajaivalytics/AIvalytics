import React from 'react';
import Layout from '../components/Layout';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  CheckBadgeIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  SparklesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Achievements: React.FC = () => {
  // Sample achievements data
  const achievements = [
    {
      id: 1,
      title: 'Fast Learner',
      description: 'Completed 5 courses in record time',
      icon: RocketLaunchIcon,
      color: 'from-blue-500 to-indigo-600',
      earned: true,
      date: '2023-07-15',
      progress: 100,
    },
    {
      id: 2,
      title: 'Perfect Attendance',
      description: 'Attended all classes for 30 days straight',
      icon: CheckBadgeIcon,
      color: 'from-green-500 to-emerald-600',
      earned: true,
      date: '2023-06-28',
      progress: 100,
    },
    {
      id: 3,
      title: 'Quiz Master',
      description: 'Score 100% on 10 consecutive quizzes',
      icon: StarIcon,
      color: 'from-yellow-500 to-amber-600',
      earned: false,
      progress: 70,
      total: 10,
      current: 7,
    },
    {
      id: 4,
      title: 'Knowledge Explorer',
      description: 'Access and review 50 different learning resources',
      icon: LightBulbIcon,
      color: 'from-purple-500 to-violet-600',
      earned: false,
      progress: 64,
      total: 50,
      current: 32,
    },
    {
      id: 5,
      title: 'Coding Streak',
      description: 'Complete coding exercises for 14 consecutive days',
      icon: FireIcon,
      color: 'from-red-500 to-rose-600',
      earned: false,
      progress: 50,
      total: 14,
      current: 7,
    },
    {
      id: 6,
      title: 'Top Performer',
      description: 'Rank in the top 5% of all students',
      icon: SparklesIcon,
      color: 'from-amber-500 to-orange-600',
      earned: true,
      date: '2023-08-01',
      progress: 100,
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Achievements</h1>
                <p className="text-gray-400 text-sm">Track your progress and earn badges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xl font-bold text-white">9</div>
                <div className="text-xs text-gray-400">Total Badges</div>
              </div>
              <div className="h-10 w-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Earned</div>
              <div className="text-2xl font-bold text-white">4</div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckBadgeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">In Progress</div>
              <div className="text-2xl font-bold text-white">5</div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <RocketLaunchIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Locked</div>
              <div className="text-2xl font-bold text-white">12</div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Achievements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`bg-gray-700 rounded-xl p-5 border ${achievement.earned ? 'border-yellow-600/50' : 'border-gray-600'}`}
              >
                <div className="flex items-center mb-4">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center mr-4 ${!achievement.earned && 'opacity-60'}`}>
                    <achievement.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{achievement.title}</h3>
                    {achievement.earned && achievement.date ? (
                      <div className="flex items-center text-xs text-yellow-400">
                        <CheckBadgeIcon className="h-3 w-3 mr-1" />
                        <span>Earned on {new Date(achievement.date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-gray-400">
                        <span>In progress</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>
                
                {!achievement.earned && achievement.total && achievement.current && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{achievement.current} / {achievement.total} completed</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-600 rounded-full">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${achievement.color}`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {achievement.earned && (
                  <div className="flex justify-center mt-2">
                    <div className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-medium border border-yellow-800/30">
                      Achievement Unlocked
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* View more button */}
          <div className="mt-6 text-center">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
              View All Achievements
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Achievements; 