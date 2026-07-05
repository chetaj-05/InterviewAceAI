import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "completed", "failed"],
      default: "uploaded",
    },

    analysis: {
      atsScore: Number,

      strengths: [String],

      weaknesses: [String],

      missingSkills: [String],

      suggestions: [String],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Resume", resumeSchema);
