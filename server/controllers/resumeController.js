import Resume from "../models/Resume.js";
import uploadToCloudinary, {
  deleteFromCloudinary,
} from "../services/cloudinaryService.js";

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
