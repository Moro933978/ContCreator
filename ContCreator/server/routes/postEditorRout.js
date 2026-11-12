import express from "express";

import {
  improvePost,
  regeneratePost,
  applySuggestion,
} from "../controllers/posteditor.js";

const router = express.Router();

// POST /api/posteditor/improve
router.post("/improve", improvePost);

// POST /api/posteditor/regenerate
router.post("/regenerate", regeneratePost);

// POST /api/posteditor/apply-suggestion
router.post("/apply-suggestion", applySuggestion);

export default router;
