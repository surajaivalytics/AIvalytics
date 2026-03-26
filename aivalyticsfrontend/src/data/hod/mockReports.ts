export interface Report {
  id: number;
  title: string;
  type: "Academic" | "Performance" | "Attendance" | "Comprehensive";
  generatedDate: string;
  period: string;
  format: "PDF" | "Excel" | "CSV";
  size: string;
  faculty?: string;
  course?: string;
}

export const mockReports: Report[] = [
  {
    id: 1,
    title: "Department Academic Summary - March 2026",
    type: "Comprehensive",
    generatedDate: "2026-03-25",
    period: "March 2026",
    format: "PDF",
    size: "2.4 MB",
  },
  {
    id: 2,
    title: "Faculty Performance Report - Q1 2026",
    type: "Performance",
    generatedDate: "2026-03-20",
    period: "Jan–Mar 2026",
    format: "PDF",
    size: "1.8 MB",
  },
  {
    id: 3,
    title: "Syllabus Coverage Analysis - Semester 6",
    type: "Academic",
    generatedDate: "2026-03-15",
    period: "Semester 6, 2026",
    format: "Excel",
    size: "956 KB",
    course: "All Courses",
  },
  {
    id: 4,
    title: "Student Attendance Report - March 2026",
    type: "Attendance",
    generatedDate: "2026-03-10",
    period: "March 2026",
    format: "PDF",
    size: "1.2 MB",
  },
  {
    id: 5,
    title: "Course Accuracy Trend - CS Department",
    type: "Performance",
    generatedDate: "2026-03-05",
    period: "Jan–Mar 2026",
    format: "CSV",
    size: "340 KB",
  },
  {
    id: 6,
    title: "Dr. Priya Sharma - Mid-Semester Review",
    type: "Performance",
    generatedDate: "2026-02-28",
    period: "Feb 2026",
    format: "PDF",
    size: "780 KB",
    faculty: "Dr. Priya Sharma",
  },
];

export const reportTypeOptions = ["Academic", "Performance", "Attendance", "Comprehensive"];
export const courseFilterOptions = ["All Courses", "Data Structures", "Database Systems", "Computer Networks", "Operating Systems", "Software Engineering", "Machine Learning"];
export const facultyFilterOptions = ["All Faculty", "Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Priya Sharma", "Prof. David Wilson", "Dr. Emily Rodriguez", "Prof. James Kumar"];
