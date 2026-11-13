import express from "express";
import { analyzeViralContent } from "../controllers/ViralMeter-ControllerAI.js";

const router = express.Router();

router.post("/viral-meter", analyzeViralContent);

export default router;