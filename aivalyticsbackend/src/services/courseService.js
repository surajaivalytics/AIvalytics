const { db } = require("../config/database");
const logger = require("../config/logger");
const crypto = require("crypto");
const { TABLES } = require("../config/constants");

/**
 * Course Service - Firebase Firestore
 */
class CourseService {
  /**
   * Get all courses with optional filters
   */
  async getAllCourses(options = {}, user) {
    try {
      const { page = 1, limit = 10, search = "", status = "all" } = options;

      let query = db.collection(TABLES.COURSES).where("deleted_at", "==", null);

      // Role-based filtering
      if (user.role === "student") {
        query = query.where("is_active", "==", true);
      } else if (user.role === "teacher") {
        query = query.where("created_by", "==", user.id);
      }

      const snap = await query.orderBy("created_at", "desc").get();

      let courses = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Search filter (in-memory for Firestore)
      if (search) {
        const searchLower = search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.name?.toLowerCase().includes(searchLower) ||
            c.about?.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (status !== "all") {
        const now = new Date();
        courses = courses.filter((c) => {
          const start = c.start_date ? new Date(c.start_date) : null;
          const end = c.end_date ? new Date(c.end_date) : null;
          switch (status) {
            case "active": return c.is_active === true;
            case "not_started": return start && now < start;
            case "in_progress": return start && end && now >= start && now <= end;
            case "completed": return end && now > end;
            default: return true;
          }
        });
      }

      const total = courses.length;

      // Paginate
      const offset = (page - 1) * limit;
      const paginated = courses.slice(offset, offset + limit);

      // Enrich with enrollment info
      const enriched = await Promise.all(
        paginated.map(async (course) => {
          const enrollSnap = await db
            .collection(TABLES.USERS)
            .where("course_ids", "array-contains", course.id)
            .get();
          const enrollmentCount = enrollSnap.size;
          const isEnrolled =
            user.role === "student" && (user.course_ids || []).includes(course.id);

          const now = new Date();
          const startDate = course.start_date ? new Date(course.start_date) : now;
          const endDate = course.end_date ? new Date(course.end_date) : null;
          let timelineStatus = "unknown";
          if (endDate) {
            if (now < startDate) timelineStatus = "not_started";
            else if (now >= startDate && now <= endDate) timelineStatus = "in_progress";
            else timelineStatus = "completed";
          }

          return {
            ...course,
            enrollmentCount,
            isEnrolled,
            timelineStatus,
            daysRemaining: endDate
              ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
              : null,
          };
        })
      );

      return {
        success: true,
        courses: enriched,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error(`Get all courses error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId, user) {
    try {
      const courseDoc = await db.collection(TABLES.COURSES).doc(courseId).get();

      if (!courseDoc.exists) {
        throw new Error("Course not found");
      }

      const courseData = courseDoc.data();
      if (courseData.deleted_at) throw new Error("Course not found");

      let enrolledStudents = [];
      let enrollmentCount = 0;

      if (["teacher", "hod", "principal"].includes(user.role)) {
        const studentsSnap = await db
          .collection(TABLES.USERS)
          .where("course_ids", "array-contains", courseId)
          .get();
        enrolledStudents = studentsSnap.docs.map((d) => ({
          id: d.id,
          username: d.data().username,
          roll_number: d.data().roll_number,
        }));
        enrollmentCount = studentsSnap.size;
      }

      const isEnrolled =
        user.role === "student" && (user.course_ids || []).includes(courseId);

      return {
        success: true,
        course: {
          id: courseDoc.id,
          ...courseData,
          enrolledStudents,
          enrollmentCount,
          isEnrolled,
        },
      };
    } catch (error) {
      logger.error(`Get course by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new course
   */
  async createCourse(courseData, createdBy) {
    try {
      const { name, about, duration_months, start_date } = courseData;

      if (!name || !about) throw new Error("Course name and about are required");

      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        throw new Error("Duration must be between 1 and 24 months");
      }

      // Check name uniqueness
      const existingSnap = await db
        .collection(TABLES.COURSES)
        .where("name", "==", name)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!existingSnap.empty) throw new Error("Course name already exists");

      const courseId = crypto.randomUUID();
      const now = new Date().toISOString();
      const newCourse = {
        id: courseId,
        name: name.trim(),
        about: about.trim(),
        created_by: createdBy,
        updated_by: createdBy,
        duration_months: duration_months || 6,
        start_date: start_date || now,
        created_at: now,
        updated_at: now,
        is_active: true,
        progress_percentage: 0,
        deleted_at: null,
      };

      await db.collection(TABLES.COURSES).doc(courseId).set(newCourse);

      logger.info(`Course created: ${name} by user ${createdBy}`);

      return { success: true, message: "Course created successfully", course: newCourse };
    } catch (error) {
      logger.error(`Create course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(courseId, updateData, updatedBy, userRole) {
    try {
      const { name, about, duration_months, start_date } = updateData;

      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        throw new Error("Duration must be between 1 and 24 months");
      }

      const courseDoc = await db.collection(TABLES.COURSES).doc(courseId).get();
      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const existing = courseDoc.data();

      if (userRole === "teacher" && existing.created_by !== updatedBy) {
        throw new Error("You can only update courses you created");
      }

      if (name && name !== existing.name) {
        const nameSnap = await db
          .collection(TABLES.COURSES)
          .where("name", "==", name)
          .where("deleted_at", "==", null)
          .limit(1)
          .get();
        const conflict = nameSnap.docs.find((d) => d.id !== courseId);
        if (conflict) throw new Error("Course name already exists");
      }

      const updateFields = { updated_by: updatedBy, updated_at: new Date().toISOString() };
      if (name) updateFields.name = name.trim();
      if (about) updateFields.about = about.trim();
      if (duration_months) updateFields.duration_months = duration_months;
      if (start_date) updateFields.start_date = start_date;

      await db.collection(TABLES.COURSES).doc(courseId).update(updateFields);

      const updatedDoc = await db.collection(TABLES.COURSES).doc(courseId).get();

      logger.info(`Course updated: ${courseId} by user ${updatedBy}`);

      return {
        success: true,
        message: "Course updated successfully",
        course: { id: updatedDoc.id, ...updatedDoc.data() },
      };
    } catch (error) {
      logger.error(`Update course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soft-delete course
   */
  async deleteCourse(courseId, deletedBy, userRole) {
    try {
      const courseDoc = await db.collection(TABLES.COURSES).doc(courseId).get();
      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const existing = courseDoc.data();

      if (userRole === "teacher" && existing.created_by !== deletedBy) {
        throw new Error("You can only delete courses you created");
      }

      const now = new Date().toISOString();
      await db.collection(TABLES.COURSES).doc(courseId).update({
        deleted_at: now,
        updated_by: deletedBy,
        updated_at: now,
        is_active: false,
      });

      // Remove course from all enrolled students
      const enrolledSnap = await db
        .collection(TABLES.USERS)
        .where("course_ids", "array-contains", courseId)
        .get();

      const batch = db.batch();
      const { FieldValue } = require("firebase-admin").firestore;
      enrolledSnap.docs.forEach((d) => {
        batch.update(d.ref, {
          course_ids: FieldValue.arrayRemove(courseId),
        });
      });
      await batch.commit();

      logger.info(`Course deleted: ${courseId} by user ${deletedBy}`);

      return { success: true, message: "Course deleted successfully" };
    } catch (error) {
      logger.error(`Delete course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enroll student in course
   */
  async enrollInCourse(courseId, studentId) {
    try {
      const { FieldValue } = require("firebase-admin").firestore;

      const courseDoc = await db.collection(TABLES.COURSES).doc(courseId).get();
      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const studentDoc = await db.collection(TABLES.USERS).doc(studentId).get();
      if (!studentDoc.exists) throw new Error("Student not found");

      const student = studentDoc.data();
      if (student.course_ids && student.course_ids.includes(courseId)) {
        throw new Error("Already enrolled in this course");
      }

      await db
        .collection(TABLES.USERS)
        .doc(studentId)
        .update({ course_ids: FieldValue.arrayUnion(courseId) });

      logger.info(`Student ${studentId} enrolled in course ${courseId}`);

      return { success: true, message: "Successfully enrolled in course" };
    } catch (error) {
      logger.error(`Enroll in course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unenroll student from course
   */
  async unenrollFromCourse(courseId, studentId) {
    try {
      const { FieldValue } = require("firebase-admin").firestore;

      const studentDoc = await db.collection(TABLES.USERS).doc(studentId).get();
      if (!studentDoc.exists) throw new Error("Student not found");

      const student = studentDoc.data();
      if (!student.course_ids || !student.course_ids.includes(courseId)) {
        throw new Error("Not enrolled in this course");
      }

      await db
        .collection(TABLES.USERS)
        .doc(studentId)
        .update({ course_ids: FieldValue.arrayRemove(courseId) });

      logger.info(`Student ${studentId} unenrolled from course ${courseId}`);

      return { success: true, message: "Successfully unenrolled from course" };
    } catch (error) {
      logger.error(`Unenroll from course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get courses for teacher (or all for HOD/Principal)
   */
  async getTeacherCourses(teacherId, options = {}, userRole = "teacher") {
    try {
      const { page = 1, limit = 10, search = "" } = options;

      let query = db.collection(TABLES.COURSES).where("deleted_at", "==", null);

      if (userRole === "teacher") {
        query = query.where("created_by", "==", teacherId);
      }

      const snap = await query.orderBy("created_at", "desc").get();
      let courses = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (search) {
        const s = search.toLowerCase();
        courses = courses.filter(
          (c) =>
            c.name?.toLowerCase().includes(s) ||
            c.about?.toLowerCase().includes(s)
        );
      }

      const total = courses.length;
      const offset = (page - 1) * limit;
      const paginated = courses.slice(offset, offset + limit);

      const enriched = await Promise.all(
        paginated.map(async (course) => {
          const enrollSnap = await db
            .collection(TABLES.USERS)
            .where("course_ids", "array-contains", course.id)
            .get();
          return { ...course, enrollmentCount: enrollSnap.size };
        })
      );

      return {
        success: true,
        courses: enriched,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error(`Get teacher courses error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(user) {
    try {
      let stats = {};

      if (user.role === "teacher") {
        const snap = await db
          .collection(TABLES.COURSES)
          .where("created_by", "==", user.id)
          .where("deleted_at", "==", null)
          .get();
        const courseIds = snap.docs.map((d) => d.id);

        let totalEnrollments = 0;
        for (const cid of courseIds) {
          const es = await db
            .collection(TABLES.USERS)
            .where("course_ids", "array-contains", cid)
            .get();
          totalEnrollments += es.size;
        }

        stats = { totalCourses: snap.size, totalEnrollments };
      } else if (user.role === "student") {
        const totalAvailable = await db
          .collection(TABLES.COURSES)
          .where("deleted_at", "==", null)
          .get();
        stats = {
          enrolledCourses: (user.course_ids || []).length,
          availableCourses: totalAvailable.size,
        };
      } else {
        const allCourses = await db
          .collection(TABLES.COURSES)
          .where("deleted_at", "==", null)
          .get();
        stats = { totalCourses: allCourses.size };
      }

      return { success: true, stats };
    } catch (error) {
      logger.error(`Get course stats error: ${error.message}`);
      throw error;
    }
  }
}

const courseService = new CourseService();
module.exports = courseService;
