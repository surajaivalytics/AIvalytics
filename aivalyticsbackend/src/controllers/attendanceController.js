const { db, admin } = require("../config/database");
const { TABLES } = require("../config/constants");
const { formatFirestoreTimestamp } = require("../utils/firebaseUtils");

/**
 * Create a new attendance session (for teachers)
 */
const createAttendanceSession = async (req, res) => {
  try {
    console.log(
      "[Attendance] Create session request:",
      req.body,
      "User:",
      req.user
    );
    const teacherId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "teacher") {
      console.error(
        "[Attendance] Permission denied: Only teachers can create sessions",
        req.user
      );
      return res.status(403).json({
        success: false,
        message: "Only teachers can create attendance sessions",
      });
    }

    const {
      course_id,
      class_id,
      session_date,
      session_time,
      session_duration = 60,
      session_type = "lecture",
      location,
      topic,
    } = req.body;

    if (!course_id) {
      console.error("[Attendance] Missing course_id in request:", req.body);
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Verify teacher has access to this course
    const courseDoc = await db.collection(TABLES.COURSES).doc(course_id).get();

    if (!courseDoc.exists || courseDoc.data().created_by !== teacherId) {
      console.error(
        "[Attendance] Course not found or permission denied:",
        req.body
      );
      return res.status(403).json({
        success: false,
        message: "You don't have permission to create sessions for this course",
      });
    }

    const sessionData = {
      course_id,
      class_id: class_id || null,
      teacher_id: teacherId,
      session_date: session_date || new Date().toISOString().split("T")[0],
      session_time: session_time || new Date().toTimeString().split(" ")[0],
      session_duration,
      session_type,
      location: location || null,
      topic: topic || null,
      status: "scheduled",
      created_by: teacherId,
      updated_by: teacherId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create attendance session
    const sessionRef = await db.collection(TABLES.ATTENDANCE_SESSIONS).add(sessionData);
    const sessionDoc = await sessionRef.get();
    const session = { id: sessionRef.id, ...sessionDoc.data() };

    console.log("[Attendance] Session created successfully:", session);
    res.status(201).json({
      success: true,
      message: "Attendance session created successfully",
      data: session,
    });
  } catch (error) {
    console.error(
      "[Attendance] Unexpected error in createAttendanceSession:",
      error,
      req.body
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark attendance for students (bulk operation)
 */
const markAttendance = async (req, res) => {
  try {
    console.log(
      "[Attendance] Mark attendance request:",
      req.body,
      "User:",
      req.user
    );
    const teacherId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "teacher") {
      console.error(
        "[Attendance] Permission denied: Only teachers can mark attendance",
        req.user
      );
      return res.status(403).json({
        success: false,
        message: "Only teachers can mark attendance",
      });
    }

    const { session_id, attendance_records } = req.body;

    if (
      !session_id ||
      !Array.isArray(attendance_records) ||
      attendance_records.length === 0
    ) {
      console.error("[Attendance] Invalid attendance mark request:", req.body);
      return res.status(400).json({
        success: false,
        message: "Session ID and attendance records are required",
      });
    }

    // === ADDED VALIDATION ===
    for (const record of attendance_records) {
      // Validate excuse reason for excused statuses
      if (
        (record.attendance_status === "excused" ||
          record.attendance_status === "medical_leave") &&
        (!record.excuse_reason ||
          typeof record.excuse_reason !== "string" ||
          record.excuse_reason.trim() === "")
      ) {
        console.error("[Attendance] Invalid excuse reason", record);
        return res.status(400).json({
          success: false,
          message: `Detailed excuse reason is required for status '${record.attendance_status}'`,
          details: {
            student_id: record.student_id,
            attendance_status: record.attendance_status,
          },
        });
      }

      // Validate arrival time for late status
      if (
        record.attendance_status === "late" &&
        (!record.arrival_time ||
          typeof record.arrival_time !== "string" ||
          record.arrival_time.trim() === "")
      ) {
        console.error("[Attendance] Invalid arrival time", record);
        return res.status(400).json({
          success: false,
          message: `Arrival time is required for status 'late'`,
          details: {
            student_id: record.student_id,
            attendance_status: record.attendance_status,
          },
        });
      }
    }
    // === END VALIDATION ===

    // Verify session exists and teacher has permission
    const sessionRef = db.collection(TABLES.ATTENDANCE_SESSIONS).doc(session_id);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists || sessionDoc.data().teacher_id !== teacherId) {
      console.error(
        "[Attendance] Session not found or permission denied:",
        req.body
      );
      return res.status(403).json({
        success: false,
        message: "Session not found or you don't have permission",
      });
    }

    const session = { id: sessionDoc.id, ...sessionDoc.data() };

    // Prepare attendance records for insertion
    const attendanceData = attendance_records.map((record) => ({
      session_id,
      student_id: record.student_id,
      course_id: session.course_id,
      attendance_status: record.attendance_status || "absent",
      marked_by: teacherId,
      arrival_time: record.arrival_time || null,
      departure_time: record.departure_time || null,
      excuse_reason: record.excuse_reason || null,
      location_verified: record.location_verified || false,
      ip_address: req.ip || null,
      device_info: {
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }));

    // Insert/Update attendance records using batch
    const batch = db.batch();
    const attendanceResults = [];

    for (const data of attendanceData) {
      // Use composite ID to prevent duplicates for same session/student
      const docId = `${data.session_id}_${data.student_id}`;
      const docRef = db.collection(TABLES.ATTENDANCE).doc(docId);
      batch.set(docRef, data, { merge: true });
      attendanceResults.push({ id: docId, ...data });
    }

    await batch.commit();

    // Get all attendance records for this session to calculate accurate totals
    const allRecordsSnapshot = await db
      .collection(TABLES.ATTENDANCE)
      .where("session_id", "==", session_id)
      .get();
    
    const allAttendanceRecords = allRecordsSnapshot.docs.map(doc => doc.data());

    // Calculate totals from all attendance records
    const totalStudents = allAttendanceRecords.length;
    const totalPresentStudents = allAttendanceRecords.filter(
      (record) =>
        record.attendance_status === "present" ||
        record.attendance_status === "excused"
    ).length;
    const totalAbsentStudents = allAttendanceRecords.filter(
      (record) => record.attendance_status === "absent"
    ).length;
    const totalLateStudents = allAttendanceRecords.filter(
      (record) => record.attendance_status === "late"
    ).length;

    // Update session status with proper counts
    await sessionRef.update({
      status: "completed",
      attendance_marked: true,
      total_students: totalStudents,
      present_students: totalPresentStudents,
      absent_students: totalAbsentStudents,
      late_students: totalLateStudents,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: teacherId,
    });

    console.log(
      "[Attendance] Attendance marked successfully for session:",
      session_id
    );
    res.json({
      success: true,
      message: `Attendance marked for ${attendanceResults.length} students`,
      data: {
        session_id,
        records_processed: attendanceResults.length,
        attendance_records: attendanceResults,
      },
    });
  } catch (error) {
    console.error(
      "[Attendance] Unexpected error in markAttendance:",
      error,
      req.body
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get attendance records for a student
 */
const getStudentAttendance = async (req, res) => {
  try {
    console.log("[Attendance] Received student attendance request:", {
      user: req.user,
      query: req.query,
    });

    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      student_id,
      course_id,
      start_date,
      end_date,
      limit = 50,
      offset = 0,
    } = req.query;

    let targetStudentId = userId;
    if (student_id && userRole !== "student") {
      targetStudentId = student_id;
    } else if (userRole === "student" && student_id && student_id !== userId) {
      console.warn("[Attendance] Unauthorized student access attempt:", {
        requestedStudentId: student_id,
        currentUserId: userId,
      });
      return res.status(403).json({
        success: false,
        message: "Students can only view their own attendance",
      });
    }

    // Build query
    let query = db.collection(TABLES.ATTENDANCE_OVERVIEW)
      .where("student_id", "==", targetStudentId)
      .orderBy("session_date", "desc");

    if (course_id) query = query.where("course_id", "==", course_id);
    if (start_date) query = query.where("session_date", ">=", start_date);
    if (end_date) query = query.where("session_date", "<=", end_date);

    // Pagination for Firestore
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("[Attendance] Attendance query result:", {
      attendanceCount: attendance?.length || 0,
    });

    // Get attendance summary
    const summarySnapshot = await db.collection(TABLES.ATTENDANCE_SUMMARY)
      .where("student_id", "==", targetStudentId)
      .get();
    
    const summary = summarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("[Attendance] Summary query result:", {
      summaryCount: summary?.length || 0,
    });

    // Ensure data is in the correct format
    const responseData = {
      success: true,
      data: {
        attendance_records: attendance || [],
        summary: summary || [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: attendance?.length || 0,
        },
      },
    };

    console.log(
      "[Attendance] Final response:",
      JSON.stringify(responseData, null, 2)
    );

    res.json(responseData);
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Get student attendance records for dashboard
 */
const getStudentAttendanceRecords = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;

    console.log(`🔍 Debug: Student ID: ${studentId}, Role: ${studentRole}`);

    // Verify user is a student
    if (studentRole !== "student") {
      console.log(
        `❌ Access denied: User role is ${studentRole}, expected student`
      );
      return res.status(403).json({
        success: false,
        message: "Only students can view their attendance records",
      });
    }

    console.log(`📊 Fetching attendance records for student: ${studentId}`);

    // Get all attendance records for this student with full details
    const recordsSnapshot = await db.collection(TABLES.ATTENDANCE)
      .where("student_id", "==", studentId)
      .orderBy("created_at", "desc")
      .get();

    const records = await Promise.all(recordsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Manual join for session and course
      const sessionDoc = await db.collection(TABLES.ATTENDANCE_SESSIONS).doc(data.session_id).get();
      let sessionData = sessionDoc.exists ? { id: sessionDoc.id, ...sessionDoc.data() } : null;
      
      if (sessionData && sessionData.course_id) {
        const courseDoc = await db.collection(TABLES.COURSES).doc(sessionData.course_id).get();
        sessionData.course = courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
      }

      return {
        id: doc.id,
        ...data,
        session: sessionData
      };
    }));

    console.log(
      `✅ Found ${
        records?.length || 0
      } detailed attendance records for student ${studentId}`
    );

    // Log the first few records for debugging
    if (records && records.length > 0) {
      console.log("📋 Sample records:", records.slice(0, 2));
    }

    res.json({
      success: true,
      data: {
        records: records || [],
        totalRecords: records?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error in getStudentAttendanceRecords:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

/**
 * Get attendance analytics
 */
const getAttendanceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (
      userRole !== "teacher" &&
      userRole !== "hod" &&
      userRole !== "principal"
    ) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to view attendance analytics",
      });
    }

    const { course_id } = req.query;

    let summaryQuery = db.collection(TABLES.ATTENDANCE_SUMMARY);

    if (course_id) {
      summaryQuery = summaryQuery.where("course_id", "==", course_id);
    }

    const summarySnapshot = await summaryQuery.get();
    const summaryData = summarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate analytics
    const analytics = {
      total_students: summaryData.length,
      average_attendance:
        summaryData.length > 0
          ? summaryData.reduce(
              (sum, s) => sum + parseFloat(s.attendance_percentage),
              0
            ) / summaryData.length
          : 0,
      excellent_attendance: summaryData.filter((s) => s.status === "excellent")
        .length,
      good_attendance: summaryData.filter((s) => s.status === "good").length,
      warning_attendance: summaryData.filter((s) => s.status === "warning")
        .length,
      critical_attendance: summaryData.filter((s) => s.status === "critical")
        .length,
    };

    res.json({
      success: true,
      data: {
        analytics,
        detailed_summary: summaryData,
      },
    });
  } catch (error) {
    console.error("Get attendance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get attendance sessions for a course
const getAttendanceSessions = async (req, res) => {
  try {
    const { course_id } = req.query;
    if (!course_id) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
    }
    const snapshot = await db.collection(TABLES.ATTENDANCE_SESSIONS)
      .where("course_id", "==", course_id)
      .orderBy("session_date", "desc")
      .orderBy("session_time", "desc")
      .get();
    
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error(
      "[Attendance] Unexpected error in getAttendanceSessions:",
      error,
      req.query
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all attendance records for a session
const getSessionAttendance = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required" });
    }
    const snapshot = await db.collection(TABLES.ATTENDANCE)
      .where("session_id", "==", session_id)
      .get();
    
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        student_id: docData.student_id,
        attendance_status: docData.attendance_status,
        notes: docData.notes,
        arrival_time: docData.arrival_time,
        departure_time: docData.departure_time
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAttendanceSession,
  markAttendance,
  getStudentAttendance,
  getAttendanceAnalytics,
  getAttendanceSessions,
  getSessionAttendance,
  getStudentAttendanceRecords,
};
