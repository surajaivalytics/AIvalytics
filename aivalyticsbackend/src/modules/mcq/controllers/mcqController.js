const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const pdf = require("pdf-parse");
const { supabase } = require("../config/database");

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
1. Create exactly ${numQuestions} questions
2. Each question must have exactly 4 options
3. Make questions conceptual and analytical - avoid simple recall questions
4. Focus on HARD to EXTREMELY HARD difficulty levels - create questions that make students think critically
5. DO NOT reference specific sections, chapters, or numbered exercises (like "section 1.9" or "exercise 1.15.3")
6. Focus on WHY and HOW concepts work, not just WHAT they are
7. Create scenario-based questions that test application of knowledge
${
  topics
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
- Escape any quotes within explanation text using backslash
- Keep explanation text concise (max 200 characters)
- NO line breaks within strings
- NO special characters that could break JSON parsing

EXACT FORMAT TO FOLLOW:
[{"question":"When implementing a recursive algorithm, what is the most critical factor that determines whether the algorithm will terminate successfully or result in a stack overflow?","options":["The programming language used","The presence of a proper base case and convergence toward it","The size of the input data","The number of recursive calls made"],"correct_answer":1,"explanation":"A recursive algorithm must have a base case that stops the recursion and each recursive call must progress toward that base case. Without this, the algorithm will recurse infinitely and cause a stack overflow.","difficulty":"hard","topic":"Programming Concepts"}]

IMPORTANT: 
1. Ensure your response is valid JSON that can be parsed without errors
2. Test your JSON format before responding
3. Keep all text content simple and avoid complex punctuation
4. Use only basic ASCII characters in strings
5. Make sure all quotes are properly escaped`;

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
      // Fix common JSON syntax errors
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/}\s*,\s*}/g, "}}")
      .replace(/]\s*,\s*]/g, "]]")
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
          .replace(/,(\s*[}\]])/g, "$1")
          // Fix common JSON syntax errors
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/}\s*,\s*}/g, "}}")
          .replace(/]\s*,\s*]/g, "]]");

        questions = JSON.parse(fixedJson);
        console.log("✅ JSON fixed and parsed successfully");
      } catch (secondError) {
        console.error("❌ Second parsing attempt failed:", secondError.message);

        // Last resort: try to extract individual questions
        try {
          console.log("🔧 Attempting to extract individual questions...");

          // Find all question objects using regex - improved pattern
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
                  .replace(/,(\s*[}\]])/g, "$1")
                  // Fix common issues in individual questions
                  .replace(/:\s*([^"][^,}\]]*[^"\s,}\]])/g, ': "$1"')
                  .replace(/"\s*(true|false|null|\d+)\s*"/g, "$1")
                  // Fix explanation text that might contain quotes
                  .replace(
                    /"explanation"\s*:\s*"([^"]*(?:\\"[^"]*)*)"([^}]*)/g,
                    '"explanation":"$1"$2'
                  )
                  // Fix any remaining unquoted strings
                  .replace(/:\s*([^"][^,}\]]*[^"\s,}\]])/g, ': "$1"')
                  // Fix common JSON syntax errors
                  .replace(/,\s*}/g, "}")
                  .replace(/,\s*]/g, "]");

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
            // Try alternative regex pattern for more complex JSON
            console.log("🔧 Trying alternative JSON extraction...");

            // Extract JSON array more aggressively
            const arrayMatch = cleanedJson.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              const arrayStr = arrayMatch[0];

              // Split by question objects more carefully
              const questionMatches = arrayStr.match(
                /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g
              );

              if (questionMatches && questionMatches.length > 0) {
                const parsedQuestions = [];

                for (let i = 0; i < questionMatches.length; i++) {
                  try {
                    let questionStr = questionMatches[i]
                      .replace(/'/g, '"')
                      .replace(
                        /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
                        '$1"$2":'
                      )
                      .replace(/,(\s*[}\]])/g, "$1")
                      .replace(/:\s*([^"][^,}\]]*[^"\s,}\]])/g, ': "$1"')
                      .replace(/"\s*(true|false|null|\d+)\s*"/g, "$1")
                      // Fix common JSON syntax errors
                      .replace(/,\s*}/g, "}")
                      .replace(/,\s*]/g, "]");

                    const questionObj = JSON.parse(questionStr);

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
                      `⚠️ Failed to parse question ${i + 1} (alt method): ${
                        objError.message
                      }`
                    );
                  }
                }

                if (parsedQuestions.length > 0) {
                  questions = parsedQuestions;
                  console.log(
                    `✅ Successfully parsed ${parsedQuestions.length} questions using alternative method`
                  );
                } else {
                  throw new Error(
                    "No valid questions could be parsed with alternative method"
                  );
                }
              } else {
                throw new Error("No question objects found in response");
              }
            } else {
              throw new Error("No JSON array found in response");
            }
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

// Fallback question generation function
const generateFallbackQuestions = (content, numQuestions, topics) => {
  console.log("🔄 Generating fallback questions from content...");

  const questions = [];
  const contentWords = content.split(/\s+/).slice(0, 1000); // Use first 1000 words

  for (let i = 0; i < numQuestions; i++) {
    const question = {
      question: `Question ${
        i + 1
      }: Based on the provided content, which of the following statements is most accurate?`,
      options: [
        "The content focuses primarily on basic concepts",
        "The content emphasizes advanced theoretical applications",
        "The content covers both fundamental and advanced topics",
        "The content is primarily focused on practical implementation",
      ],
      correct_answer: 2,
      explanation:
        "This is a fallback question generated when AI parsing failed. Please review the content manually.",
      difficulty: "medium",
      topic: topics || "General",
    };
    questions.push(question);
  }

  return questions;
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
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // For PPTX and DOCX files, you would need additional libraries like mammoth or officegen
      // For now, returning a message to use PDF or TXT
      throw new Error(
        "PPTX and DOCX files are not fully supported yet. Please convert to PDF or TXT format."
      );
    }

    throw new Error("Unsupported file type");
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
    const { data: course, error: courseError } = await supabase
      .from("course")
      .select("*, quiz_ids")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
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

    // Save quiz to database
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .insert({
        name: quiz_name,
        course_id,
        created_by: userId,
        updated_by: userId,
        question_json: generatedQuestions,
        max_score,
        status: "draft", // Set initial status as draft
      })
      .select()
      .single();

    if (quizError) {
      throw new Error(`Failed to save quiz: ${quizError.message}`);
    }

    console.log("💾 Quiz saved to database successfully!");
    console.log(`🆔 Quiz ID: ${quiz.id}`);
    console.log(`📚 Course ID: ${course_id}`);
    console.log(`👨‍🏫 Created by: ${userId}`);
    console.log(
      `📊 Total questions stored: ${quiz.question_json?.length || 0}`
    );

    // Update course's quiz_ids array (now that we know it exists in the schema)
    const { error: courseUpdateError } = await supabase
      .from("course")
      .update({
        quiz_ids: [...(course.quiz_ids || []), quiz.id],
      })
      .eq("id", course_id);

    if (courseUpdateError) {
      console.error("Failed to update course quiz_ids:", courseUpdateError);
      // Don't fail the request, just log the error
    } else {
      console.log("🔗 Course quiz_ids updated successfully");
    }

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
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { page = 1, limit = 10, course_id } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("quiz")
      .select(
        `
        *,
        course:course_id (
          id,
          name
        )
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by teacher for teacher role
    if (userRole === "teacher") {
      query = query.eq("created_by", userId);
    }

    // Filter by course if specified
    if (course_id) {
      query = query.eq("course_id", course_id);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch quizzes: ${error.message}`,
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("quiz")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (userRole === "teacher") {
      countQuery = countQuery.eq("created_by", userId);
    }

    if (course_id) {
      countQuery = countQuery.eq("course_id", course_id);
    }

    const { count } = await countQuery;

    res.json({
      success: true,
      data: {
        quizzes: quizzes.map((quiz) => ({
          ...quiz,
          question_count: quiz.question_json ? quiz.question_json.length : 0,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get teacher quizzes error:", error);
    res.status(500).json({
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
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("*, course:course_id(quiz_ids)")
      .eq("id", quiz_id)
      .single();

    if (quizError || !quiz) {
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

    // Delete quiz
    const { error: deleteError } = await supabase
      .from("quiz")
      .delete()
      .eq("id", quiz_id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: `Failed to delete quiz: ${deleteError.message}`,
      });
    }

    // Update course's quiz_ids array (now that we know it exists in the schema)
    if (quiz.course && quiz.course.quiz_ids) {
      const updatedQuizIds = quiz.course.quiz_ids.filter(
        (id) => id !== quiz_id
      );
      await supabase
        .from("course")
        .update({ quiz_ids: updatedQuizIds })
        .eq("id", quiz.course_id);
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get quizzes for a specific course (for students)
 */
const getCourseQuizzes = async (req, res) => {
  try {
    const { course_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is enrolled in the course (for students)
    if (userRole === "student") {
      const { data: user, error: userError } = await supabase
        .from("user")
        .select("course_ids")
        .eq("id", userId)
        .single();

      if (
        userError ||
        !user ||
        !user.course_ids ||
        !user.course_ids.includes(course_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }
    }

    // Get quizzes for the course
    let query = supabase
      .from("quiz")
      .select(
        `
        id,
        name,
        max_score,
        created_at,
        question_json,
        status,
        course:course_id (
          id,
          name
        )
      `
      )
      .eq("course_id", course_id)
      .is("deleted_at", null);

    // For students, only show active quizzes
    if (userRole === "student") {
      query = query.eq("status", "active");
    }

    const { data: quizzes, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch quizzes: ${error.message}`,
      });
    }

    // For students, filter out quizzes they have already taken
    let availableQuizzes = quizzes;
    if (userRole === "student") {
      // Get list of quizzes the student has already taken
      const { data: takenQuizzes, error: scoresError } = await supabase
        .from("score")
        .select("quiz_id")
        .eq("user_id", userId)
        .is("deleted_at", null);

      if (scoresError) {
        console.error("Error fetching student scores:", scoresError);
        // Don't fail the request, just log the error
      } else {
        const takenQuizIds = takenQuizzes.map((score) => score.quiz_id);
        availableQuizzes = quizzes.filter(
          (quiz) => !takenQuizIds.includes(quiz.id)
        );

        console.log(`📊 Quiz filtering for student ${userId}:`);
        console.log(`📝 Total quizzes in course: ${quizzes.length}`);
        console.log(`✅ Already taken: ${takenQuizIds.length}`);
        console.log(`🎯 Available to take: ${availableQuizzes.length}`);
      }
    }

    res.json({
      success: true,
      data: {
        quizzes: availableQuizzes.map((quiz) => ({
          ...quiz,
          question_count: quiz.question_json ? quiz.question_json.length : 0,
        })),
      },
    });
  } catch (error) {
    console.error("Get course quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select(
        `
        *,
        course:course_id (
          id,
          name
        )
      `
      )
      .eq("id", quiz_id)
      .is("deleted_at", null)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // For students, check if quiz is active
    if (userRole === "student" && quiz.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This quiz is not available for taking",
      });
    }

    // Check if student is enrolled in the course
    if (userRole === "student") {
      const { data: user, error: userError } = await supabase
        .from("user")
        .select("course_ids")
        .eq("id", userId)
        .single();

      if (
        userError ||
        !user ||
        !user.course_ids ||
        !user.course_ids.includes(quiz.course_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }

      // Check if student has already taken this quiz
      const { data: existingScore, error: scoreError } = await supabase
        .from("score")
        .select("id")
        .eq("user_id", userId)
        .eq("quiz_id", quiz_id)
        .is("deleted_at", null)
        .single();

      if (scoreError && scoreError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Error checking existing score:", scoreError);
        return res.status(500).json({
          success: false,
          message: "Error checking quiz status",
        });
      }

      if (existingScore) {
        console.log(`🚫 Student ${userId} attempted to retake quiz ${quiz_id}`);
        return res.status(403).json({
          success: false,
          message: "You have already taken this quiz",
        });
      }
    }

    // Get questions from the quiz
    let questions = quiz.question_json || [];

    // For students, always select exactly 5 questions
    if (userRole === "student") {
      if (questions.length < 5) {
        return res.status(400).json({
          success: false,
          message:
            "This quiz does not have enough questions. A minimum of 5 questions is required.",
        });
      }

      if (questions.length >= 5) {
        // Shuffle array and take exactly 5
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        questions = shuffled.slice(0, 5);

        console.log("🎲 Random question selection for student:");
        console.log(`👨‍🎓 Student: ${userId}`);
        console.log(`📝 Quiz: ${quiz.name} (${quiz.id})`);
        console.log(
          `🔢 Selected exactly ${questions.length} questions from ${
            quiz.question_json?.length || 0
          } total`
        );
        console.log(
          `📋 Question IDs: ${questions.map((q) => q.id).join(", ")}`
        );
      }
    }

    // Remove correct answers for students (they shouldn't see them)
    const questionsForStudent = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      topic: q.topic,
      // Don't include correct_answer and explanation for students
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
      return res.status(403).json({
        success: false,
        message: "Only students can submit quiz answers",
      });
    }

    // Get quiz details with correct answers
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("*")
      .eq("id", quiz_id)
      .is("deleted_at", null)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if student is enrolled in the course
    const { data: user, error: userError } = await supabase
      .from("user")
      .select("course_ids")
      .eq("id", userId)
      .single();

    if (
      userError ||
      !user ||
      !user.course_ids ||
      !user.course_ids.includes(quiz.course_id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Check if student has already submitted this quiz
    const { data: existingScore, error: scoreError } = await supabase
      .from("score")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_id", quiz_id)
      .is("deleted_at", null)
      .single();

    if (scoreError && scoreError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error checking existing score:", scoreError);
      return res.status(500).json({
        success: false,
        message: "Error checking quiz status",
      });
    }

    if (existingScore) {
      console.log(`🚫 Student ${userId} attempted to resubmit quiz ${quiz_id}`);
      return res.status(403).json({
        success: false,
        message: "You have already submitted this quiz",
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

    // Save quiz attempt to score table
    try {
      const { data: scoreRecord, error: scoreError } = await supabase
        .from("score")
        .insert({
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
        })
        .select()
        .single();

      if (scoreError) {
        console.error("❌ Failed to save score to database:", scoreError);
        // Don't fail the request, just log the error
      } else {
        console.log("💾 Score saved to database successfully!");
        console.log(`🆔 Score record ID: ${scoreRecord.id}`);
        console.log(`📊 Triggers will automatically update leaderboard stats`);
      }
    } catch (error) {
      console.error("❌ Error saving score:", error);
      // Don't fail the request, just log the error
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
    res.status(500).json({
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
      return res.status(403).json({
        success: false,
        message: "Only students can view their scores",
      });
    }

    const { page = 1, limit = 10, course_id } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("score")
      .select(
        `
        *,
        quiz:quiz_id (
          id,
          name,
          max_score,
          course:course_id (
            id,
            name
          )
        )
      `
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by course if specified
    if (course_id) {
      query = query.eq("quiz.course_id", course_id);
    }

    const { data: scores, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch scores: ${error.message}`,
      });
    }

    // Get total count for pagination
    const countQuery = supabase
      .from("score")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);

    const { count } = await countQuery;

    res.json({
      success: true,
      data: {
        scores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get student scores error:", error);
    res.status(500).json({
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
      return res.status(403).json({
        success: false,
        message: "Only students can view their quiz results",
      });
    }

    // Get the student's score record for this quiz
    const { data: scoreRecord, error: scoreError } = await supabase
      .from("score")
      .select(
        `
        *,
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
      .eq("user_id", userId)
      .eq("quiz_id", quiz_id)
      .is("deleted_at", null)
      .single();

    if (scoreError || !scoreRecord) {
      return res.status(404).json({
        success: false,
        message: "Quiz result not found",
      });
    }

    // Only include the questions the student actually received/answered
    const answeredQuestionIds = (scoreRecord.response?.answers || []).map(
      (a) => a.question_id
    );
    const filteredQuestions = (scoreRecord.quiz?.question_json || []).filter(
      (q) => answeredQuestionIds.includes(q.id)
    );
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
        percentage: Math.round(
          (scoreRecord.marks / scoreRecord.quiz.max_score) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Get student quiz result error:", error);
    res.status(500).json({
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
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get quiz details first
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select(
        `
        *,
        course:course_id (
          id,
          name,
          created_by
        )
      `
      )
      .eq("id", quiz_id)
      .is("deleted_at", null)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if teacher has access to this quiz
    if (userRole === "teacher" && quiz.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view submissions for your own quizzes",
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get all submissions for this quiz
    const { data: submissions, error: submissionsError } = await supabase
      .from("score")
      .select(
        `
        *,
        user:user_id (
          id,
          username,
          email
        )
      `
      )
      .eq("quiz_id", quiz_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch submissions: ${submissionsError.message}`,
      });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("score")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quiz_id)
      .is("deleted_at", null);

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const averageScore =
      totalSubmissions > 0
        ? submissions.reduce((sum, sub) => sum + sub.marks, 0) /
          totalSubmissions
        : 0;
    const highestScore =
      totalSubmissions > 0
        ? Math.max(...submissions.map((sub) => sub.marks))
        : 0;
    const lowestScore =
      totalSubmissions > 0
        ? Math.min(...submissions.map((sub) => sub.marks))
        : 0;

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
        pass_rate:
          totalSubmissions > 0
            ? Math.round(
                (submissions.filter((sub) => sub.marks / quiz.max_score >= 0.6)
                  .length /
                  totalSubmissions) *
                  100
              )
            : 0,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get quiz submissions error:", error);
    res.status(500).json({
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

    // Get all quizzes created by this teacher
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quiz")
      .select(
        `
        id,
        name,
        course_id,
        max_score,
        created_at,
        updated_at,
        question_json,
        course:course_id (
          id,
          name,
          code
        )
      `
      )
      .eq("created_by", teacherId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (quizzesError) {
      console.error("❌ Error fetching teacher quizzes:", quizzesError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch quiz data",
        error: quizzesError.message,
      });
    }

    if (!quizzes || quizzes.length === 0) {
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

    console.log(`📊 Found ${quizzes.length} quizzes for teacher`);

    // Get all scores for these quizzes
    const quizIds = quizzes.map((quiz) => quiz.id);
    const { data: scores, error: scoresError } = await supabase
      .from("score")
      .select(
        `
        id,
        quiz_id,
        user_id,
        marks,
        max_score,
        created_at,
        response,
        user:user_id (
          id,
          username,
          roll_number
        )
      `
      )
      .in("quiz_id", quizIds)
      .order("created_at", { ascending: false });

    if (scoresError) {
      console.error("❌ Error fetching quiz scores:", scoresError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch quiz scores",
        error: scoresError.message,
      });
    }

    console.log(`📊 Found ${scores?.length || 0} quiz submissions`);

    // Calculate analytics
    const totalQuizzes = quizzes.length;
    const totalSubmissions = scores?.length || 0;

    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let passCount = 0;

    if (scores && scores.length > 0) {
      const percentages = scores.map((score) => {
        const percentage =
          score.max_score > 0 ? (score.marks / score.max_score) * 100 : 0;
        return Math.round(percentage * 100) / 100; // Round to 2 decimal places
      });

      averageScore =
        Math.round(
          (percentages.reduce((sum, p) => sum + p, 0) / percentages.length) *
            100
        ) / 100;
      highestScore = Math.max(...percentages);
      lowestScore = Math.min(...percentages);
      passCount = percentages.filter((p) => p >= 60).length; // Assuming 60% is passing
    }

    const passRate =
      totalSubmissions > 0
        ? Math.round((passCount / totalSubmissions) * 100 * 100) / 100
        : 0;

    // Recent quizzes (last 5)
    const recentQuizzes = quizzes.slice(0, 5).map((quiz) => ({
      id: quiz.id,
      name: quiz.name,
      course: quiz.course,
      question_count: Array.isArray(quiz.question_json)
        ? quiz.question_json.length
        : 20,
      max_score: quiz.max_score,
      created_at: quiz.created_at,
      submissions_count:
        scores?.filter((s) => s.quiz_id === quiz.id).length || 0,
    }));

    // Quiz performance analysis
    const quizPerformance = quizzes.map((quiz) => {
      const quizScores = scores?.filter((s) => s.quiz_id === quiz.id) || [];
      const quizPercentages = quizScores.map((score) =>
        score.max_score > 0 ? (score.marks / score.max_score) * 100 : 0
      );

      const avgScore =
        quizPercentages.length > 0
          ? Math.round(
              (quizPercentages.reduce((sum, p) => sum + p, 0) /
                quizPercentages.length) *
                100
            ) / 100
          : 0;

      return {
        quiz_id: quiz.id,
        quiz_name: quiz.name,
        course_name: quiz.course?.name || "Unknown Course",
        submissions: quizScores.length,
        average_score: avgScore,
        highest_score:
          quizPercentages.length > 0 ? Math.max(...quizPercentages) : 0,
        lowest_score:
          quizPercentages.length > 0 ? Math.min(...quizPercentages) : 0,
        pass_rate:
          quizScores.length > 0
            ? Math.round(
                (quizPercentages.filter((p) => p >= 60).length /
                  quizScores.length) *
                  100 *
                  100
              ) / 100
            : 0,
        created_at: quiz.created_at,
      };
    });

    // Monthly statistics (last 6 months)
    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthQuizzes = quizzes.filter((quiz) => {
        const quizDate = new Date(quiz.created_at);
        return quizDate >= monthStart && quizDate <= monthEnd;
      });

      const monthScores =
        scores?.filter((score) => {
          const scoreDate = new Date(score.created_at);
          return scoreDate >= monthStart && scoreDate <= monthEnd;
        }) || [];

      const monthPercentages = monthScores.map((score) =>
        score.max_score > 0 ? (score.marks / score.max_score) * 100 : 0
      );

      monthlyStats.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        quizzes_created: monthQuizzes.length,
        submissions: monthScores.length,
        average_score:
          monthPercentages.length > 0
            ? Math.round(
                (monthPercentages.reduce((sum, p) => sum + p, 0) /
                  monthPercentages.length) *
                  100
              ) / 100
            : 0,
      });
    }

    // Top performing quizzes (by average score)
    const topPerformingQuizzes = quizPerformance
      .filter((quiz) => quiz.submissions > 0)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5);

    const analytics = {
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
    };

    console.log("📊 Analytics calculated:", {
      totalQuizzes,
      totalSubmissions,
      averageScore,
      passRate,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("❌ Error in getQuizAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz analytics",
      error: error.message,
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

    // Validate quiz exists and belongs to teacher
    const { data: existingQuiz, error: fetchError } = await supabase
      .from("quiz")
      .select("*")
      .eq("id", quiz_id)
      .eq("created_by", teacherId)
      .single();

    if (fetchError || !existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or you don't have permission to edit it",
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (max_score !== undefined) updateData.max_score = max_score;
    if (question_json !== undefined) updateData.question_json = question_json;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    // Update the quiz
    const { data: updatedQuiz, error: updateError } = await supabase
      .from("quiz")
      .update(updateData)
      .eq("id", quiz_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating quiz:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update quiz",
      });
    }

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Error in updateQuiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

    // Validate quiz exists and belongs to teacher
    const { data: existingQuiz, error: fetchError } = await supabase
      .from("quiz")
      .select("*")
      .eq("id", quiz_id)
      .eq("created_by", teacherId)
      .single();

    if (fetchError || !existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or you don't have permission to activate it",
      });
    }

    // Check if quiz has questions
    if (
      !existingQuiz.question_json ||
      existingQuiz.question_json.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot activate quiz without questions",
      });
    }

    // Activate the quiz
    const { data: activatedQuiz, error: updateError } = await supabase
      .from("quiz")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quiz_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error activating quiz:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to activate quiz",
      });
    }

    res.json({
      success: true,
      message: "Quiz activated successfully and is now available to students",
      data: activatedQuiz,
    });
  } catch (error) {
    console.error("Error in activateQuiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

module.exports = {
  generateMCQ,
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
