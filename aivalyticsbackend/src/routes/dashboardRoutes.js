const express = require("express");
const { supabase } = require("../config/database");

const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// Get leaderboard data
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUserId = req.user.id;

    console.log("🏆 Fetching leaderboard for user:", currentUserId);

    // Use the new database function for efficient leaderboard retrieval
    const { data: leaderboardData, error: leaderboardError } =
      await supabase.rpc("get_leaderboard", {
        limit_count: parseInt(limit),
        user_id_filter: currentUserId,
      });

    if (leaderboardError) {
      console.error("❌ Database error:", leaderboardError);

      // Fallback to manual query if function doesn't exist yet
      const { data: users, error: fallbackError } = await supabase
        .from("user")
        .select(
          `
          id, 
          username, 
          total_score, 
          total_quizzes_taken, 
          average_score, 
          highest_score, 
          overall_percentage,
          leaderboard_points
        `
        )
        .eq(
          "role_id",
          (
            await supabase
              .from("roles")
              .select("id")
              .eq("name", "student")
              .single()
          ).data?.id
        )
        .is("deleted_at", null)
        .gt("total_quizzes_taken", 0)
        .order("leaderboard_points", { ascending: false })
        .order("overall_percentage", { ascending: false })
        .order("total_score", { ascending: false })
        .limit(parseInt(limit));

      if (fallbackError) {
        throw fallbackError;
      }

      // Add rank and format data
      const formattedData = users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.username,
        points: user.leaderboard_points || 0,
        quizCount: user.total_quizzes_taken || 0,
        averageScore: user.average_score || 0,
        highestScore: user.highest_score || 0,
        overallPercentage: user.overall_percentage || 0,
        isCurrentUser: user.id === currentUserId,
      }));

      return res.json({
        success: true,
        data: {
          leaderboard: formattedData,
          currentUserRank:
            formattedData.find((user) => user.isCurrentUser) || null,
        },
      });
    }

    console.log("📊 Database function result:", leaderboardData);

    if (!leaderboardData || leaderboardData.length === 0) {
      // Create sample leaderboard data if no users found (for development mode)
      console.log("📝 No users found, returning sample leaderboard data");

      const sampleLeaderboard = [
        {
          id: "sample1",
          name: "Sarah Johnson",
          points: 450,
          quizCount: 12,
          averageScore: 92.5,
          highestScore: 98,
          overallPercentage: 92.5,
          rank: 1,
          isCurrentUser: currentUserId === "sample1",
        },
        {
          id: "sample2",
          name: "Michael Chen",
          points: 425,
          quizCount: 11,
          averageScore: 88.7,
          highestScore: 95,
          overallPercentage: 88.7,
          rank: 2,
          isCurrentUser: currentUserId === "sample2",
        },
        {
          id: "sample3",
          name: "Emma Rodriguez",
          points: 400,
          quizCount: 10,
          averageScore: 85.2,
          highestScore: 92,
          overallPercentage: 85.2,
          rank: 3,
          isCurrentUser: currentUserId === "sample3",
        },
        {
          id: "sample4",
          name: "You",
          points: 375,
          quizCount: 9,
          averageScore: 79.8,
          highestScore: 87,
          overallPercentage: 79.8,
          rank: 4,
          isCurrentUser: true,
        },
        {
          id: "sample5",
          name: "David Kim",
          points: 350,
          quizCount: 8,
          averageScore: 76.3,
          highestScore: 84,
          overallPercentage: 76.3,
          rank: 5,
          isCurrentUser: currentUserId === "sample5",
        },
        {
          id: "sample6",
          name: "Jessica Wong",
          points: 325,
          quizCount: 7,
          averageScore: 72.8,
          highestScore: 81,
          overallPercentage: 72.8,
          rank: 6,
          isCurrentUser: currentUserId === "sample6",
        },
      ].slice(0, parseInt(limit));

      return res.json({
        success: true,
        data: {
          leaderboard: sampleLeaderboard,
          currentUserRank:
            sampleLeaderboard.find((user) => user.isCurrentUser) || null,
        },
      });
    }

    // Format the data from the database function
    const formattedLeaderboard = leaderboardData.map((user) => ({
      rank: user.rank,
      id: user.id,
      name: user.username,
      points: user.leaderboard_points || 0,
      quizCount: user.total_quizzes_taken || 0,
      averageScore: parseFloat(user.average_score) || 0,
      highestScore: user.highest_score || 0,
      overallPercentage: parseFloat(user.overall_percentage) || 0,
      isCurrentUser: user.is_current_user || false,
    }));

    // Find current user's rank
    const currentUserRank = formattedLeaderboard.find(
      (user) => user.isCurrentUser
    );

    console.log("✅ Leaderboard data formatted successfully");

    res.json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        currentUserRank: currentUserRank || null,
      },
    });
  } catch (error) {
    console.error("❌ Leaderboard error:", error);

    // If it's a database/authentication error, provide sample data for development
    if (
      error.message?.includes("JWT") ||
      error.message?.includes("auth") ||
      error.code === "PGRST116"
    ) {
      console.log("🔧 Database/auth error, providing development sample data");

      const sampleLeaderboard = [
        {
          id: "dev1",
          name: "Sarah Johnson",
          points: 450,
          quizCount: 12,
          averageScore: 92.5,
          highestScore: 98,
          overallPercentage: 92.5,
          rank: 1,
          isCurrentUser: false,
        },
        {
          id: "dev2",
          name: "Michael Chen",
          points: 425,
          quizCount: 11,
          averageScore: 88.7,
          highestScore: 95,
          overallPercentage: 88.7,
          rank: 2,
          isCurrentUser: false,
        },
        {
          id: "dev3",
          name: "Emma Rodriguez",
          points: 400,
          quizCount: 10,
          averageScore: 85.2,
          highestScore: 92,
          overallPercentage: 85.2,
          rank: 3,
          isCurrentUser: false,
        },
        {
          id: "dev4",
          name: "You",
          points: 375,
          quizCount: 9,
          averageScore: 79.8,
          highestScore: 87,
          overallPercentage: 79.8,
          rank: 4,
          isCurrentUser: true,
        },
        {
          id: "dev5",
          name: "David Kim",
          points: 350,
          quizCount: 8,
          averageScore: 76.3,
          highestScore: 84,
          overallPercentage: 76.3,
          rank: 5,
          isCurrentUser: false,
        },
        {
          id: "dev6",
          name: "Jessica Wong",
          points: 325,
          quizCount: 7,
          averageScore: 72.8,
          highestScore: 81,
          overallPercentage: 72.8,
          rank: 6,
          isCurrentUser: false,
        },
      ].slice(0, parseInt(req.query.limit || 10));

      return res.json({
        success: true,
        data: {
          leaderboard: sampleLeaderboard,
          currentUserRank:
            sampleLeaderboard.find((user) => user.isCurrentUser) || null,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard",
      error: error.message,
    });
  }
});

// Student Dashboard Data
router.get("/student", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Student role required.",
      });
    }

    // Get student's enrolled courses
    const { data: courses, error: coursesError } = await supabase
      .from("course")
      .select(
        `
        id, name, about, created_by, duration_months, 
        start_date, created_at, updated_at, progress_percentage,
        user!created_by(username)
      `
      )
      .is("deleted_at", null);

    if (coursesError) {
      throw coursesError;
    }

    const enrolledCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.about,
      created_by: course.created_by,
      teacher_name: course.user?.username || "Unknown",
      duration_months: course.duration_months,
      start_date: course.start_date,
      created_at: course.created_at,
      updated_at: course.updated_at,
      progress_percentage:
        course.progress_percentage || Math.floor(Math.random() * 100), // Mock progress for now
    }));

    // Get student's quiz attempts and scores from the score table
    const { data: userScores, error: scoresError } = await supabase
      .from("score")
      .select(
        `
        quiz_id, 
        marks, 
        response,
        question_name,
        created_at,
        quiz!quiz_id(
          id,
          name,
          max_score,
          course!course_id(name)
        )
      `
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (scoresError) {
      throw scoresError;
    }

    const quizAttempts = userScores.map((score) => {
      const maxScore = score.quiz?.max_score || 5; // Default to 5 if not found
      const percentage =
        maxScore > 0 ? Math.round((score.marks / maxScore) * 100 * 10) / 10 : 0;

      return {
        quiz_id: score.quiz_id,
        score: score.marks,
        max_score: maxScore,
        percentage: percentage,
        completed_at: score.created_at,
        quiz_name: score.question_name || score.quiz?.name || "Quiz",
        course_name: score.quiz?.course?.name || "Unknown Course",
      };
    });

    // Calculate performance statistics
    const totalQuizzes = quizAttempts.length;
    const totalScore = quizAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    const totalMaxScore = quizAttempts.reduce(
      (sum, attempt) => sum + attempt.max_score,
      0
    );
    const averagePercentage =
      totalQuizzes > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
          totalQuizzes
        : 0;

    // Get recent activity (last 5 quiz attempts)
    const recentActivity = quizAttempts.slice(0, 5).map((attempt) => ({
      id: attempt.quiz_id,
      type: "quiz_completed",
      title: attempt.quiz_name || "Quiz",
      course: attempt.course_name || "Unknown Course",
      score: `${attempt.score}/${attempt.max_score}`,
      percentage: attempt.percentage,
      timestamp: attempt.completed_at,
    }));

    // Calculate subject-wise performance
    const subjectPerformance = {};
    quizAttempts.forEach((attempt) => {
      const subject = attempt.course_name || "Unknown";
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          totalAttempts: 0,
          totalScore: 0,
          totalMaxScore: 0,
          scores: [],
        };
      }
      subjectPerformance[subject].totalAttempts++;
      subjectPerformance[subject].totalScore += attempt.score;
      subjectPerformance[subject].totalMaxScore += attempt.max_score;
      subjectPerformance[subject].scores.push(attempt.percentage);
    });

    const subjectStats = Object.keys(subjectPerformance).map((subject) => {
      const data = subjectPerformance[subject];
      const avgPercentage =
        data.scores.length > 0
          ? data.scores.reduce((sum, score) => sum + score, 0) /
            data.scores.length
          : 0;

      return {
        subject,
        attempts: data.totalAttempts,
        averageScore: avgPercentage,
        totalScore: data.totalScore,
        totalMaxScore: data.totalMaxScore,
      };
    });

    // Get upcoming deadlines (mock data for now, can be enhanced)
    const upcomingDeadlines = [
      {
        id: 1,
        title: "Mathematics Quiz",
        course: "Advanced Mathematics",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: "quiz",
      },
      {
        id: 2,
        title: "Physics Assignment",
        course: "Physics",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: "assignment",
      },
    ];

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        enrolledCourses: enrolledCourses.length,
        completedQuizzes: totalQuizzes,
        averageScore: Math.round(averagePercentage * 10) / 10,
        totalPoints: totalScore,
      },
      recentActivity,
      subjectPerformance: subjectStats,
      upcomingDeadlines,
      performanceTrend: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: quizAttempts.slice(-4).map((attempt) => attempt.percentage),
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard data",
      error: error.message,
    });
  }
});

// Teacher Dashboard Data
router.get("/teacher", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Teacher role required.",
      });
    }

    // Get teacher's courses
    const coursesQuery = `
      SELECT id, name, description, created_at, updated_at
      FROM courses 
      WHERE created_by = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const courses = await req.db.query(coursesQuery, [userId]);

    // Get quizzes created by teacher
    const quizzesQuery = `
      SELECT m.id, m.question, m.course_id, c.name as course_name, m.created_at,
             COUNT(us.id) as total_attempts,
             AVG(us.percentage) as average_score
      FROM mcqs m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN user_scores us ON m.id = us.quiz_id
      WHERE c.created_by = ?
      GROUP BY m.id, m.question, m.course_id, c.name, m.created_at
      ORDER BY m.created_at DESC
    `;

    const quizzes = await req.db.query(quizzesQuery, [userId]);

    // Get student performance data
    const studentPerformanceQuery = `
      SELECT u.id, u.username, us.score, us.max_score, us.percentage, 
             us.completed_at, c.name as course_name, m.question as quiz_name
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      JOIN mcqs m ON us.quiz_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE c.created_by = ? AND us.completed_at IS NOT NULL
      ORDER BY us.completed_at DESC
      LIMIT 50
    `;

    const studentPerformance = await req.db.query(studentPerformanceQuery, [
      userId,
    ]);

    // Calculate statistics
    const totalStudents = new Set(studentPerformance.map((sp) => sp.id)).size;
    const totalQuizAttempts = studentPerformance.length;
    const averageClassScore =
      studentPerformance.length > 0
        ? studentPerformance.reduce((sum, sp) => sum + sp.percentage, 0) /
          studentPerformance.length
        : 0;

    // Get recent activity
    const recentActivity = studentPerformance.slice(0, 10).map((sp) => ({
      id: sp.id,
      type: "student_submission",
      student: sp.username,
      quiz: sp.quiz_name,
      course: sp.course_name,
      score: `${sp.score}/${sp.max_score}`,
      percentage: sp.percentage,
      timestamp: sp.completed_at,
    }));

    // Course-wise performance
    const coursePerformance = {};
    studentPerformance.forEach((sp) => {
      const course = sp.course_name;
      if (!coursePerformance[course]) {
        coursePerformance[course] = {
          attempts: 0,
          totalScore: 0,
          students: new Set(),
        };
      }
      coursePerformance[course].attempts++;
      coursePerformance[course].totalScore += sp.percentage;
      coursePerformance[course].students.add(sp.id);
    });

    const courseStats = Object.keys(coursePerformance).map((course) => {
      const data = coursePerformance[course];
      return {
        course,
        students: data.students.size,
        attempts: data.attempts,
        averageScore: data.attempts > 0 ? data.totalScore / data.attempts : 0,
      };
    });

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalStudents,
        averageClassScore: Math.round(averageClassScore * 10) / 10,
      },
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        createdAt: course.created_at,
      })),
      recentActivity,
      coursePerformance: courseStats,
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        name: quiz.question,
        course: quiz.course_name,
        attempts: quiz.total_attempts || 0,
        averageScore: Math.round((quiz.average_score || 0) * 10) / 10,
        createdAt: quiz.created_at,
      })),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher dashboard data",
      error: error.message,
    });
  }
});

// HOD Dashboard Data
router.get("/hod", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "hod") {
      return res.status(403).json({
        success: false,
        message: "Access denied. HOD role required.",
      });
    }

    // Get all teachers in the department
    const teachersQuery = `
      SELECT id, username, email, created_at
      FROM users 
      WHERE role = 'teacher'
      ORDER BY created_at DESC
    `;

    const teachers = await req.db.query(teachersQuery);

    // Get all students
    const studentsQuery = `
      SELECT id, username, email, created_at
      FROM users 
      WHERE role = 'student'
      ORDER BY created_at DESC
    `;

    const students = await req.db.query(studentsQuery);

    // Get all courses
    const coursesQuery = `
      SELECT c.id, c.name, c.description, c.created_at, u.username as teacher_name
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `;

    const courses = await req.db.query(coursesQuery);

    // Get overall performance statistics
    const performanceQuery = `
      SELECT us.score, us.max_score, us.percentage, us.completed_at,
             c.name as course_name, u.username as student_name
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      JOIN mcqs m ON us.quiz_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE us.completed_at IS NOT NULL
      ORDER BY us.completed_at DESC
      LIMIT 100
    `;

    const performanceData = await req.db.query(performanceQuery);

    // Calculate department statistics
    const totalQuizAttempts = performanceData.length;
    const averageDepartmentScore =
      performanceData.length > 0
        ? performanceData.reduce((sum, pd) => sum + pd.percentage, 0) /
          performanceData.length
        : 0;

    // Teacher performance analysis
    const teacherPerformance = {};
    for (const teacher of teachers) {
      const teacherCoursesQuery = `
        SELECT c.id, c.name FROM courses c WHERE c.created_by = ? AND c.deleted_at IS NULL
      `;
      const teacherCourses = await req.db.query(teacherCoursesQuery, [
        teacher.id,
      ]);

      const teacherStatsQuery = `
        SELECT AVG(us.percentage) as avg_score, COUNT(us.id) as total_attempts
        FROM user_scores us
        JOIN mcqs m ON us.quiz_id = m.id
        JOIN courses c ON m.course_id = c.id
        WHERE c.created_by = ? AND us.completed_at IS NOT NULL
      `;
      const teacherStats = await req.db.query(teacherStatsQuery, [teacher.id]);

      teacherPerformance[teacher.username] = {
        courses: teacherCourses.length,
        averageScore: teacherStats[0]?.avg_score || 0,
        totalAttempts: teacherStats[0]?.total_attempts || 0,
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
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.username,
        email: teacher.email,
        courses: teacherPerformance[teacher.username]?.courses || 0,
        averageScore:
          Math.round(
            (teacherPerformance[teacher.username]?.averageScore || 0) * 10
          ) / 10,
        joinedAt: teacher.created_at,
      })),
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        teacher: course.teacher_name,
        createdAt: course.created_at,
      })),
      departmentPerformance: {
        totalAttempts: totalQuizAttempts,
        averageScore: averageDepartmentScore,
        performanceTrend: performanceData.slice(-7).map((pd) => pd.percentage),
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("HOD dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HOD dashboard data",
      error: error.message,
    });
  }
});

// Principal Dashboard Data
router.get("/principal", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Principal role required.",
      });
    }

    // Get institution-wide statistics
    const usersQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;

    const userStats = await req.db.query(usersQuery);

    const coursesQuery = `
      SELECT COUNT(*) as total_courses
      FROM courses
      WHERE deleted_at IS NULL
    `;

    const courseStats = await req.db.query(coursesQuery);

    const quizzesQuery = `
      SELECT COUNT(*) as total_quizzes
      FROM mcqs
    `;

    const quizStats = await req.db.query(quizzesQuery);

    // Get overall institutional performance
    const institutionPerformanceQuery = `
      SELECT us.percentage, us.completed_at, c.name as course_name,
             u.username as student_name, t.username as teacher_name
      FROM user_scores us
      JOIN users u ON us.user_id = u.id
      JOIN mcqs m ON us.quiz_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN users t ON c.created_by = t.id
      WHERE us.completed_at IS NOT NULL
      ORDER BY us.completed_at DESC
      LIMIT 200
    `;

    const institutionPerformance = await req.db.query(
      institutionPerformanceQuery
    );

    // Calculate institution-wide metrics
    const totalAttempts = institutionPerformance.length;
    const averageInstitutionScore =
      institutionPerformance.length > 0
        ? institutionPerformance.reduce((sum, ip) => sum + ip.percentage, 0) /
          institutionPerformance.length
        : 0;

    // Department-wise analysis (simplified)
    const departmentAnalysis = {
      "Computer Science": {
        students: userStats.find((us) => us.role === "student")?.count || 0,
        teachers: userStats.find((us) => us.role === "teacher")?.count || 0,
        courses: courseStats[0]?.total_courses || 0,
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
      timestamp: ip.completed_at,
    }));

    const dashboardData = {
      user: {
        id: userId,
        name: req.user.username,
        role: userRole,
      },
      stats: {
        totalStudents:
          userStats.find((us) => us.role === "student")?.count || 0,
        totalTeachers:
          userStats.find((us) => us.role === "teacher")?.count || 0,
        totalHODs: userStats.find((us) => us.role === "hod")?.count || 0,
        totalCourses: courseStats[0]?.total_courses || 0,
        totalQuizzes: quizStats[0]?.total_quizzes || 0,
        averageInstitutionScore: Math.round(averageInstitutionScore * 10) / 10,
      },
      departmentAnalysis,
      recentActivity,
      performanceTrends: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: institutionPerformance.slice(-4).map((ip) => ip.percentage),
      },
      institutionMetrics: {
        totalAttempts,
        averageScore: averageInstitutionScore,
        passRate:
          (institutionPerformance.filter((ip) => ip.percentage >= 60).length /
            totalAttempts) *
          100,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
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
