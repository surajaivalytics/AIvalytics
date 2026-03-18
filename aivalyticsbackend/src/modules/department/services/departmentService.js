const { db } = require("../config/database");
const logger = require("../config/logger");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Department Service
 * CRUD operations for department management
 */
class DepartmentService {
  /**
   * Get all departments
   * @param {Object} options - Query options (pagination, search)
   * @returns {Object} List of departments
   */
  async getAllDepartments(options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Add search filter if provided
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      const { data: departments, error, count } = await query;

      if (error) {
        logger.error(`Get departments failed: ${error.message}`);
        throw new Error("Failed to fetch departments");
      }

      return {
        success: true,
        departments,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error(`Get departments error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get department by ID
   * @param {string} departmentId - Department ID
   * @returns {Object} Department details
   */
  async getDepartmentById(departmentId) {
    try {
      const { data: department, error } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("*")
        .eq("id", departmentId)
        .single();

      if (error || !department) {
        logger.warn(`Department not found: ${departmentId}`);
        throw new Error("Department not found");
      }

      return {
        success: true,
        department,
      };
    } catch (error) {
      logger.error(`Get department by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new department
   * @param {Object} departmentData - Department data
   * @param {string} createdBy - User ID who created the department
   * @returns {Object} Created department
   */
  async createDepartment(departmentData, createdBy) {
    try {
      const { name } = departmentData;

      // Check if department name already exists
      const { data: existingName } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("id")
        .eq("name", name)
        .single();

      if (existingName) {
        throw new Error("Department name already exists");
      }

      // Create department with only name field
      const { data: newDepartment, error: createError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .insert({
          name: name.trim(),
        })
        .select("*")
        .single();

      if (createError) {
        logger.error(`Create department failed: ${createError.message}`);
        throw new Error("Failed to create department");
      }

      logger.info(
        `Department created: ${newDepartment.name} by user ${createdBy}`,
      );

      return {
        success: true,
        message: "Department created successfully",
        department: newDepartment,
      };
    } catch (error) {
      logger.error(`Create department error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update department
   * @param {string} departmentId - Department ID
   * @param {Object} updateData - Update data
   * @param {string} updatedBy - User ID who updated the department
   * @returns {Object} Updated department
   */
  async updateDepartment(departmentId, updateData, updatedBy) {
    try {
      const { name } = updateData;

      // Check if department exists
      const { data: existingDepartment, error: fetchError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("*")
        .eq("id", departmentId)
        .single();

      if (fetchError || !existingDepartment) {
        throw new Error("Department not found");
      }

      // Check if new name already exists (excluding current department)
      if (name && name !== existingDepartment.name) {
        const { data: nameExists } = await supabaseAdmin
          .from(TABLES.DEPARTMENTS)
          .select("id")
          .eq("name", name)
          .neq("id", departmentId)
          .single();

        if (nameExists) {
          throw new Error("Department name already exists");
        }
      }

      // Prepare update data
      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (name) {
        updateFields.name = name.trim();
      }

      // Update department
      const { data: updatedDepartment, error: updateError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .update(updateFields)
        .eq("id", departmentId)
        .select("*")
        .single();

      if (updateError) {
        logger.error(`Update department failed: ${updateError.message}`);
        throw new Error("Failed to update department");
      }

      logger.info(
        `Department updated: ${updatedDepartment.name} by user ${updatedBy}`,
      );

      return {
        success: true,
        message: "Department updated successfully",
        department: updatedDepartment,
      };
    } catch (error) {
      logger.error(`Update department error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete department (hard delete)
   * @param {string} departmentId - Department ID
   * @param {string} deletedBy - User ID who deleted the department
   * @returns {Object} Delete result
   */
  async deleteDepartment(departmentId, deletedBy) {
    try {
      // Check if department exists
      const { data: existingDepartment, error: fetchError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("*")
        .eq("id", departmentId)
        .single();

      if (fetchError || !existingDepartment) {
        throw new Error("Department not found");
      }

      // Check if department has associated classes
      const { data: associatedClasses } = await supabaseAdmin
        .from(TABLES.CLASSES)
        .select("id")
        .eq("department_id", departmentId);

      if (associatedClasses && associatedClasses.length > 0) {
        throw new Error("Cannot delete department with associated classes");
      }

      // Check if department has associated courses
      const { data: associatedCourses } = await supabaseAdmin
        .from(TABLES.COURSES)
        .select("id")
        .eq("department_id", departmentId);

      if (associatedCourses && associatedCourses.length > 0) {
        throw new Error("Cannot delete department with associated courses");
      }

      // Hard delete department (actually remove from database)
      const { error: deleteError } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .delete()
        .eq("id", departmentId);

      if (deleteError) {
        logger.error(`Delete department failed: ${deleteError.message}`);
        throw new Error("Failed to delete department");
      }

      logger.info(
        `Department deleted: ${existingDepartment.name} by user ${deletedBy}`,
      );

      return {
        success: true,
        message: "Department deleted successfully",
      };
    } catch (error) {
      logger.error(`Delete department error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get department statistics
   * @returns {Object} Department statistics
   */
  async getDepartmentStats() {
    try {
      // Get total departments
      const { count: totalDepartments } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select("*", { count: "exact", head: true });

      // Get departments with classes count
      const { data: departmentsWithClasses } = await supabaseAdmin
        .from(TABLES.DEPARTMENTS)
        .select(
          `
          id,
          name,
          classes:class(count)
        `,
        );

      return {
        success: true,
        stats: {
          totalDepartments: totalDepartments || 0,
          departmentsWithClasses: departmentsWithClasses || [],
        },
      };
    } catch (error) {
      logger.error(`Get department stats error: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const departmentService = new DepartmentService();

module.exports = departmentService;
