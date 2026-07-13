import { useEffect, useState } from "react";
import { getBookmarks, toggleBookmark } from "../services/interviewService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (interviewId, questionId) => {
    try {
      await toggleBookmark({ interviewId, questionId });
      setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error("Failed to remove bookmark");
    }
  };

  const filtered = bookmarks.filter(
    (b) =>
      b.question.toLowerCase().includes(search.toLowerCase()) ||
      b.role.toLowerCase().includes(search.toLowerCase()),
  );

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
          Bookmarks
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {bookmarks.length} bookmarked questions
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <input
          type="text"
          placeholder="🔍 Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Bookmarks list */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-20 text-center shadow-sm">
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No bookmarks yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Bookmark questions during interviews to review them here
          </p>
          <Link
            to="/interview/start"
            className="mt-4 inline-block text-indigo-500 text-sm font-semibold hover:underline"
          >
            Start an interview →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((bookmark) => (
            <div
              key={bookmark.questionId}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
            >
              {/* Role tag */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  {bookmark.role}
                </span>
                <div className="flex items-center gap-2">
                  {bookmark.aiRating > 0 && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        bookmark.aiRating >= 8
                          ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                          : bookmark.aiRating >= 5
                            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600"
                            : "bg-red-100 dark:bg-red-900/40 text-red-500"
                      }`}
                    >
                      {bookmark.aiRating}/10
                    </span>
                  )}
                  <button
                    onClick={() =>
                      handleRemove(bookmark.interviewId, bookmark.questionId)
                    }
                    className="text-yellow-500 hover:text-gray-400 transition-colors text-lg"
                    title="Remove bookmark"
                  >
                    🔖
                  </button>
                </div>
              </div>

              {/* Question */}
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed mb-3">
                {bookmark.question}
              </p>

              {/* Your answer */}
              {bookmark.userAnswer && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Your Answer
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {bookmark.userAnswer}
                  </p>
                </div>
              )}

              {/* AI Feedback */}
              {bookmark.aiFeedback && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    💬 AI Feedback
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {bookmark.aiFeedback}
                  </p>
                </div>
              )}

              {/* Link to full result */}
              <div className="mt-3 text-right">
                <Link
                  to={`/interview/result/${bookmark.interviewId}`}
                  className="text-xs text-indigo-500 font-semibold hover:underline"
                >
                  View full interview →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;
