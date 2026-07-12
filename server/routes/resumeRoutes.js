import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { analyzeResume, matchWithJD } from "../controllers/resumeController.js";
import {
  uploadResume,
  getResume,
  deleteResume,
} from "../controllers/resumeController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("resume"), uploadResume);

router.get("/", protect, getResume);

router.delete("/", protect, deleteResume);
router.post("/analyze", protect, analyzeResume);
router.post("/match-jd", protect, matchWithJD);

export default router;
