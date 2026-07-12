import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all completed interviews
    const interviews = await Interview.find({
      user: userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    // Get resume
    const resume = await Resume.findOne({ user: userId });

    // Total interviews
    const totalInterviews = interviews.length;

    // Average score
    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce((sum, i) => sum + i.overallScore, 0) /
              totalInterviews,
          )
        : 0;

    // Best score
    const bestScore =
      totalInterviews > 0
        ? Math.max(...interviews.map((i) => i.overallScore))
        : 0;

    // Total questions answered
    const totalQuestions = interviews.reduce(
      (sum, i) => sum + i.questions.length,
      0,
    );

    // Total bookmarks across all interviews
    const totalBookmarks = interviews.reduce(
      (sum, i) => sum + i.questions.filter((q) => q.isBookmarked).length,
      0,
    );

    // Score trend — last 7 interviews
    const scoreTrend = interviews
      .slice(0, 7)
      .map((i) => ({
        date: i.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        score: i.overallScore,
        role: i.role,
      }))
      .reverse();

    // Interview type breakdown
    const typeBreakdown = {
      technical: interviews.filter((i) => i.type === "technical").length,
      hr: interviews.filter((i) => i.type === "hr").length,
      mixed: interviews.filter((i) => i.type === "mixed").length,
    };

    // Difficulty breakdown
    const difficultyBreakdown = {
      easy: interviews.filter((i) => i.difficulty === "easy").length,
      medium: interviews.filter((i) => i.difficulty === "medium").length,
      hard: interviews.filter((i) => i.difficulty === "hard").length,
    };

    // Most practiced roles
    const roleCounts = {};
    interviews.forEach((i) => {
      roleCounts[i.role] = (roleCounts[i.role] || 0) + 1;
    });
    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }));

    // Recent interviews (last 5)
    const recentInterviews = interviews.slice(0, 5).map((i) => ({
      id: i._id,
      role: i.role,
      type: i.type,
      difficulty: i.difficulty,
      overallScore: i.overallScore,
      createdAt: i.createdAt,
    }));

    res.status(200).json({
      stats: {
        totalInterviews,
        averageScore,
        bestScore,
        totalQuestions,
        totalBookmarks,
      },
      resume: resume
        ? {
            status: resume.status,
            atsScore: resume.analysis?.atsScore || 0,
            overallScore: resume.analysis?.overallScore || 0,
            uploadedAt: resume.createdAt,
          }
        : null,
      scoreTrend,
      typeBreakdown,
      difficultyBreakdown,
      topRoles,
      recentInterviews,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
