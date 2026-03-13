const { auth, db, admin } = require("../config/firebaseAdmin");
const logger = require("../config/logger");
const { formatFirestoreTimestamp } = require("../utils/firebaseUtils");
const {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TABLES,
} = require("../config/constants");

/**
 * Department Service
 * CRUD operations for department management using Firebase Firestore
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
      
      let query = db.collection(TABLES.DEPARTMENTS);

      // Add search filter if provided (Firestore doesn't support ilike, using simple startsWith/contains or local filtering)
      // For simple search, we'll fetch all and filter or use basic Firestore queries
      let departmentsSnapshot = await query.orderBy("createdAt", "desc").get();
      
      let departments = departmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: formatFirestoreTimestamp(doc.data().createdAt),
        updatedAt: formatFirestoreTimestamp(doc.data().updatedAt)
      }));

      if (search) {
        departments = departments.filter(dept => 
          dept.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = departments.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedDepartments = departments.slice((page - 1) * limit, page * limit);

      return {
        success: true,
        departments: paginatedDepartments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
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
      const deptDoc = await db.collection(TABLES.DEPARTMENTS).doc(departmentId).get();

      if (!deptDoc.exists) {
        logger.warn(`Department not found: ${departmentId}`);
        throw new Error("Department not found");
      }

      const department = {
        id: deptDoc.id,
        ...deptDoc.data(),
        createdAt: formatFirestoreTimestamp(deptDoc.data().createdAt),
        updatedAt: formatFirestoreTimestamp(deptDoc.data().updatedAt)
      };

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
      const existingQuery = await db.collection(TABLES.DEPARTMENTS)
        .where("name", "==", name.trim())
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new Error("Department name already exists");
      }

      // Create department
      const newDeptRef = db.collection(TABLES.DEPARTMENTS).doc();
      const newDeptData = {
        name: name.trim(),
        createdBy: createdBy,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await newDeptRef.set(newDeptData);
      
      const createdDept = {
        id: newDeptRef.id,
        ...newDeptData,
        createdAt: new Date().toISOString(), // Approximation for immediate response
        updatedAt: new Date().toISOString()
      };

      logger.info(
        `Department created: ${createdDept.name} by user ${createdBy}`,
      );

      return {
        success: true,
        message: "Department created successfully",
        department: createdDept,
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
      const deptRef = db.collection(TABLES.DEPARTMENTS).doc(departmentId);
      const deptDoc = await deptRef.get();

      if (!deptDoc.exists) {
        throw new Error("Department not found");
      }

      const existingData = deptDoc.data();

      // Check if new name already exists (excluding current department)
      if (name && name !== existingData.name) {
        const nameExistsQuery = await db.collection(TABLES.DEPARTMENTS)
          .where("name", "==", name.trim())
          .get();
        
        const otherDocs = nameExistsQuery.docs.filter(doc => doc.id !== departmentId);
        if (otherDocs.length > 0) {
          throw new Error("Department name already exists");
        }
      }

      // Prepare update data
      const updateFields = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: updatedBy
      };

      if (name) {
        updateFields.name = name.trim();
      }

      // Update department
      await deptRef.update(updateFields);
      
      const updatedDoc = await deptRef.get();
      const updatedDepartment = {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: formatFirestoreTimestamp(updatedDoc.data().createdAt),
        updatedAt: formatFirestoreTimestamp(updatedDoc.data().updatedAt)
      };

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
      const deptRef = db.collection(TABLES.DEPARTMENTS).doc(departmentId);
      const deptDoc = await deptRef.get();

      if (!deptDoc.exists) {
        throw new Error("Department not found");
      }

      // Check if department has associated classes
      const classesQuery = await db.collection(TABLES.CLASSES)
        .where("departmentId", "==", departmentId)
        .limit(1)
        .get();

      if (!classesQuery.empty) {
        throw new Error("Cannot delete department with associated classes");
      }

      // Check if department has associated courses
      const coursesQuery = await db.collection(TABLES.COURSES)
        .where("departmentId", "==", departmentId)
        .limit(1)
        .get();

      if (!coursesQuery.empty) {
        throw new Error("Cannot delete department with associated courses");
      }

      // Hard delete department
      const deptName = deptDoc.data().name;
      await deptRef.delete();

      logger.info(
        `Department deleted: ${deptName} by user ${deletedBy}`,
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
      const deptsSnapshot = await db.collection(TABLES.DEPARTMENTS).get();
      const totalDepartments = deptsSnapshot.size;

      // In Firestore, we'd typically need to join or have counters for classes
      // For now, let's return total count and an empty list for departmentsWithClasses if not easily joinable
      // Or we can do a mapping but it might be expensive
      const departmentsWithClasses = [];
      for (const doc of deptsSnapshot.docs) {
        const classesSnapshot = await db.collection(TABLES.CLASSES)
          .where("departmentId", "==", doc.id)
          .get();
        
        departmentsWithClasses.push({
          id: doc.id,
          name: doc.data().name,
          classes: { count: classesSnapshot.size }
        });
      }

      return {
        success: true,
        stats: {
          totalDepartments,
          departmentsWithClasses,
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
