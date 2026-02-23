const request = require("supertest");
const app = require("../src/server");
const { pool } = require("../src/config/database");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../src/config/constants");

describe("Attendance System Tests", () => {
  let authToken;
  let teacherToken;
  let studentToken;
  let testCourseId;
  let testSessionId;
  let testStudentId;

  beforeAll(async () => {
    // Create test users and get auth tokens
    const teacherUser = {
      id: "test-teacher-id",
      email: "teacher@test.com",
      role: "teacher",
    };

    const studentUser = {
      id: "test-student-id",
      email: "student@test.com",
      role: "student",
    };

    teacherToken = jwt.sign(teacherUser, JWT_SECRET, { expiresIn: "1h" });
    studentToken = jwt.sign(studentUser, JWT_SECRET, { expiresIn: "1h" });
    testStudentId = studentUser.id;

    // Create test course
    const courseResult = await pool.query(
      `
      INSERT INTO course (id, name, description, teacher_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `,
      ["test-course-id", "Test Course", "Test Description", teacherUser.id]
    );

    testCourseId = courseResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM attendance WHERE session_id LIKE $1", [
      "test-%",
    ]);
    await pool.query("DELETE FROM attendance_session WHERE id LIKE $1", [
      "test-%",
    ]);
    await pool.query("DELETE FROM course WHERE id = $1", [testCourseId]);
    await pool.end();
  });

  describe("POST /api/attendance/sessions", () => {
    it("should create a new attendance session", async () => {
      const sessionData = {
        course_id: testCourseId,
        session_date: "2024-01-15",
        session_time: "10:00:00",
        session_duration: 60,
        session_type: "lecture",
        location: "Room 101",
        topic: "Introduction to Testing",
      };

      const response = await request(app)
        .post("/api/attendance/sessions")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(sessionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");

      testSessionId = response.body.data.id;
    });

    it("should fail with invalid data", async () => {
      const invalidData = {
        course_id: "invalid-id",
        session_date: "invalid-date",
      };

      const response = await request(app)
        .post("/api/attendance/sessions")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without authentication", async () => {
      const sessionData = {
        course_id: testCourseId,
        session_date: "2024-01-15",
        session_time: "10:00:00",
      };

      const response = await request(app)
        .post("/api/attendance/sessions")
        .send(sessionData);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/attendance/mark", () => {
    it("should mark attendance for students", async () => {
      const attendanceData = {
        session_id: testSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "present",
            notes: "On time",
          },
        ],
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(attendanceData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.marked_count).toBe(1);
    });

    it("should handle bulk attendance marking", async () => {
      // Create another session for bulk testing
      const sessionResponse = await request(app)
        .post("/api/attendance/sessions")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          course_id: testCourseId,
          session_date: "2024-01-16",
          session_time: "11:00:00",
        });

      const bulkSessionId = sessionResponse.body.data.id;

      const bulkData = {
        session_id: bulkSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "present",
          },
          {
            student_id: "test-student-2",
            attendance_status: "absent",
          },
          {
            student_id: "test-student-3",
            attendance_status: "late",
            arrival_time: "11:15:00",
          },
        ],
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(bulkData);

      expect(response.status).toBe(201);
      expect(response.body.data.marked_count).toBe(3);
    });

    it("should validate late attendance requires arrival time", async () => {
      const invalidData = {
        session_id: testSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "late",
            // Missing arrival_time
          },
        ],
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/attendance/student", () => {
    it("should get student attendance records", async () => {
      const response = await request(app)
        .get("/api/attendance/student")
        .set("Authorization", `Bearer ${studentToken}`)
        .query({
          student_id: testStudentId,
          course_id: testCourseId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by date range", async () => {
      const response = await request(app)
        .get("/api/attendance/student")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          student_id: testStudentId,
          start_date: "2024-01-01",
          end_date: "2024-01-31",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/attendance/student")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          student_id: testStudentId,
          limit: 10,
          offset: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pagination");
    });
  });

  describe("GET /api/attendance/analytics", () => {
    it("should get attendance analytics", async () => {
      const response = await request(app)
        .get("/api/attendance/analytics")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          course_id: testCourseId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("summary");
      expect(response.body.data).toHaveProperty("trends");
    });

    it("should calculate attendance percentages correctly", async () => {
      const response = await request(app)
        .get("/api/attendance/analytics")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          course_id: testCourseId,
        });

      const summary = response.body.data.summary;
      expect(summary).toHaveProperty("total_sessions");
      expect(summary).toHaveProperty("attendance_percentage");
      expect(typeof summary.attendance_percentage).toBe("number");
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limits on attendance marking", async () => {
      const attendanceData = {
        session_id: testSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "present",
          },
        ],
      };

      // Make multiple rapid requests
      const promises = Array(15)
        .fill()
        .map(() =>
          request(app)
            .post("/api/attendance/mark")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send(attendanceData)
        );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (res) => res.status === 429
      );
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("Validation Middleware", () => {
    it("should validate session creation data", async () => {
      const invalidData = {
        course_id: "not-a-uuid",
        session_date: "invalid-date",
        session_time: "25:00:00", // Invalid time
      };

      const response = await request(app)
        .post("/api/attendance/sessions")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should validate attendance marking data", async () => {
      const invalidData = {
        session_id: "not-a-uuid",
        attendance_records: "not-an-array",
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("Database Transactions", () => {
    it("should rollback on bulk attendance error", async () => {
      const invalidBulkData = {
        session_id: testSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "present",
          },
          {
            student_id: "invalid-student-id",
            attendance_status: "invalid-status", // This should cause an error
          },
        ],
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidBulkData);

      expect(response.status).toBe(400);

      // Verify no partial data was saved
      const checkResult = await pool.query(
        `
        SELECT COUNT(*) as count 
        FROM attendance 
        WHERE session_id = $1 AND student_id = $2
      `,
        [testSessionId, testStudentId]
      );

      // Should still have the original record, not duplicated
      expect(parseInt(checkResult.rows[0].count)).toBe(1);
    });
  });

  describe("Performance Tests", () => {
    it("should handle large attendance datasets efficiently", async () => {
      const startTime = Date.now();

      // Create a large number of attendance records
      const largeDataset = Array(100)
        .fill()
        .map((_, index) => ({
          student_id: `test-student-${index}`,
          attendance_status: index % 4 === 0 ? "absent" : "present",
        }));

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          session_id: testSessionId,
          attendance_records: largeDataset,
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should efficiently query attendance analytics", async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get("/api/attendance/analytics")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          course_id: testCourseId,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("Edge Cases", () => {
    it("should handle duplicate attendance marking gracefully", async () => {
      const duplicateData = {
        session_id: testSessionId,
        attendance_records: [
          {
            student_id: testStudentId,
            attendance_status: "absent",
          },
        ],
      };

      const response = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(duplicateData);

      // Should update existing record, not create duplicate
      expect(response.status).toBe(200);
      expect(response.body.data.updated_count).toBe(1);
    });

    it("should handle sessions with no enrolled students", async () => {
      // Create session for course with no students
      const emptySessionResponse = await request(app)
        .post("/api/attendance/sessions")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          course_id: "empty-course-id",
          session_date: "2024-01-20",
          session_time: "09:00:00",
        });

      const response = await request(app)
        .get("/api/attendance/analytics")
        .set("Authorization", `Bearer ${teacherToken}`)
        .query({
          course_id: "empty-course-id",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.summary.total_sessions).toBe(0);
    });

    it("should handle very old attendance records", async () => {
      const response = await request(app)
        .get("/api/attendance/student")
        .set("Authorization", `Bearer ${studentToken}`)
        .query({
          student_id: testStudentId,
          start_date: "2020-01-01",
          end_date: "2020-12-31",
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
