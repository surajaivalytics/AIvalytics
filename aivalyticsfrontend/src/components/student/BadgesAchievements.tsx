import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Trophy, Star, Flame, Target, Award, BookOpen, Brain, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon: React.ReactNode;
  status: 'locked' | 'in-progress' | 'completed';
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Quick Learner',
    description: 'Complete 5 courses with 90% or higher',
    progress: 3,
    maxProgress: 5,
    icon: <Zap className="h-4 w-4" />,
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Knowledge Seeker',
    description: 'Study for 50 hours total',
    progress: 42,
    maxProgress: 50,
    icon: <BookOpen className="h-4 w-4" />,
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    progress: 1,
    maxProgress: 1,
    icon: <Star className="h-4 w-4" />,
    status: 'completed'
  },
  {
    id: '4',
    title: 'Master Mind',
    description: 'Complete all advanced courses',
    progress: 0,
    maxProgress: 3,
    icon: <Brain className="h-4 w-4" />,
    status: 'locked'
  }
];

const BadgesAchievements: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>
          Track your learning milestones and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.status === 'locked'
                  ? 'opacity-50'
                  : achievement.status === 'completed'
                  ? 'bg-primary/5'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  achievement.status === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <Badge
                      variant={
                        achievement.status === 'completed'
                          ? 'default'
                          : achievement.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {achievement.status === 'completed'
                        ? 'Completed'
                        : achievement.status === 'in-progress'
                        ? `${achievement.progress}/${achievement.maxProgress}`
                        : 'Locked'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.status === 'in-progress' && (
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-1 mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesAchievements; 