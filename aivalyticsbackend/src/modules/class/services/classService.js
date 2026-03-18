const { db } = require("../config/database");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Class Service
 * CRUD operations for class management
 */
class ClassService {
  /**
   * Get all classes
   * @param {Object} options - Query options (pagination, search)
   * @returns {Object} List of classes
   */
  async getAllClasses(options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from(TABLES.CLASSES)
        .select(
          `
          *,
          department:department_id(id, name)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      // Add search filter if provided
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      const { data: classes, error, count } = await query;

      if (error) {
        logger.error(`Get classes failed: ${error.message}`);
        throw new Error("Failed to fetch classes");
      }

      return {
        success: true,
        classes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error(`Get classes error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get class by ID with details
   * @param {string} classId - Class ID
   * @returns {Object} Class details
   */
  async getClassById(classId) {
    try {
      const { data: classData, error } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select(
          `
          *,
          department:department_id(id, name),
          students:user!class_id(id, username, roll_number)
        `,
        )
        .eq("id", classId)
        .single();

      if (error || !classData) {
        logger.warn(`Class not found: ${classId}`);
        throw new Error("Class not found");
      }

      return {
        success: true,
        class: classData,
      };
    } catch (error) {
      logger.error(`Get class by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new class
   * @param {Object} classData - Class data
   * @param {string} createdBy - User ID who created the class
   * @returns {Object} Created class
   */
  async createClass(classData, createdBy) {
    try {
      const { name, department_id } = classData;

      // Check if class name already exists
      const { data: existingName } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("id")
        .eq("name", name)
        .single();

      if (existingName) {
        throw new Error("Class name already exists");
      }

      // Verify department exists
      const { data: department, error: deptError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("id, name")
        .eq("id", department_id)
        .single();

      if (deptError || !department) {
        throw new Error("Department not found");
      }

      // Create class
      const { data: newClass, error: createError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .insert({
          name: name.trim(),
          department_id,
          num_students: 0,
          class_teacher_id: null,
        })
        .select(
          `
          *,
          department:department_id(id, name)
        `,
        )
        .single();

      if (createError) {
        logger.error(`Create class failed: ${createError.message}`);
        throw new Error("Failed to create class");
      }

      logger.info(
        `Class created: ${newClass.name} in ${department.name} by user ${createdBy}`,
      );

      return {
        success: true,
        message: "Class created successfully",
        class: newClass,
      };
    } catch (error) {
      logger.error(`Create class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update class
   * @param {string} classId - Class ID
   * @param {Object} updateData - Update data
   * @param {string} updatedBy - User ID who updated the class
   * @returns {Object} Updated class
   */
  async updateClass(classId, updateData, updatedBy) {
    try {
      const { name, department_id } = updateData;

      // Check if class exists
      const { data: existingClass, error: fetchError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("*")
        .eq("id", classId)
        .single();

      if (fetchError || !existingClass) {
        throw new Error("Class not found");
      }

      // Check if new name already exists (excluding current class)
      if (name && name !== existingClass.name) {
        const { data: nameExists } = await supabaseAdmin
          .from(TABLES.CLASSES)
          .select("id")
          .eq("name", name)
          .neq("id", classId)
          .single();

        if (nameExists) {
          throw new Error("Class name already exists");
        }
      }

      // Verify department exists if being updated
      if (department_id && department_id !== existingClass.department_id) {
        const { data: department, error: deptError } = await supabaseAdmin
          .from(TABLES.DEPARTMENTS)
          .select("id")
          .eq("id", department_id)
          .single();

        if (deptError || !department) {
          throw new Error("Department not found");
        }
      }

      // Prepare update data
      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (name) updateFields.name = name.trim();
      if (department_id) updateFields.department_id = department_id;

      // Update class
      const { data: updatedClass, error: updateError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .update(updateFields)
        .eq("id", classId)
        .select(
          `
          *,
          department:department_id(id, name)
        `,
        )
        .single();

      if (updateError) {
        logger.error(`Update class failed: ${updateError.message}`);
        throw new Error("Failed to update class");
      }

      logger.info(`Class updated: ${updatedClass.name} by user ${updatedBy}`);

      return {
        success: true,
        message: "Class updated successfully",
        class: updatedClass,
      };
    } catch (error) {
      logger.error(`Update class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete class (hard delete)
   * @param {string} classId - Class ID
   * @param {string} deletedBy - User ID who deleted the class
   * @returns {Object} Delete result
   */
  async deleteClass(classId, deletedBy) {
    try {
      // Check if class exists
      const { data: existingClass, error: fetchError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("*")
        .eq("id", classId)
        .single();

      if (fetchError || !existingClass) {
        throw new Error("Class not found");
      }

      // Check if class has students
      const { data: students } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id")
        .eq("class_id", classId);

      if (students && students.length > 0) {
        throw new Error("Cannot delete class with enrolled students");
      }

      // Hard delete class
      const { error: deleteError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .delete()
        .eq("id", classId);

      if (deleteError) {
        logger.error(`Delete class failed: ${deleteError.message}`);
        throw new Error("Failed to delete class");
      }

      logger.info(`Class deleted: ${existingClass.name} by user ${deletedBy}`);

      return {
        success: true,
        message: "Class deleted successfully",
      };
    } catch (error) {
      logger.error(`Delete class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add student to class
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @param {string} addedBy - User ID who added the student
   * @returns {Object} Result
   */
  async addStudentToClass(classId, studentId, addedBy) {
    try {
      // Verify class exists
      const { data: classData, error: classError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("id, name, num_students")
        .eq("id", classId)
        .single();

      if (classError || !classData) {
        throw new Error("Class not found");
      }

      // Verify student exists and is a student role
      const { data: student, error: studentError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select(
          `
          id, username, roll_number, class_id,
          roles!inner(name)
        `,
        )
        .eq("id", studentId)
        .eq("roles.name", "student")
        .single();

      if (studentError || !student) {
        throw new Error("Student not found");
      }

      // Check if student is already in a class
      if (student.class_id) {
        throw new Error("Student is already enrolled in a class");
      }

      // Add student to class
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({ class_id: classId })
        .eq("id", studentId);

      if (updateError) {
        logger.error(`Add student to class failed: ${updateError.message}`);
        throw new Error("Failed to add student to class");
      }

      // Update class student count
      const { error: countError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .update({
          num_students: classData.num_students + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", classId);

      if (countError) {
        logger.error(`Update class count failed: ${countError.message}`);
      }

      logger.info(
        `Student ${student.username} added to class ${classData.name} by user ${addedBy}`,
      );

      return {
        success: true,
        message: "Student added to class successfully",
      };
    } catch (error) {
      logger.error(`Add student to class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove student from class
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @param {string} removedBy - User ID who removed the student
   * @returns {Object} Result
   */
  async removeStudentFromClass(classId, studentId, removedBy) {
    try {
      // Verify class exists
      const { data: classData, error: classError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("id, name, num_students")
        .eq("id", classId)
        .single();

      if (classError || !classData) {
        throw new Error("Class not found");
      }

      // Verify student exists and is in this class
      const { data: student, error: studentError } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("id, username, class_id")
        .eq("id", studentId)
        .eq("class_id", classId)
        .single();

      if (studentError || !student) {
        throw new Error("Student not found in this class");
      }

      // Remove student from class
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({ class_id: null })
        .eq("id", studentId);

      if (updateError) {
        logger.error(
          `Remove student from class failed: ${updateError.message}`,
        );
        throw new Error("Failed to remove student from class");
      }

      // Update class student count
      const { error: countError } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .update({
          num_students: Math.max(0, classData.num_students - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", classId);

      if (countError) {
        logger.error(`Update class count failed: ${countError.message}`);
      }

      logger.info(
        `Student ${student.username} removed from class ${classData.name} by user ${removedBy}`,
      );

      return {
        success: true,
        message: "Student removed from class successfully",
      };
    } catch (error) {
      logger.error(`Remove student from class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available students (not enrolled in any class)
   * @param {string} search - Search term
   * @returns {Object} Available students
   */
  async getAvailableStudents(search = "") {
    try {
      let query = supabaseAdmin
        .from(TABLES.USERS)
        .select(
          `
          id, username, roll_number,
          roles!inner(name)
        `,
        )
        .eq("roles.name", "student")
        .is("class_id", null);

      if (search) {
        query = query.or(
          `username.ilike.%${search}%,roll_number.ilike.%${search}%`,
        );
      }

      query = query.limit(20).order("username");

      const { data: students, error } = await query;

      if (error) {
        logger.error(`Get available students failed: ${error.message}`);
        throw new Error("Failed to fetch available students");
      }

      return {
        success: true,
        students: students || [],
      };
    } catch (error) {
      logger.error(`Get available students error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all departments for dropdown
   * @returns {Object} List of departments
   */
  async getDepartments() {
    try {
      const { data: departments, error } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("id, name")
        .order("name");

      if (error) {
        logger.error(`Get departments failed: ${error.message}`);
        throw new Error("Failed to fetch departments");
      }

      return {
        success: true,
        departments: departments || [],
      };
    } catch (error) {
      logger.error(`Get departments error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get class statistics
   * @returns {Object} Class statistics
   */
  async getClassStats() {
    try {
      // Get total classes
      const { count: totalClasses } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("*", { count: "exact", head: true });

      // Get total students in classes
      const { count: totalStudentsInClasses } = await supabaseAdmin
        .from(TABLES.USERS)
        .select("*", { count: "exact", head: true })
        .not("class_id", "is", null);

      return {
        success: true,
        stats: {
          totalClasses: totalClasses || 0,
          totalStudentsInClasses: totalStudentsInClasses || 0,
        },
      };
    } catch (error) {
      logger.error(`Get class stats error: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const classService = new ClassService();

module.exports = classService;
