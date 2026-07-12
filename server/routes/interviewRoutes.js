import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  startInterview,
  submitAnswer,
  finishInterview,
  getInterviews,
  getInterview,
  deleteInterview,
  toggleBookmark,
  getBookmarks,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/submit-answer", protect, submitAnswer);
router.post("/finish", protect, finishInterview);
router.get("/", protect, getInterviews);
router.get("/bookmarks", protect, getBookmarks);
router.get("/:id", protect, getInterview);
router.delete("/:id", protect, deleteInterview);
router.post("/bookmark", protect, toggleBookmark);

export default router;
