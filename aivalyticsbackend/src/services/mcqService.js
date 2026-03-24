const { db, admin } = require("../config/firebaseAdmin");
const logger = require("../config/logger");
const { TABLES } = require("../config/constants");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

/**
 * MCQ Service
 * Handles quiz and MCQ database operations using Firestore
 */
class MCQService {
  /**
   * Get a quiz by ID
   */
  async getQuizById(quizId) {
    try {
      const quizDoc = await db.collection(TABLES.QUIZZES).doc(quizId).get();
      if (!quizDoc.exists || quizDoc.data().deleted_at) {
        return null;
      }
      return { id: quizDoc.id, ...quizDoc.data() };
    } catch (error) {
      logger.error(`Get quiz by ID error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save a new quiz
   */
  async saveQuiz(quizData) {
    try {
      const { course_id, created_by } = quizData;
      
      const docData = {
        ...quizData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        deleted_at: null,
      };

      const quizRef = await db.collection(TABLES.QUIZZES).add(docData);
      
      // Update course's quiz_ids array if course_id is provided
      if (course_id) {
        const courseRef = db.collection(TABLES.COURSES).doc(course_id);
        await courseRef.update({
          quiz_ids: admin.firestore.FieldValue.arrayUnion(quizRef.id),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return { id: quizRef.id, ...docData };
    } catch (error) {
      logger.error(`Save quiz error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get teacher's quizzes
   */
  async getTeacherQuizzes(userId, role, filters = {}) {
    try {
      const { page = 1, limit = 10, course_id } = filters;
      let query = db.collection(TABLES.QUIZZES).where("deleted_at", "==", null);

      if (role === "teacher") {
        query = query.where("created_by", "==", userId);
      }

      if (course_id) {
        query = query.where("course_id", "==", course_id);
      }

      const snapshot = await query.orderBy("created_at", "desc").get();
      const quizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        question_count: doc.data().question_json ? doc.data().question_json.length : 0
      }));

      const total = quizzes.length;
      return {
        quizzes: quizzes.slice((page - 1) * limit, page * limit),
        totalQuizzes: total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error(`Get teacher quizzes error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get quizzes for a specific course
   */
  async getCourseQuizzes(courseId, userId, role) {
    try {
      // Check if user is enrolled in the course (for students)
      if (role === "student") {
        const userDoc = await db.collection(TABLES.USERS).doc(userId).get();
        if (!userDoc.exists || !userDoc.data().course_ids || !userDoc.data().course_ids.includes(courseId)) {
          throw new Error("You are not enrolled in this course");
        }
      }

      // Query quizzes by course without composite fields to avoid index errors
      const query = db.collection(TABLES.QUIZZES)
        .where("course_id", "==", courseId)
        .where("deleted_at", "==", null);

      const snapshot = await query.get();
      let quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Soft sort by created_at in memory
      quizzes.sort((a, b) => {
        const tA = a.created_at ? (a.created_at.toMillis ? a.created_at.toMillis() : new Date(a.created_at).getTime()) : 0;
        const tB = b.created_at ? (b.created_at.toMillis ? b.created_at.toMillis() : new Date(b.created_at).getTime()) : 0;
        return tB - tA; // descending
      });

      if (role === "student") {
        // Only show active quizzes
        quizzes = quizzes.filter(q => q.status === "active");

        // Filter out quizzes they have already taken
        const scoresSnapshot = await db.collection(TABLES.SCORES)
          .where("user_id", "==", userId)
          .where("deleted_at", "==", null)
          .get();

        const takenQuizIds = scoresSnapshot.docs.map(doc => doc.data().quiz_id);
        quizzes = quizzes.filter(quiz => !takenQuizIds.includes(quiz.id));
      } else if (role === "teacher") {
        // For teacher, they only see quizzes they created OR maybe all for the course depending on requirements
        // We'll filter to their own quizzes usually
        quizzes = quizzes.filter(q => q.created_by === userId);
      }

      return quizzes;
    } catch (error) {
      logger.error(`Get course quizzes error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId, userId, role) {
    try {
      const quizRef = db.collection(TABLES.QUIZZES).doc(quizId);
      const quizDoc = await quizRef.get();

      if (!quizDoc.exists || quizDoc.data().deleted_at) {
        throw new Error("Quiz not found");
      }

      const quizData = quizDoc.data();

      // Permission check
      if (role === "teacher" && quizData.created_by !== userId) {
        throw new Error("You don't have permission to delete this quiz");
      }

      // Soft delete
      await quizRef.update({
        deleted_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Remove from course's quiz_ids
      const courseRef = db.collection(TABLES.COURSES).doc(quizData.course_id);
      await courseRef.update({
        quiz_ids: admin.firestore.FieldValue.arrayRemove(quizId)
      });

      return { success: true };
    } catch (error) {
      logger.error(`Delete quiz error: ${error.message}`);
      throw error;
    }
  }

  async getQuizForTaking(quizId, userId, role) {
    try {
      const quiz = await this.getQuizById(quizId);
      if (!quiz) throw new Error("Quiz not found");

      if (role === "student") {
        if (quiz.status !== "active") {
          throw new Error("This quiz is not available for taking");
        }

        // Check if student is enrolled in the course
        const userDoc = await db.collection(TABLES.USERS).doc(userId).get();
        if (!userDoc.exists) throw new Error("User not found");
        
        const userData = userDoc.data();
        const courseIds = userData.course_ids || [];
        
        if (quiz.course_id && !courseIds.includes(quiz.course_id)) {
          throw new Error("You are not enrolled in this course");
        }

        // Check if student has already taken this quiz
        const scoreSnapshot = await db.collection(TABLES.SCORES)
          .where("user_id", "==", userId)
          .where("quiz_id", "==", quizId)
          .where("deleted_at", "==", null)
          .limit(1)
          .get();

        if (!scoreSnapshot.empty) {
          throw new Error("You have already taken this quiz");
        }
      }

      return quiz;
    } catch (error) {
      logger.error(`Get quiz for taking error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuizAnswers(userId, quizId, submissionData) {
    try {
      const { finalScore, results, totalQuestions, correctAnswers, scorePercentage, quizName } = submissionData;

      // Check if student is enrolled in the course
      const quiz = await this.getQuizById(quizId);
      if (!quiz) throw new Error("Quiz not found");

      const userDoc = await db.collection(TABLES.USERS).doc(userId).get();
      if (!userDoc.exists) throw new Error("User not found");
      
      const userData = userDoc.data();
      const courseIds = userData.course_ids || [];
      
      if (quiz.course_id && !courseIds.includes(quiz.course_id)) {
        throw new Error("You are not enrolled in this course");
      }

      // Check if student has already taken this quiz
      const scoreSnapshot = await db.collection(TABLES.SCORES)
        .where("user_id", "==", userId)
        .where("quiz_id", "==", quizId)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!scoreSnapshot.empty) {
        throw new Error("You have already submitted this quiz");
      }

      const docData = {
        user_id: userId,
        quiz_id: quizId,
        marks: finalScore,
        response: {
          answers: results,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
          submitted_at: new Date().toISOString(),
        },
        question_name: quizName || quiz.name,
        created_by: userId,
        updated_by: userId,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        deleted_at: null,
      };

      const scoreRef = await db.collection(TABLES.SCORES).add(docData);
      return { id: scoreRef.id, ...docData };
    } catch (error) {
      logger.error(`Submit quiz answers error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student scores
   */
  async getStudentScores(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, course_id } = filters;
      let query = db.collection(TABLES.SCORES)
        .where("user_id", "==", userId)
        .where("deleted_at", "==", null);

      const snapshot = await query.orderBy("created_at", "desc").get();
      let scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Join with quiz and course data manually if needed
      const detailedScores = await Promise.all(scores.map(async (score) => {
        const quiz = await this.getQuizById(score.quiz_id);
        if (quiz && course_id && quiz.course_id !== course_id) {
          return null;
        }
        return {
          ...score,
          quiz: quiz ? {
            id: quiz.id,
            name: quiz.name,
            max_score: quiz.max_score,
            course_id: quiz.course_id
          } : null
        };
      }));

      const filteredScores = detailedScores.filter(s => s !== null);
      const total = filteredScores.length;

      return {
        scores: filteredScores.slice((page - 1) * limit, page * limit),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error(`Get student scores error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student quiz result
   */
  async getStudentQuizResult(userId, quizId) {
    try {
      const snapshot = await db.collection(TABLES.SCORES)
        .where("user_id", "==", userId)
        .where("quiz_id", "==", quizId)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      
      const scoreData = snapshot.docs[0].data();
      const quiz = await this.getQuizById(quizId);

      return {
        ...scoreData,
        id: snapshot.docs[0].id,
        quiz
      };
    } catch (error) {
      logger.error(`Get student quiz result error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get quiz submissions for teachers
   */
  async getQuizSubmissions(quizId, filters = {}) {
    try {
      const { page = 1, limit = 20 } = filters;
      const snapshot = await db.collection(TABLES.SCORES)
        .where("quiz_id", "==", quizId)
        .where("deleted_at", "==", null)
        .orderBy("created_at", "desc")
        .get();

      const rawSubmissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Join with user data
      const submissions = await Promise.all(rawSubmissions.map(async (sub) => {
        const userDoc = await db.collection(TABLES.USERS).doc(sub.user_id).get();
        const userData = userDoc.exists ? userDoc.data() : { username: "Unknown", email: "" };
        return {
          ...sub,
          user: {
            id: sub.user_id,
            username: userData.username,
            email: userData.email
          }
        };
      }));

      const total = submissions.length;

      return {
        submissions: submissions.slice((page - 1) * limit, page * limit),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error(`Get quiz submissions error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get quiz analytics for teacher
   */
  async getQuizAnalytics(teacherId) {
    try {
      // Get all quizzes created by this teacher
      const quizzesSnapshot = await db.collection(TABLES.QUIZZES)
        .where("created_by", "==", teacherId)
        .where("deleted_at", "==", null)
        .get();

      const quizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const quizIds = quizzes.map(q => q.id);
      
      if (quizIds.length === 0) return { quizzes: [], scores: [] };

      // Get all scores for these quizzes
      let allScores = [];
      const scoreBatches = [];
      for (let i = 0; i < quizIds.length; i += 30) {
        scoreBatches.push(quizIds.slice(i, i + 30));
      }

      await Promise.all(scoreBatches.map(async (batchIds) => {
        const scoresSnapshot = await db.collection(TABLES.SCORES)
          .where("quiz_id", "in", batchIds)
          .where("deleted_at", "==", null)
          .get();
        
        const batchScores = await Promise.all(scoresSnapshot.docs.map(async doc => {
          const scoreData = doc.data();
          const userDoc = await db.collection(TABLES.USERS).doc(scoreData.user_id).get();
          const userData = userDoc.exists ? userDoc.data() : {};
          return { 
            id: doc.id, 
            ...scoreData,
            user: {
              id: scoreData.user_id,
              username: userData.username,
              roll_number: userData.rollNumber || userData.roll_number
            }
          };
        }));
        allScores = allScores.concat(batchScores);
      }));

      // Join quizzes with course data
      const quizzesWithCourse = await Promise.all(quizzes.map(async quiz => {
        let course = null;
        if (quiz.course_id) {
          const courseDoc = await db.collection(TABLES.COURSES).doc(quiz.course_id).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data();
            course = {
              id: courseDoc.id,
              name: courseData.name,
              code: courseData.code
            };
          }
        }
        return { ...quiz, course };
      }));

      return {
        quizzes: quizzesWithCourse,
        scores: allScores
      };
    } catch (error) {
      logger.error(`Get quiz analytics error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId, teacherId, updateData) {
    try {
      const quizRef = db.collection(TABLES.QUIZZES).doc(quizId);
      const quizDoc = await quizRef.get();

      if (!quizDoc.exists || quizDoc.data().deleted_at) {
        throw new Error("Quiz not found");
      }

      if (quizDoc.data().created_by !== teacherId) {
        throw new Error("You don't have permission to edit this quiz");
      }

      const cleanUpdateData = {
        ...updateData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await quizRef.update(cleanUpdateData);
      
      const updatedDoc = await quizRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      logger.error(`Update quiz error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Activate quiz
   */
  async activateQuiz(quizId, teacherId) {
    try {
      const quizRef = db.collection(TABLES.QUIZZES).doc(quizId);
      const quizDoc = await quizRef.get();

      if (!quizDoc.exists || quizDoc.data().deleted_at) {
        throw new Error("Quiz not found");
      }

      if (quizDoc.data().created_by !== teacherId) {
        throw new Error("You don't have permission to activate this quiz");
      }

      if (!quizDoc.data().question_json || quizDoc.data().question_json.length === 0) {
        throw new Error("Cannot activate quiz without questions");
      }

      await quizRef.update({
        status: "active",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      const updatedDoc = await quizRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      logger.error(`Activate quiz error: ${error.message}`);
      throw error;
    }
  }

  // --- AI and File Processing Helpers ---

  async extractTextFromFile(filePath, fileType) {
    try {
      if (fileType === "text/plain") {
        return fs.readFileSync(filePath, "utf8");
      }
      if (fileType === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
      }
      if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      }
      throw new Error("Unsupported file type. Allowed: PDF, DOCX, TXT.");
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  async generateMCQFromContent(content, numQuestions = 20, maxScore = 100, topics = "") {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "demo-key") {
        throw new Error("OpenAI API key is required for MCQ generation.");
      }

      const topicsInstruction = topics ? `Focus specifically on these topics: ${topics}. ` : "";
      const prompt = `Based on the following content, generate exactly ${numQuestions} multiple-choice questions...\n\n${topicsInstruction}\n\nContent:\n${content.substring(0, 8000)}...`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are an expert educator. Respond with ONLY valid JSON array." }, { role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const text = completion.choices[0].message.content;
      // JSON Extraction logic (omitted for brevity here, should match mcqController's one)
      // For this migration, I'll simplify the parsing slightly to fit the service pattern
      let jsonText = text.trim();
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) jsonText = codeBlockMatch[1].trim();

      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!arrayMatch) throw new Error("Could not extract valid JSON from AI response.");

      const questions = JSON.parse(arrayMatch[0]);
      return questions.map((q, idx) => ({ ...q, id: idx }));
    } catch (error) {
      logger.error(`MCQ generation from content error: ${error.message}`);
      throw error;
    }
  }

  async generateMCQWithGemini(content, numQuestions, maxScore, topics) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
      });
      const topicsInstruction = topics ? `Focus specifically on these topics: ${topics}. ` : "";
      
      const prompt = `You are an expert educator. Generate exactly ${numQuestions} multiple-choice questions from this content: ${content.substring(0, 10000)}... 
      ${topicsInstruction}
      
      You MUST respond ONLY with a valid JSON array. Each object in the array must have exactly this structure:
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0, // integer index of the correct option (0-3)
        "explanation": "Brief explanation of why the answer is correct",
        "difficulty": "Easy,Medium,Hard",
        "topic": "The specific topic"
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      let jsonText = text;
      // Handle edge cases where the model still prepends/appends markdown block backticks
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (fenceMatch) jsonText = fenceMatch[1];
      
      // If the entire text wasn't extracted by fenceMatch, try matching an array
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
         jsonText = arrayMatch[0];
      }

      let questions;
      try {
        questions = JSON.parse(jsonText);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError.message}. Response was: ${text.substring(0, 150)}...`);
      }
      
      if (!Array.isArray(questions)) {
        throw new Error("Response is not a valid JSON array. Received: " + typeof questions);
      }

      return questions.map((q, idx) => ({ ...q, id: idx }));
    } catch (error) {
      logger.error(`MCQ generation with Gemini error: ${error.message}`);
      throw error;
    }
  }

  async generateMCQFromText(params) {
    const { userId, userRole, quiz_name, course_id, lecture_content, num_questions, max_score, topics } = params;
    
    const generatedQuestions = await this.generateMCQWithGemini(lecture_content, num_questions, max_score, topics);
    
    if (generatedQuestions.length < 3) {
      throw new Error(`Only ${generatedQuestions.length} questions generated. Provide more detailed content.`);
    }

    const quiz = await this.saveQuiz({
      name: quiz_name,
      course_id: course_id || null,
      created_by: userId,
      updated_by: userId,
      question_json: generatedQuestions,
      max_score,
      status: "draft",
    });

    return {
      quiz_id: quiz.id,
      quiz_name: quiz.name,
      total_questions: generatedQuestions.length,
      total_marks: quiz.max_score
    };
  }

  async generateMCQFromFile(params) {
    const { userId, userRole, quiz_name, course_id, filePath, fileMimetype, num_questions, max_score, topics } = params;
    
    try {
      const extractedContent = await this.extractTextFromFile(filePath, fileMimetype);
      
      const generatedQuestions = await this.generateMCQWithGemini(extractedContent, num_questions, max_score, topics);
      
      if (generatedQuestions.length < 3) {
        throw new Error(`Only ${generatedQuestions.length} questions generated. Provide more detailed content.`);
      }

      const quiz = await this.saveQuiz({
        name: quiz_name,
        course_id: course_id || null,
        created_by: userId,
        updated_by: userId,
        question_json: generatedQuestions,
        max_score,
        status: "draft",
      });

      // Clean up file
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

      return {
        quiz_id: quiz.id,
        quiz_name: quiz.name,
        total_questions: generatedQuestions.length,
        total_marks: quiz.max_score
      };
    } catch (error) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      throw error;
    }
  }

  /**
   * Get teacher's quizzes
   */
  async getTeacherQuizzes(userId, userRole, options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      
      let query = db.collection(TABLES.QUIZZES).where("deleted_at", "==", null);

      if (userRole === "teacher") {
        query = query.where("created_by", "==", userId);
      }

      const snapshot = await query.orderBy("created_at", "desc").get();
      let quizzes = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        
        let course = null;
        if (data.course_id) {
          const courseDoc = await db.collection(TABLES.COURSES).doc(data.course_id).get();
          if (courseDoc.exists) {
            course = {
              id: courseDoc.id,
              name: courseDoc.data().name
            };
          }
        }

        return {
          id: doc.id,
          ...data,
          course
        };
      }));

      if (search) {
        const lowerSearch = search.toLowerCase();
        quizzes = quizzes.filter(q => 
          q.name.toLowerCase().includes(lowerSearch)
        );
      }

      const total = quizzes.length;
      return {
        success: true,
        quizzes: quizzes.slice((page - 1) * limit, page * limit),
        totalQuizzes: total,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      logger.error(`Get teacher quizzes error: ${error.message}`);
      throw error;
    }
  }


}

const mcqService = new MCQService();
module.exports = mcqService;
