import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Video, FileText, Link as LinkIcon } from 'lucide-react';

interface Resource {
 id: string;
 title: string;
 type: 'video' | 'document' | 'link' | 'interactive';
 description: string;
 duration?: string;
 difficulty: 'beginner' | 'intermediate' | 'advanced';
 link: string;
}

const resources: Resource[] = [
 {
 id: '1',
 title: 'Introduction to Data Structures',
 type: 'video',
 description: 'A comprehensive overview of basic data structures',
 duration: '15 mins',
 difficulty: 'beginner',
 link: '#'
 },
 {
 id: '2',
 title: 'Algorithm Complexity Guide',
 type: 'document',
 description: 'Learn about Big O notation and algorithm analysis',
 difficulty: 'intermediate',
 link: '#'
 },
 {
 id: '3',
 title: 'Interactive Sorting Visualizer',
 type: 'interactive',
 description: 'Visualize and understand sorting algorithms',
 difficulty: 'intermediate',
 link: '#'
 }
];

const getResourceIcon = (type: Resource['type']) => {
 switch (type) {
 case 'video':
 return <Video className="h-4 w-4" />;
 case 'document':
 return <FileText className="h-4 w-4" />;
 case 'link':
 return <LinkIcon className="h-4 w-4" />;
 case 'interactive':
 return <BookOpen className="h-4 w-4" />;
 }
};

const getDifficultyColor = (difficulty: Resource['difficulty']) => {
 switch (difficulty) {
 case 'beginner':
 return 'bg-green-100 text-green-800';
 case 'intermediate':
 return 'bg-blue-100 text-blue-800';
 case 'advanced':
 return 'bg-purple-100 text-purple-800';
 }
};

const LearningResources: React.FC = () => {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <BookOpen className="h-5 w-5" />
 Learning Resources
 </CardTitle>
 <CardDescription>
 Curated materials to support your learning journey
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {resources.map((resource) => (
 <div
 key={resource.id}
 className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
 >
 <div className="p-2 rounded-lg bg-primary/10">
 {getResourceIcon(resource.type)}
 </div>
 <div className="flex-1 space-y-1">
 <div className="flex items-center justify-between">
 <h4 className="font-medium">{resource.title}</h4>
 <Badge
 variant="secondary"
 className={getDifficultyColor(resource.difficulty)}
 >
 {resource.difficulty}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground">
 {resource.description}
 </p>
 {resource.duration && (
 <p className="text-xs text-muted-foreground">
 Duration: {resource.duration}
 </p>
 )}
 </div>
 <Button variant="ghost" size="sm" asChild>
 <a href={resource.link} target="_blank" rel="noopener noreferrer">
 Access
 </a>
 </Button>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
};

export default LearningResources; 