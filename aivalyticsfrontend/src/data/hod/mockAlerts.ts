export type AlertSeverity = "Critical" | "Warning" | "Info";

export interface Alert {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  severity: AlertSeverity;
  type: "Academic" | "Administrative" | "Performance" | "Attendance";
  read: boolean;
}

export const mockAlerts: Alert[] = [
  {
    id: 1,
    title: "Low Course Accuracy Detected",
    description:
      "Machine Learning (CS402) has dropped below the 70% accuracy threshold. Immediate review recommended.",
    timestamp: "2026-03-26T09:15:00",
    severity: "Critical",
    type: "Academic",
    read: false,
  },
  {
    id: 2,
    title: "Syllabus Coverage Behind Schedule",
    description:
      "Database Systems (CS301) is 25% behind the expected syllabus coverage for this point in the semester.",
    timestamp: "2026-03-25T14:30:00",
    severity: "Warning",
    type: "Performance",
    read: false,
  },
  {
    id: 3,
    title: "Faculty Submission Pending",
    description:
      "Prof. Michael Chen has not submitted the mid-semester assessment grades for CS301.",
    timestamp: "2026-03-24T11:00:00",
    severity: "Warning",
    type: "Administrative",
    read: true,
  },
  {
    id: 4,
    title: "High Attendance Drop Reported",
    description:
      "Student attendance in Operating Systems has fallen below 75% for the past 2 weeks.",
    timestamp: "2026-03-23T16:45:00",
    severity: "Warning",
    type: "Attendance",
    read: true,
  },
  {
    id: 5,
    title: "Department Meeting Reminder",
    description:
      "Monthly department review meeting scheduled for March 28, 2026 at 10:00 AM in Room 401.",
    timestamp: "2026-03-22T08:00:00",
    severity: "Info",
    type: "Administrative",
    read: true,
  },
  {
    id: 6,
    title: "Semester End Approaching",
    description:
      "4 courses are scheduled for completion this month. Please ensure all assessments are finalized.",
    timestamp: "2026-03-21T10:00:00",
    severity: "Info",
    type: "Academic",
    read: true,
  },
  {
    id: 7,
    title: "New AI Tool Available",
    description:
      "The AI-powered MCQ generator has been updated with support for Computer Science topics. Try it now.",
    timestamp: "2026-03-20T09:00:00",
    severity: "Info",
    type: "Administrative",
    read: true,
  },
];
