const { db } = require("../config/database");
const crypto = require("crypto");
const logger = require("../config/logger");
const { TABLES } = require("../config/constants");

/**
 * Department Service - Firebase Firestore
 */
class DepartmentService {
  /**
   * Get all departments with pagination
   */
  async getAllDepartments(options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;

      const snap = await db
        .collection(TABLES.DEPARTMENTS)
        .orderBy("created_at", "desc")
        .get();

      let departments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (search) {
        const s = search.toLowerCase();
        departments = departments.filter((d) =>
          d.name?.toLowerCase().includes(s)
        );
      }

      const total = departments.length;
      const offset = (page - 1) * limit;
      const paginated = departments.slice(offset, offset + limit);

      return {
        success: true,
        departments: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error(`Get departments error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(departmentId) {
    try {
      const deptDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();

      if (!deptDoc.exists) {
        logger.warn(`Department not found: ${departmentId}`);
        throw new Error("Department not found");
      }

      return { success: true, department: { id: deptDoc.id, ...deptDoc.data() } };
    } catch (error) {
      logger.error(`Get department by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new department
   */
  async createDepartment(departmentData, createdBy) {
    try {
      const { name } = departmentData;

      // Check name uniqueness
      const existingSnap = await db
        .collection(TABLES.DEPARTMENTS)
        .where("name", "==", name)
        .limit(1)
        .get();
      if (!existingSnap.empty) throw new Error("Department name already exists");

      const deptId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newDepartment = {
        id: deptId,
        name: name.trim(),
        created_at: now,
        updated_at: now,
      };

      await db.collection(TABLES.DEPARTMENTS).doc(deptId).set(newDepartment);

      logger.info(`Department created: ${name} by user ${createdBy}`);

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
   */
  async updateDepartment(departmentId, updateData, updatedBy) {
    try {
      const { name } = updateData;

      const deptDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();
      if (!deptDoc.exists) throw new Error("Department not found");

      const existing = deptDoc.data();

      if (name && name !== existing.name) {
        const nameSnap = await db
          .collection(TABLES.DEPARTMENTS)
          .where("name", "==", name)
          .limit(1)
          .get();
        const conflict = nameSnap.docs.find((d) => d.id !== departmentId);
        if (conflict) throw new Error("Department name already exists");
      }

      const updateFields = { updated_at: new Date().toISOString() };
      if (name) updateFields.name = name.trim();

      await db.collection(TABLES.DEPARTMENTS).doc(departmentId).update(updateFields);

      const updatedDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();

      logger.info(`Department updated: ${departmentId} by user ${updatedBy}`);

      return {
        success: true,
        message: "Department updated successfully",
        department: { id: updatedDoc.id, ...updatedDoc.data() },
      };
    } catch (error) {
      logger.error(`Update department error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete department (hard delete)
   */
  async deleteDepartment(departmentId, deletedBy) {
    try {
      const deptDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();
      if (!deptDoc.exists) throw new Error("Department not found");

      const existing = deptDoc.data();

      // Check for associated classes
      const classesSnap = await db
        .collection(TABLES.CLASSES)
        .where("department_id", "==", departmentId)
        .limit(1)
        .get();
      if (!classesSnap.empty) {
        throw new Error("Cannot delete department with associated classes");
      }

      // Check for associated courses
      const coursesSnap = await db
        .collection(TABLES.COURSES)
        .where("department_id", "==", departmentId)
        .limit(1)
        .get();
      if (!coursesSnap.empty) {
        throw new Error("Cannot delete department with associated courses");
      }

      await db.collection(TABLES.DEPARTMENTS).doc(departmentId).delete();

      logger.info(`Department deleted: ${existing.name} by user ${deletedBy}`);

      return { success: true, message: "Department deleted successfully" };
    } catch (error) {
      logger.error(`Delete department error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats() {
    try {
      const deptsSnap = await db.collection(TABLES.DEPARTMENTS).get();
      const total = deptsSnap.size;

      const departmentsWithClasses = await Promise.all(
        deptsSnap.docs.map(async (doc) => {
          const classesSnap = await db
            .collection(TABLES.CLASSES)
            .where("department_id", "==", doc.id)
            .get();
          return {
            id: doc.id,
            name: doc.data().name,
            classCount: classesSnap.size,
          };
        })
      );

      return {
        success: true,
        stats: {
          totalDepartments: total,
          departmentsWithClasses,
        },
      };
    } catch (error) {
      logger.error(`Get department stats error: ${error.message}`);
      throw error;
    }
  }
}

const departmentService = new DepartmentService();
module.exports = departmentService;
