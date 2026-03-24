import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Brain, Clock, Target } from 'lucide-react';

const performanceData = [
 { day: 'Mon', score: 85, time: 2.5 },
 { day: 'Tue', score: 92, time: 3.0 },
 { day: 'Wed', score: 88, time: 2.8 },
 { day: 'Thu', score: 95, time: 3.2 },
 { day: 'Fri', score: 89, time: 2.7 },
 { day: 'Sat', score: 93, time: 2.9 },
 { day: 'Sun', score: 90, time: 2.6 },
];

const subjectPerformance = [
 { subject: 'Mathematics', score: 88, improvement: '+5%' },
 { subject: 'Physics', score: 92, improvement: '+3%' },
 { subject: 'Computer Science', score: 95, improvement: '+7%' },
 { subject: 'Chemistry', score: 85, improvement: '+2%' },
];

const StudentWeeklyReport: React.FC = () => {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 font-primary font-medium">
 <Activity className="h-5 w-5" />
 Weekly Performance Report
 </CardTitle>
 <CardDescription className="font-secondary">
 Your learning progress and achievements this week
 </CardDescription>
 </CardHeader>
 <CardContent className="font-secondary">
 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList>
 <TabsTrigger value="overview">Overview</TabsTrigger>
 <TabsTrigger value="subjects">Subjects</TabsTrigger>
 <TabsTrigger value="time">Study Time</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 rounded-lg bg-primary/5 space-y-2">
 <div className="flex items-center gap-2 text-sm font-medium">
 <Target className="h-4 w-4" />
 Average Score
 </div>
 <div className="text-2xl font-bold font-primary">90.3%</div>
 <div className="text-sm text-muted-foreground">+4.2% from last week</div>
 </div>
 <div className="p-4 rounded-lg bg-primary/5 space-y-2">
 <div className="flex items-center gap-2 text-sm font-medium">
 <Clock className="h-4 w-4" />
 Study Time
 </div>
 <div className="text-2xl font-bold font-primary">19.7h</div>
 <div className="text-sm text-muted-foreground">2.8h daily average</div>
 </div>
 </div>

 <div className="h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={performanceData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="day" />
 <YAxis />
 <Tooltip />
 <Line
 type="monotone"
 dataKey="score"
 stroke="hsl(var(--primary))"
 strokeWidth={2}
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </TabsContent>

 <TabsContent value="subjects" className="space-y-4">
 {subjectPerformance.map((subject) => (
 <div
 key={subject.subject}
 className="flex items-center justify-between p-4 rounded-lg border"
 >
 <div className="space-y-1">
 <div className="font-medium">{subject.subject}</div>
 <div className="text-sm text-muted-foreground">
 Performance Score
 </div>
 </div>
 <div className="text-right">
 <div className="text-2xl font-bold font-primary">{subject.score}%</div>
 <div className="text-sm text-green-600">{subject.improvement}</div>
 </div>
 </div>
 ))}
 </TabsContent>

 <TabsContent value="time" className="space-y-4">
 <div className="h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={performanceData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="day" />
 <YAxis />
 <Tooltip />
 <Bar
 dataKey="time"
 fill="hsl(var(--primary))"
 radius={[4, 4, 0, 0]}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="text-sm text-muted-foreground text-center">
 Daily study time in hours
 </div>
 </TabsContent>
 </Tabs>
 </CardContent>
 </Card>
 );
};

export default StudentWeeklyReport; 