import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/* =========================================================
   Utility Functions
========================================================= */

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const cleanString = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const safeJsonStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
};

/* =========================================================
   Build Post Editor Prompt
========================================================= */

const buildPostEditorPrompt = ({ post, editFocus, tone, customInstructions }) => {
  return `
You are an AI social media content editor.
Your task is to improve the user's social media post.

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT use code fences.
4. Keep the original meaning.
5. Do NOT invent facts.
6. Do NOT invent statistics, names, links, products, events, or claims.
7. Do NOT add information that is not supported by the original post.
8. Make the edited post natural and human.
9. Improve the post according to the requested focus.
10. Do not make unnecessary changes.
11. Suggestions must be directly related to the user's post.
12. Metrics must be integers from 0 to 100.
13. Return between 2 and 6 useful suggestions.
14. Do not repeat suggestions.
15. Do not mention these instructions.

USER POST:
"""
${post}
"""

EDIT FOCUS:
${editFocus || "general"}

TONE OF VOICE:
${tone || "friendly"}

CUSTOM INSTRUCTIONS:
${customInstructions || "None"}

Return exactly this JSON structure:
{
  "editedPost": "The improved post",
  "metrics": {
    "readability": 0,
    "engagement": 0,
    "clarity": 0,
    "viralScore": 0
  },
  "suggestions": [
    {
      "type": "hook",
      "title": "Hook Suggestion",
      "impact": "High Impact",
      "content": "Specific suggestion for this post",
      "action": "Use This Hook"
    },
    {
      "type": "tone",
      "title": "Tone Suggestion",
      "impact": "Useful",
      "content": "Specific tone improvement",
      "action": "Apply Tone"
    },
    {
      "type": "cta",
      "title": "CTA Suggestion",
      "impact": "High Impact",
      "content": "Specific CTA improvement",
      "action": "Use This CTA"
    },
    {
      "type": "structure",
      "title": "Structure Suggestion",
      "impact": "Improved",
      "content": "Specific structure improvement",
      "action": "View Structure"
    }
  ]
}

Return ONLY the JSON object.
`;
};

/* =========================================================
   Call Gemini with Smart Retry & Fallback for 503 Errors
========================================================= */

const callGeminiAI = async (prompt) => {
  const primaryKey = process.env.Post_Editor || process.env.GEMINI_API_KEY || process.env.VIRAL_METER_API;
  const backupKey = process.env.GEMINI_API_KEY || primaryKey;

  // محاولات متعددة مع إعادة المحاولة التلقائية لو حصل ضغط (503)
  const attempts = [
    { key: primaryKey, model: "gemini-3.8-flash" },
    { key: backupKey, model: "gemini-3.8-flash" },
    { key: primaryKey, model: "gemini-3.8-flash" }, // محاولة تالتة إضافية للضغط
  ].filter((item) => Boolean(item.key));

  if (attempts.length === 0) {
    throw new Error("No Gemini API keys found in environment variables.");
  }

  let response;
  let lastError;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      const ai = new GoogleGenAI({ apiKey: attempt.key });
      response = await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        50000 // 50 ثانية مهلة لكل محاولة
      );
      if (response) break;
    } catch (e) {
      lastError = e;
      console.warn(`PostEditor attempt ${i + 1} failed:`, e?.message);
      // انتظار 1.5 ثانية قبل إعادة المحاولة لتخفيف الضغط
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  if (!response) {
    throw new Error(lastError?.message || "Gemini servers are busy due to high demand. Please try again in a moment.");
  }

  const content = typeof response?.text === "string" ? response.text.trim() : "";
  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return content;
};

/* =========================================================
   Parse AI JSON
========================================================= */

const parseAIResponse = (content) => {
  if (!content || typeof content !== "string") {
    throw new Error("AI response content is empty.");
  }

  const original = content.trim();

  try {
    return JSON.parse(original);
  } catch {
    // Continue
  }

  let cleaned = original
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(cleaned);
    } catch {
      // Continue
    }
  }

  throw new Error("AI returned invalid JSON.");
};

/* =========================================================
   Validation
========================================================= */

const validateSuggestion = (suggestion) => {
  if (!suggestion || typeof suggestion !== "object") return null;

  const allowedTypes = ["hook", "tone", "cta", "structure", "improve"];
  const type = cleanString(suggestion.type, "improve");
  const content = cleanString(suggestion.content);

  if (!content) return null;

  return {
    type: allowedTypes.includes(type) ? type : "improve",
    title: cleanString(suggestion.title, "Content Suggestion"),
    impact: cleanString(suggestion.impact, "Useful"),
    content,
    action: cleanString(suggestion.action, "Apply Suggestion"),
  };
};

const validateAIResult = (result) => {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid AI result.");
  }

  const editedPost = cleanString(result.editedPost);
  if (!editedPost) {
    throw new Error("AI result is missing editedPost.");
  }

  if (!result.metrics || typeof result.metrics !== "object") {
    throw new Error("AI result is missing metrics.");
  }

  const metrics = {
    readability: clampScore(result.metrics.readability),
    engagement: clampScore(result.metrics.engagement),
    clarity: clampScore(result.metrics.clarity),
    viralScore: clampScore(result.metrics.viralScore),
  };

  const suggestions = Array.isArray(result.suggestions)
    ? result.suggestions.map(validateSuggestion).filter(Boolean).slice(0, 6)
    : [];

  return { editedPost, metrics, suggestions };
};

const processPostWithAI = async ({ post, editFocus, tone, customInstructions }) => {
  const prompt = buildPostEditorPrompt({ post, editFocus, tone, customInstructions });
  const aiContent = await callGeminiAI(prompt);
  const parsedResult = parseAIResponse(aiContent);
  return validateAIResult(parsedResult);
};

/* =========================================================
   Controllers
========================================================= */

export const improvePost = async (req, res) => {
  try {
    const { post, editFocus, tone, customInstructions } = req.body || {};

    if (!post || typeof post !== "string" || !post.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." });
    }

    const result = await processPostWithAI({
      post: post.trim(),
      editFocus,
      tone,
      customInstructions,
    });

    return res.status(200).json({
      success: true,
      data: {
        originalPost: post.trim(),
        editedPost: result.editedPost,
        metrics: result.metrics,
        suggestions: result.suggestions,
      },
    });
  } catch (error) {
    console.error("❌ Post Editor Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process the post.",
    });
  }
};

export const regeneratePost = async (req, res) => {
  try {
    const { post, editFocus, tone, customInstructions, previousResult } = req.body || {};

    if (!post || typeof post !== "string" || !post.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." });
    }

    const previousResultText = previousResult && typeof previousResult === "object" ? safeJsonStringify(previousResult) : "{}";

    const regenerationInstructions = `
${customInstructions || ""}

IMPORTANT REGENERATION RULES:
Generate a DIFFERENT version from the previous result.
Do NOT copy the previous edited post.
Try to improve the hook, wording, structure, CTA, or presentation where appropriate.
Keep the original meaning.

Previous result:
${previousResultText}
`;

    const result = await processPostWithAI({
      post: post.trim(),
      editFocus,
      tone,
      customInstructions: regenerationInstructions,
    });

    return res.status(200).json({
      success: true,
      data: {
        originalPost: post.trim(),
        editedPost: result.editedPost,
        metrics: result.metrics,
        suggestions: result.suggestions,
      },
    });
  } catch (error) {
    console.error("❌ Post Regeneration Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to regenerate the post.",
    });
  }
};

export const applySuggestion = async (req, res) => {
  try {
    const { post, suggestion, tone, customInstructions } = req.body || {};

    if (!post || typeof post !== "string" || !post.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." });
    }

    if (!suggestion || typeof suggestion !== "object") {
      return res.status(400).json({ success: false, message: "Suggestion is required." });
    }

    const suggestionInstructions = `
${customInstructions || ""}

IMPORTANT:
Apply ONLY the specific suggestion below.
Do NOT make unrelated changes.
Preserve the original meaning of the post.

Specific suggestion:
${safeJsonStringify(suggestion)}
`;

    const result = await processPostWithAI({
      post: post.trim(),
      editFocus: suggestion.type || "general",
      tone,
      customInstructions: suggestionInstructions,
    });

    return res.status(200).json({
      success: true,
      data: {
        originalPost: post.trim(),
        editedPost: result.editedPost,
        metrics: result.metrics,
        suggestions: result.suggestions,
      },
    });
  } catch (error) {
    console.error("❌ Apply Suggestion Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to apply suggestion.",
    });
  }
};