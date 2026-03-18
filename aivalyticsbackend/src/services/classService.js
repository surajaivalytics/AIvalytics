const { db } = require("../config/database");
const crypto = require("crypto");
const logger = require("../config/logger");
const { TABLES } = require("../config/constants");

/**
 * Class Service - Firebase Firestore
 */
class ClassService {
  /**
   * Get all classes
   */
  async getAllClasses(options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;

      const snap = await db
        .collection(TABLES.CLASSES)
        .orderBy("created_at", "desc")
        .get();

      let classes = await Promise.all(
        snap.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch department name
          let department = null;
          if (data.department_id) {
            const deptDoc = await db
              .collection(TABLES.DEPARTMENTS)
              .doc(data.department_id)
              .get();
            if (deptDoc.exists) {
              department = { id: deptDoc.id, name: deptDoc.data().name };
            }
          }
          return { id: doc.id, ...data, department };
        })
      );

      if (search) {
        const s = search.toLowerCase();
        classes = classes.filter((c) => c.name?.toLowerCase().includes(s));
      }

      const total = classes.length;
      const offset = (page - 1) * limit;
      const paginated = classes.slice(offset, offset + limit);

      return {
        success: true,
        classes: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error(`Get classes error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get class by ID with students
   */
  async getClassById(classId) {
    try {
      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      if (!classDoc.exists) throw new Error("Class not found");

      const classData = classDoc.data();

      // Get department
      let department = null;
      if (classData.department_id) {
        const deptDoc = await db
          .collection(TABLES.DEPARTMENTS)
          .doc(classData.department_id)
          .get();
        if (deptDoc.exists) {
          department = { id: deptDoc.id, name: deptDoc.data().name };
        }
      }

      // Get students in class
      const studentsSnap = await db
        .collection(TABLES.USERS)
        .where("class_id", "==", classId)
        .get();
      const students = studentsSnap.docs.map((d) => ({
        id: d.id,
        username: d.data().username,
        roll_number: d.data().roll_number,
      }));

      return {
        success: true,
        class: { id: classDoc.id, ...classData, department, students },
      };
    } catch (error) {
      logger.error(`Get class by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create new class
   */
  async createClass(classData, createdBy) {
    try {
      const { name, department_id } = classData;

      // Check name uniqueness
      const existingSnap = await db
        .collection(TABLES.CLASSES)
        .where("name", "==", name)
        .limit(1)
        .get();
      if (!existingSnap.empty) throw new Error("Class name already exists");

      // Verify department exists
      const deptDoc = await db
        .collection(TABLES.DEPARTMENTS)
        .doc(department_id)
        .get();
      if (!deptDoc.exists) throw new Error("Department not found");

      const classId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newClass = {
        id: classId,
        name: name.trim(),
        department_id,
        num_students: 0,
        class_teacher_id: null,
        created_at: now,
        updated_at: now,
      };

      await db.collection(TABLES.CLASSES).doc(classId).set(newClass);

      logger.info(`Class created: ${name} by user ${createdBy}`);

      return {
        success: true,
        message: "Class created successfully",
        class: { ...newClass, department: { id: deptDoc.id, name: deptDoc.data().name } },
      };
    } catch (error) {
      logger.error(`Create class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update class
   */
  async updateClass(classId, updateData, updatedBy) {
    try {
      const { name, department_id } = updateData;

      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      if (!classDoc.exists) throw new Error("Class not found");

      const existing = classDoc.data();

      if (name && name !== existing.name) {
        const nameSnap = await db
          .collection(TABLES.CLASSES)
          .where("name", "==", name)
          .limit(1)
          .get();
        const conflict = nameSnap.docs.find((d) => d.id !== classId);
        if (conflict) throw new Error("Class name already exists");
      }

      if (department_id && department_id !== existing.department_id) {
        const deptDoc = await db
          .collection(TABLES.DEPARTMENTS)
          .doc(department_id)
          .get();
        if (!deptDoc.exists) throw new Error("Department not found");
      }

      const updateFields = { updated_at: new Date().toISOString() };
      if (name) updateFields.name = name.trim();
      if (department_id) updateFields.department_id = department_id;

      await db.collection(TABLES.CLASSES).doc(classId).update(updateFields);

      const updatedDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      logger.info(`Class updated: ${classId} by user ${updatedBy}`);

      return {
        success: true,
        message: "Class updated successfully",
        class: { id: updatedDoc.id, ...updatedDoc.data() },
      };
    } catch (error) {
      logger.error(`Update class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete class (hard delete)
   */
  async deleteClass(classId, deletedBy) {
    try {
      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      if (!classDoc.exists) throw new Error("Class not found");

      // Check for students
      const studentsSnap = await db
        .collection(TABLES.USERS)
        .where("class_id", "==", classId)
        .limit(1)
        .get();
      if (!studentsSnap.empty) {
        throw new Error("Cannot delete class with enrolled students");
      }

      await db.collection(TABLES.CLASSES).doc(classId).delete();

      logger.info(`Class deleted: ${classId} by user ${deletedBy}`);

      return { success: true, message: "Class deleted successfully" };
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
      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      if (!classDoc.exists) throw new Error("Class not found");

      const studentDoc = await db.collection(TABLES.USERS).doc(studentId).get();
      if (!studentDoc.exists) throw new Error("Student not found");

      const student = studentDoc.data();
      if (student.role !== "student") throw new Error("User is not a student");
      if (student.class_id) throw new Error("Student is already enrolled in a class");

      await db.collection(TABLES.USERS).doc(studentId).update({ class_id: classId });

      const classData = classDoc.data();
      await db.collection(TABLES.CLASSES).doc(classId).update({
        num_students: (classData.num_students || 0) + 1,
        updated_at: new Date().toISOString(),
      });

      logger.info(`Student ${studentId} added to class ${classId} by ${addedBy}`);

      return { success: true, message: "Student added to class successfully" };
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
      const classDoc = await db.collection(TABLES.CLASSES).doc(classId).get();
      if (!classDoc.exists) throw new Error("Class not found");

      const studentDoc = await db.collection(TABLES.USERS).doc(studentId).get();
      if (!studentDoc.exists) throw new Error("Student not found");

      const student = studentDoc.data();
      if (student.class_id !== classId) {
        throw new Error("Student not found in this class");
      }

      await db.collection(TABLES.USERS).doc(studentId).update({ class_id: null });

      const classData = classDoc.data();
      await db.collection(TABLES.CLASSES).doc(classId).update({
        num_students: Math.max(0, (classData.num_students || 1) - 1),
        updated_at: new Date().toISOString(),
      });

      logger.info(`Student ${studentId} removed from class ${classId} by ${removedBy}`);

      return { success: true, message: "Student removed from class successfully" };
    } catch (error) {
      logger.error(`Remove student from class error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available students (not in any class)
   */
  async getAvailableStudents(search = "") {
    try {
      const snap = await db
        .collection(TABLES.USERS)
        .where("role", "==", "student")
        .where("class_id", "==", null)
        .limit(20)
        .get();

      let students = snap.docs.map((d) => ({
        id: d.id,
        username: d.data().username,
        roll_number: d.data().roll_number,
      }));

      if (search) {
        const s = search.toLowerCase();
        students = students.filter(
          (st) =>
            st.username?.toLowerCase().includes(s) ||
            st.roll_number?.toLowerCase().includes(s)
        );
      }

      return { success: true, students };
    } catch (error) {
      logger.error(`Get available students error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get departments dropdown
   */
  async getDepartments() {
    try {
      const snap = await db.collection(TABLES.DEPARTMENTS).orderBy("name").get();
      const departments = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      return { success: true, departments };
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
      const classesSnap = await db.collection(TABLES.CLASSES).get();
      const studentsSnap = await db
        .collection(TABLES.USERS)
        .where("class_id", "!=", null)
        .get();

      return {
        success: true,
        stats: {
          totalClasses: classesSnap.size,
          totalStudentsInClasses: studentsSnap.size,
        },
      };
    } catch (error) {
      logger.error(`Get class stats error: ${error.message}`);
      throw error;
    }
  }
}

const classService = new ClassService();
module.exports = classService;
