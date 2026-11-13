import express from "express";
import { generateContent } from "../controllers/contentGeneratorController.js";

const router = express.Router();

router.post("/generate-content", generateContent);

export default router;