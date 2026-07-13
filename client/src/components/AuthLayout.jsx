import { motion } from "framer-motion";

function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-slate-950 flex overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600 blur-[150px] top-0 -left-20 opacity-30" />

      <div className="absolute w-96 h-96 rounded-full bg-purple-600 blur-[150px] bottom-0 right-0 opacity-30" />

      <div className="hidden lg:flex w-1/2 justify-center items-center">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-extrabold text-white">
            InterviewAce AI
          </h1>

          <p className="text-slate-300 mt-8 text-xl leading-10">
            🚀 AI Mock Interviews
            <br />
            📄 Resume Analyzer
            <br />
            📊 Performance Analytics
            <br />
            🎯 Personalized Learning
          </p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
