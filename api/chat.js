
const { GoogleGenAI } = require("@google/genai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_MESSAGE_LENGTH = 10000;

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    // Parse request body
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON request body",
        });
      }
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
      });
    }

    // Extract prompt
    const { message, prompt, contents } = body;

    const userPrompt = message ?? prompt ?? contents;

    // Validate prompt
    if (typeof userPrompt !== "string" || !userPrompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt must be a non-empty string",
      });
    }

    if (userPrompt.length > MAX_MESSAGE_LENGTH) {
      return res.status(413).json({
        success: false,
        error: "Message is too long",
      });
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");

      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Generate response
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt.trim(),
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Extract response text
    const replyText = response.text;

    if (!replyText) {
      console.error("Gemini returned an empty response");

      return res.status(502).json({
        success: false,
        error: "AI returned an empty response",
      });
    }

    // Successful response
    return res.status(200).json({
      success: true,
      text: replyText,
      reply: replyText,
      message: replyText,
    });

  } catch (error) {
    // Detailed server-side logging
    console.error("Gemini API Error:", {
      message: error.message,
      status: error.status,
      name: error.name,
    });

    const status = Number(error.status);

    // Map known API errors
    if (status === 429) {
      return res.status(429).json({
        success: false,
        error: "Gemini API rate limit exceeded. Please try again later.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        error: "Gemini API authentication or permission error.",
      });
    }

    if (status === 400) {
      return res.status(400).json({
        success: false,
        error: "Gemini rejected the request. Check the input format.",
      });
    }

    if (status === 404) {
      return res.status(502).json({
        success: false,
        error: "Gemini model not found or unavailable.",
      });
    }

    if (status === 503 || status === 504) {
      return res.status(503).json({
        success: false,
        error: "Gemini service is temporarily unavailable.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error while generating response.",
    });
  }
};
