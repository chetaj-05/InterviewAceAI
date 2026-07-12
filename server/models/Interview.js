import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String, default: "" },
  aiFeedback: { type: String, default: "" },
  aiRating: { type: Number, default: 0 },
  isBookmarked: { type: Boolean, default: false },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["technical", "hr", "mixed"],
      default: "technical",
    },
    techStack: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    overallFeedback: {
      type: String,
      default: "",
    },
    strengths: [String],
    improvements: [String],
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Interview", interviewSchema);
