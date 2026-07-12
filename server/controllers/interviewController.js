import Interview from "../models/Interview.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
} from "../services/aiService.js";

// Start a new interview — generates questions
export const startInterview = async (req, res) => {
  try {
    const { role, type, techStack, difficulty, questionCount } = req.body;

    if (!role || !type || !difficulty) {
      return res
        .status(400)
        .json({ message: "Role, type and difficulty are required" });
    }

    // Generate questions with Gemini
    const questions = await generateInterviewQuestions({
      role,
      type,
      techStack,
      difficulty,
      count: questionCount || 5,
    });

    // Save interview session to DB
    const interview = await Interview.create({
      user: req.user.id,
      role,
      type,
      techStack: techStack || "",
      difficulty,
      questions: questions.map((q) => ({ question: q })),
      status: "pending",
    });

    res.status(201).json({
      message: "Interview started",
      interviewId: interview._id,
      questions: interview.questions.map((q) => ({
        id: q._id,
        question: q.question,
      })),
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate questions. Try again." });
  }
};

// Submit a single answer and get AI feedback
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, userAnswer } = req.body;

    if (!interviewId || !questionId) {
      return res
        .status(400)
        .json({ message: "Interview ID and Question ID required" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Find the question
    const question = interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Evaluate answer with Gemini
    const evaluation = await evaluateAnswer({
      question: question.question,
      userAnswer: userAnswer || "",
      role: interview.role,
      difficulty: interview.difficulty,
    });

    // Save answer and feedback
    question.userAnswer = userAnswer || "";
    question.aiFeedback = evaluation.feedback;
    question.aiRating = evaluation.rating;

    await interview.save();

    res.status(200).json({
      message: "Answer submitted",
      rating: evaluation.rating,
      feedback: evaluation.feedback,
      idealAnswer: evaluation.idealAnswer,
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ message: "Failed to evaluate answer. Try again." });
  }
};

// Finish interview — generates overall feedback
export const finishInterview = async (req, res) => {
  try {
    const { interviewId, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Calculate overall score
    const answeredQuestions = interview.questions.filter((q) => q.aiRating > 0);
    const totalRating = answeredQuestions.reduce(
      (sum, q) => sum + q.aiRating,
      0,
    );
    const overallScore =
      answeredQuestions.length > 0
        ? Math.round(totalRating / answeredQuestions.length)
        : 0;

    // Generate overall feedback
    const feedback = await generateOverallFeedback({
      role: interview.role,
      questions: interview.questions,
      overallScore,
    });

    // Save final results
    interview.overallScore = overallScore;
    interview.overallFeedback = feedback.overallFeedback;
    interview.strengths = feedback.strengths;
    interview.improvements = feedback.improvements;
    interview.status = "completed";
    interview.timeTaken = timeTaken || 0;

    await interview.save();

    res.status(200).json({
      message: "Interview completed",
      overallScore,
      overallFeedback: feedback.overallFeedback,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("Finish interview error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate feedback. Try again." });
  }
};

// Get all interviews for a user
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .select("-questions")
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single interview with all questions
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await interview.deleteOne();
    res.status(200).json({ message: "Interview deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Bookmark a question
export const toggleBookmark = async (req, res) => {
  try {
    const { interviewId, questionId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const question = interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.isBookmarked = !question.isBookmarked;
    await interview.save();

    res.status(200).json({
      message: question.isBookmarked
        ? "Question bookmarked"
        : "Bookmark removed",
      isBookmarked: question.isBookmarked,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookmarked questions across all interviews
export const getBookmarks = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id });

    const bookmarks = [];
    interviews.forEach((interview) => {
      interview.questions.forEach((q) => {
        if (q.isBookmarked) {
          bookmarks.push({
            questionId: q._id,
            interviewId: interview._id,
            role: interview.role,
            question: q.question,
            userAnswer: q.userAnswer,
            aiFeedback: q.aiFeedback,
            aiRating: q.aiRating,
          });
        }
      });
    });

    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
