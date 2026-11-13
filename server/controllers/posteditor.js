import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/* =========================================================
   Environment
========================================================= */

const AI_API_URL = process.env.AI_API_URL;
const AI_API_KEY = process.env.Post_Editor;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/*
  Provider:
  - "gemini"  -> use Google Gemini directly
  - "external" -> use OpenAI-compatible API
  - undefined -> automatically detect
*/
const AI_PROVIDER =
  process.env.POST_EDITOR_PROVIDER ||
  (AI_API_URL && AI_API_KEY ? "external" : "gemini");

/* =========================================================
   Utility Functions
========================================================= */

const clampScore = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
};

const cleanString = (value, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }

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

const buildPostEditorPrompt = ({
  post,
  editFocus,
  tone,
  customInstructions,
}) => {
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

METRICS:

readability:
Integer between 0 and 100.

engagement:
Integer between 0 and 100.

clarity:
Integer between 0 and 100.

viralScore:
Integer between 0 and 100.

ALLOWED SUGGESTION TYPES:

- hook
- tone
- cta
- structure
- improve

Return ONLY the JSON object.
`;
};

/* =========================================================
   Call External OpenAI-Compatible API
========================================================= */

const callExternalAI = async (prompt) => {
  if (!AI_API_URL) {
    throw new Error(
      "AI_API_URL is not configured in .env"
    );
  }

  if (!AI_API_KEY) {
    throw new Error(
      "Post_Editor API key is not configured in .env"
    );
  }

  const response = await fetch(AI_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },

    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,

      response_format: {
        type: "json_object",
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `External AI API failed: ${response.status} ${responseText}`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      "External AI API returned invalid JSON response."
    );
  }
};

/* =========================================================
   Call Gemini
========================================================= */

const callGeminiAI = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured in .env"
    );
  }

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: prompt,

    config: {
      temperature: 0.7,

      responseMimeType: "application/json",
    },
  });

  const content =
    typeof response?.text === "string"
      ? response.text.trim()
      : "";

  if (!content) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  return content;
};

/* =========================================================
   Call AI
========================================================= */

const callAI = async (prompt) => {
  if (AI_PROVIDER === "gemini") {
    return callGeminiAI(prompt);
  }

  if (AI_PROVIDER === "external") {
    return callExternalAI(prompt);
  }

  throw new Error(
    `Unsupported POST_EDITOR_PROVIDER: ${AI_PROVIDER}`
  );
};

/* =========================================================
   Extract AI Content
========================================================= */

const extractAIContent = (data) => {
  // Gemini may already return a string.
  if (typeof data === "string") {
    return data.trim();
  }

  // OpenAI-compatible response.
  let content =
    data?.choices?.[0]?.message?.content;

  // Some providers return content as an array.
  if (Array.isArray(content)) {
    content = content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.text ||
          item?.content ||
          ""
        );
      })
      .join("");
  }

  // Other possible provider structures.
  if (
    !content &&
    typeof data?.content === "string"
  ) {
    content = data.content;
  }

  if (
    !content &&
    typeof data?.text === "string"
  ) {
    content = data.text;
  }

  if (!content || typeof content !== "string") {
    console.error(
      "Unexpected AI response:",
      data
    );

    throw new Error(
      "AI returned an empty or unsupported response."
    );
  }

  return content.trim();
};

/* =========================================================
   Parse AI JSON
========================================================= */

const parseAIResponse = (content) => {
  if (!content || typeof content !== "string") {
    throw new Error(
      "AI response content is empty."
    );
  }

  const original = content.trim();

  // Attempt 1: direct JSON
  try {
    return JSON.parse(original);
  } catch {
    // Continue
  }

  // Attempt 2: remove markdown fences
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

  // Attempt 3: extract JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(cleaned);
    } catch {
      // Continue
    }
  }

  console.error(
    "Invalid AI JSON content:",
    original
  );

  throw new Error(
    "AI returned invalid JSON."
  );
};

/* =========================================================
   Validate Suggestion
========================================================= */

const validateSuggestion = (suggestion) => {
  if (
    !suggestion ||
    typeof suggestion !== "object"
  ) {
    return null;
  }

  const allowedTypes = [
    "hook",
    "tone",
    "cta",
    "structure",
    "improve",
  ];

  const type = cleanString(
    suggestion.type,
    "improve"
  );

  const content = cleanString(
    suggestion.content
  );

  if (!content) {
    return null;
  }

  return {
    type: allowedTypes.includes(type)
      ? type
      : "improve",

    title: cleanString(
      suggestion.title,
      "Content Suggestion"
    ),

    impact: cleanString(
      suggestion.impact,
      "Useful"
    ),

    content,

    action: cleanString(
      suggestion.action,
      "Apply Suggestion"
    ),
  };
};

/* =========================================================
   Validate AI Result
========================================================= */

const validateAIResult = (result) => {
  if (
    !result ||
    typeof result !== "object"
  ) {
    throw new Error(
      "Invalid AI result."
    );
  }

  const editedPost = cleanString(
    result.editedPost
  );

  if (!editedPost) {
    throw new Error(
      "AI result is missing editedPost."
    );
  }

  if (
    !result.metrics ||
    typeof result.metrics !== "object"
  ) {
    throw new Error(
      "AI result is missing metrics."
    );
  }

  const metrics = {
    readability: clampScore(
      result.metrics.readability
    ),

    engagement: clampScore(
      result.metrics.engagement
    ),

    clarity: clampScore(
      result.metrics.clarity
    ),

    viralScore: clampScore(
      result.metrics.viralScore
    ),
  };

  const suggestions = Array.isArray(
    result.suggestions
  )
    ? result.suggestions
        .map(validateSuggestion)
        .filter(Boolean)
        .slice(0, 6)
    : [];

  return {
    editedPost,
    metrics,
    suggestions,
  };
};

/* =========================================================
   Process AI Request
========================================================= */

const processPostWithAI = async ({
  post,
  editFocus,
  tone,
  customInstructions,
}) => {
  const prompt = buildPostEditorPrompt({
    post,
    editFocus,
    tone,
    customInstructions,
  });

  const aiResponse = await callAI(prompt);

  const aiContent =
    extractAIContent(aiResponse);

  const parsedResult =
    parseAIResponse(aiContent);

  return validateAIResult(
    parsedResult
  );
};

/* =========================================================
   Improve Post
========================================================= */

export const improvePost = async (
  req,
  res
) => {
  try {
    const {
      post,
      editFocus,
      tone,
      customInstructions,
    } = req.body || {};

    /* -----------------------------------------------------
       Validate Request
    ----------------------------------------------------- */

    if (
      !post ||
      typeof post !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Post content is required.",
      });
    }

    const trimmedPost =
      post.trim();

    if (!trimmedPost) {
      return res.status(400).json({
        success: false,
        message:
          "Post content cannot be empty.",
      });
    }

    /* -----------------------------------------------------
       AI Processing
    ----------------------------------------------------- */

    const result =
      await processPostWithAI({
        post: trimmedPost,
        editFocus,
        tone,
        customInstructions,
      });

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      data: {
        originalPost: trimmedPost,

        editedPost:
          result.editedPost,

        metrics:
          result.metrics,

        suggestions:
          result.suggestions,
      },
    });
  } catch (error) {
    console.error(
      "❌ Post Editor Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to process the post.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   Regenerate Post
========================================================= */

export const regeneratePost = async (
  req,
  res
) => {
  try {
    const {
      post,
      editFocus,
      tone,
      customInstructions,
      previousResult,
    } = req.body || {};

    /* -----------------------------------------------------
       Validate Request
    ----------------------------------------------------- */

    if (
      !post ||
      typeof post !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Post content is required.",
      });
    }

    const trimmedPost =
      post.trim();

    if (!trimmedPost) {
      return res.status(400).json({
        success: false,
        message:
          "Post content cannot be empty.",
      });
    }

    /* -----------------------------------------------------
       Previous Result
    ----------------------------------------------------- */

    const previousResultText =
      previousResult &&
      typeof previousResult === "object"
        ? safeJsonStringify(
            previousResult
          )
        : "{}";

    /* -----------------------------------------------------
       Regeneration Instructions
    ----------------------------------------------------- */

    const regenerationInstructions = `
${customInstructions || ""}

IMPORTANT REGENERATION RULES:

Generate a DIFFERENT version from the previous result.

Do NOT copy the previous edited post.

Try to improve the hook, wording, structure,
CTA, or presentation where appropriate.

Keep the original meaning.

Previous result:
${previousResultText}
`;

    /* -----------------------------------------------------
       AI Processing
    ----------------------------------------------------- */

    const result =
      await processPostWithAI({
        post: trimmedPost,

        editFocus,

        tone,

        customInstructions:
          regenerationInstructions,
      });

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      data: {
        originalPost: trimmedPost,

        editedPost:
          result.editedPost,

        metrics:
          result.metrics,

        suggestions:
          result.suggestions,
      },
    });
  } catch (error) {
    console.error(
      "❌ Post Regeneration Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to regenerate the post.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   Apply Suggestion
========================================================= */

export const applySuggestion = async (
  req,
  res
) => {
  try {
    const {
      post,
      suggestion,
      tone,
      customInstructions,
    } = req.body || {};

    /* -----------------------------------------------------
       Validate Post
    ----------------------------------------------------- */

    if (
      !post ||
      typeof post !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Post content is required.",
      });
    }

    const trimmedPost =
      post.trim();

    if (!trimmedPost) {
      return res.status(400).json({
        success: false,
        message:
          "Post content cannot be empty.",
      });
    }

    /* -----------------------------------------------------
       Validate Suggestion
    ----------------------------------------------------- */

    if (
      !suggestion ||
      typeof suggestion !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Suggestion is required.",
      });
    }

    /* -----------------------------------------------------
       Build Suggestion Instructions
    ----------------------------------------------------- */

    const suggestionInstructions = `
${customInstructions || ""}

IMPORTANT:

Apply ONLY the specific suggestion below.

Do NOT make unrelated changes.

Preserve the original meaning of the post.

Specific suggestion:
${safeJsonStringify(suggestion)}
`;

    /* -----------------------------------------------------
       AI Processing
    ----------------------------------------------------- */

    const result =
      await processPostWithAI({
        post: trimmedPost,

        editFocus:
          suggestion.type ||
          "general",

        tone,

        customInstructions:
          suggestionInstructions,
      });

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      data: {
        originalPost: trimmedPost,

        editedPost:
          result.editedPost,

        metrics:
          result.metrics,

        suggestions:
          result.suggestions,
      },
    });
  } catch (error) {
    console.error(
      "❌ Apply Suggestion Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to apply suggestion.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};