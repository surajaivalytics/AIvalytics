const { supabaseAdmin } = require("../config/database");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Course Service
 * CRUD operations for course management and student enrollment
 */
class CourseService {
  /**
   * Get all courses with optional filters
   * @param {Object} options - Query options (pagination, search, user role)
   * @param {Object} user - Current user object
   * @returns {Object} List of courses
   */
  async getAllCourses(options = {}, user) {
    try {
      const {
        page = 1, limit = 10, search = "", status = "all",
      } = options;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from(TABLES.COURSES)
        .select(
          `
          *,
          created_by_user:created_by(id, username, roll_number),
          updated_by_user:updated_by(id, username)
        `,
          { count: "exact" },
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      // Add search filter if provided
      if (search) {
        query = query.or(`name.ilike.%${search}%,about.ilike.%${search}%`);
      }

      // Add status filter for timeline-based filtering
      if (status !== "all") {
        const now = new Date().toISOString();
        switch (status) {
          case "active":
            query = query.eq("is_active", true);
            break;
          case "not_started":
            query = query.gt("start_date", now);
            break;
          case "in_progress":
            query = query.lte("start_date", now).gt("end_date", now);
            break;
          case "completed":
            query = query.lte("end_date", now);
            break;
          case "enrollment_open":
            query = query.gt("enrollment_deadline", now);
            break;
        }
      }

      // For students, only show active courses they can enroll in
      if (user.role === "student") {
        query = query.eq("is_active", true);
      }

      // For teachers, only show courses they created
      if (user.role === "teacher") {
        query = query.eq("created_by", user.id);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      const { data: courses, error, count } = await query;

      if (error) {
        logger.error(`Get courses failed: ${error.message}`);
        throw new Error("Failed to fetch courses");
      }

      // Add enrollment information for each course
      const coursesWithEnrollment = await Promise.all(
        courses.map(async (course) => {
          // Get enrollment count
          const { data: enrollmentData } = await supabaseAdmin
            .from(TABLES.USERS)
            .select("id")
            .contains("course_ids", [course.id]);

          const enrollmentCount = enrollmentData ? enrollmentData.length : 0;

          // For students, check if they're enrolled
          const isEnrolled = user.role === "student" && user.course_ids
            ? user.course_ids.includes(course.id)
            : false;

          // Calculate timeline status
          const now = new Date();
          const startDate = new Date(course.start_date);
          const endDate = new Date(course.end_date);

          let timelineStatus = "unknown";
          if (now < startDate) {
            timelineStatus = "not_started";
          } else if (now >= startDate && now <= endDate) {
            timelineStatus = "in_progress";
          } else if (now > endDate) {
            timelineStatus = "completed";
          }

          return {
            ...course,
            enrollmentCount,
            isEnrolled,
            timelineStatus,
            daysRemaining: course.end_date
              ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
              : null,
            enrollmentOpen: course.enrollment_deadline
              ? now < new Date(course.enrollment_deadline)
              : true,
            // Add creator information for tracking
            createdByUsername: course.created_by_user?.username || "Unknown",
            createdByRollNumber: course.created_by_user?.roll_number || "N/A",
            updatedByUsername: course.updated_by_user?.username || "Unknown",
          };
        }),
      );

      logger.info(
        `Retrieved ${coursesWithEnrollment.length} courses for user ${user.id} (${user.role})`,
      );

      return {
        success: true,
        courses: coursesWithEnrollment,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error(`Get all courses error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course by ID with enrollment details
   * @param {string} courseId - Course ID
   * @param {Object} user - Current user object
   * @returns {Object} Course details
   */
  async getCourseById(courseId, user) {
    try {
      const { data: courseData, error } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select(
          `
          *,
          created_by_user:created_by(id, username, roll_number),
          updated_by_user:updated_by(id, username)
        `,
        )
        .eq("id", courseId)
        .is("deleted_at", null) // Only show non-deleted courses
        .single();

      if (error || !courseData) {
        logger.warn(`Course not found or deleted: ${courseId}`);
        throw new Error("Course not found");
      }

      // Check if user has permission to view this course
      if (user.role === "teacher" && courseData.created_by !== user.id) {
        // Teachers can only view their own courses (unless HOD/Principal)
        logger.warn(
          `Teacher ${user.id} attempted to access course ${courseId} created by ${courseData.created_by}`,
        );
      }

      // Get enrolled students count and list (for teachers)
      let enrolledStudents = [];
      let enrollmentCount = 0;

      if (
        user.role === "teacher"
        || user.role === "hod"
        || user.role === "principal"
      ) {
        const { data: students, error: studentsError } = await supabaseAdmin
          .from(TABLES.USERS)
          .select("id, username, roll_number")
          .contains("course_ids", [courseId]);

        if (!studentsError && students) {
          enrolledStudents = students;
          enrollmentCount = students.length;
        }
      }

      // For students, add enrollment status
      const isEnrolled = user.role === "student" && user.course_ids
        ? user.course_ids.includes(courseId)
        : false;

      logger.info(
        `Course ${courseId} retrieved by user ${user.id} (${user.role}). Created by: ${courseData.created_by}`,
      );

      return {
        success: true,
        course: {
          ...courseData,
          enrolledStudents,
          enrollmentCount,
          isEnrolled,
          // Add creator information
          createdByUsername: courseData.created_by_user?.username || "Unknown",
          createdByRollNumber: courseData.created_by_user?.roll_number || "N/A",
          updatedByUsername: courseData.updated_by_user?.username || "Unknown",
        },
      };
    } catch (error) {
      logger.error(`Get course by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new course (Teachers only)
   * @param {Object} courseData - Course data
   * @param {string} createdBy - User ID who created the course
   * @returns {Object} Created course
   */
  async createCourse(courseData, createdBy) {
    try {
      const {
        name, about, duration_months, start_date,
      } = courseData;

      // Validation
      if (!name || !about) {
        throw new Error("Course name and about are required");
      }

      // Validate duration_months
      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        throw new Error("Duration must be between 1 and 24 months");
      }

      // Validate start_date
      if (
        start_date
        && new Date(start_date) < new Date().setHours(0, 0, 0, 0)
      ) {
        throw new Error("Start date cannot be in the past");
      }

      // Check if course name already exists
      const { data: existingName } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select("id")
        .eq("name", name)
        .is("deleted_at", null)
        .single();

      if (existingName) {
        throw new Error("Course name already exists");
      }

      // Prepare course data with proper tracking fields
      const courseInsertData = {
        name: name.trim(),
        about: about.trim(),
        created_by: createdBy, // Track who created the course
        updated_by: createdBy, // Initially same as created_by
        duration_months: duration_months || 6, // Default 6 months
        start_date: start_date || new Date().toISOString(), // Default to now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true, // Set as active by default
        progress_percentage: 0, // Start with 0% progress
      };

      // Create course
      const { data: newCourse, error: createError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .insert(courseInsertData)
        .select(
          `
          *,
          created_by_user:created_by(id, username),
          updated_by_user:updated_by(id, username)
        `,
        )
        .single();

      if (createError) {
        logger.error(`Create course failed: ${createError.message}`);
        throw new Error("Failed to create course");
      }

      logger.info(
        `Course created: ${newCourse.name} by user ${createdBy} (ID: ${newCourse.id})`,
      );

      return {
        success: true,
        message: "Course created successfully",
        course: newCourse,
      };
    } catch (error) {
      logger.error(`Create course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update course (Teachers only - can only update their own courses)
   * @param {string} courseId - Course ID
   * @param {Object} updateData - Update data
   * @param {string} updatedBy - User ID who updated the course
   * @param {string} userRole - User role
   * @returns {Object} Updated course
   */
  async updateCourse(courseId, updateData, updatedBy, userRole) {
    try {
      const {
        name, about, duration_months, start_date,
      } = updateData;

      // Validation
      if (duration_months && (duration_months < 1 || duration_months > 24)) {
        throw new Error("Duration must be between 1 and 24 months");
      }

      if (
        start_date
        && new Date(start_date) < new Date().setHours(0, 0, 0, 0)
      ) {
        throw new Error("Start date cannot be in the past");
      }

      // Check if course exists and get current data
      const { data: existingCourse, error: fetchError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select("*")
        .eq("id", courseId)
        .is("deleted_at", null)
        .single();

      if (fetchError || !existingCourse) {
        throw new Error("Course not found");
      }

      // Teachers can only update their own courses (unless HOD/Principal)
      if (userRole === "teacher" && existingCourse.created_by !== updatedBy) {
        throw new Error("You can only update courses you created");
      }

      // Check if new name already exists (excluding current course)
      if (name && name !== existingCourse.name) {
        const { data: nameExists } = await supabaseAdmin
          .from(TABLES.COURSES)
          .select("id")
          .eq("name", name)
          .neq("id", courseId)
          .is("deleted_at", null)
          .single();

        if (nameExists) {
          throw new Error("Course name already exists");
        }
      }

      // Prepare update data with proper tracking
      const updateFields = {
        updated_by: updatedBy, // Track who updated the course
        updated_at: new Date().toISOString(), // Update timestamp
      };

      // Only update fields that are provided
      if (name) updateFields.name = name.trim();
      if (about) updateFields.about = about.trim();
      if (duration_months) updateFields.duration_months = duration_months;
      if (start_date) updateFields.start_date = start_date;

      // Update course
      const { data: updatedCourse, error: updateError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .update(updateFields)
        .eq("id", courseId)
        .select(
          `
          *,
          created_by_user:created_by(id, username),
          updated_by_user:updated_by(id, username)
        `,
        )
        .single();

      if (updateError) {
        logger.error(`Update course failed: ${updateError.message}`);
        throw new Error("Failed to update course");
      }

      logger.info(
        `Course updated: ${updatedCourse.name} by user ${updatedBy} (Course ID: ${courseId})`,
      );

      return {
        success: true,
        message: "Course updated successfully",
        course: updatedCourse,
      };
    } catch (error) {
      logger.error(`Update course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete course (Teachers can only delete their own courses)
   * @param {string} courseId - Course ID
   * @param {string} deletedBy - User ID who deleted the course
   * @param {string} userRole - User role
   * @returns {Object} Delete result
   */
  async deleteCourse(courseId, deletedBy, userRole) {
    try {
      // Check if course exists and get current data
      const { data: existingCourse, error: fetchError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select("*")
        .eq("id", courseId)
        .is("deleted_at", null)
        .single();

      if (fetchError || !existingCourse) {
        throw new Error("Course not found");
      }

      // Teachers can only delete their own courses (unless HOD/Principal)
      if (userRole === "teacher" && existingCourse.created_by !== deletedBy) {
        throw new Error("You can only delete courses you created");
      }

      // Soft delete course with proper tracking
      const { error: deleteError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .update({
          deleted_at: new Date().toISOString(), // Mark as deleted
          updated_by: deletedBy, // Track who deleted it
          updated_at: new Date().toISOString(), // Update timestamp
          is_active: false, // Deactivate the course
        })
        .eq("id", courseId);

      if (deleteError) {
        logger.error(`Delete course failed: ${deleteError.message}`);
        throw new Error("Failed to delete course");
      }

      // Remove course from all enrolled students
      const { error: removeError } = await supabaseAdmin.rpc(
        "remove_course_from_all_users",
        { course_id_to_remove: courseId },
      );

      if (removeError) {
        logger.warn(
          `Failed to remove course from users: ${removeError.message}`,
        );
      }

      logger.info(
        `Course deleted: ${existingCourse.name} by user ${deletedBy} (Course ID: ${courseId}, Originally created by: ${existingCourse.created_by})`,
      );

      return {
        success: true,
        message: "Course deleted successfully",
      };
    } catch (error) {
      logger.error(`Delete course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enroll student in course
   * @param {string} courseId - Course ID
   * @param {string} studentId - Student ID
   * @returns {Object} Enrollment result
   */
  async enrollInCourse(courseId, studentId) {
    try {
      // Verify course exists and is not deleted
      const { data: course, error: courseError } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select("id, name")
        .eq("id", courseId)
        .is("deleted_at", null)
        .single();

      if (courseError || !course) {
        throw new Error("Course not found");
      }

      // Get current user data
      const { data: student, error: studentError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, course_ids")
        .eq("id", studentId)
        .single();

      if (studentError || !student) {
        throw new Error("Student not found");
      }

      // Check if already enrolled
      if (student.course_ids && student.course_ids.includes(courseId)) {
        throw new Error("Already enrolled in this course");
      }

      // Add course to student's course_ids array
      const updatedCourseIds = student.course_ids
        ? [...student.course_ids, courseId]
        : [courseId];

      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({ course_ids: updatedCourseIds })
        .eq("id", studentId);

      if (updateError) {
        logger.error(`Enroll in course failed: ${updateError.message}`);
        throw new Error("Failed to enroll in course");
      }

      logger.info(
        `Student ${student.username} enrolled in course ${course.name}`,
      );

      return {
        success: true,
        message: "Successfully enrolled in course",
      };
    } catch (error) {
      logger.error(`Enroll in course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unenroll student from course
   * @param {string} courseId - Course ID
   * @param {string} studentId - Student ID
   * @returns {Object} Unenrollment result
   */
  async unenrollFromCourse(courseId, studentId) {
    try {
      // Get current user data
      const { data: student, error: studentError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, course_ids")
        .eq("id", studentId)
        .single();

      if (studentError || !student) {
        throw new Error("Student not found");
      }

      // Check if enrolled
      if (!student.course_ids || !student.course_ids.includes(courseId)) {
        throw new Error("Not enrolled in this course");
      }

      // Remove course from student's course_ids array
      const updatedCourseIds = student.course_ids.filter(
        (id) => id !== courseId,
      );

      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          course_ids: updatedCourseIds.length > 0 ? updatedCourseIds : null,
        })
        .eq("id", studentId);

      if (updateError) {
        logger.error(`Unenroll from course failed: ${updateError.message}`);
        throw new Error("Failed to unenroll from course");
      }

      logger.info(`Student ${student.username} unenrolled from course`);

      return {
        success: true,
        message: "Successfully unenrolled from course",
      };
    } catch (error) {
      logger.error(`Unenroll from course error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get courses created by a specific teacher (or all courses for HOD/Principal)
   * @param {string} teacherId - Teacher ID
   * @param {Object} options - Query options
   * @param {string} userRole - User role (teacher, hod, principal)
   * @returns {Object} Teacher's courses
   */
  async getTeacherCourses(teacherId, options = {}, userRole = "teacher") {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from(TABLES.COURSES)
        .select(
          `
          *,
          created_by_user:created_by(id, username, roll_number),
          updated_by_user:updated_by(id, username)
        `,
          { count: "exact" },
        )
        .is("deleted_at", null) // Only show non-deleted courses
        .order("created_at", { ascending: false });

      // For teachers, only show their own courses
      // For HOD and Principal, show all courses
      if (userRole === "teacher") {
        query = query.eq("created_by", teacherId);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,about.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: courses, error, count } = await query;

      if (error) {
        logger.error(`Get teacher courses failed: ${error.message}`);
        throw new Error("Failed to fetch teacher courses");
      }

      // Add enrollment count and creator information to each course
      const coursesWithDetails = await Promise.all(
        courses.map(async (course) => {
          // Get enrollment count
          const { data: enrollmentData } = await supabaseAdmin
            .from(TABLES.USERS)
            .select("id")
            .contains("course_ids", [course.id]);

          const enrollmentCount = enrollmentData ? enrollmentData.length : 0;

          // Calculate timeline status and progress
          const now = new Date();
          const startDate = course.start_date ? new Date(course.start_date) : now;
          const durationMs = (course.duration_months || 6) * 30 * 24 * 60 * 60 * 1000;
          const endDate = new Date(startDate.getTime() + durationMs);

          let timelineStatus = "not_started";
          let progress_percentage = 0;

          if (now < startDate) {
            timelineStatus = "not_started";
            progress_percentage = 0;
          } else if (now > endDate) {
            timelineStatus = "completed";
            progress_percentage = 100;
          } else {
            timelineStatus = "in_progress";
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            progress_percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          }

          return {
            ...course,
            enrollmentCount,
            timelineStatus,
            progress_percentage,
            // Add creator information
            createdByUsername: course.created_by_user?.username || "Unknown",
            createdByRollNumber: course.created_by_user?.roll_number || "N/A",
            updatedByUsername: course.updated_by_user?.username || "Unknown",
          };
        }),
      );

      logger.info(`Retrieved ${coursesWithDetails.length} courses for ${userRole} ${teacherId}`);

      return {
        success: true,
        courses: coursesWithDetails,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error(`Get teacher courses error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course statistics
   * @param {Object} user - Current user
   * @returns {Object} Course statistics
   */
  async getCourseStats(user) {
    try {
      let stats = {};

      if (user.role === "teacher") {
        // Stats for teachers - their courses
        const { count: totalCourses } = await supabaseAdmin
          .from(TABLES.COURSES)
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.id)
          .is("deleted_at", null);

        // Get total enrollments in teacher's courses
        const { data: teacherCourses } = await supabaseAdmin
          .from(TABLES.COURSES)
          .select("id")
          .eq("created_by", user.id)
          .is("deleted_at", null);

        let totalEnrollments = 0;
        if (teacherCourses && teacherCourses.length > 0) {
          const courseIds = teacherCourses.map((c) => c.id);
          const { count: enrollments } = await supabaseAdmin
            .from(TABLES.USERS)
            .select("*", { count: "exact", head: true })
            .overlaps("course_ids", courseIds);

          totalEnrollments = enrollments || 0;
        }

        stats = {
          totalCourses: totalCourses || 0,
          totalEnrollments,
        };
      } else if (user.role === "student") {
        // Stats for students - their enrollments
        const enrolledCoursesCount = user.course_ids
          ? user.course_ids.length
          : 0;

        const { count: availableCourses } = await supabaseAdmin
          .from(TABLES.COURSES)
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null);

        stats = {
          enrolledCourses: enrolledCoursesCount,
          availableCourses: availableCourses || 0,
        };
      } else {
        // Stats for HOD/Principal - all courses
        const { count: totalCourses } = await supabaseAdmin
          .from(TABLES.COURSES)
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null);

        const { count: totalEnrollments } = await supabaseAdmin
          .from(TABLES.USERS)
          .select("*", { count: "exact", head: true })
          .not("course_ids", "is", null);

        stats = {
          totalCourses: totalCourses || 0,
          totalEnrollments: totalEnrollments || 0,
        };
      }

      return {
        success: true,
        stats,
      };
    } catch (error) {
      logger.error(`Get course stats error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get course timeline analytics
   * @param {Object} user - Current user object
   * @returns {Object} Timeline analytics
   */
  async getCourseTimelineAnalytics(user) {
    try {
      let query = supabaseAdmin
        .from(TABLES.COURSES)
        .select("*")
        .is("deleted_at", null);

      // Filter by teacher for teacher role
      if (user.role === "teacher") {
        query = query.eq("created_by", user.id);
      }

      const { data: courses, error } = await query;

      if (error) {
        logger.error(`Get timeline analytics failed: ${error.message}`);
        throw new Error("Failed to fetch timeline analytics");
      }

      // Calculate timeline status for each course
      const coursesWithTimeline = courses.map((course) => {
        const now = new Date();
        const startDate = course.start_date ? new Date(course.start_date) : now;
        const durationMs = (course.duration_months || 6) * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
        const endDate = new Date(startDate.getTime() + durationMs);

        let timelineStatus = "not_started";
        let progress_percentage = 0;

        if (now < startDate) {
          timelineStatus = "not_started";
          progress_percentage = 0;
        } else if (now > endDate) {
          timelineStatus = "completed";
          progress_percentage = 100;
        } else {
          timelineStatus = "in_progress";
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          progress_percentage = Math.min(
            100,
            Math.max(0, (elapsed / totalDuration) * 100),
          );
        }

        return {
          ...course,
          timelineStatus,
          progress_percentage,
          end_date: endDate.toISOString(),
          enrollmentCount: 0, // Default for mock data
        };
      });

      // Calculate analytics
      const analytics = {
        totalCourses: coursesWithTimeline.length,
        activeCoursesCount: coursesWithTimeline.filter(
          (c) => c.timelineStatus === "in_progress",
        ).length,
        notStartedCount: coursesWithTimeline.filter(
          (c) => c.timelineStatus === "not_started",
        ).length,
        inProgressCount: coursesWithTimeline.filter(
          (c) => c.timelineStatus === "in_progress",
        ).length,
        completedCount: coursesWithTimeline.filter(
          (c) => c.timelineStatus === "completed",
        ).length,
        totalEnrollments: coursesWithTimeline.reduce(
          (sum, c) => sum + (c.enrollmentCount || 0),
          0,
        ),
        averageProgress:
          coursesWithTimeline.length > 0
            ? coursesWithTimeline.reduce(
              (sum, c) => sum + (c.progress_percentage || 0),
              0,
            ) / coursesWithTimeline.length
            : 0,
        coursesEndingSoon: coursesWithTimeline.filter((c) => {
          if (!c.end_date) return false;
          const daysRemaining = Math.ceil(
            (new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24),
          );
          return daysRemaining > 0 && daysRemaining <= 30;
        }).length,
      };

      return {
        success: true,
        analytics,
        courses: coursesWithTimeline.slice(0, 10), // Return first 10 courses for dashboard
      };
    } catch (error) {
      logger.error(`Get timeline analytics error: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const courseService = new CourseService();

module.exports = courseService;
