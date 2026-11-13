
import "dotenv/config";

import express from "express";
import cors from "cors";

import { GoogleGenAI } from "@google/genai";

import aiRoutes from "./routes/ai.js";
import contentRoutes from "./routes/content-rout.js";
import viralMeterRoutes from "./routes/Viral-Rout.js";
import postEditorRoutes from "./routes/postEditorRout.js";

const app = express();

// =========================================================
// CORS Configuration
// =========================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://cont-creator.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server or health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);

      return callback(new Error("Origin not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =========================================================
// Middleware
// =========================================================

app.use(express.json());

// =========================================================
// Routes
// =========================================================

app.use("/api", aiRoutes);
app.use("/api", contentRoutes);
app.use("/api", viralMeterRoutes);

app.use("/api/posteditor", postEditorRoutes);

// =========================================================
// Home
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Creator AI Server is running 🚀",
  });
});

// =========================================================
// Health Check
// =========================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "API is healthy 🚀",
  });
});

// =========================================================
// Post Editor Test
// =========================================================

app.get("/api/posteditor/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Post Editor routes are working ✅",
  });
});

// =========================================================
// Test Gemini Key
// =========================================================

app.get("/api/test-key", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "GEMINI_API_KEY not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "GEMINI_API_KEY loaded successfully",
    keyLength: apiKey.length,
  });
});

// =========================================================
// Test Gemini
// =========================================================

app.get("/api/test-gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY not found",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say only Hello",
    });

    return res.status(200).json({
      success: true,
      text: response.text || "Hello",
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Gemini request failed",
    });
  }
});

// =========================================================
// 404 Handler
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// Global Error Handler
// =========================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,
  });
});

// =========================================================
// Server
// =========================================================

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("==========================================");

  console.log(
    process.env.GEMINI_API_KEY
      ? "✅ GEMINI_API_KEY Loaded"
      : "❌ GEMINI_API_KEY NOT Found"
  );

  console.log("==========================================");
});
