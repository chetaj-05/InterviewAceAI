import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInterview,
  submitAnswer,
  finishInterview,
} from "../services/interviewService";
import toast from "react-hot-toast";

function MockInterview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [finishing, setFinishing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data);
      } catch (error) {
        toast.error("Interview not found");
        navigate("/interview/start");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentQuestion = interview?.questions[currentIndex];
  const totalQuestions = interview?.questions.length || 0;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please write an answer before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitAnswer({
        interviewId: id,
        questionId: currentQuestion._id,
        userAnswer: answer,
      });

      setFeedback(result);
      setSubmitted(true);
      setAnsweredQuestions((prev) => ({
        ...prev,
        [currentIndex]: {
          answer,
          rating: result.rating,
          feedback: result.feedback,
          idealAnswer: result.idealAnswer,
        },
      }));
    } catch (error) {
      toast.error("Failed to submit answer. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setAnswer("");
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSkip = async () => {
    await submitAnswer({
      interviewId: id,
      questionId: currentQuestion._id,
      userAnswer: "",
    });
    setAnsweredQuestions((prev) => ({
      ...prev,
      [currentIndex]: { answer: "", rating: 0, skipped: true },
    }));
    if (currentIndex < totalQuestions - 1) {
      handleNext();
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await finishInterview({
        interviewId: id,
        timeTaken: timeElapsed,
      });
      toast.success("Interview completed!");
      navigate(`/interview/result/${id}`);
    } catch (error) {
      toast.error("Failed to finish. Try again.");
    } finally {
      setFinishing(false);
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answeredQuestions).length === totalQuestions;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading interview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {interview?.role}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">
              {interview?.type} · {interview?.difficulty}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">Time</p>
              <p className="text-sm font-bold text-indigo-500 font-mono">
                {formatTime(timeElapsed)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Progress
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {currentIndex + 1}/{totalQuestions}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div
              className="h-1.5 bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question dots */}
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          {interview?.questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < currentIndex
                  ? answeredQuestions[i]?.rating >= 7
                    ? "bg-green-500"
                    : answeredQuestions[i]?.skipped
                      ? "bg-gray-300 dark:bg-gray-700"
                      : "bg-yellow-500"
                  : i === currentIndex
                    ? "bg-indigo-500"
                    : "bg-gray-200 dark:bg-gray-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 pb-10 space-y-5">
        {/* Question card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
              Q{currentIndex + 1}
            </span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
            {currentQuestion?.question}
          </p>
        </div>

        {/* Answer area */}
        {!submitted ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be as detailed as possible."
              rows={8}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </button>
              <button
                onClick={handleSkip}
                disabled={submitting}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          /* Feedback card */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                  feedback?.rating >= 8
                    ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                    : feedback?.rating >= 5
                      ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600"
                      : "bg-red-100 dark:bg-red-900/40 text-red-500"
                }`}
              >
                {feedback?.rating}/10
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {feedback?.rating >= 8
                    ? "Excellent!"
                    : feedback?.rating >= 6
                      ? "Good answer"
                      : feedback?.rating >= 4
                        ? "Needs improvement"
                        : "Keep practicing"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  AI Evaluation
                </p>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                💬 AI Feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback?.feedback}
              </p>
            </div>

            {/* Ideal answer */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                ✅ Ideal Answer
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback?.idealAnswer}
              </p>
            </div>

            {/* Next or Finish */}
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {finishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating report...
                  </>
                ) : (
                  "🏁 Finish Interview"
                )}
              </button>
            )}
          </div>
        )}

        {/* Finish early button */}
        {!submitted && currentIndex > 0 && (
          <div className="text-center">
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            >
              End interview early
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;
