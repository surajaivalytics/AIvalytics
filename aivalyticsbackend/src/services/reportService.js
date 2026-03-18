const { db, admin } = require("../config/firebaseAdmin");
const OpenAI = require("openai");
const logger = require("../config/logger");
const { TABLES } = require("../config/constants");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

/**
 * Report Service
 * Handles report database operations using Firestore
 */
class ReportService {
  /**
   * Get student scores/attempts
   */
  async getStudentScores(studentId, courseId = null) {
    try {
      let query = db.collection(TABLES.SCORES)
        .where("user_id", "==", studentId)
        .where("deleted_at", "==", null);

      const snapshot = await query.orderBy("created_at", "desc").get();
      let scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Manual join with quiz and course details
      const detailedScores = await Promise.all(scores.map(async (score) => {
        const quizDoc = await db.collection(TABLES.QUIZZES).doc(score.quiz_id).get();
        if (quizDoc.exists) {
          const quizData = quizDoc.data();
          const courseDoc = await db.collection(TABLES.COURSES).doc(quizData.course_id).get();
          return {
            ...score,
            quiz: {
              ...quizData,
              course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null
            }
          };
        }
        return score;
      }));

      // Filter by course if specified (since we did manual join)
      if (courseId) {
        return detailedScores.filter(s => s.quiz && s.quiz.course_id === courseId);
      }

      return detailedScores;
    } catch (error) {
      logger.error(`Get student scores error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save a generated report
   */
  async saveReport(reportData) {
    try {
      const docData = {
        ...reportData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      const reportRef = await db.collection(TABLES.REPORTS).add(docData);
      return { id: reportRef.id, ...docData };
    } catch (error) {
      logger.error(`Save report error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student reports
   */
  async getStudentReports(studentId, filters = {}) {
    try {
      const { report_type, course_id, limit = 10, offset = 0 } = filters;
      let query = db.collection(TABLES.REPORTS).where("user_id", "==", studentId);

      if (report_type) {
        query = query.where("report_type", "==", report_type);
      }
      if (course_id) {
        query = query.where("course_id", "==", course_id);
      }

      const snapshot = await query.orderBy("created_at", "desc").get();
      const reports = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let course = null;
        if (data.course_id) {
          const courseDoc = await db.collection(TABLES.COURSES).doc(data.course_id).get();
          course = courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
        }
        return { id: doc.id, ...data, course };
      }));

      const total = reports.length;
      return {
        reports: reports.slice(offset, offset + limit),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        }
      };
    } catch (error) {
      logger.error(`Get student reports error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId, userId) {
    try {
      const reportDoc = await db.collection(TABLES.REPORTS).doc(reportId).get();
      if (!reportDoc.exists || reportDoc.data().user_id !== userId) {
        return null;
      }

      const data = reportDoc.data();
      let course = null;
      if (data.course_id) {
        const courseDoc = await db.collection(TABLES.COURSES).doc(data.course_id).get();
        course = courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
      }

      return { id: reportDoc.id, ...data, course };
    } catch (error) {
      logger.error(`Get report by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate comprehensive performance analytics
   */
  calculatePerformanceAnalytics(scores, enrolledCourses) {
    if (!scores || scores.length === 0) {
      return {
        overallStats: {
          totalQuizzes: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          totalMarks: 0,
          totalPossibleMarks: 0,
        },
        subjectPerformance: [],
        recentPerformance: [],
        performanceTrend: "no_data",
        strengths: [],
        weaknesses: [],
        monthlyProgress: [],
      };
    }

    // Overall statistics
    const totalQuizzes = scores.length;
    const percentages = scores.map((score) =>
      score.quiz?.max_score > 0 ? (score.marks / score.quiz.max_score) * 100 : 0
    );

    const averageScore =
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const highestScore = Math.max(...percentages);
    const lowestScore = Math.min(...percentages);
    const passRate =
      (percentages.filter((p) => p >= 60).length / totalQuizzes) * 100;
    const totalMarks = scores.reduce((sum, score) => sum + score.marks, 0);
    const totalPossibleMarks = scores.reduce(
      (sum, score) => sum + (score.quiz?.max_score || 0),
      0
    );

    // Subject-wise performance
    const subjectPerformance = {};
    scores.forEach((score) => {
      const courseName = score.quiz?.course?.name || "Unknown Course";
      if (!subjectPerformance[courseName]) {
        subjectPerformance[courseName] = {
          courseName,
          quizzes: 0,
          totalMarks: 0,
          totalPossible: 0,
          scores: [],
        };
      }
      subjectPerformance[courseName].quizzes++;
      subjectPerformance[courseName].totalMarks += score.marks;
      subjectPerformance[courseName].totalPossible += score.quiz?.max_score || 0;
      subjectPerformance[courseName].scores.push(
        (score.marks / (score.quiz?.max_score || 1)) * 100
      );
    });

    const subjectStats = Object.values(subjectPerformance).map((subject) => ({
      courseName: subject.courseName,
      quizzesTaken: subject.quizzes,
      averageScore:
        subject.scores.reduce((sum, s) => sum + s, 0) / subject.scores.length,
      highestScore: Math.max(...subject.scores),
      lowestScore: Math.min(...subject.scores),
      totalMarks: subject.totalMarks,
      totalPossible: subject.totalPossible,
      percentage: (subject.totalMarks / subject.totalPossible) * 100,
    }));

    // Recent performance (last 5 quizzes)
    const recentPerformance = scores.slice(0, 5).map((score) => ({
      quizName: score.quiz?.name || "Unknown Quiz",
      courseName: score.quiz?.course?.name || "Unknown Course",
      score: score.marks,
      maxScore: score.quiz?.max_score || 0,
      percentage: (score.marks / (score.quiz?.max_score || 1)) * 100,
      date: score.created_at,
    }));

    // Performance trend analysis
    let performanceTrend = "stable";
    if (scores.length >= 3) {
      const recent3 = percentages.slice(0, 3);
      const previous3 = percentages.slice(3, 6);
      if (previous3.length > 0) {
        const recentAvg = recent3.reduce((sum, p) => sum + p, 0) / recent3.length;
        const previousAvg =
          previous3.reduce((sum, p) => sum + p, 0) / previous3.length;

        if (recentAvg > previousAvg + 5) {
          performanceTrend = "improving";
        } else if (recentAvg < previousAvg - 5) {
          performanceTrend = "declining";
        }
      }
    }

    // Identify strengths and weaknesses
    let strengths = [];

    // Primary: Look for subjects with 70%+
    const highPerformingSubjects = subjectStats
      .filter((subject) => subject.averageScore >= 70)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3);

    if (highPerformingSubjects.length > 0) {
      strengths = highPerformingSubjects.map((subject) => ({
        area: subject.courseName,
        score: subject.averageScore,
        reason: `Strong performance with ${subject.averageScore.toFixed(1)}% average`,
      }));
    }

    // Secondary: Find relative strengths
    if (strengths.length === 0 && subjectStats.length > 0) {
      const topSubjects = subjectStats
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, Math.min(2, subjectStats.length))
        .filter((subject) => subject.averageScore >= 50);

      if (topSubjects.length > 0) {
        strengths = topSubjects.map((subject) => ({
          area: subject.courseName,
          score: subject.averageScore,
          reason: `Best performing subject with ${subject.averageScore.toFixed(1)}% average`,
        }));
      }
    }

    // Tertiary: Effort-based strengths
    if (strengths.length === 0 && scores.length > 0) {
      if (totalQuizzes >= 3) {
        strengths.push({
          area: "Consistency",
          score: totalQuizzes,
          reason: `Consistent effort with ${totalQuizzes} quiz attempts completed`,
        });
      }

      if (passRate >= 30) {
        strengths.push({
          area: "Progress",
          score: passRate,
          reason: `${passRate.toFixed(1)}% pass rate shows learning progress`,
        });
      }

      if (performanceTrend === "improving") {
        strengths.push({
          area: "Improvement",
          score: averageScore,
          reason: "Recent performance shows positive improvement trend",
        });
      }

      if (strengths.length === 0) {
        strengths.push({
          area: "Engagement",
          score: Math.max(averageScore, 50),
          reason: "Active participation in learning activities shows commitment",
        });
      }
    }

    const weaknesses = subjectStats
      .filter((subject) => subject.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3)
      .map((subject) => ({
        area: subject.courseName,
        score: subject.averageScore,
        reason: `Needs improvement with ${subject.averageScore.toFixed(1)}% average`,
      }));

    // Monthly progress (last 6 months)
    const monthlyProgress = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthScores = scores.filter((score) => {
        const scoreDate = new Date(score.created_at || score.createdAt);
        return scoreDate >= monthStart && scoreDate <= monthEnd;
      });

      const monthPercentages = monthScores.map((score) =>
        score.quiz?.max_score > 0 ? (score.marks / score.quiz.max_score) * 100 : 0
      );

      monthlyProgress.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        quizzesTaken: monthScores.length,
        averageScore:
          monthPercentages.length > 0
            ? monthPercentages.reduce((sum, p) => sum + p, 0) /
              monthPercentages.length
            : 0,
        totalMarks: monthScores.reduce((sum, score) => sum + score.marks, 0),
      });
    }

    return {
      overallStats: {
        totalQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        lowestScore: Math.round(lowestScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        totalMarks,
        totalPossibleMarks,
      },
      subjectPerformance: subjectStats,
      recentPerformance,
      performanceTrend,
      strengths,
      weaknesses,
      monthlyProgress,
    };
  }

  /**
   * Generate AI-powered suggestions using GPT
   */
  async generateAISuggestions(student, scores, analytics) {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key" || process.env.OPENAI_API_KEY.trim() === "") {
        logger.warn("OpenAI API key not available, skipping AI suggestions");
        return null;
      }

      const performanceData = {
        studentInfo: {
          username: student.username,
          rollNumber: student.rollNumber || student.roll_number,
          totalQuizzes: scores.length,
        },
        overallPerformance: analytics.overallStats,
        subjectPerformance: analytics.subjectPerformance,
        recentTrend: analytics.performanceTrend,
        strengths: analytics.strengths,
        weaknesses: analytics.weaknesses,
      };

      const recentResponses = scores.slice(0, 3).map((score) => ({
        quizName: score.quiz?.name,
        courseName: score.quiz?.course?.name,
        score: score.marks,
        maxScore: score.quiz?.max_score || 0,
        responses: score.response?.answers || [],
      }));

      const prompt = `
You are an expert educational advisor and learning specialist analyzing a student's academic performance. Based on the comprehensive data provided, generate personalized, actionable suggestions for improvement.

STUDENT PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

RECENT QUIZ RESPONSES:
${JSON.stringify(recentResponses, null, 2)}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallAssessment": "String (3-4 sentences)",
  "strengths": [{"area": "String", "description": "String", "advice": "String"}],
  "areasForImprovement": [{"area": "String", "currentIssue": "String", "suggestion": "String", "priority": "high/medium/low"}],
  "studyRecommendations": [{"recommendation": "String", "reason": "String", "timeframe": "String"}],
  "motivationalMessage": "String (2-3 sentences)",
  "nextSteps": ["String", "String", "String", "String"]
}
Respond with ONLY the JSON object, no additional text.`;

      const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const text = result.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      logger.error(`AI suggestion generation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate comprehensive student report
   */
  async generateComprehensiveReport(studentId, courseId = null) {
    try {
      // Get student profile
      const userDoc = await db.collection(TABLES.USERS).doc(studentId).get();
      if (!userDoc.exists) throw new Error("Student not found");
      const student = { id: userDoc.id, ...userDoc.data() };

      // Get scores
      const scores = await this.getStudentScores(studentId, courseId);

      // Get enrolled courses
      let enrolledCourses = [];
      const courseIds = student.course_ids || [];
      if (courseIds.length > 0) {
        const coursesSnapshot = await db.collection(TABLES.COURSES)
          .where(admin.firestore.FieldPath.documentId(), "in", courseIds)
          .where("deleted_at", "==", null)
          .get();
        enrolledCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      // Calculate analytics
      const analytics = this.calculatePerformanceAnalytics(scores, enrolledCourses);

      // Generate AI suggestions
      let aiSuggestions = null;
      if (scores.length > 0) {
        const aiTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 15000));
        aiSuggestions = await Promise.race([
          this.generateAISuggestions(student, scores, analytics),
          aiTimeout
        ]).catch(() => null);
      }

      return {
        student: {
          id: student.id,
          username: student.username,
          rollNumber: student.rollNumber || student.roll_number,
          email: student.email,
          memberSince: student.createdAt || student.created_at,
        },
        enrolledCourses: enrolledCourses.length,
        courseDetails: enrolledCourses,
        performance: analytics,
        aiSuggestions,
        generatedAt: new Date().toISOString(),
        totalQuizzesTaken: scores.length,
      };
    } catch (error) {
      logger.error(`Generate comprehensive report error: ${error.message}`);
      throw error;
    }
  }
}

const reportService = new ReportService();
module.exports = reportService;
