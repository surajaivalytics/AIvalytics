export interface Course {
  id: number;
  name: string;
  code: string;
  faculty: string;
  year: number;
  semester: number;
  status: "Active" | "Completed" | "Upcoming";
  completion: number;
  accuracy: number;
  enrolled: number;
  credits: number;
}

export const mockCourses: Course[] = [
  {
    id: 1,
    name: "Data Structures",
    code: "CS201",
    faculty: "Dr. Sarah Johnson",
    year: 2,
    semester: 3,
    status: "Active",
    completion: 78,
    accuracy: 85,
    enrolled: 62,
    credits: 4,
  },
  {
    id: 2,
    name: "Database Systems",
    code: "CS301",
    faculty: "Prof. Michael Chen",
    year: 3,
    semester: 5,
    status: "Active",
    completion: 65,
    accuracy: 74,
    enrolled: 58,
    credits: 4,
  },
  {
    id: 3,
    name: "Computer Networks",
    code: "CS302",
    faculty: "Dr. Priya Sharma",
    year: 3,
    semester: 5,
    status: "Active",
    completion: 72,
    accuracy: 80,
    enrolled: 55,
    credits: 3,
  },
  {
    id: 4,
    name: "Operating Systems",
    code: "CS303",
    faculty: "Prof. David Wilson",
    year: 3,
    semester: 6,
    status: "Active",
    completion: 85,
    accuracy: 79,
    enrolled: 60,
    credits: 4,
  },
  {
    id: 5,
    name: "Software Engineering",
    code: "CS401",
    faculty: "Dr. Emily Rodriguez",
    year: 4,
    semester: 7,
    status: "Active",
    completion: 92,
    accuracy: 91,
    enrolled: 48,
    credits: 4,
  },
  {
    id: 6,
    name: "Machine Learning",
    code: "CS402",
    faculty: "Prof. James Kumar",
    year: 4,
    semester: 7,
    status: "Active",
    completion: 60,
    accuracy: 68,
    enrolled: 45,
    credits: 3,
  },
  {
    id: 7,
    name: "Algorithms",
    code: "CS202",
    faculty: "Dr. Sarah Johnson",
    year: 2,
    semester: 4,
    status: "Completed",
    completion: 100,
    accuracy: 88,
    enrolled: 64,
    credits: 4,
  },
];
