import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lightbulb, Target, ArrowUp, Brain, Clock, CheckCircle2 } from 'lucide-react';

interface Recommendation {
 id: string;
 title: string;
 description: string;
 type: 'practice' | 'review' | 'focus' | 'time';
 priority: 'high' | 'medium' | 'low';
 status: 'new' | 'in-progress' | 'completed';
 estimatedTime: string;
}

const recommendations: Recommendation[] = [
 {
 id: '1',
 title: 'Review Data Structures Concepts',
 description: 'Focus on binary trees and graph algorithms where performance is lower',
 type: 'review',
 priority: 'high',
 status: 'new',
 estimatedTime: '2 hours'
 },
 {
 id: '2',
 title: 'Practice Algorithm Problems',
 description: 'Complete 5 medium-level problems on sorting and searching',
 type: 'practice',
 priority: 'medium',
 status: 'in-progress',
 estimatedTime: '3 hours'
 },
 {
 id: '3',
 title: 'Deep Focus Session',
 description: 'Dedicated study time for complex topics without distractions',
 type: 'focus',
 priority: 'medium',
 status: 'new',
 estimatedTime: '1.5 hours'
 },
 {
 id: '4',
 title: 'Time Management',
 description: 'Allocate specific time blocks for different subjects',
 type: 'time',
 priority: 'low',
 status: 'completed',
 estimatedTime: '30 mins'
 }
];

const getTypeIcon = (type: Recommendation['type']) => {
 switch (type) {
 case 'practice':
 return <Target className="h-4 w-4" />;
 case 'review':
 return <Brain className="h-4 w-4" />;
 case 'focus':
 return <Lightbulb className="h-4 w-4" />;
 case 'time':
 return <Clock className="h-4 w-4" />;
 }
};

const getPriorityColor = (priority: Recommendation['priority']) => {
 switch (priority) {
 case 'high':
 return 'bg-red-100 text-red-800';
 case 'medium':
 return 'bg-yellow-100 text-yellow-800';
 case 'low':
 return 'bg-green-100 text-green-800';
 }
};

const getStatusColor = (status: Recommendation['status']) => {
 switch (status) {
 case 'new':
 return 'bg-blue-100 text-blue-800';
 case 'in-progress':
 return 'bg-purple-100 text-purple-800';
 case 'completed':
 return 'bg-green-100 text-green-800';
 }
};

const ImprovementPlan: React.FC = () => {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <ArrowUp className="h-5 w-5" />
 Personalized Improvement Plan
 </CardTitle>
 <CardDescription>
 AI-generated recommendations based on your performance
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {recommendations.map((recommendation) => (
 <div
 key={recommendation.id}
 className={`p-4 rounded-lg border ${
 recommendation.status === 'completed'
 ? 'bg-gray-50 border-green-100'
 : 'bg-card'
 }`}
 >
 <div className="space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <div className={`p-2 rounded-lg bg-primary/10`}>
 {getTypeIcon(recommendation.type)}
 </div>
 <div>
 <h4 className="font-medium">{recommendation.title}</h4>
 <p className="text-sm text-muted-foreground">
 {recommendation.description}
 </p>
 </div>
 </div>
 <Badge
 variant="secondary"
 className={getPriorityColor(recommendation.priority)}
 >
 {recommendation.priority} priority
 </Badge>
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <div className="flex items-center gap-1">
 <Clock className="h-4 w-4" />
 {recommendation.estimatedTime}
 </div>
 <Badge
 variant="outline"
 className={getStatusColor(recommendation.status)}
 >
 {recommendation.status}
 </Badge>
 </div>
 {recommendation.status !== 'completed' && (
 <Button size="sm" variant={recommendation.status === 'in-progress' ? 'outline' : 'default'}>
 {recommendation.status === 'in-progress' ? 'Continue' : 'Start'}
 </Button>
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

export default ImprovementPlan; 