import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInterviews, deleteInterview } from "../services/interviewService";
import toast from "react-hot-toast";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (error) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this interview?")) return;
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      toast.success("Interview deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const filtered = interviews
    .filter((i) => filter === "all" || i.type === filter)
    .filter((i) => i.role.toLowerCase().includes(search.toLowerCase()));

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interview History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {interviews.length} interviews completed
          </p>
        </div>
        <Link
          to="/interview/start"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          + New Interview
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Search by role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <div className="flex gap-2">
          {["all", "technical", "hr", "mixed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-20 text-center shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No interviews found
          </p>
          <Link
            to="/interview/start"
            className="mt-4 inline-block text-indigo-500 text-sm font-semibold hover:underline"
          >
            Start your first interview →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((interview) => (
            <div
              key={interview._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      interview.overallScore >= 8
                        ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                        : interview.overallScore >= 5
                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600"
                          : "bg-red-100 dark:bg-red-900/40 text-red-500"
                    }`}
                  >
                    {interview.overallScore}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {interview.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium capitalize">
                        {interview.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize">
                        {interview.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(interview.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/interview/result/${interview._id}`}
                    className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(interview._id)}
                    className="text-xs bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewHistory;
