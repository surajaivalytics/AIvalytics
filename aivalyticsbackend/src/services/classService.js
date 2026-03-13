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
 * Class Service
 * CRUD operations for class management using Firebase Firestore
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
      
      let query = db.collection(TABLES.CLASSES);

      // Add search filter if provided (Firestore limits, using simple fetch and filter)
      let classesSnapshot = await query.orderBy("createdAt", "desc").get();
      
      let classes = await Promise.all(classesSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        let department = null;
        
        if (data.departmentId) {
          const deptDoc = await db.collection(TABLES.DEPARTMENTS).doc(data.departmentId).get();
          if (deptDoc.exists) {
            department = { id: deptDoc.id, name: deptDoc.data().name };
          }
        }

        return {
          id: doc.id,
          ...data,
          department,
          createdAt: formatFirestoreTimestamp(data.createdAt),
          updatedAt: formatFirestoreTimestamp(data.updatedAt)
        };
      }));

      if (search) {
        classes = classes.filter(cls => 
          cls.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = classes.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedClasses = classes.slice((page - 1) * limit, page * limit);

      return {
        success: true,
        classes: paginatedClasses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
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
      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();

      if (!classDoc.exists) {
        logger.warn(`Class not found: ${classId}`);
        throw new Error("Class not found");
      }

      const classData = classDoc.data();
      let department = null;
      
      if (classData.departmentId) {
        const deptDoc = await db.collection(TABLES.DEPARTMENTS).doc(classData.departmentId).get();
        if (deptDoc.exists) {
          department = { id: deptDoc.id, name: deptDoc.data().name };
        }
      }

      // Get students enrolled in this class
      const studentsSnapshot = await db.collection(TABLES.USERS)
        .where("classId", "==", classId)
        .get();
      
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        rollNumber: doc.data().rollNumber
      }));

      return {
        success: true,
        class: {
          id: classId,
          ...classData,
          department,
          students,
          createdAt: formatFirestoreTimestamp(classData.createdAt),
          updatedAt: formatFirestoreTimestamp(classData.updatedAt)
        },
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
      const { name, departmentId } = classData;

      // Check if class name already exists
      const existingQuery = await db.collection(TABLES.CLASSES)
        .where("name", "==", name.trim())
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new Error("Class name already exists");
      }

      // Verify department exists
      const departmentDoc = await db.collection(TABLES.DEPARTMENTS).doc(departmentId).get();
      if (!departmentDoc.exists) {
        throw new Error("Department not found");
      }

      // Create class
      const newClassRef = db.collection(TABLES.CLASSES).doc();
      const newClassData = {
        name: name.trim(),
        departmentId,
        numStudents: 0,
        classTeacherId: null,
        createdBy,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await newClassRef.set(newClassData);

      const createdClass = {
        id: newClassRef.id,
        ...newClassData,
        department: { id: departmentId, name: departmentDoc.data().name },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info(
        `Class created: ${createdClass.name} in ${createdClass.department.name} by user ${createdBy}`,
      );

      return {
        success: true,
        message: "Class created successfully",
        class: createdClass,
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
      const { name, departmentId } = updateData;
      const classRef = db.collection(TABLES.CLASSES).doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        throw new Error("Class not found");
      }

      const existingClass = classDoc.data();

      // Check if new name already exists (excluding current class)
      if (name && name !== existingClass.name) {
        const nameQuery = await db.collection(TABLES.CLASSES)
          .where("name", "==", name.trim())
          .get();
        
        const otherDocs = nameQuery.docs.filter(doc => doc.id !== classId);
        if (otherDocs.length > 0) {
          throw new Error("Class name already exists");
        }
      }

      // Verify department exists if being updated
      if (departmentId && departmentId !== existingClass.departmentId) {
        const deptDoc = await db.collection(TABLES.DEPARTMENTS).doc(departmentId).get();
        if (!deptDoc.exists) {
          throw new Error("Department not found");
        }
      }

      // Prepare update data
      const updateFields = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy
      };

      if (name) updateFields.name = name.trim();
      if (departmentId) updateFields.departmentId = departmentId;

      // Update class
      await classRef.update(updateFields);
      
      const updatedClassResult = await this.getClassById(classId);

      logger.info(`Class updated: ${updatedClassResult.class.name} by user ${updatedBy}`);

      return {
        success: true,
        message: "Class updated successfully",
        class: updatedClassResult.class,
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
      const classRef = db.collection(TABLES.CLASSES).doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        throw new Error("Class not found");
      }

      // Check if class has students
      const studentsSnapshot = await db.collection(TABLES.USERS)
        .where("classId", "==", classId)
        .limit(1)
        .get();

      if (!studentsSnapshot.empty) {
        throw new Error("Cannot delete class with enrolled students");
      }

      // Hard delete class
      const className = classDoc.data().name;
      await classRef.delete();

      logger.info(`Class deleted: ${className} by user ${deletedBy}`);

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
   */
  async addStudentToClass(classId, studentId, addedBy) {
    try {
      const classRef = db.collection(TABLES.CLASSES).doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        throw new Error("Class not found");
      }

      const studentRef = db.collection(TABLES.USERS).doc(studentId);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists) {
        throw new Error("Student not found");
      }

      if (studentDoc.data().classId) {
        throw new Error("Student is already enrolled in a class");
      }

      await studentRef.update({ classId });
      
      const currentNum = classDoc.data().numStudents || 0;
      await classRef.update({
        numStudents: currentNum + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Student ${studentDoc.data().username} added to class ${classDoc.data().name} by user ${addedBy}`);

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
   */
  async removeStudentFromClass(classId, studentId, removedBy) {
    try {
      const classRef = db.collection(TABLES.CLASSES).doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        throw new Error("Class not found");
      }

      const studentRef = db.collection(TABLES.USERS).doc(studentId);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists || studentDoc.data().classId !== classId) {
        throw new Error("Student not found in this class");
      }

      await studentRef.update({ classId: null });
      
      const currentNum = classDoc.data().numStudents || 0;
      await classRef.update({
        numStudents: Math.max(0, currentNum - 1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Student ${studentDoc.data().username} removed from class ${classDoc.data().name} by user ${removedBy}`);

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
   * Get available students
   */
  async getAvailableStudents(search = "") {
    try {
      let query = db.collection(TABLES.USERS)
        .where("role", "==", "student")
        .where("classId", "==", null);

      const snapshot = await query.get();
      let students = snapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        rollNumber: doc.data().rollNumber
      }));

      if (search) {
        const lowerSearch = search.toLowerCase();
        students = students.filter(s => 
          s.username.toLowerCase().includes(lowerSearch) || 
          (s.rollNumber && s.rollNumber.toLowerCase().includes(lowerSearch))
        );
      }

      return {
        success: true,
        students: students.slice(0, 20),
      };
    } catch (error) {
      logger.error(`Get available students error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all departments for dropdown
   */
  async getDepartments() {
    try {
      const snapshot = await db.collection(TABLES.DEPARTMENTS).orderBy("name").get();
      const departments = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      return {
        success: true,
        departments,
      };
    } catch (error) {
      logger.error(`Get departments error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get class statistics
   */
  async getClassStats() {
    try {
      const classesSnapshot = await db.collection(TABLES.CLASSES).get();
      const totalClasses = classesSnapshot.size;

      const studentsInClassesSnapshot = await db.collection(TABLES.USERS)
        .where("role", "==", "student")
        // Note: Firestore doesn't support 'not equal null' well without inequalities on other fields
        // Simple way: check all users or filter if we have a flag
        .get();
      
      const totalStudentsInClasses = studentsInClassesSnapshot.docs.filter(doc => doc.data().classId).length;

      return {
        success: true,
        stats: {
          totalClasses,
          totalStudentsInClasses,
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
