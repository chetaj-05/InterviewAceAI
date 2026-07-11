import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
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

export default router;
