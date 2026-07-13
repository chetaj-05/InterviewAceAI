import { useEffect, useState } from "react";
import {
  uploadResume,
  getResume,
  deleteResume,
  analyzeResume,
  matchWithJD,
} from "../services/resumeService";
import toast from "react-hot-toast";

function Resume() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [showJD, setShowJD] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const data = await getResume();
      setResume(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load resume");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      await uploadResume(file);
      toast.success("Resume uploaded successfully");
      setMatchResult(null);
      fetchResume();
    } catch (error) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async () => {
    if (!confirm("Delete your resume?")) return;
    try {
      await deleteResume();
      setResume(null);
      setMatchResult(null);
      toast.success("Resume deleted");
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeResume();
      toast.success("Resume analyzed successfully");
      setResume((prev) => ({
        ...prev,
        status: "completed",
        analysis: data.analysis,
      }));
    } catch (error) {
      toast.error("Analysis failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatchJD = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }
    setMatching(true);
    try {
      const data = await matchWithJD(jobDescription);
      setMatchResult(data);
      toast.success("JD match complete");
    } catch (error) {
      toast.error("Match failed. Try again.");
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Resume
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Upload, analyze and match your resume with job descriptions
        </p>
      </div>

      {/* Upload area */}
      {!resume ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
            dragOver
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          }`}
        >
          <p className="text-5xl mb-4">📄</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Upload your resume
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Drag and drop your PDF here or click to browse
          </p>
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all inline-block">
            {uploading ? "Uploading..." : "Choose PDF"}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
            PDF only · Max 5MB
          </p>
        </div>
      ) : (
        <>
          {/* Resume card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-2xl">
                  📄
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Resume.pdf
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        resume.status === "completed"
                          ? "bg-green-500"
                          : resume.status === "analyzing"
                            ? "bg-yellow-500 animate-pulse"
                            : resume.status === "failed"
                              ? "bg-red-500"
                              : "bg-gray-400"
                      }`}
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                      {resume.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={resume.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-all"
                >
                  View
                </a>
                <label className="cursor-pointer text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg font-medium transition-all">
                  Replace
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <button
                  onClick={handleDelete}
                  className="text-xs bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-all"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Analyze button */}
            {resume.status === "uploaded" || resume.status === "failed" ? (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  "🤖 Analyze with AI"
                )}
              </button>
            ) : resume.status === "analyzing" ? (
              <div className="mt-5 w-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 py-3 rounded-xl text-sm font-medium text-center">
                ⏳ Analysis in progress...
              </div>
            ) : null}
          </div>

          {/* Analysis results */}
          {resume.status === "completed" && resume.analysis && (
            <>
              {/* Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "ATS Score",
                    value: resume.analysis.atsScore,
                    color: "text-indigo-500",
                    bg: "bg-indigo-50 dark:bg-indigo-900/30",
                  },
                  {
                    label: "Overall Score",
                    value: resume.analysis.overallScore,
                    color: "text-green-500",
                    bg: "bg-green-50 dark:bg-green-900/30",
                  },
                  {
                    label: "Experience",
                    value: resume.analysis.experienceLevel,
                    color: "text-purple-500",
                    bg: "bg-purple-50 dark:bg-purple-900/30",
                    isText: true,
                  },
                  {
                    label: "Target Role",
                    value: resume.analysis.targetRole,
                    color: "text-amber-500",
                    bg: "bg-amber-50 dark:bg-amber-900/30",
                    isText: true,
                  },
                ].map(({ label, value, color, bg, isText }) => (
                  <div key={label} className={`${bg} rounded-2xl p-5`}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {label}
                    </p>
                    <p
                      className={`font-bold ${color} ${isText ? "text-base capitalize" : "text-3xl"}`}
                    >
                      {isText ? value : `${value}%`}
                    </p>
                    {!isText && (
                      <div className="h-1.5 bg-white/50 dark:bg-black/20 rounded-full mt-3">
                        <div
                          className={`h-1.5 rounded-full ${color.replace("text-", "bg-")}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                    ✅ Skills Found
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.analysis.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                    ❌ Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.analysis.missingSkills?.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths and Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                    💪 Strengths
                  </h3>
                  <ul className="space-y-2">
                    {resume.analysis.strengths?.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                    💡 Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {resume.analysis.suggestions?.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span className="text-indigo-500 mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* JD Matcher */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      🎯 Job Description Matcher
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Paste any JD to see how well your resume matches
                    </p>
                  </div>
                  <button
                    onClick={() => setShowJD(!showJD)}
                    className="text-xs text-indigo-500 font-semibold hover:underline"
                  >
                    {showJD ? "Hide" : "Try it"}
                  </button>
                </div>

                {showJD && (
                  <div className="space-y-4">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      rows={6}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                    />
                    <button
                      onClick={handleMatchJD}
                      disabled={matching}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                      {matching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Matching...
                        </>
                      ) : (
                        "Match Resume"
                      )}
                    </button>
                  </div>
                )}

                {/* Match result */}
                {matchResult && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-indigo-500">
                        {matchResult.matchScore}%
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          Match Score
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {matchResult.matchScore >= 70
                            ? "Great match! You should apply."
                            : matchResult.matchScore >= 50
                              ? "Decent match. Some gaps to fill."
                              : "Low match. Consider upskilling first."}
                        </p>
                      </div>
                    </div>

                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          matchResult.matchScore >= 70
                            ? "bg-green-500"
                            : matchResult.matchScore >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${matchResult.matchScore}%` }}
                      />
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {matchResult.feedback}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                          ✅ Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.matchedSkills?.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-500 mb-2">
                          ❌ Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missingSkills?.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Resume;
