export interface Faculty {
  id: number;
  name: string;
  designation: string;
  department: string;
  courses: string[];
  accuracy: number;
  syllabus: number;
  status: "On Track" | "Behind" | "Excellent";
  email: string;
  avatar: string;
}

export const mockFaculty: Faculty[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    designation: "Associate Professor",
    department: "Computer Science",
    courses: ["Data Structures", "Algorithms"],
    accuracy: 88,
    syllabus: 92,
    status: "Excellent",
    email: "s.johnson@university.edu",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    designation: "Assistant Professor",
    department: "Computer Science",
    courses: ["Database Systems"],
    accuracy: 74,
    syllabus: 65,
    status: "Behind",
    email: "m.chen@university.edu",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    designation: "Professor",
    department: "Computer Science",
    courses: ["Computer Networks", "Cloud Computing"],
    accuracy: 82,
    syllabus: 78,
    status: "On Track",
    email: "p.sharma@university.edu",
    avatar: "PS",
  },
  {
    id: 4,
    name: "Prof. David Wilson",
    designation: "Associate Professor",
    department: "Computer Science",
    courses: ["Operating Systems"],
    accuracy: 79,
    syllabus: 85,
    status: "On Track",
    email: "d.wilson@university.edu",
    avatar: "DW",
  },
  {
    id: 5,
    name: "Dr. Emily Rodriguez",
    designation: "Assistant Professor",
    department: "Computer Science",
    courses: ["Software Engineering", "Web Development"],
    accuracy: 91,
    syllabus: 94,
    status: "Excellent",
    email: "e.rodriguez@university.edu",
    avatar: "ER",
  },
  {
    id: 6,
    name: "Prof. James Kumar",
    designation: "Associate Professor",
    department: "Computer Science",
    courses: ["Machine Learning"],
    accuracy: 68,
    syllabus: 60,
    status: "Behind",
    email: "j.kumar@university.edu",
    avatar: "JK",
  },
];
