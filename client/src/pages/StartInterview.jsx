import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview } from "../services/interviewService";
import toast from "react-hot-toast";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Software Devloper",
];

const TECH_STACKS = [
  "React, JavaScript",
  "React, TypeScript",
  "Node.js, Express",
  "Python, Django",
  "Python, FastAPI",
  "Vue.js",
  "Angular",
  "React Native",
  "Flutter",
  "Java, Spring Boot",
  "MERN Stack",
  "MEAN Stack",
  "cpp",
];

function StartInterview() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [type, setType] = useState("technical");
  const [techStack, setTechStack] = useState("");
  const [customTech, setCustomTech] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    const finalRole = role === "custom" ? customRole : role;
    const finalTech = techStack === "custom" ? customTech : techStack;

    if (!finalRole) {
      toast.error("Please select a role");
      return;
    }
    if (type !== "hr" && !finalTech) {
      toast.error("Please select a tech stack");
      return;
    }

    setLoading(true);
    try {
      const data = await startInterview({
        role: finalRole,
        type,
        techStack: finalTech,
        difficulty,
        questionCount,
      });
      toast.success("Interview started!");
      navigate(`/interview/mock/${data.interviewId}`);
    } catch (error) {
      toast.error("Failed to start interview. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Start Interview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Configure your mock interview and practice with AI
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6">
        {/* Role */}
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Job Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Select a role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="custom">Custom role...</option>
          </select>
          {role === "custom" && (
            <input
              type="text"
              placeholder="Enter your role"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="w-full mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          )}
        </div>

        {/* Interview Type */}
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "technical", label: "Technical", icon: "💻" },
              { value: "hr", label: "HR", icon: "🤝" },
              { value: "mixed", label: "Mixed", icon: "🔀" },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  type === value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stack — hide for HR */}
        {type !== "hr" && (
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Tech Stack
            </label>
            <select
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select tech stack</option>
              {TECH_STACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="custom">Custom tech stack...</option>
            </select>
            {techStack === "custom" && (
              <input
                type="text"
                placeholder="e.g. React, GraphQL, AWS"
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                className="w-full mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            )}
          </div>
        )}

        {/* Difficulty */}
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "easy",
                label: "Easy",
                icon: "🟢",
                desc: "Fundamentals",
              },
              {
                value: "medium",
                label: "Medium",
                icon: "🟡",
                desc: "Intermediate",
              },
              { value: "hard", label: "Hard", icon: "🔴", desc: "Advanced" },
            ].map(({ value, label, icon, desc }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  difficulty === value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
                <span className="text-xs opacity-60">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
            Number of Questions:{" "}
            <span className="text-indigo-500">{questionCount}</span>
          </label>
          <input
            type="range"
            min={3}
            max={10}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>3 (Quick)</span>
            <span>7 (Standard)</span>
            <span>10 (Full)</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Interview Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span>🎯</span>
              <span>
                {role === "custom"
                  ? customRole || "Not set"
                  : role || "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span>💻</span>
              <span className="capitalize">{type} round</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span>⚡</span>
              <span className="capitalize">{difficulty} difficulty</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span>❓</span>
              <span>{questionCount} questions</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating questions...
            </>
          ) : (
            "🚀 Start Interview"
          )}
        </button>
      </div>
    </div>
  );
}

export default StartInterview;
