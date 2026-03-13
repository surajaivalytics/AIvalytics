const express = require("express");
const { db, auth, admin } = require("../config/database");
const { TABLES, ROLES } = require("../config/constants");

const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// Get leaderboard data
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUserId = req.user.id;

    console.log("🏆 Fetching leaderboard for user:", currentUserId);

    // Fetch student users with quiz activity
    const usersSnapshot = await db.collection(TABLES.USERS)
      .where("role", "==", ROLES.STUDENT)
      .orderBy("leaderboard_points", "desc")
      .limit(parseInt(limit))
      .get();

    if (usersSnapshot.empty) {
      console.log("📝 No users found, returning sample leaderboard data");
      // Sample data as fallback for development
      const sampleLeaderboard = [
        { id: "sample1", name: "Sarah Johnson", points: 450, quizCount: 12, averageScore: 92.5, highestScore: 98, overallPercentage: 92.5, rank: 1, isCurrentUser: currentUserId === "sample1" },
        { id: "sample2", name: "Michael Chen", points: 425, quizCount: 11, averageScore: 88.7, highestScore: 95, overallPercentage: 88.7, rank: 2, isCurrentUser: currentUserId === "sample2" },
        { id: "sample3", name: "Emma Rodriguez", points: 400, quizCount: 10, averageScore: 85.2, highestScore: 92, overallPercentage: 85.2, rank: 3, isCurrentUser: currentUserId === "sample3" },
        { id: "dev4", name: "You", points: 375, quizCount: 9, averageScore: 79.8, highestScore: 87, overallPercentage: 79.8, rank: 4, isCurrentUser: true }
      ].slice(0, parseInt(limit));

      return res.json({
        success: true,
        data: {
          leaderboard: sampleLeaderboard,
          currentUserRank: sampleLeaderboard.find(u => u.isCurrentUser) || null
        }
      });
    }

    const leaderboard = usersSnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        id: doc.id,
        name: data.username || data.displayName || "Unknown",
        points: data.leaderboard_points || 0,
        quizCount: data.total_quizzes_taken || 0,
        averageScore: data.average_score || 0,
        highestScore: data.highest_score || 0,
        overallPercentage: data.overall_percentage || 0,
        isCurrentUser: doc.id === currentUserId
      };
    });

    // Check if current user is in the leaderboard, if not, fetch their data separately
    let currentUserRank = leaderboard.find(u => u.isCurrentUser);
    if (!currentUserRank) {
      const userDoc = await db.collection(TABLES.USERS).doc(currentUserId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        currentUserRank = {
          id: currentUserId,
          name: userData.username || userData.displayName || "You",
          points: userData.leaderboard_points || 0,
          isCurrentUser: true,
          // Rank would require a count query which is expensive, return null or a placeholder
          rank: null 
        };
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        currentUserRank
      }
    });
  } catch (error) {
    console.error("❌ Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard",
      error: error.message
    });
  }
});

// Student Dashboard Data
router.get("/student", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Student role required."
      });
    }

    // Get all courses (mocking enrollment for now as in original code)
    const coursesSnapshot = await db.collection(TABLES.COURSES)
      .where("deleted_at", "==", null)
      .get();

    const enrolledCourses = await Promise.all(coursesSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      let teacherName = "Unknown";
      
      if (data.created_by) {
        const teacherDoc = await db.collection(TABLES.USERS).doc(data.created_by).get();
        if (teacherDoc.exists) {
          teacherName = teacherDoc.data().username || teacherDoc.data().displayName || "Unknown";
        }
      }

      return {
        id: doc.id,
        name: data.name,
        description: data.about || data.description,
        created_by: data.created_by,
        teacher_name: teacherName,
        duration_months: data.duration_months,
        start_date: data.start_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        progress_percentage: data.progress_percentage || Math.floor(Math.random() * 100)
      };
    }));

    // Get student's quiz attempts from scores collection
    const scoresSnapshot = await db.collection(TABLES.SCORES)
      .where("user_id", "==", userId)
      .where("deleted_at", "==", null)
      .orderBy("created_at", "desc")
      .get();

    const quizAttempts = await Promise.all(scoresSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      let quizName = data.question_name || "Quiz";
      let courseName = "Unknown Course";
      let maxScore = 5;

      if (data.quiz_id) {
        const quizDoc = await db.collection(TABLES.QUIZZES).doc(data.quiz_id).get();
        if (quizDoc.exists) {
          const quizData = quizDoc.data();
          quizName = data.question_name || quizData.name || quizName;
          maxScore = quizData.max_score || maxScore;

          if (quizData.course_id) {
            const courseDoc = await db.collection(TABLES.COURSES).doc(quizData.course_id).get();
            if (courseDoc.exists) {
              courseName = courseDoc.data().name || courseName;
            }
          }
        }
      }

      const percentage = maxScore > 0 ? Math.round((data.marks / maxScore) * 100 * 10) / 10 : 0;

      return {
        quiz_id: data.quiz_id,
        score: data.marks,
        max_score: maxScore,
        percentage,
        completed_at: data.created_at,
        quiz_name: quizName,
        course_name: courseName
      };
    }));

    // Calculate statistics
    const totalQuizzes = quizAttempts.length;
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averagePercentage = totalQuizzes > 0
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalQuizzes
      : 0;

    // Get recent activity (last 5)
    const recentActivity = quizAttempts.slice(0, 5).map(attempt => ({
      id: attempt.quiz_id,
      type: "quiz_completed",
      title: attempt.quiz_name,
      course: attempt.course_name,
      score: `${attempt.score}/${attempt.max_score}`,
      percentage: attempt.percentage,
      timestamp: attempt.completed_at
    }));

    // Subject-wise performance
    const subjectPerformance = {};
    quizAttempts.forEach(attempt => {
      const subject = attempt.course_name;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { attempts: 0, scores: [] };
      }
      subjectPerformance[subject].attempts++;
      subjectPerformance[subject].scores.push(attempt.percentage);
    });

    const subjectStats = Object.keys(subjectPerformance).map(subject => {
      const data = subjectPerformance[subject];
      return {
        subject,
        attempts: data.attempts,
        averageScore: data.scores.reduce((a, b) => a + b, 0) / data.attempts
      };
    });

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole
      },
      stats: {
        enrolledCourses: enrolledCourses.length,
        completedQuizzes: totalQuizzes,
        averageScore: Math.round(averagePercentage * 10) / 10,
        totalPoints: totalScore
      },
      recentActivity,
      subjectPerformance: subjectStats,
      upcomingDeadlines: [
        { id: 1, title: "Mathematics Quiz", course: "Advanced Mathematics", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "quiz" },
        { id: 2, title: "Physics Assignment", course: "Physics", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" }
      ],
      performanceTrend: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: quizAttempts.slice(-4).map(attempt => attempt.percentage)
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Student dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard data",
      error: error.message
    });
  }
});

// Teacher Dashboard Data
router.get("/teacher", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== ROLES.TEACHER) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Teacher role required.",
      });
    }

    // Get teacher's courses
    const coursesSnapshot = await db.collection(TABLES.COURSES)
      .where("created_by", "==", userId)
      .where("deleted_at", "==", null)
      .orderBy("created_at", "desc")
      .get();

    const teacherCourses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const courseIds = teacherCourses.map(c => c.id);

    // Get quizzes created by teacher (MCQs for their courses)
    let teacherQuizzes = [];
    if (courseIds.length > 0) {
      // Firestore 'in' operator limit is 10, but let's assume standard usage or handle batching if needed
      // For simplicity, handle up to 10 courses or loop
      const quizzesSnapshot = await db.collection(TABLES.QUIZZES)
        .where("course_id", "in", courseIds.slice(0, 10))
        .orderBy("created_at", "desc")
        .get();
      
      teacherQuizzes = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        course_name: teacherCourses.find(c => c.id === doc.data().course_id)?.name || "Unknown"
      }));
    }

    // Get student performance data (scores for teacher's quizzes)
    const quizIds = teacherQuizzes.map(q => q.id);
    let studentScores = [];
    
    if (quizIds.length > 0) {
      // Fetch scores in batches of 10 for 'in' query
      for (let i = 0; i < quizIds.length; i += 10) {
        const batchIds = quizIds.slice(i, i + 10);
        const scoresSnapshot = await db.collection(TABLES.SCORES)
          .where("quiz_id", "in", batchIds)
          .orderBy("completed_at", "desc")
          .limit(100)
          .get();
        
        const batchScores = await Promise.all(scoresSnapshot.docs.map(async doc => {
          const scoreData = doc.data();
          const userDoc = await db.collection(TABLES.USERS).doc(scoreData.user_id).get();
          const quiz = teacherQuizzes.find(q => q.id === scoreData.quiz_id);
          
          return {
            ...scoreData,
            id: doc.id,
            username: userDoc.exists ? (userDoc.data().username || userDoc.data().displayName) : "Unknown",
            course_name: quiz?.course_name || "Unknown",
            quiz_name: quiz?.name || quiz?.question || "Unknown"
          };
        }));
        studentScores = [...studentScores, ...batchScores];
      }
    }

    // Calculate statistics
    const totalStudentsSet = new Set(studentScores.map(s => s.user_id));
    const totalStudents = totalStudentsSet.size;
    const averageClassScore = studentScores.length > 0
      ? studentScores.reduce((sum, s) => sum + (s.percentage || 0), 0) / studentScores.length
      : 0;

    // Recent activity
    const recentActivity = studentScores.slice(0, 10).map(s => ({
      id: s.user_id,
      type: "student_submission",
      student: s.username,
      quiz: s.quiz_name,
      course: s.course_name,
      score: `${s.marks || s.score}/${s.max_score || 5}`,
      percentage: s.percentage,
      timestamp: s.completed_at || s.created_at
    }));

    // Course performance aggregation
    const coursePerformance = {};
    studentScores.forEach(s => {
      const course = s.course_name;
      if (!coursePerformance[course]) {
        coursePerformance[course] = { attempts: 0, totalScore: 0, students: new Set() };
      }
      coursePerformance[course].attempts++;
      coursePerformance[course].totalScore += (s.percentage || 0);
      coursePerformance[course].students.add(s.user_id);
    });

    const courseStats = Object.keys(coursePerformance).map(course => {
      const data = coursePerformance[course];
      return {
        course,
        students: data.students.size,
        attempts: data.attempts,
        averageScore: data.attempts > 0 ? data.totalScore / data.attempts : 0
      };
    });

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        totalCourses: teacherCourses.length,
        totalQuizzes: teacherQuizzes.length,
        totalStudents,
        averageClassScore: Math.round(averageClassScore * 10) / 10,
      },
      courses: teacherCourses.map(course => ({
        id: course.id,
        name: course.name,
        description: course.about || course.description,
        createdAt: course.created_at
      })),
      recentActivity,
      coursePerformance: courseStats,
      quizzes: teacherQuizzes.map(quiz => {
        const quizScores = studentScores.filter(s => s.quiz_id === quiz.id);
        const avgScore = quizScores.length > 0 
          ? quizScores.reduce((sum, s) => sum + (s.percentage || 0), 0) / quizScores.length
          : 0;
        
        return {
          id: quiz.id,
          name: quiz.name || quiz.question,
          course: quiz.course_name,
          attempts: quizScores.length,
          averageScore: Math.round(avgScore * 10) / 10,
          createdAt: quiz.created_at
        };
      })
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher dashboard data",
      error: error.message
    });
  }
});

// HOD Dashboard Data
router.get("/hod", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== ROLES.HOD) {
      return res.status(403).json({
        success: false,
        message: "Access denied. HOD role required.",
      });
    }

    // Get all teachers
    const teachersSnapshot = await db.collection(TABLES.USERS)
      .where("role", "==", ROLES.TEACHER)
      .get();
    
    const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all students
    const studentsSnapshot = await db.collection(TABLES.USERS)
      .where("role", "==", ROLES.STUDENT)
      .limit(100) // Limit for dashboard view
      .get();
    
    const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all courses
    const coursesSnapshot = await db.collection(TABLES.COURSES)
      .where("deleted_at", "==", null)
      .get();
    
    const courses = await Promise.all(coursesSnapshot.docs.map(async doc => {
      const data = doc.data();
      let teacherName = "Unknown";
      if (data.created_by) {
        const teacherDoc = await db.collection(TABLES.USERS).doc(data.created_by).get();
        teacherName = teacherDoc.exists ? (teacherDoc.data().username || teacherDoc.data().displayName) : "Unknown";
      }
      return { id: doc.id, ...data, teacher_name: teacherName };
    }));

    // Get overall performance statistics (recent 100 scores)
    const scoresSnapshot = await db.collection(TABLES.SCORES)
      .orderBy("completed_at", "desc")
      .limit(100)
      .get();
    
    const performanceData = await Promise.all(scoresSnapshot.docs.map(async doc => {
      const data = doc.data();
      const userDoc = await db.collection(TABLES.USERS).doc(data.user_id).get();
      const quizDoc = await db.collection(TABLES.QUIZZES).doc(data.quiz_id).get();
      let courseName = "Unknown";
      
      if (quizDoc.exists && quizDoc.data().course_id) {
        const courseDoc = await db.collection(TABLES.COURSES).doc(quizDoc.data().course_id).get();
        courseName = courseDoc.exists ? courseDoc.data().name : "Unknown";
      }

      return {
        ...data,
        student_name: userDoc.exists ? (userDoc.data().username || userDoc.data().displayName) : "Unknown",
        course_name: courseName
      };
    }));

    // Calculate department statistics
    const averageDepartmentScore = performanceData.length > 0
      ? performanceData.reduce((sum, pd) => sum + (pd.percentage || 0), 0) / performanceData.length
      : 0;

    // Teacher performance analysis
    const teacherPerformance = {};
    for (const teacher of teachers) {
      const teacherCourses = courses.filter(c => c.created_by === teacher.id);
      
      // For dashboard, we could aggregate scores but might be expensive. 
      // Using a simplified version or pre-calculated stats if they existed.
      // Here we'll just count courses and placeholders for score.
      teacherPerformance[teacher.id] = {
        courses: teacherCourses.length,
        averageScore: 0, // In a real app, this would be fetched from teacher_stats or aggregated
        totalAttempts: 0
      };
    }

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalCourses: courses.length,
        averageDepartmentScore: Math.round(averageDepartmentScore * 10) / 10,
      },
      teachers: teachers.map(t => ({
        id: t.id,
        name: t.username || t.displayName,
        email: t.email,
        courses: teacherPerformance[t.id]?.courses || 0,
        averageScore: 0,
        joinedAt: t.created_at
      })),
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        description: c.about || c.description,
        teacher: c.teacher_name,
        createdAt: c.created_at
      })),
      departmentPerformance: {
        totalAttempts: performanceData.length,
        averageScore: averageDepartmentScore,
        performanceTrend: performanceData.slice(0, 7).map(pd => pd.percentage)
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("HOD dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HOD dashboard data",
      error: error.message
    });
  }
});

// Principal Dashboard Data
router.get("/principal", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== ROLES.PRINCIPAL) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Principal role required.",
      });
    }

    // Get institution-wide statistics
    const usersSnapshot = await db.collection(TABLES.USERS).get();
    const userStats = {
      student: 0,
      teacher: 0,
      hod: 0,
      principal: 0
    };
    usersSnapshot.forEach(doc => {
      const role = doc.data().role;
      if (userStats[role] !== undefined) userStats[role]++;
    });

    const coursesSnapshot = await db.collection(TABLES.COURSES)
      .where("deleted_at", "==", null)
      .get();
    
    const quizStatsSnapshot = await db.collection(TABLES.QUIZZES).get();

    // Get overall institutional performance (recent 200 scores)
    const scoresSnapshot = await db.collection(TABLES.SCORES)
      .orderBy("completed_at", "desc")
      .limit(200)
      .get();

    const institutionPerformance = await Promise.all(scoresSnapshot.docs.map(async doc => {
      const data = doc.data();
      const userDoc = await db.collection(TABLES.USERS).doc(data.user_id).get();
      const quizDoc = await db.collection(TABLES.QUIZZES).doc(data.quiz_id).get();
      
      let courseName = "Unknown";
      let teacherName = "Unknown";
      
      if (quizDoc.exists) {
        const quizData = quizDoc.data();
        if (quizData.course_id) {
          const courseDoc = await db.collection(TABLES.COURSES).doc(quizData.course_id).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data();
            courseName = courseData.name || "Unknown";
            if (courseData.created_by) {
              const teacherDoc = await db.collection(TABLES.USERS).doc(courseData.created_by).get();
              teacherName = teacherDoc.exists ? (teacherDoc.data().username || teacherDoc.data().displayName) : "Unknown";
            }
          }
        }
      }

      return {
        ...data,
        student_name: userDoc.exists ? (userDoc.data().username || userDoc.data().displayName) : "Unknown",
        course_name: courseName,
        teacher_name: teacherName
      };
    }));

    // Calculate institution-wide metrics
    const totalAttempts = institutionPerformance.length;
    const averageInstitutionScore = totalAttempts > 0
      ? institutionPerformance.reduce((sum, ip) => sum + (ip.percentage || 0), 0) / totalAttempts
      : 0;

    // Department-wise analysis (simplified for now as departments are not explicitly linked to users in a complex way here)
    const departmentAnalysis = {
      "Computer Science": {
        students: userStats.student,
        teachers: userStats.teacher,
        courses: coursesSnapshot.size,
        averageScore: averageInstitutionScore,
      },
    };

    // Recent institutional activity
    const recentActivity = institutionPerformance.slice(0, 15).map((ip) => ({
      type: "quiz_completion",
      student: ip.student_name,
      course: ip.course_name,
      teacher: ip.teacher_name,
      score: ip.percentage,
      timestamp: ip.completed_at || ip.created_at,
    }));

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        totalStudents: userStats.student,
        totalTeachers: userStats.teacher,
        totalHODs: userStats.hod,
        totalCourses: coursesSnapshot.size,
        totalQuizzes: quizStatsSnapshot.size,
        averageInstitutionScore: Math.round(averageInstitutionScore * 10) / 10,
      },
      departmentAnalysis,
      recentActivity,
      performanceTrends: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: institutionPerformance.slice(0, 4).map((ip) => ip.percentage),
      },
      institutionMetrics: {
        totalAttempts,
        averageScore: averageInstitutionScore,
        passRate: totalAttempts > 0
          ? (institutionPerformance.filter((ip) => (ip.percentage || 0) >= 60).length / totalAttempts) * 100
          : 0,
      },
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Principal dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch principal dashboard data",
      error: error.message,
    });
  }
});

module.exports = router;
