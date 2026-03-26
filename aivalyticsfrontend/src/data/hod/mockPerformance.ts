export interface MonthlyTrend {
  month: string;
  accuracy: number;
  syllabus: number;
}

export interface FacultyComparison {
  name: string;
  shortName: string;
  accuracy: number;
  syllabus: number;
  studentSatisfaction: number;
}

export interface CoursePerformance {
  name: string;
  accuracy: number;
  syllabus: number;
}

export const monthlyTrend: MonthlyTrend[] = [
  { month: "Sep", accuracy: 70, syllabus: 62 },
  { month: "Oct", accuracy: 72, syllabus: 65 },
  { month: "Nov", accuracy: 69, syllabus: 68 },
  { month: "Dec", accuracy: 74, syllabus: 70 },
  { month: "Jan", accuracy: 75, syllabus: 72 },
  { month: "Feb", accuracy: 74, syllabus: 65 },
  { month: "Mar", accuracy: 76, syllabus: 68 },
];

export const facultyComparison: FacultyComparison[] = [
  { name: "Dr. Sarah Johnson", shortName: "S. Johnson", accuracy: 88, syllabus: 92, studentSatisfaction: 90 },
  { name: "Prof. Michael Chen", shortName: "M. Chen", accuracy: 74, syllabus: 65, studentSatisfaction: 72 },
  { name: "Dr. Priya Sharma", shortName: "P. Sharma", accuracy: 82, syllabus: 78, studentSatisfaction: 85 },
  { name: "Prof. David Wilson", shortName: "D. Wilson", accuracy: 79, syllabus: 85, studentSatisfaction: 80 },
  { name: "Dr. Emily Rodriguez", shortName: "E. Rodriguez", accuracy: 91, syllabus: 94, studentSatisfaction: 92 },
  { name: "Prof. James Kumar", shortName: "J. Kumar", accuracy: 68, syllabus: 60, studentSatisfaction: 70 },
];

export const coursePerformance: CoursePerformance[] = [
  { name: "Data Structures", accuracy: 85, syllabus: 78 },
  { name: "Database Systems", accuracy: 74, syllabus: 65 },
  { name: "Computer Networks", accuracy: 80, syllabus: 72 },
  { name: "Operating Systems", accuracy: 79, syllabus: 85 },
  { name: "Software Engg.", accuracy: 91, syllabus: 92 },
  { name: "Machine Learning", accuracy: 68, syllabus: 60 },
];

export const studentDistribution = [
  { name: "First Year", value: 28, color: "#7C3AED" },
  { name: "Second Year", value: 26, color: "#10B981" },
  { name: "Third Year", value: 24, color: "#F59E0B" },
  { name: "Fourth Year", value: 22, color: "#EF4444" },
];
