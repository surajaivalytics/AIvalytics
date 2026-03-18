const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { db } = require("../config/database");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

/**
 * MCQ Controller
 * Handles AI-powered MCQ generation from uploaded files using OpenAI GPT
 */

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

// AI MCQ generation function using GPT
const generateMCQFromContent = async (
  content,
  numQuestions = 20,
  maxScore = 100,
  topics = ""
) => {
  try {
    // Require valid API key - no mock fallback
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "demo-key" ||
      process.env.OPENAI_API_KEY.trim() === ""
    ) {
      throw new Error(
        "OpenAI API key is required for MCQ generation. Please set OPENAI_API_KEY in your environment variables."
      );
    }

    const topicsInstruction = topics
      ? `Focus specifically on these topics: ${topics}. `
      : "";

    const prompt = `You are an expert educator creating challenging multiple-choice questions. Based on the following content, generate exactly ${numQuestions} high-quality multiple-choice questions that require deep thinking and analysis.

${topicsInstruction}

Content to analyze:
${content.substring(0, 8000)}

CRITICAL REQUIREMENTS:
1. Create exactly ${numQuestions} questions that test deep understanding and critical thinking
2. Each question must have exactly 4 options
3. Make questions conceptual and analytical - avoid simple recall questions
4. Focus on HARD to EXTREMELY HARD difficulty levels - create questions that make students think critically
5. DO NOT reference specific sections, chapters, or numbered exercises (like "section 1.9" or "exercise 1.15.3")
6. Focus on WHY and HOW concepts work, not just WHAT they are
7. Create scenario-based questions that test application of knowledge
8. ${topics
        ? `Focus on these topics: ${topics}`
        : "Cover key concepts from the content"
      }
9. Provide detailed explanations that help students understand the reasoning

QUESTION DESIGN PRINCIPLES:
- Ask "What would happen if..." scenarios
- Test understanding of cause-and-effect relationships  
- Require analysis and comparison of concepts
- Focus on problem-solving and application
- Avoid simple definition-based questions
- Make students think about implications and consequences

CRITICAL JSON FORMAT REQUIREMENTS:
- Respond with ONLY valid JSON - no markdown, no code blocks, no extra text
- Use double quotes for ALL strings (not single quotes)
- Ensure all property names are in double quotes
- correct_answer must be a number (0, 1, 2, or 3)
- All fields are required for each question
- NO trailing commas
- NO unquoted property names
- NO unquoted string values

EXACT FORMAT TO FOLLOW:
[{"question":"When implementing a recursive algorithm, what is the most critical factor that determines whether the algorithm will terminate successfully or result in a stack overflow?","options":["The programming language used","The presence of a proper base case and convergence toward it","The size of the input data","The number of recursive calls made"],"correct_answer":1,"explanation":"A recursive algorithm must have a base case that stops the recursion and each recursive call must progress toward that base case. Without this, the algorithm will recurse infinitely and cause a stack overflow.","difficulty":"hard","topic":"Programming Concepts"}]

Generate exactly ${numQuestions} questions following this exact format. Focus on creating challenging, thought-provoking questions that test deep understanding rather than memorization. Return ONLY the JSON array with no additional formatting or text.`;

    console.log("🤖 Sending request to OpenAI GPT...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educator creating challenging multiple-choice questions. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const text = completion.choices[0].message.content;

    // Save the raw AI response to a file for debugging
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFileName = `gpt-response-${timestamp}.txt`;
    const logFilePath = path.join(__dirname, "../../uploads", logFileName);

    try {
      fs.writeFileSync(
        logFilePath,
        `=== OPENAI GPT RESPONSE LOG ===
Timestamp: ${new Date().toISOString()}
Content Length: ${content.substring(0, 500)}...
Topics: ${topics}
Number of Questions: ${numQuestions}
Max Score: ${maxScore}

=== RAW GPT RESPONSE ===
${text}

=== END OF RESPONSE ===
`
      );
      console.log(`📝 GPT response saved to: ${logFileName}`);
    } catch (fileError) {
      console.error("Failed to save GPT response to file:", fileError);
    }

    console.log(`🤖 Raw AI response length: ${text.length} characters`);
    console.log(`📝 AI response preview: ${text.substring(0, 500)}...`);

    // Extract JSON from response with improved error handling
    let rawJsonText = text.trim();

    console.log(`🔍 Raw response length: ${rawJsonText.length} characters`);
    console.log(`🔍 Response starts with: ${rawJsonText.substring(0, 100)}`);
    console.log(
      `🔍 Response ends with: ${rawJsonText.substring(
        rawJsonText.length - 100
      )}`
    );

    // Remove any markdown code block formatting
    if (rawJsonText.includes("```")) {
      const codeBlockMatch = rawJsonText.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/
      );
      if (codeBlockMatch) {
        rawJsonText = codeBlockMatch[1].trim();
        console.log("✅ Extracted JSON from code blocks");
        console.log(
          `🔍 Extracted content length: ${rawJsonText.length} characters`
        );
      }
    }

    // Find the JSON array in the response
    let jsonMatch = rawJsonText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ Could not find JSON array in AI response");
      console.log(
        "🔍 First 500 chars of response:",
        rawJsonText.substring(0, 500)
      );
      throw new Error(
        "Could not extract valid JSON from AI response. The AI may not have returned properly formatted JSON."
      );
    }

    const jsonString = jsonMatch[0];
    console.log(`📋 JSON string length: ${jsonString.length} characters`);

    // Clean and fix common JSON issues
    let cleanedJson = jsonString
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Fix unquoted property names
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, "$1")
      // Fix newlines in strings
      .replace(/"\s*\n\s*"/g, '" "')
      // Remove any control characters
      .replace(/[\x00-\x1F\x7F]/g, "")
      // Fix double quotes
      .replace(/""/g, '"')
      // Ensure proper spacing
      .replace(/\s+/g, " ")
      .trim();

    console.log(`🔧 Cleaned JSON preview: ${cleanedJson.substring(0, 300)}...`);

    let questions;
    try {
      questions = JSON.parse(cleanedJson);
      console.log("✅ JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError.message);

      // Try to fix more specific issues
      try {
        console.log("🔧 Attempting additional JSON fixes...");

        // Fix missing quotes around string values
        let fixedJson = cleanedJson
          // Fix unquoted string values
          .replace(/:\s*([^"][^,}\]]*[^"\s,}\]])/g, ': "$1"')
          // Fix boolean and number values that got quoted
          .replace(/"\s*(true|false|null|\d+)\s*"/g, "$1")
          // Remove any remaining trailing commas
          .replace(/,(\s*[}\]])/g, "$1");

        questions = JSON.parse(fixedJson);
        console.log("✅ JSON fixed and parsed successfully");
      } catch (secondError) {
        console.error("❌ Second parsing attempt failed:", secondError.message);

        // Last resort: try to extract individual questions
        try {
          console.log("🔧 Attempting to extract individual questions...");

          // Find all question objects using regex
          const questionRegex = /\{[^{}]*"question"[^{}]*\}/g;
          const matches = cleanedJson.match(questionRegex);

          if (matches && matches.length > 0) {
            const parsedQuestions = [];

            for (let i = 0; i < matches.length; i++) {
              try {
                // Clean up individual question object
                let questionStr = matches[i]
                  .replace(/'/g, '"')
                  .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
                  .replace(/,(\s*[}\]])/g, "$1");

                const questionObj = JSON.parse(questionStr);

                // Validate required fields
                if (
                  questionObj.question &&
                  Array.isArray(questionObj.options) &&
                  questionObj.options.length === 4 &&
                  typeof questionObj.correct_answer === "number" &&
                  questionObj.correct_answer >= 0 &&
                  questionObj.correct_answer <= 3
                ) {
                  parsedQuestions.push(questionObj);
                }
              } catch (objError) {
                console.warn(
                  `⚠️ Failed to parse question ${i + 1}: ${objError.message}`
                );
              }
            }

            if (parsedQuestions.length > 0) {
              questions = parsedQuestions;
              console.log(
                `✅ Successfully parsed ${parsedQuestions.length} questions`
              );
            } else {
              throw new Error("No valid questions could be parsed");
            }
          } else {
            throw new Error("No question objects found in response");
          }
        } catch (finalError) {
          console.error("❌ All parsing attempts failed:", finalError.message);
          console.log(
            "🔍 Raw JSON that failed to parse:",
            jsonString.substring(0, 1000)
          );

          // Fallback: Generate simple questions from content
          console.log("🔄 Generating fallback questions from content...");
          questions = generateFallbackQuestions(content, numQuestions, topics);
          console.log(`✅ Generated ${questions.length} fallback questions`);
        }
      }
    }

    if (!Array.isArray(questions)) {
      throw new Error("AI response is not a valid array of questions");
    }

    if (questions.length === 0) {
      throw new Error("AI did not generate any questions");
    }

    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: index,
    }));

    console.log(`📊 AI generated ${questionsWithIds.length} questions`);
    console.log("🔍 Sample AI question:", {
      question: `${questionsWithIds[0]?.question?.substring(0, 100)}...`,
      options_count: questionsWithIds[0]?.options?.length,
      difficulty: questionsWithIds[0]?.difficulty,
      topic: questionsWithIds[0]?.topic,
    });

    return questionsWithIds;
  } catch (error) {
    console.error("❌ MCQ generation failed:", error);
    throw error;
  }
};

// Fallback function to generate simple questions when AI fails
const generateFallbackQuestions = (content, numQuestions, topics) => {
  const questions = [];
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 20) continue;

    const question = {
      question: `Based on the content, what is the main concept discussed in: "${sentence.substring(
        0,
        100
      )}..."?`,
      options: [
        "The concept is not clearly defined in the content",
        "It relates to fundamental principles discussed in the material",
        "It represents an advanced application of the topic",
        "It demonstrates a practical implementation approach",
      ],
      correct_answer: 1,
      explanation:
        "This question tests understanding of the main concepts presented in the content.",
      difficulty: "medium",
      topic: topics || "General",
    };

    questions.push(question);
  }

  // If we don't have enough questions, add some generic ones
  while (questions.length < numQuestions) {
    const question = {
      question: `What is the primary focus of the content provided?`,
      options: [
        "Basic definitions and terminology",
        "Practical applications and real-world examples",
        "Theoretical concepts and their relationships",
        "Historical development of the subject",
      ],
      correct_answer: 2,
      explanation:
        "The content focuses on theoretical concepts and their relationships.",
      difficulty: "medium",
      topic: topics || "General",
    };

    questions.push(question);
  }

  return questions.slice(0, numQuestions);
};

// Enhanced text extraction from different file types
const extractTextFromFile = async (filePath, fileType) => {
  try {
    if (fileType === "text/plain") {
      return fs.readFileSync(filePath, "utf8");
    }

    if (fileType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    }

    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      throw new Error(
        "PPTX files are not supported. Please convert to PDF, DOCX, or TXT format."
      );
    }

    throw new Error("Unsupported file type. Allowed: PDF, DOCX, TXT.");
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

/**
 * Generate MCQ from uploaded file
 */
const generateMCQ = async (req, res) => {
  try {
    const {
      course_id,
      quiz_name,
      num_questions = 20,
      max_score = 100,
      topics = "",
    } = req.body;
    const { file } = req;

    // Validate required fields
    if (!course_id || !quiz_name || !file) {
      return res.status(400).json({
        success: false,
        message: "Course ID, quiz name, and file are required",
      });
    }

    // Verify user is a teacher
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["teacher", "hod", "principal"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only teachers can generate MCQs",
      });
    }

    // Verify the course exists and user has access
    const courseDoc = await db.collection("course").doc(course_id).get();
    const course = courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
    const course = await courseService.getCourseById(course_id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // For teachers, verify they created the course (using created_by field)
    // HOD and Principal can create MCQs for any course
    if (userRole === "teacher" && course.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only create quizzes for courses you created",
      });
    }

    // Extract text from uploaded file
    const filePath = file.path;
    const fileType = file.mimetype;

    let extractedContent;
    try {
      extractedContent = await extractTextFromFile(filePath, fileType);
    } catch (error) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Failed to process file: ${error.message}`,
      });
    }

    // Generate MCQs using AI with topics
    let generatedQuestions;
    try {
      console.log(`🤖 Starting MCQ generation for course: ${course.name}`);
      console.log(`📝 Quiz name: ${quiz_name}`);
      console.log(`📊 Number of questions: ${num_questions}`);
      console.log(`🎯 Max score: ${max_score}`);
      console.log(`📚 Topics: ${topics || "General"}`);
      console.log(`📄 File type: ${fileType}`);
      console.log(`📏 Content length: ${extractedContent.length} characters`);

      generatedQuestions = await generateMCQFromContent(
        extractedContent,
        parseInt(num_questions),
        parseInt(max_score),
        topics
      );

      console.log("✅ MCQ generation successful!");
      console.log(`📋 Generated ${generatedQuestions.length} questions`);

      // Ensure we have at least 5 questions for student quizzes
      if (generatedQuestions.length < 5) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: `Quiz generation failed: Only ${generatedQuestions.length} questions were generated. A minimum of 5 questions is required for student quizzes. Please try with more content or adjust the generation parameters.`,
        });
      }

      console.log("🔍 Sample question:", {
        question: `${generatedQuestions[0]?.question?.substring(0, 100)}...`,
        options_count: generatedQuestions[0]?.options?.length,
        difficulty: generatedQuestions[0]?.difficulty,
        topic: generatedQuestions[0]?.topic,
      });
    } catch (error) {
      console.error("❌ MCQ generation failed:", error);
      // Clean up uploaded file
      fs.unlinkSync(filePath);

      // Provide specific error message for missing API key
      if (error.message.includes("OpenAI API key is required")) {
        return res.status(400).json({
          success: false,
          message:
            "OpenAI API key is required for MCQ generation. Please contact your administrator to configure the OPENAI_API_KEY environment variable.",
        });
      }

      return res.status(500).json({
        success: false,
        message: `Failed to generate MCQs: ${error.message}`,
      });
    }

    // Save quiz to Firestore
    const quizRef = db.collection("quiz").doc();
    const quizData = {
      id: quizRef.id,
    // Save quiz to database
    const quiz = await mcqService.saveQuiz({
      name: quiz_name,
      course_id,
      created_by: userId,
      updated_by: userId,
      question_json: generatedQuestions,
      max_score,
      status: "draft",
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await quizRef.set(quizData);
    const quiz = quizData;
    });

    console.log("💾 Quiz saved to Firestore successfully!");
    console.log(`🆔 Quiz ID: ${quiz.id}`);

    // Update course's quiz_ids array
    await db.collection("course").doc(course_id).update({
      quiz_ids: FieldValue.arrayUnion(quiz.id),
    });
    console.log("🔗 Course quiz_ids updated successfully");

    res.json({
      success: true,
      message: "MCQ quiz generated successfully",
      data: {
        quiz_id: quiz.id,
        quiz_name: quiz.name,
        total_questions: generatedQuestions.length,
        total_marks: quiz.max_score,
        course_name: course.name,
      },
    });
  } catch (error) {
    console.error("MCQ generation error:", error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during MCQ generation",
    });
  }
};

/**
 * Get teacher's quizzes
 */
const getTeacherQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["teacher", "hod", "principal"].includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied",
      });
    }

    const { page = 1, limit = 10, course_id } = req.query;
    const offset = (page - 1) * limit;

    // Build Firestore query
    let quizQuery = db.collection("quiz").where("deleted_at", "==", null);
    if (userRole === "teacher") quizQuery = quizQuery.where("created_by", "==", userId);
    if (course_id) quizQuery = quizQuery.where("course_id", "==", course_id);

    const snap = await quizQuery.orderBy("created_at", "desc").get();
    let allQuizzes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Enrich with course name
    const courseIds = [...new Set(allQuizzes.map((q) => q.course_id).filter(Boolean))];
    const courseMap = {};
    for (const cid of courseIds) {
      const cd = await db.collection("course").doc(cid).get();
      if (cd.exists) courseMap[cid] = { id: cd.id, name: cd.data().name };
    }
    allQuizzes = allQuizzes.map((q) => ({ ...q, course: courseMap[q.course_id] || null }));

    const count = allQuizzes.length;
    const quizzes = allQuizzes.slice(offset, offset + parseInt(limit));
    const { data: result, totalQuizzes } = await mcqService.getTeacherQuizzes(userId, userRole, {
      page: parseInt(page),
      limit: parseInt(limit),
      course_id,
    });

    res.json({
      success: true,
      data: {
        quizzes: result,
        totalQuizzes
      },
    });
  } catch (error) {
    logger.error(`Get teacher quizzes error: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete quiz
 */
const deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["teacher", "hod", "principal"].includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get quiz details
    const quizDoc = await db.collection("quiz").doc(quiz_id).get();
    const quiz = quizDoc.exists ? { id: quizDoc.id, ...quizDoc.data() } : null;

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check permissions
    if (userRole === "teacher" && quiz.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own quizzes",
      });
    }

    // Delete quiz from Firestore
    await db.collection("quiz").doc(quiz_id).delete();

    // Remove quiz from course's quiz_ids array
    if (quiz.course_id) {
      await db.collection("course").doc(quiz.course_id).update({
        quiz_ids: FieldValue.arrayRemove(quiz_id),
      });
    }
    await mcqService.deleteQuiz(quiz_id, userId, userRole);

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    logger.error(`Delete quiz error: ${error.message}`);
    const status = error.message.includes("not found") ? HTTP_STATUS.NOT_FOUND : (error.message.includes("permission") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getCourseQuizzes = async (req, res) => {
  try {
    const { course_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is enrolled in the course (for students)
    if (userRole === "student") {
      const userDoc = await db.collection("user").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      if (!userData || !(userData.course_ids || []).includes(course_id)) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }
    }

    // Get quizzes for the course from Firestore
    let quizQuery = db.collection("quiz")
      .where("course_id", "==", course_id)
      .where("deleted_at", "==", null);
    if (userRole === "student") quizQuery = quizQuery.where("status", "==", "active");

    const quizSnap = await quizQuery.orderBy("created_at", "desc").get();
    let quizzes = quizSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Get course info
    const courseDoc = await db.collection("course").doc(course_id).get();
    const courseInfo = courseDoc.exists ? { id: courseDoc.id, name: courseDoc.data().name } : null;
    quizzes = quizzes.map((q) => ({ ...q, course: courseInfo }));

    // For students, filter out already-taken quizzes
    let availableQuizzes = quizzes;
    if (userRole === "student") {
      const scoresSnap = await db.collection("score")
        .where("user_id", "==", userId)
        .where("deleted_at", "==", null)
        .get();
      const takenQuizIds = scoresSnap.docs.map((d) => d.data().quiz_id);
      availableQuizzes = quizzes.filter((q) => !takenQuizIds.includes(q.id));
      console.log(`📊 Quiz filtering: total=${quizzes.length}, taken=${takenQuizIds.length}, available=${availableQuizzes.length}`);
    }
    // Get quizzes for the course using service
    const quizzes = await mcqService.getCourseQuizzes(course_id, userId, userRole);

    res.json({
      success: true,
      data: {
        quizzes: quizzes.map((quiz) => ({
          ...quiz,
          question_count: quiz.question_json ? quiz.question_json.length : 0,
        })),
      },
    });
  } catch (error) {
    console.error("Get course quizzes error:", error);
    const status = error.message.includes("not enrolled") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get quiz for taking (random 5 questions for students)
 */
const getQuizForTaking = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get quiz from Firestore
    const quizDoc = await db.collection("quiz").doc(quiz_id).get();
    const quiz = quizDoc.exists && !quizDoc.data().deleted_at
      ? { id: quizDoc.id, ...quizDoc.data() } : null;

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Attach course info
    if (quiz.course_id) {
      const cd = await db.collection("course").doc(quiz.course_id).get();
      quiz.course = cd.exists ? { id: cd.id, name: cd.data().name } : null;
    }

    // For students, check quiz is active + enrolled + not already taken
    if (userRole === "student") {
      if (quiz.status !== "active") {
        return res.status(403).json({ success: false, message: "This quiz is not available for taking" });
      }
      const userDoc = await db.collection("user").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      if (!userData || !(userData.course_ids || []).includes(quiz.course_id)) {
        return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
      }
      const scoresSnap = await db.collection("score")
        .where("user_id", "==", userId)
        .where("quiz_id", "==", quiz_id)
        .where("deleted_at", "==", null)
        .limit(1).get();
      if (!scoresSnap.empty) {
        return res.status(403).json({ success: false, message: "You have already taken this quiz" });
      }
    }

    const quiz = await mcqService.getQuizForTaking(quiz_id, userId, userRole);

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get questions from the quiz
    let questions = quiz.question_json || [];

    // For students, always select exactly 5 questions
    if (userRole === "student") {
      if (questions.length < 5) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "This quiz does not have enough questions. A minimum of 5 questions is required.",
        });
      }

      // Shuffle array and take exactly 5
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, 5);

      console.log("🎲 Random question selection for student:");
      console.log(`👨‍🎓 Student: ${userId}`);
      console.log(`📝 Quiz: ${quiz.name} (${quiz.id})`);
      console.log(`🔢 Selected exactly ${questions.length} questions from ${quiz.question_json?.length || 0} total`);
    }

    // Remove correct answers for students (they shouldn't see them)
    const questionsForStudent = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      topic: q.topic,
    }));

    res.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          name: quiz.name,
          course: quiz.course,
          max_score: quiz.max_score,
          total_questions: questions.length,
        },
        questions: userRole === "student" ? questionsForStudent : questions,
      },
    });
  } catch (error) {
    console.error("Get quiz for taking error:", error);
    res.status(error.message.includes("not enrolled") || error.message.includes("not available") || error.message.includes("already taken") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Submit quiz answers (for students)
 */
const submitQuizAnswers = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { answers } = req.body; // Array of { question_id, selected_answer }
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can submit quiz answers",
      });
    }

    // Get quiz from Firestore
    const quizDoc = await db.collection("quiz").doc(quiz_id).get();
    const quiz = quizDoc.exists && !quizDoc.data().deleted_at
      ? { id: quizDoc.id, ...quizDoc.data() } : null;
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Check enrollment
    const userDoc = await db.collection("user").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    if (!userData || !(userData.course_ids || []).includes(quiz.course_id)) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
    }

    // Check if already submitted
    const existingSnap = await db.collection("score")
      .where("user_id", "==", userId)
      .where("quiz_id", "==", quiz_id)
      .where("deleted_at", "==", null)
      .limit(1).get();
    if (!existingSnap.empty) {
      return res.status(403).json({ success: false, message: "You have already submitted this quiz" });
    // Get quiz details with correct answers
    const quiz = await mcqService.getQuizById(quiz_id);

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Calculate score
    const questions = quiz.question_json || [];
    let correctAnswers = 0;
    const results = [];

    answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.question_id);
      if (question) {
        const isCorrect = question.correct_answer === answer.selected_answer;
        if (isCorrect) correctAnswers++;

        results.push({
          question_id: answer.question_id,
          question: question.question,
          selected_answer: answer.selected_answer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          explanation: question.explanation,
        });
      }
    });

    const totalQuestions = answers.length;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    const finalScore = Math.round((scorePercentage / 100) * quiz.max_score);

    console.log("📊 Quiz submission results:");
    console.log(`👨‍🎓 Student: ${userId}`);
    console.log(`📝 Quiz: ${quiz.name} (${quiz.id})`);
    console.log(`✅ Correct answers: ${correctAnswers}/${totalQuestions}`);
    console.log(`📈 Score percentage: ${scorePercentage}%`);
    console.log(`🎯 Final score: ${finalScore}/${quiz.max_score}`);

    // Save quiz attempt to Firestore score collection
    try {
      const scoreRef = db.collection("score").doc();
      await scoreRef.set({
        id: scoreRef.id,
        user_id: userId,
        quiz_id,
        marks: finalScore,
        response: {
          answers: results,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score_percentage: Math.round(scorePercentage),
          submitted_at: new Date().toISOString(),
        },
        question_name: quiz.name,
        created_by: userId,
        updated_by: userId,
        deleted_at: null,
        created_at: new Date().toISOString(),
      });
      console.log("💾 Score saved to Firestore:", scoreRef.id);

      // Update student's leaderboard stats
      await db.collection("user").doc(userId).update({
        total_score: FieldValue.increment(finalScore),
        total_quizzes_taken: FieldValue.increment(1),
      });
    } catch (err) {
      console.error("❌ Error saving score:", err);
    // Save quiz attempt using service
    try {
      const scoreRecord = await mcqService.submitQuizAnswers(userId, quiz_id, {
        finalScore,
        results,
        totalQuestions,
        correctAnswers,
        scorePercentage: Math.round(scorePercentage),
        quizName: quiz.name
      });
      console.log("💾 Score saved to database successfully!");
      console.log(`🆔 Score record ID: ${scoreRecord.id}`);
    } catch (saveError) {
      console.error("❌ Failed to save score to database:", saveError);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: saveError.message || "Failed to save score",
      });
    }

    res.json({
      success: true,
      data: {
        quiz_name: quiz.name,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score_percentage: Math.round(scorePercentage),
        final_score: finalScore,
        max_score: quiz.max_score,
        results,
      },
    });
  } catch (error) {
    console.error("Submit quiz answers error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get student quiz scores and results
 */
const getStudentScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can view their scores",
      });
    }

    const { page = 1, limit = 10, course_id } = req.query;
    const result = await mcqService.getStudentScores(userId, { page, limit, course_id });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get student scores error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get detailed quiz results for a student (for past quizzes view)
 */
const getStudentQuizResult = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "student") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only students can view their quiz results",
      });
    }

    const scoreRecord = await mcqService.getStudentQuizResult(userId, quiz_id);

    if (!scoreRecord) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Quiz result not found",
      });
    }

    // Only include the questions the student actually received/answered
    const answeredQuestionIds = (scoreRecord.response?.answers || []).map((a) => a.question_id);
    const filteredQuestions = (scoreRecord.quiz?.question_json || []).filter((q) => answeredQuestionIds.includes(q.id));
    
    const filteredQuiz = {
      ...scoreRecord.quiz,
      question_json: filteredQuestions,
    };

    res.json({
      success: true,
      data: {
        quiz: filteredQuiz,
        score: scoreRecord.marks,
        max_score: scoreRecord.quiz.max_score,
        submitted_at: scoreRecord.created_at,
        response: scoreRecord.response,
        percentage: Math.round((scoreRecord.marks / scoreRecord.quiz.max_score) * 100),
      },
    });
  } catch (error) {
    console.error("Get student quiz result error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get quiz submissions for teachers (to see all student results for a quiz)
 */
const getQuizSubmissions = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["teacher", "hod", "principal"].includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied",
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const quiz = await mcqService.getQuizById(quiz_id);

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if teacher has access to this quiz
    if (userRole === "teacher" && quiz.created_by !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "You can only view submissions for your own quizzes",
      });
    }

    const result = await mcqService.getQuizSubmissions(quiz_id, { page, limit });
    const { submissions } = result;

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0 ? submissions.reduce((sum, sub) => sum + sub.marks, 0) / totalSubmissions : 0;
    const highestScore = totalSubmissions > 0 ? Math.max(...submissions.map((sub) => sub.marks)) : 0;
    const lowestScore = totalSubmissions > 0 ? Math.min(...submissions.map((sub) => sub.marks)) : 0;

    const responseData = {
      quiz: {
        id: quiz.id,
        name: quiz.name,
        max_score: quiz.max_score,
        course: quiz.course,
        total_questions: quiz.question_json ? quiz.question_json.length : 0,
      },
      submissions: submissions.map((sub) => ({
        id: sub.id,
        student: {
          id: sub.user.id,
          name: sub.user.username,
          email: sub.user.email,
        },
        marks: sub.marks,
        max_score: quiz.max_score,
        percentage: Math.round((sub.marks / quiz.max_score) * 100),
        submitted_at: sub.created_at,
        response: sub.response,
      })),
      statistics: {
        total_submissions: totalSubmissions,
        average_score: Math.round(averageScore * 100) / 100,
        highest_score: highestScore,
        lowest_score: lowestScore,
        pass_rate: totalSubmissions > 0 ? Math.round((submissions.filter((sub) => sub.marks / quiz.max_score >= 0.6).length / totalSubmissions) * 100) : 0,
      },
      pagination: result.pagination,
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get quiz submissions error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get comprehensive quiz analytics for teachers
 */
const getQuizAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.id;
    console.log(`📊 Fetching quiz analytics for teacher: ${teacherId}`);

    const result = await mcqService.getQuizAnalytics(teacherId);

    if (!result || result.quizzes.length === 0) {
      console.log("📊 No quizzes found for teacher");
      return res.json({
        success: true,
        data: {
          totalQuizzes: 0,
          totalSubmissions: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          recentQuizzes: [],
          quizPerformance: [],
          monthlyStats: [],
          topPerformingQuizzes: [],
        },
      });
    }

    const { quizzes, scores } = result;
    console.log(`📊 Found ${quizzes.length} quizzes and ${scores?.length || 0} submissions for teacher`);

    // Calculate analytics
    const totalQuizzes = quizzes.length;
    const totalSubmissions = scores?.length || 0;

    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let passCount = 0;

    if (scores && scores.length > 0) {
      const percentages = scores.map((score) => {
        const percentage = score.max_score > 0 ? (score.marks / score.max_score) * 100 : 0;
        return Math.round(percentage * 100) / 100;
      });

      averageScore = Math.round((percentages.reduce((sum, p) => sum + p, 0) / percentages.length) * 100) / 100;
      highestScore = Math.max(...percentages);
      lowestScore = Math.min(...percentages);
      passCount = percentages.filter((p) => p >= 60).length;
    }

    const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100 * 100) / 100 : 0;

    // Recent quizzes (last 5)
    const recentQuizzes = quizzes.slice(0, 5).map((quiz) => ({
      id: quiz.id,
      name: quiz.name,
      course: quiz.course,
      question_count: Array.isArray(quiz.question_json) ? quiz.question_json.length : 0,
      max_score: quiz.max_score,
      created_at: quiz.created_at,
      submissions_count: scores?.filter((s) => s.quiz_id === quiz.id).length || 0,
    }));

    // Quiz performance analysis
    const quizPerformance = quizzes.map((quiz) => {
      const quizScores = scores?.filter((s) => s.quiz_id === quiz.id) || [];
      const quizPercentages = quizScores.map((score) => (score.max_score > 0 ? (score.marks / score.max_score) * 100 : 0));

      const avgScore = quizPercentages.length > 0 ? Math.round((quizPercentages.reduce((sum, p) => sum + p, 0) / quizPercentages.length) * 100) / 100 : 0;

      return {
        quiz_id: quiz.id,
        quiz_name: quiz.name,
        course_name: quiz.course?.name || "Unknown Course",
        submissions: quizScores.length,
        average_score: avgScore,
        highest_score: quizPercentages.length > 0 ? Math.max(...quizPercentages) : 0,
        lowest_score: quizPercentages.length > 0 ? Math.min(...quizPercentages) : 0,
        pass_rate: quizScores.length > 0 ? Math.round((quizPercentages.filter((p) => p >= 60).length / quizScores.length) * 100 * 100) / 100 : 0,
        created_at: quiz.created_at,
      };
    });

    // Monthly analytics calculation logic (omitted for brevity, can be added if needed)
    const monthlyStats = []; // Placeholder

    const topPerformingQuizzes = quizPerformance
      .filter((quiz) => quiz.submissions > 0)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalQuizzes,
        totalSubmissions,
        averageScore,
        highestScore,
        lowestScore,
        passRate,
        recentQuizzes,
        quizPerformance,
        monthlyStats,
        topPerformingQuizzes,
      },
    });
  } catch (error) {
    console.error("❌ Error in getQuizAnalytics:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch quiz analytics",
    });
  }
};

/**
 * @desc    Update quiz questions and details
 * @route   PUT /api/mcq/quiz/:quiz_id
 * @access  Private (Teachers only)
 */
const updateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { name, max_score, question_json, status } = req.body;
    const teacherId = req.user.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (max_score !== undefined) updateData.max_score = max_score;
    if (question_json !== undefined) updateData.question_json = question_json;
    if (status !== undefined) updateData.status = status;

    const result = await mcqService.updateQuiz(quiz_id, teacherId, updateData);

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateQuiz:", error);
    const status = error.message.includes("not found") ? HTTP_STATUS.NOT_FOUND : (error.message.includes("permission") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * @desc    Activate a quiz (make it available to students)
 * @route   POST /api/mcq/quiz/:quiz_id/activate
 * @access  Private (Teachers only)
 */
const activateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const teacherId = req.user.id;

    const result = await mcqService.activateQuiz(quiz_id, teacherId);

    res.json({
      success: true,
      message: "Quiz activated successfully and is now available to students",
      data: result,
    });
  } catch (error) {
    console.error("Error in activateQuiz:", error);
    const status = error.message.includes("not found") ? HTTP_STATUS.NOT_FOUND : (error.message.includes("permission") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * @desc    Generate a detailed explanation for a concept using AI
 * @route   POST /api/mcq/explain
 * @access  Private (All authenticated users)
 */
const getDetailedExplanation = async (req, res) => {
  try {
    const { explanation, context } = req.body;

    if (!explanation) {
      return res
        .status(400)
        .json({ success: false, message: "Explanation text is required" });
    }

    // Initialize OpenAI
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "demo-key" ||
      process.env.OPENAI_API_KEY.trim() === ""
    ) {
      throw new Error(
        "OpenAI API key is required. Please contact your administrator."
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an expert educator. A student needs a deeper understanding of a concept from a quiz.
    
    The original brief explanation was: "${explanation}"
    The question context was: "${context || "Not provided"}"

    Your task is to expand this into a detailed, multi-paragraph explanation (2-3 paragraphs). Your explanation should:
    1. Clearly explain the core concept in simple, accessible terms.
    2. Use analogies or real-world examples to make it easier to grasp.
    3. Explain the significance of this concept within its broader topic.
    4. Maintain a supportive and encouraging tone.

    Generate only the detailed explanation text. Do not add any extra headers, formatting, or conversational filler.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-nano",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educator. Provide detailed explanations in a clear, supportive tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const explanationText = completion.choices[0].message.content;

    res.json({
      success: true,
      explanation: explanationText,
    });
  } catch (error) {
    console.error("Error generating detailed explanation:", error);
    if (error.message.includes("OpenAI API key is required")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to generate explanation" });
  }
};

/**
 * @desc    Generate MCQ from pasted lecture content using Google Gemini AI
 * @route   POST /api/mcq/generate-text
 * @access  Private (Teachers only)
 */
const generateMCQFromText = async (req, res) => {
  try {
    const {
      lecture_content,
      num_questions = 10,
      max_score = 100,
      topics = "",
      gemini_api_key,
      course_id,
    } = req.body;

    // Auto-generate quiz name from timestamp
    const quiz_name = req.body.quiz_name ||
      `AI Quiz - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    if (!lecture_content || lecture_content.trim().length < 20) {
      return res.status(400).json({ success: false, message: "Lecture content must be at least 20 characters" });
    }
    if (!gemini_api_key || !gemini_api_key.trim()) {
      return res.status(400).json({ success: false, message: "Gemini API key is required. Get yours at https://aistudio.google.com/" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    if (!["teacher", "hod", "principal"].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Only teachers can generate MCQs" });
    }

    console.log(`🤖 Starting Gemini MCQ generation | Questions: ${num_questions} | Content length: ${lecture_content.length}`);

    let result;
    try {
      result = await mcqService.generateMCQFromText({
        userId,
        userRole,
        quiz_name,
        course_id,
        lecture_content,
        num_questions: parseInt(num_questions),
        max_score: parseInt(max_score),
        topics,
        gemini_api_key
      });
      console.log(`✅ Gemini generated and saved quiz: ${result.quiz_id}`);
    } catch (error) {
      console.error("❌ Gemini generation failed:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: `Failed to generate MCQs: ${error.message}` });
    }

    res.json({
      success: true,
      message: "MCQ quiz generated successfully with Google Gemini AI",
      data: {
        quiz_id: result.quiz_id,
        quiz_name: result.quiz_name,
        total_questions: result.total_questions,
        total_marks: result.total_marks,
        course_name: "General",
        ai_model: "Google Gemini 2.0 Flash",
      },
    });
  } catch (error) {
    console.error("generateMCQFromText error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error during MCQ generation" });
  }
};

/**
 * @desc    Generate MCQ from uploaded file using Google Gemini AI
 * @route   POST /api/mcq/generate-file
 * @access  Private (Teachers only)
 */
const generateMCQFromFile = async (req, res) => {
  const uploadedFilePath = req.file?.path;
  try {
    const {
      num_questions = 10,
      max_score = 100,
      topics = "",
      gemini_api_key,
    } = req.body;

    const quiz_name =
      req.body.quiz_name ||
      `AI Quiz - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Please attach a PDF, DOCX, or TXT file." });
    }
    if (!gemini_api_key || !gemini_api_key.trim()) {
      if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ success: false, message: "Gemini API key is required. Get yours at https://aistudio.google.com/" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    if (!["teacher", "hod", "principal"].includes(userRole)) {
      if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
      return res.status(403).json({ success: false, message: "Only teachers can generate MCQs" });
    }

    // Extract text from uploaded file
    let extractedContent;
    try {
      extractedContent = await extractTextFromFile(req.file.path, req.file.mimetype);
    } catch (error) {
      if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ success: false, message: `Failed to read file: ${error.message}` });
    }

    if (!extractedContent || extractedContent.trim().length < 50) {
      if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ success: false, message: "File content is too short or empty. Please upload a file with sufficient text content." });
    }

    console.log(`🤖 Gemini file MCQ generation | File: ${req.file.originalname} | Questions: ${num_questions}`);

    let result;
    try {
      result = await mcqService.generateMCQFromFile({
        userId,
        userRole,
        quiz_name,
        course_id: req.body.course_id,
        filePath: req.file.path,
        fileMimetype: req.file.mimetype,
        num_questions: parseInt(num_questions),
        max_score: parseInt(max_score),
        topics,
        gemini_api_key
      });
      console.log(`✅ Gemini generated and saved quiz from file: ${result.quiz_id}`);
    } catch (error) {
      console.error("❌ Gemini file generation failed:", error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: `Failed to generate MCQs: ${error.message}` });
    }

    res.json({
      success: true,
      message: "MCQ quiz generated successfully from uploaded file using Google Gemini AI",
      data: {
        quiz_id: result.quiz_id,
        quiz_name: result.quiz_name,
        total_questions: result.total_questions,
        total_marks: result.total_marks,
        course_name: "General",
        ai_model: "Google Gemini 2.0 Flash",
        source_file: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("generateMCQFromFile error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error during MCQ generation" });
  }
};

module.exports = {
  generateMCQ,
  generateMCQFromText,
  generateMCQFromFile,
  getTeacherQuizzes,
  deleteQuiz,
  getCourseQuizzes,
  getQuizForTaking,
  submitQuizAnswers,
  getStudentScores,
  getStudentQuizResult,
  getQuizSubmissions,
  getQuizAnalytics,
  updateQuiz,
  activateQuiz,
  getDetailedExplanation,
};
