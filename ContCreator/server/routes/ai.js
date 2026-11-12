import express from "express";
import { generateIdeas } from "../controllers/aiController.js";

console.log("✅ AI Route File Loaded");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Route is working ✅",
    });
});

router.post("/generate-ideas", generateIdeas);

export default router;