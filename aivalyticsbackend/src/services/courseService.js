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
          const startDate = new Date(course.start_date);
          const endDate = new Date(course.end_date);

          let timelineStatus = "unknown";
          if (now < startDate) timelineStatus = "not_started";
          else if (now >= startDate && now <= endDate) timelineStatus = "in_progress";
          else if (now > endDate) timelineStatus = "completed";

          return {
            ...course,
            enrollmentCount,
            isEnrolled,
            timelineStatus,
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

      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

      const courseData = { id: courseDoc.id, ...courseDoc.data() };

      let enrolledStudents = [];
      let enrollmentCount = 0;

      if (["teacher", "hod", "principal"].includes(user.role)) {
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
      const courseRef = db.collection(TABLES.COURSES).doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

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
   * Delete course
   */
  async deleteCourse(courseId, deletedBy, userRole) {
    try {
      const courseRef = db.collection(TABLES.COURSES).doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists || courseDoc.data().deleted_at) {
        throw new Error("Course not found");
      }

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
   * Teacher Courses (and HOD/Principal)
   */
  async getTeacherCourses(teacherId, options = {}, userRole = "teacher") {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      
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
   * Stats
   */
  async getCourseStats(user) {
    try {
      let stats = {};
      if (user.role === "teacher") {
        const snapshot = await db.collection(TABLES.COURSES)
          .where("created_by", "==", user.id)
          .where("deleted_at", "==", null)
          .get();
        
        stats = { totalCourses: snapshot.size, totalEnrollments: 0 }; // Simplified
      } else {
        const snapshot = await db.collection(TABLES.COURSES).where("deleted_at", "==", null).get();
        stats = { totalCourses: snapshot.size, totalEnrollments: 0 };
      }
      return { success: true, stats };
    } catch (error) {
      throw error;
    }
  }
}

const courseService = new CourseService();
module.exports = courseService;
