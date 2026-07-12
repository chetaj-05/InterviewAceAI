import Resume from "../models/Resume.js";
import uploadToCloudinary, {
  deleteFromCloudinary,
} from "../services/cloudinaryService.js";
import { extractTextFromPdfUrl } from "../services/pdfService.js";
import {
  analyzeResumeWithGemini,
  matchResumeWithJD,
} from "../services/aiService.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF",
      });
    }

    // Upload new resume to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    // Check if resume already exists
    const existingResume = await Resume.findOne({
      user: req.user.id,
    });

    if (existingResume) {
      // Delete old resume from Cloudinary
      await deleteFromCloudinary(existingResume.cloudinaryPublicId);

      // Update MongoDB document
      existingResume.resumeUrl = result.secure_url;
      existingResume.cloudinaryPublicId = result.public_id;
      existingResume.status = "uploaded";

      await existingResume.save();

      return res.status(200).json({
        message: "Resume replaced successfully",
        resume: existingResume,
      });
    }

    // First upload
    const resume = await Resume.create({
      user: req.user.id,
      resumeUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      status: "uploaded",
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    await deleteFromCloudinary(resume.cloudinaryPublicId);

    await Resume.deleteOne({
      _id: resume._id,
    });

    res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Analyze resume with AI
export const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found. Please upload first." });
    }

    // Update status to analyzing
    resume.status = "analyzing";
    await resume.save();

    // Extract text from PDF stored on Cloudinary
    const resumeText = await extractTextFromPdfUrl(resume.resumeUrl);

    if (!resumeText || resumeText.trim().length < 50) {
      resume.status = "failed";
      await resume.save();
      return res.status(400).json({
        message: "Could not extract text from PDF. Try re-uploading.",
      });
    }

    // Send to Gemini for analysis
    const analysis = await analyzeResumeWithGemini(resumeText);

    // Save analysis to DB
    resume.status = "completed";
    resume.analysis = {
      atsScore: analysis.atsScore,
      overallScore: analysis.overallScore,
      experienceLevel: analysis.experienceLevel,
      targetRole: analysis.targetRole,
      skills: analysis.skills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
    };

    await resume.save();

    res.status(200).json({
      message: "Resume analyzed successfully",
      analysis: resume.analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // Mark as failed
    await Resume.findOneAndUpdate({ user: req.user.id }, { status: "failed" });

    res.status(500).json({ message: "Analysis failed. Try again." });
  }
};

// Match resume with job description
export const matchWithJD = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Please analyze your resume first" });
    }

    const resumeText = await extractTextFromPdfUrl(resume.resumeUrl);
    const matchResult = await matchResumeWithJD(resumeText, jobDescription);

    // Just return — don't save to DB
    res.status(200).json({
      message: "JD match complete",
      matchScore: matchResult.matchScore,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      feedback: matchResult.feedback,
      suggestions: matchResult.suggestions,
    });
  } catch (error) {
    console.error("JD match error:", error);
    res.status(500).json({ message: "JD match failed. Try again." });
  }
};
