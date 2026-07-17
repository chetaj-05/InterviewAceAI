import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const StatCard = ({ title, value, icon, color, subtext }) => (
  <div className="bg-white dark:bg-[#13131f] rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}
      >
        {icon}
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">
        {subtext || "total"}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
      {value}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
      {title}
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-white/10 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-violet-500">
          Score: {payload[0].value}/10
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Welcome back,{" "}
            <span className="font-semibold text-violet-500">{user?.name}</span>{" "}
            👋
          </p>
        </div>
        <Link
          to="/interview/start"
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-violet-500/20"
        >
          + New Interview
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Interviews"
          value={data?.stats?.totalInterviews || 0}
          icon="🎯"
          color="bg-violet-100 dark:bg-violet-500/10"
        />
        <StatCard
          title="Average Score"
          value={`${data?.stats?.averageScore || 0}/10`}
          icon="📊"
          color="bg-blue-100 dark:bg-blue-500/10"
        />
        <StatCard
          title="Best Score"
          value={`${data?.stats?.bestScore || 0}/10`}
          icon="🏆"
          color="bg-amber-100 dark:bg-amber-500/10"
        />
        <StatCard
          title="Questions Done"
          value={data?.stats?.totalQuestions || 0}
          icon="❓"
          color="bg-emerald-100 dark:bg-emerald-500/10"
        />
        <StatCard
          title="Bookmarks"
          value={data?.stats?.totalBookmarks || 0}
          icon="🔖"
          color="bg-pink-100 dark:bg-pink-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#13131f] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Score Trend
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              Last 7 sessions
            </span>
          </div>
          {data?.scoreTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.scoreTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  className="dark:stroke-white/5"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#7c3aed" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center text-2xl mb-3">
                📊
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No interviews yet
              </p>
              <Link
                to="/interview/start"
                className="mt-3 text-violet-500 text-sm font-semibold hover:underline"
              >
                Start your first interview →
              </Link>
            </div>
          )}
        </div>

        {/* Resume Card */}
        <div className="bg-white dark:bg-[#13131f] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Resume
            </h2>
            <Link
              to="/resume"
              className="text-xs text-violet-500 font-semibold hover:underline"
            >
              Manage →
            </Link>
          </div>
          {data?.resume ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    data.resume.status === "completed"
                      ? "bg-emerald-500"
                      : data.resume.status === "analyzing"
                        ? "bg-amber-500 animate-pulse"
                        : data.resume.status === "failed"
                          ? "bg-red-500"
                          : "bg-gray-400"
                  }`}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {data.resume.status}
                </span>
              </div>

              {data.resume.status === "completed" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        ATS Score
                      </p>
                      <p className="text-xs font-bold text-violet-500">
                        {data.resume.atsScore}%
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${data.resume.atsScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Overall Score
                      </p>
                      <p className="text-xs font-bold text-emerald-500">
                        {data.resume.overallScore}%
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${data.resume.overallScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-3">
                📄
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No resume uploaded
              </p>
              <Link
                to="/resume"
                className="mt-3 text-violet-500 text-sm font-semibold hover:underline"
              >
                Upload resume →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interviews */}
        <div className="bg-white dark:bg-[#13131f] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Interviews
            </h2>
            <Link
              to="/interview/history"
              className="text-xs text-violet-500 font-semibold hover:underline"
            >
              View all
            </Link>
          </div>

          {data?.recentInterviews?.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">
                🎯
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No interviews yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {data?.recentInterviews?.map((interview) => (
                <Link
                  to={`/interview/result/${interview.id}`}
                  key={interview.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        interview.overallScore >= 8
                          ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600"
                          : interview.overallScore >= 5
                            ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600"
                            : "bg-red-100 dark:bg-red-500/10 text-red-500"
                      }`}
                    >
                      {interview.overallScore}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {interview.role}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                        {interview.type} · {interview.difficulty}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition-colors">
                    {new Date(interview.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Roles */}
        <div className="bg-white dark:bg-[#13131f] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
            Most Practiced Roles
          </h2>

          {data?.topRoles?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl mb-3">
                📋
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No data yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.topRoles?.map(({ role, count }, index) => (
                <div key={role}>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {role}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {count} {count === 1 ? "session" : "sessions"}
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all"
                      style={{
                        width: `${(count / (data?.topRoles[0]?.count || 1)) * 100}%`,
                        opacity: 1 - index * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
