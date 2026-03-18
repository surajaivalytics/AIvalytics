const { db } = require("../config/database");
const crypto = require("crypto");
const logger = require("../config/logger");
const { TABLES } = require("../config/constants");

/**
 * Department Service - Firebase Firestore
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
      const offset = (page - 1) * limit;
      const paginated = departments.slice(offset, offset + limit);

      return {
        success: true,
        departments: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
   */
  async getDepartmentById(departmentId) {
    try {
      const deptDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();
      const deptDoc = await db.collection(TABLES.DEPARTMENTS).doc(departmentId).get();

      if (!deptDoc.exists) {
        logger.warn(`Department not found: ${departmentId}`);
        throw new Error("Department not found");
      }

      return { success: true, department: { id: deptDoc.id, ...deptDoc.data() } };
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
   */
  async updateDepartment(departmentId, updateData, updatedBy) {
    try {
      const { name } = updateData;
      const deptRef = db.collection(TABLES.DEPARTMENTS).doc(departmentId);
      const deptDoc = await deptRef.get();

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

      const updatedDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(departmentId)
        .get();

      logger.info(`Department updated: ${departmentId} by user ${updatedBy}`);
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
          totalDepartments: total,
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

const departmentService = new DepartmentService();
module.exports = departmentService;
