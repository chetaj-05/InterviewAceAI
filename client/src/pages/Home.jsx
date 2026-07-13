import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">InterviewAce AI</h1>

        <p className="text-slate-400 mt-5 text-xl">
          Your AI Powered Interview Coach
        </p>

        <div className="flex justify-center gap-5 mt-10">
          <Link
            to="/login"
            className="bg-indigo-600 px-8 py-3 rounded-lg text-white"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="border border-white px-8 py-3 rounded-lg text-white"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
