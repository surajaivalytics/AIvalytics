import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  duration: string;
  questions: number;
  difficulty: "easy" | "medium" | "hard";
  dueDate: string;
  status: "pending" | "completed" | "overdue";
}

const quizzes: Quiz[] = [
  {
    id: "1",
    title: "Data Structures Basics",
    subject: "Computer Science",
    duration: "30 mins",
    questions: 15,
    difficulty: "easy",
    dueDate: "Today, 11:59 PM",
    status: "pending",
  },
  {
    id: "2",
    title: "Algorithm Analysis",
    subject: "Computer Science",
    duration: "45 mins",
    questions: 20,
    difficulty: "medium",
    dueDate: "Tomorrow, 3:00 PM",
    status: "pending",
  },
  {
    id: "3",
    title: "Database Design",
    subject: "Computer Science",
    duration: "30 mins",
    questions: 15,
    difficulty: "medium",
    dueDate: "Yesterday, 11:59 PM",
    status: "overdue",
  },
];

const getDifficultyColor = (difficulty: Quiz["difficulty"]) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "hard":
      return "bg-red-100 text-red-800";
  }
};

const getStatusColor = (status: Quiz["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "pending":
      return "text-blue-600";
    case "overdue":
      return "text-red-600";
  }
};

const getStatusIcon = (status: Quiz["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "overdue":
      return <AlertCircle className="h-4 w-4" />;
  }
};

const DailyQuizzes: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Daily Quizzes
        </CardTitle>
        <CardDescription>Your upcoming and pending quizzes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className={`p-4 rounded-lg border ${
                quiz.status === "overdue"
                  ? "bg-red-50 border-red-100"
                  : quiz.status === "completed"
                  ? "bg-green-50 border-green-100"
                  : "bg-card"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{quiz.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quiz.subject}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(quiz.difficulty)}
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{quiz.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span>{quiz.questions} questions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <span className={getStatusColor(quiz.status)}>
                      {getStatusIcon(quiz.status)}
                    </span>
                    <span className="text-muted-foreground">
                      Due {quiz.dueDate}
                    </span>
                  </div>
                  {quiz.status === "pending" && (
                    <Button size="sm">Start Quiz</Button>
                  )}
                  {quiz.status === "overdue" && (
                    <Button size="sm" variant="outline">
                      Request Extension
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

export default DailyQuizzes;
