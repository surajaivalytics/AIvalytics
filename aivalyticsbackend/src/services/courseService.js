const { db } = require("../config/database");
const logger = require("../config/logger");
const crypto = require("crypto");
const { TABLES } = require("../config/constants");

/**
 * Course Service - Firebase Firestore
const { db, admin } = require("../config/firebaseAdmin");
const logger = require("../config/logger");
const { formatFirestoreTimestamp } = require("../utils/firebaseUtils");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Course Service
 * CRUD operations for course management and student enrollment using Firebase Firestore
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
      const {
        page = 1, limit = 10, search = "", status = "all",
      } = options;

      let query = db.collection(TABLES.COURSES).where("deleted_at", "==", null);

      if (user.role === "teacher") {
        query = query.where("created_by", "==", user.id);
      } else if (user.role === "student") {
        query = query.where("is_active", "==", true);
      }

      const snapshot = await query.orderBy("created_at", "desc").get();
      let courses = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: formatFirestoreTimestamp(doc.data().created_at || doc.data().createdAt),
        updatedAt: formatFirestoreTimestamp(doc.data().updated_at || doc.data().updatedAt)
      }));

      if (search) {
        const searchLower = search.toLowerCase();
        courses = courses.filter(course =>
          (course.name && course.name.toLowerCase().includes(searchLower)) ||
          (course.about && course.about.toLowerCase().includes(searchLower))
        );
      }

      if (status !== "all") {
        const now = new Date();
        courses = courses.filter(course => {
          const startDate = new Date(course.start_date);
          const endDate = new Date(course.end_date);
          switch (status) {
            case "active": return course.is_active === true;
            case "not_started": return startDate > now;
            case "in_progress": return startDate <= now && endDate > now;
            case "completed": return endDate <= now;
            case "enrollment_open": return course.enrollment_deadline ? new Date(course.enrollment_deadline) > now : true;
            default: return true;
          }
        });
      }

      const totalCount = courses.length;
      const offset = (page - 1) * limit;
      const paginatedCourses = courses.slice(offset, offset + limit);

      const coursesWithEnrollment = await Promise.all(
        paginatedCourses.map(async (course) => {
          const studentsSnapshot = await db.collection(TABLES.USERS)
            .where("course_ids", "array-contains", course.id)
            .get();

          const enrollmentCount = studentsSnapshot.size;
          const isEnrolled = user.role === "student" && user.course_ids
            ? user.course_ids.includes(course.id)
            : false;

          const now = new Date();
          const startDate = course.start_date ? new Date(course.start_date) : now;
          const endDate = course.end_date ? new Date(course.end_date) : null;
          let timelineStatus = "unknown";
          if (endDate) {
            if (now < startDate) timelineStatus = "not_started";
            else if (now >= startDate && now <= endDate) timelineStatus = "in_progress";
            else timelineStatus = "completed";
          }
          if (now < startDate) timelineStatus = "not_started";
          else if (now >= startDate && now <= endDate) timelineStatus = "in_progress";
          else if (now > endDate) timelineStatus = "completed";

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
            daysRemaining: course.end_date
              ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null,
            enrollmentOpen: course.enrollment_deadline
              ? now < new Date(course.enrollment_deadline)
              : true,
          };
        }),
      );

      return {
        success: true,
        courses: enriched,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        courses: coursesWithEnrollment,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
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
      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const courseData = { id: courseDoc.id, ...courseDoc.data() };

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
        const studentsSnapshot = await db.collection(TABLES.USERS)
          .where("course_ids", "array-contains", courseId)
          .get();

        enrolledStudents = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          roll_number: doc.data().rollNumber || doc.data().roll_number
        }));
        enrollmentCount = enrolledStudents.length;
      }

      const isEnrolled = user.role === "student" && user.course_ids
        ? user.course_ids.includes(courseId)
        : false;

      return {
        success: true,
        course: {
          id: courseDoc.id,
          ...courseData,
          enrolledStudents,
          enrollmentCount,
          isEnrolled,
          createdAt: formatFirestoreTimestamp(courseData.created_at || courseData.createdAt),
          updatedAt: formatFirestoreTimestamp(courseData.updated_at || courseData.updatedAt)
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

      if (!name || !about) throw new Error("Course name and about are required");

      const existingSnapshot = await db.collection(TABLES.COURSES)
        .where("name", "==", name.trim())
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        throw new Error("Course name already exists");
      }

      const newCourseData = {
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
        start_date: start_date || new Date().toISOString(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        is_active: true,
        progress_percentage: 0,
        deleted_at: null
      };

      const docRef = await db.collection(TABLES.COURSES).add(newCourseData);
      
      return {
        success: true,
        message: "Course created successfully",
        course: { id: docRef.id, ...newCourseData }
      };
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
      const courseRef = db.collection(TABLES.COURSES).doc(courseId);
      const courseDoc = await courseRef.get();

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
      if (userRole === "teacher" && courseDoc.data().created_by !== updatedBy) {
        throw new Error("You can only update courses you created");
      }

      const updateFields = {
        updated_by: updatedBy,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

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
      await courseRef.update(updateFields);

      return {
        success: true,
        message: "Course updated successfully"
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
   * Delete course
   */
  async deleteCourse(courseId, deletedBy, userRole) {
    try {
      const courseRef = db.collection(TABLES.COURSES).doc(courseId);
      const courseDoc = await courseRef.get();

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
      if (userRole === "teacher" && courseDoc.data().created_by !== deletedBy) {
        throw new Error("You can only delete courses you created");
      }

      await courseRef.update({
        deleted_at: admin.firestore.FieldValue.serverTimestamp(),
        is_active: false,
        updated_by: deletedBy,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

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
   * Enroll/Unenroll
   */
  async enrollInCourse(courseId, studentId) {
    try {
      const userRef = db.collection(TABLES.USERS).doc(studentId);
      await userRef.update({
        course_ids: admin.firestore.FieldValue.arrayUnion(courseId)
      });
      return { success: true, message: "Successfully enrolled" };
    } catch (error) {
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
  async unenrollFromCourse(courseId, studentId) {
    try {
      const userRef = db.collection(TABLES.USERS).doc(studentId);
      await userRef.update({
        course_ids: admin.firestore.FieldValue.arrayRemove(courseId)
      });
      return { success: true, message: "Successfully unenrolled" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get courses for teacher (or all for HOD/Principal)
   * Teacher Courses (and HOD/Principal)
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
      
      let query = db.collection(TABLES.COURSES).where("deleted_at", "==", null);

      if (userRole === "teacher") {
        query = query.where("created_by", "==", teacherId);
      }

      const snapshot = await query.orderBy("created_at", "desc").get();
      let courses = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        
        // Get enrollment count
        const studentsSnapshot = await db.collection(TABLES.USERS)
          .where("course_ids", "array-contains", doc.id)
          .get();

        const enrollmentCount = studentsSnapshot.size;

        return {
          id: doc.id,
          ...data,
          enrollmentCount,
          createdAt: formatFirestoreTimestamp(data.created_at || data.createdAt),
          updatedAt: formatFirestoreTimestamp(data.updated_at || data.updatedAt)
        };
      }));

      if (search) {
        const lowerSearch = search.toLowerCase();
        courses = courses.filter(c => 
          c.name.toLowerCase().includes(lowerSearch) || 
          (c.about && c.about.toLowerCase().includes(lowerSearch))
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
      return {
        success: true,
        courses: courses.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error(`Get teacher courses error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course statistics
   * Stats
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

        const snapshot = await db.collection(TABLES.COURSES)
          .where("created_by", "==", user.id)
          .where("deleted_at", "==", null)
          .get();
        
        // Get total enrollments for teacher's courses
        let totalEnrollments = 0;
        const courseIds = snapshot.docs.map(doc => doc.id);
        
        if (courseIds.length > 0) {
          const studentsSnapshot = await db.collection(TABLES.USERS)
            .where("role", "==", "student")
            .get();
          
          totalEnrollments = studentsSnapshot.docs.filter(doc => {
            const userCourseIds = doc.data().course_ids || [];
            return userCourseIds.some(id => courseIds.includes(id));
          }).length;
        }

        stats = { totalCourses: snapshot.size, totalEnrollments };
      } else {
        const snapshot = await db.collection(TABLES.COURSES).where("deleted_at", "==", null).get();
        
        // Total enrollments across all courses
        const studentsSnapshot = await db.collection(TABLES.USERS)
          .where("role", "==", "student")
          .get();
        
        const totalEnrollments = studentsSnapshot.docs.reduce((acc, doc) => {
          return acc + (doc.data().course_ids ? doc.data().course_ids.length : 0);
        }, 0);

        stats = { totalCourses: snapshot.size, totalEnrollments };
      }
      return { success: true, stats };
    } catch (error) {
      logger.error(`Get course stats error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course timeline analytics
   */
  async getCourseTimelineAnalytics(user) {
    try {
      let query = db.collection(TABLES.COURSES).where("deleted_at", "==", null);
      if (user.role === "teacher") {
        query = query.where("created_by", "==", user.id);
      }
      
      const snapshot = await query.get();
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const now = new Date();
      const analytics = {
        not_started: 0,
        in_progress: 0,
        completed: 0,
        total: courses.length
      };

      courses.forEach(course => {
        const start = new Date(course.start_date || (course.created_at ? course.created_at.toDate() : new Date()));
        const duration = course.duration_months || 6;
        const end = new Date(start);
        end.setMonth(start.getMonth() + duration);

        if (now < start) analytics.not_started++;
        else if (now <= end) analytics.in_progress++;
        else analytics.completed++;
      });

      return {
        success: true,
        analytics
      };
    } catch (error) {
      logger.error(`Timeline analytics error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extend course duration
   */
  async extendCourseDuration(courseId, additionalMonths) {
    try {
      const courseRef = db.collection(TABLES.COURSES).doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const currentDuration = parseInt(courseDoc.data().duration_months) || 6;
      const newDuration = currentDuration + additionalMonths;

      await courseRef.update({
        duration_months: newDuration,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: `Course duration extended by ${additionalMonths} months to ${newDuration} months`,
      };
    } catch (error) {
      logger.error(`Extend duration error: ${error.message}`);
      throw error;
    }
  }
}

const courseService = new CourseService();
module.exports = courseService;
