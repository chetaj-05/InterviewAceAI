import express from "express";

import {
  uploadResume,
  getResume,
  deleteResume,
} from "../controllers/resumeController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadResume);

router.get("/", protect, getResume);

router.delete("/", protect, deleteResume);

export default router;
