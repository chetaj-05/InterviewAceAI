import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./configs/db.js";
import dns from "dns";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.send("InterviewAce API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
