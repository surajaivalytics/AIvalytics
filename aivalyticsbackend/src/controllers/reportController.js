const OpenAI = require("openai");
const { supabase } = require("../config/database");

/**
 * Report Controller
 * Handles AI-powered student performance report generation
 */

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

/**
 * Generate comprehensive student performance report with AI suggestions
 */
const generateStudentReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;

    // Verify user is a student
    if (studentRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can generate performance reports",
      });
    }

    console.log(`📊 Generating performance report for student: ${studentId}`);

    // Get student information
    const { data: student, error: studentError } = await supabase
      .from("user")
      .select(
        `
        id,
        username,
        roll_number,
        email,
        course_ids,
        created_at
      `
      )
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all quiz scores for this student
    const { data: scores, error: scoresError } = await supabase
      .from("score")
      .select(
        `
        id,
        quiz_id,
        marks,
        created_at,
        response,
        quiz:quiz_id (
          id,
          name,
          max_score,
          question_json,
          course:course_id (
            id,
            name
          )
        )
      `
      )
      .eq("user_id", studentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (scoresError) {
      console.error("❌ Error fetching student scores:", scoresError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student performance data",
      });
    }

    console.log(`📈 Found ${scores?.length || 0} quiz attempts for analysis`);

    // Get enrolled courses information
    let enrolledCourses = [];
    if (student.course_ids && student.course_ids.length > 0) {
      const { data: courses, error: coursesError } = await supabase
        .from("course")
        .select(
          `
          id,
          name,
          about,
          duration_months,
          created_at
        `
        )
        .in("id", student.course_ids)
        .is("deleted_at", null);

      if (!coursesError && courses) {
        enrolledCourses = courses;
      }
    }

    // Calculate performance analytics
    const analytics = calculatePerformanceAnalytics(scores, enrolledCourses);

    // Generate AI suggestions if we have performance data
    let aiSuggestions = null;
    if (scores && scores.length > 0) {
      try {
        // Add timeout to AI suggestions generation
        const aiTimeout = new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("AI suggestions timeout")), 15000) // 15 second timeout
        );

        const aiPromise = generateAISuggestions(student, scores, analytics);

        // Race between AI generation and timeout
        aiSuggestions = await Promise.race([aiPromise, aiTimeout]);
        console.log("✅ AI suggestions generated successfully");
      } catch (aiError) {
        console.error(
          "❌ AI suggestion generation failed or timed out:",
          aiError
        );
        // Continue without AI suggestions rather than failing the entire request
        aiSuggestions = null;
      }
    }

    // Compile comprehensive report
    const report = {
      student: {
        id: student.id,
        username: student.username,
        rollNumber: student.roll_number,
        email: student.email,
        memberSince: student.created_at,
      },
      enrolledCourses: enrolledCourses.length,
      courseDetails: enrolledCourses,
      performance: analytics,
      aiSuggestions,
      generatedAt: new Date().toISOString(),
      totalQuizzesTaken: scores?.length || 0,
    };

    console.log(`✅ Report generated successfully for student ${studentId}`);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("❌ Error generating student report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate performance report",
      error: error.message,
    });
  }
};

/**
 * Store generated report in database
 */
const storeReport = async (
  userId,
  reportData,
  reportType = "performance",
  courseId = null
) => {
  try {
    // Convert "all" to "comprehensive" to avoid constraint violation
    if (reportType === "all") {
      reportType = "comprehensive";
    }

    const reportName = `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } Report - ${new Date().toLocaleDateString()}`;

    const { data: report, error } = await supabase
      .from("report")
      .insert({
        user_id: userId,
        name: reportName,
        report_type: reportType,
        report_data: reportData,
        status: "completed",
        generated_by: userId,
        course_id: courseId,
        date_created: new Date().toISOString().split("T")[0],
        accuracy: reportData.performance?.overallStats?.passRate || 0,
        suggestions: reportData.aiSuggestions?.summary || null,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error storing report:", error);
      throw error;
    }

    console.log(`✅ Report stored successfully with ID: ${report.id}`);
    return report;
  } catch (error) {
    console.error("❌ Failed to store report:", error);
    throw error;
  }
};

/**
 * Get all reports for a student
 */
const getStudentReports = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;

    // Verify user is a student
    if (studentRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view their reports",
      });
    }

    const { report_type, course_id, limit = 10, offset = 0 } = req.query;

    console.log(`📊 Fetching reports for student: ${studentId}`);

    // Build query
    let query = supabase
      .from("report")
      .select(
        `
        id,
        name,
        report_type,
        report_data,
        status,
        accuracy,
        suggestions,
        date_created,
        created_at,
        course:course_id (
          id,
          name
        )
      `
      )
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (report_type) {
      query = query.eq("report_type", report_type);
    }

    if (course_id) {
      query = query.eq("course_id", course_id);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error("❌ Error fetching reports:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reports",
        error: error.message,
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("report")
      .select("id", { count: "exact" })
      .eq("user_id", studentId);

    if (report_type) {
      countQuery = countQuery.eq("report_type", report_type);
    }

    if (course_id) {
      countQuery = countQuery.eq("course_id", course_id);
    }

    const { count } = await countQuery;

    console.log(
      `✅ Found ${reports?.length || 0} reports for student ${studentId}`
    );

    res.json({
      success: true,
      data: {
        reports: reports || [],
        pagination: {
          total: count || 0,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (count || 0) > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getStudentReports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * Get a specific report by ID
 */
const getReportById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;
    const { reportId } = req.params;

    // Verify user is a student
    if (studentRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view reports",
      });
    }

    console.log(`📊 Fetching report ${reportId} for student: ${studentId}`);

    const { data: report, error } = await supabase
      .from("report")
      .select(
        `
        id,
        name,
        report_type,
        report_data,
        status,
        accuracy,
        suggestions,
        date_created,
        created_at,
        course:course_id (
          id,
          name
        )
      `
      )
      .eq("id", reportId)
      .eq("user_id", studentId)
      .single();

    if (error || !report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied",
      });
    }

    console.log(`✅ Report ${reportId} retrieved successfully`);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("❌ Error in getReportById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

/**
 * Generate and store comprehensive student performance report with AI suggestions
 */
const generateAndStoreStudentReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentRole = req.user.role;
    let { course_id, report_type = "performance" } = req.body;

    // Convert "all" to "comprehensive" to avoid constraint violation
    if (report_type === "all") {
      report_type = "comprehensive";
    }

    // Verify user is a student
    if (studentRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can generate performance reports",
      });
    }

    console.log(
      `📊 Generating and storing ${report_type} report for student: ${studentId}`
    );

    // Get student information
    const { data: student, error: studentError } = await supabase
      .from("user")
      .select(
        `
        id,
        username,
        roll_number,
        email,
        course_ids,
        created_at
      `
      )
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all quiz scores for this student
    let scoresQuery = supabase
      .from("score")
      .select(
        `
        id,
        quiz_id,
        marks,
        created_at,
        response,
        quiz:quiz_id (
          id,
          name,
          max_score,
          question_json,
          course:course_id (
            id,
            name
          )
        )
      `
      )
      .eq("user_id", studentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (course_id) {
      scoresQuery = scoresQuery.eq("quiz.course_id", course_id);
    }

    const { data: scores, error: scoresError } = await scoresQuery;

    if (scoresError) {
      console.error("❌ Error fetching student scores:", scoresError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student performance data",
      });
    }

    console.log(`📈 Found ${scores?.length || 0} quiz attempts for analysis`);

    // Get enrolled courses information
    let enrolledCourses = [];
    if (student.course_ids && student.course_ids.length > 0) {
      const { data: courses, error: coursesError } = await supabase
        .from("course")
        .select(
          `
          id,
          name,
          about,
          duration_months,
          created_at
        `
        )
        .in("id", student.course_ids)
        .is("deleted_at", null);

      if (!coursesError && courses) {
        enrolledCourses = courses;
      }
    }

    // Calculate performance analytics
    const analytics = calculatePerformanceAnalytics(scores, enrolledCourses);

    // Generate AI suggestions if we have performance data
    let aiSuggestions = null;
    if (scores && scores.length > 0) {
      try {
        // Add timeout to AI suggestions generation
        const aiTimeout = new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("AI suggestions timeout")), 15000) // 15 second timeout
        );

        const aiPromise = generateAISuggestions(student, scores, analytics);

        // Race between AI generation and timeout
        aiSuggestions = await Promise.race([aiPromise, aiTimeout]);
        console.log("✅ AI suggestions generated successfully");
      } catch (aiError) {
        console.error(
          "❌ AI suggestion generation failed or timed out:",
          aiError
        );
        // Continue without AI suggestions rather than failing the entire request
        aiSuggestions = null;
      }
    }

    // Compile comprehensive report
    const reportData = {
      student: {
        id: student.id,
        username: student.username,
        rollNumber: student.roll_number,
        email: student.email,
        memberSince: student.created_at,
      },
      enrolledCourses: enrolledCourses.length,
      courseDetails: enrolledCourses,
      performance: analytics,
      aiSuggestions,
      generatedAt: new Date().toISOString(),
      totalQuizzesTaken: scores?.length || 0,
    };

    // Store the report in database
    const storedReport = await storeReport(
      studentId,
      reportData,
      report_type,
      course_id
    );

    console.log(
      `✅ Report generated and stored successfully for student ${studentId}`
    );

    res.json({
      success: true,
      message: "Report generated and stored successfully",
      data: {
        report: storedReport,
        reportData: reportData,
      },
    });
  } catch (error) {
    console.error("❌ Error generating and storing student report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate and store performance report",
      error: error.message,
    });
  }
};

/**
 * Calculate comprehensive performance analytics
 */
const calculatePerformanceAnalytics = (scores, enrolledCourses) => {
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

  // Identify strengths and weaknesses - FIXED LOGIC
  console.log("🔍 Subject Stats for Strengths Analysis:", subjectStats);

  let strengths = [];

  // Primary: Look for subjects with 70%+ (lowered threshold)
  const highPerformingSubjects = subjectStats
    .filter((subject) => subject.averageScore >= 70)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);

  console.log("🏆 High Performing Subjects (>=70%):", highPerformingSubjects);

  if (highPerformingSubjects.length > 0) {
    strengths = highPerformingSubjects.map((subject) => ({
      area: subject.courseName,
      score: subject.averageScore,
      reason: `Strong performance with ${subject.averageScore.toFixed(
        1
      )}% average`,
    }));
  }

  // Secondary: If no 70%+ subjects, find relative strengths (top performers)
  if (strengths.length === 0 && subjectStats.length > 0) {
    console.log("🔄 No 70%+ subjects, looking for relative strengths...");

    // Get top performing subjects regardless of absolute score
    const topSubjects = subjectStats
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, Math.min(2, subjectStats.length))
      .filter((subject) => subject.averageScore >= 50); // At least 50%

    console.log("📈 Top Relative Subjects:", topSubjects);

    if (topSubjects.length > 0) {
      strengths = topSubjects.map((subject) => ({
        area: subject.courseName,
        score: subject.averageScore,
        reason: `Best performing subject with ${subject.averageScore.toFixed(
          1
        )}% average`,
      }));
    }
  }

  // Tertiary: If still no strengths, add effort-based strengths
  if (strengths.length === 0 && scores.length > 0) {
    console.log("💪 Adding effort-based strengths...");

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

    // Always ensure at least one strength
    if (strengths.length === 0) {
      strengths.push({
        area: "Engagement",
        score: Math.max(averageScore, 50),
        reason: "Active participation in learning activities shows commitment",
      });
    }
  }

  console.log("✅ Final Strengths:", strengths);

  const weaknesses = subjectStats
    .filter((subject) => subject.averageScore < 60)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)
    .map((subject) => ({
      area: subject.courseName,
      score: subject.averageScore,
      reason: `Needs improvement with ${subject.averageScore.toFixed(
        1
      )}% average`,
    }));

  // Monthly progress (last 6 months)
  const monthlyProgress = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthScores = scores.filter((score) => {
      const scoreDate = new Date(score.created_at);
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
};

/**
 * Generate AI-powered suggestions using GPT
 */
const generateAISuggestions = async (student, scores, analytics) => {
  try {
    // Check if OpenAI API key is available
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "demo-key" ||
      process.env.OPENAI_API_KEY.trim() === ""
    ) {
      console.log("⚠️ OpenAI API key not available, skipping AI suggestions");
      return null;
    }

    const model = "gpt-4o-mini"; // Using a standard GPT-4 model

    // Prepare performance data for AI analysis
    const performanceData = {
      studentInfo: {
        username: student.username,
        rollNumber: student.roll_number,
        totalQuizzes: scores.length,
      },
      overallPerformance: analytics.overallStats,
      subjectPerformance: analytics.subjectPerformance,
      recentTrend: analytics.performanceTrend,
      strengths: analytics.strengths,
      weaknesses: analytics.weaknesses,
    };

    // Analyze recent quiz responses for detailed insights
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
  "overallAssessment": "A detailed overall assessment of the student's performance, highlighting key patterns and trends (3-4 sentences)",
  "strengths": [
    {
      "area": "Subject/skill area",
      "description": "What the student is doing well with specific examples",
      "advice": "How to maintain or build on this strength"
    }
  ],
  "areasForImprovement": [
    {
      "area": "Subject/skill area that needs work",
      "currentIssue": "What the specific problem is",
      "suggestion": "Detailed actionable advice with specific techniques",
      "priority": "high/medium/low"
    }
  ],
  "studyRecommendations": [
    {
      "recommendation": "Specific study technique or approach with clear steps",
      "reason": "Why this will help based on learning science",
      "timeframe": "When and how often to implement this"
    }
  ],
  "motivationalMessage": "A personalized, encouraging message that acknowledges their efforts and inspires continued learning (2-3 sentences)",
  "nextSteps": [
    "Immediate action item 1 (this week)",
    "Short-term goal (next 2 weeks)",
    "Medium-term objective (next month)",
    "Long-term target (next quarter)"
  ]
}

ENHANCED GUIDELINES:
1. Be highly specific and actionable in all suggestions
2. Reference actual performance data and trends in your analysis
3. Provide evidence-based study techniques and learning strategies
4. Be encouraging while providing honest, constructive feedback
5. Tailor all advice to their current performance level and learning patterns
6. Include both subject-specific and meta-learning recommendations
7. Focus on growth mindset and continuous improvement
8. Provide realistic timelines and expectations
9. Consider different learning styles and preferences
10. Make recommendations progressive and achievable

Respond with ONLY the JSON object, no additional text.
`;

    console.log(
      `🤖 Generating AI suggestions for student ${student.username}...`
    );
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    const text = result.choices[0].message.content;

    console.log(`🤖 AI response length: ${text.length} characters`);

    // Parse AI response
    let suggestions;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
        console.log("✅ AI suggestions generated successfully");
      } else {
        throw new Error("Could not extract JSON from AI response");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI suggestions:", parseError);
      return null;
    }

    return suggestions;
  } catch (error) {
    console.error("❌ AI suggestion generation failed:", error);
    return null;
  }
};

module.exports = {
  generateStudentReport,
  generateAndStoreStudentReport,
  getStudentReports,
  getReportById,
};
