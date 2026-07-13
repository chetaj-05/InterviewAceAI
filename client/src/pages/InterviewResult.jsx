import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInterview, toggleBookmark } from "../services/interviewService";
import toast from "react-hot-toast";

function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data);
        const bm = {};
        data.questions.forEach((q) => {
          if (q.isBookmarked) bm[q._id] = true;
        });
        setBookmarked(bm);
      } catch (error) {
        toast.error("Result not found");
        navigate("/interview/history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBookmark = async (questionId) => {
    try {
      await toggleBookmark({ interviewId: id, questionId });
      setBookmarked((prev) => ({
        ...prev,
        [questionId]: !prev[questionId],
      }));
      toast.success(
        bookmarked[questionId] ? "Bookmark removed" : "Question bookmarked",
      );
    } catch (error) {
      toast.error("Failed to bookmark");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const scoreColor =
    interview?.overallScore >= 8
      ? "text-green-500"
      : interview?.overallScore >= 5
        ? "text-yellow-500"
        : "text-red-500";

  const scoreBg =
    interview?.overallScore >= 8
      ? "bg-green-50 dark:bg-green-900/20"
      : interview?.overallScore >= 5
        ? "bg-yellow-50 dark:bg-yellow-900/20"
        : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interview Result
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm capitalize">
            {interview?.role} · {interview?.type} · {interview?.difficulty}
          </p>
        </div>
        <Link
          to="/interview/start"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          New Interview
        </Link>
      </div>

      {/* Score card */}
      <div className={`${scoreBg} rounded-2xl p-8 text-center`}>
        <p className={`text-7xl font-bold ${scoreColor}`}>
          {interview?.overallScore}
          <span className="text-3xl">/10</span>
        </p>
        <p className="text-gray-600 dark:text-gray-300 font-semibold mt-2">
          {interview?.overallScore >= 8
            ? "Excellent Performance! 🎉"
            : interview?.overallScore >= 6
              ? "Good Job! Keep it up 👍"
              : interview?.overallScore >= 4
                ? "Needs Improvement 📚"
                : "Keep Practicing! 💪"}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {interview?.questions?.length} questions ·{" "}
          {Math.floor((interview?.timeTaken || 0) / 60)} min{" "}
          {(interview?.timeTaken || 0) % 60} sec
        </p>
      </div>

      {/* Overall Feedback */}
      {interview?.overallFeedback && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
            📝 Overall Feedback
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {interview.overallFeedback}
          </p>
        </div>
      )}

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            💪 Strengths
          </h2>
          <ul className="space-y-2">
            {interview?.strengths?.map((s, i) => (
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
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            📈 Areas to Improve
          </h2>
          <ul className="space-y-2">
            {interview?.improvements?.map((s, i) => (
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

      {/* Question Review */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Question Review
        </h2>
        <div className="space-y-4">
          {interview?.questions?.map((q, i) => (
            <div
              key={q._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full shrink-0">
                    Q{i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      q.aiRating >= 8
                        ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                        : q.aiRating >= 5
                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600"
                          : q.aiRating > 0
                            ? "bg-red-100 dark:bg-red-900/40 text-red-500"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {q.aiRating > 0 ? `${q.aiRating}/10` : "Skipped"}
                  </span>
                  <button
                    onClick={() => handleBookmark(q._id)}
                    className={`text-lg transition-all ${
                      bookmarked[q._id]
                        ? "text-yellow-500"
                        : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
                    }`}
                    title="Bookmark question"
                  >
                    🔖
                  </button>
                </div>
              </div>

              {/* Your answer */}
              {q.userAnswer && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Your Answer
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {q.userAnswer}
                  </p>
                </div>
              )}

              {/* AI Feedback */}
              {q.aiFeedback && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    💬 AI Feedback
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {q.aiFeedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-4 pb-6">
        <Link
          to="/interview/history"
          className="flex-1 text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-semibold transition-all"
        >
          View History
        </Link>
        <Link
          to="/interview/start"
          className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all"
        >
          Practice Again
        </Link>
      </div>
    </div>
  );
}

export default InterviewResult;
