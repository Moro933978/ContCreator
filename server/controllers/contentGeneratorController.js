
import { GoogleGenAI } from "@google/genai";

// ========================================
// Generate Content Controller
// ========================================

export const generateContent = async (req, res) => {
  try {
    // ========================================
    // 1. Check API Key
    // ========================================

    const apiKey = process.env.CONTENT_GENERATOR;

    if (!apiKey) {
      console.error(
        "[ContentGenerator] CONTENT_GENERATOR is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Gemini API key is missing. Check CONTENT_GENERATOR in Vercel Environment Variables.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ========================================
    // 2. Get Request Data
    // ========================================

    const {
      idea,
      targetAudience,
      tone,
      platform,
      contentStyle,
      contentLength,
      include,
    } = req.body || {};

    // ========================================
    // 3. Validate Request
    // ========================================

    if (
      !idea ||
      !targetAudience ||
      !tone ||
      !platform ||
      !contentStyle ||
      !contentLength
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please provide idea, targetAudience, tone, platform, contentStyle, and contentLength.",
      });
    }

    // ========================================
    // 4. Construct Prompt
    // ========================================

    const prompt = `
You are Techook Studio AI, an elite Social Media Strategist, Copywriter, Viral Growth Expert, and Content Marketing Specialist.

Your mission is to transform a single content idea into a premium, highly engaging, platform-optimized social media post.

====================================================
USER INPUT
====================================================

Idea:
${idea}

Target Audience:
${targetAudience}

Platform:
${platform}

Content Style:
${contentStyle}

Tone:
${tone}

Content Length:
${contentLength}

====================================================
MISSION
====================================================

Generate ONE complete social media post.

The content must feel completely human-written.

Never sound robotic.

Never mention AI.

Write exactly as an experienced copywriter would.

====================================================
PLATFORM OPTIMIZATION
====================================================

Adapt the writing style according to the selected platform.

Instagram:
- Emotional
- Short paragraphs
- Scroll stopping
- Emoji friendly
- High engagement

Facebook:
- Conversational
- Storytelling
- Community focused

LinkedIn:
- Professional
- Valuable
- Credible
- Business tone

TikTok:
- Fast
- Exciting
- Curiosity driven

YouTube:
- High retention
- Strong hook
- Viewer focused

X (Twitter):
- Concise
- Powerful
- Highly shareable

====================================================
CONTENT STYLE
====================================================

Respect the selected content style exactly.

Examples:

Educational
Storytelling
Professional
Friendly
Motivational
Funny
Inspirational
Viral Hook

Do not mix unrelated styles.

====================================================
CONTENT LENGTH
====================================================

Small:
Approximately 80–120 words.

Medium:
Approximately 150–250 words.

Large:
Approximately 300–500 words.

====================================================
HOOK RULES
====================================================

The hook must immediately stop scrolling.

Use one or more of:

- Curiosity
- Pain Point
- Bold Statement
- Unexpected Fact
- Question
- Contradiction
- Fear of Missing Out

Never use boring openings.

====================================================
POST RULES
====================================================

Write naturally.

Flow smoothly.

Never repeat ideas.

Keep the reader engaged until the end.

Use line breaks where appropriate.

Use emojis only when suitable for the platform.

Avoid keyword stuffing.

Never sound generated.

====================================================
CALL TO ACTION
====================================================

Generate ONE CTA.

It must fit the platform.

Examples:

- Ask for comments.
- Ask users to save.
- Ask users to share.
- Ask users to follow.
- Ask users to visit website.

Do NOT repeat generic CTAs.

====================================================
HASHTAGS
====================================================

Generate between 5 and 10 hashtags.

Rules:

- Relevant
- Platform specific
- Trending when possible
- No duplicates

Mix:

- High competition
- Medium competition
- Low competition

====================================================
VIRAL SCORE
====================================================

Return an integer from 1–100.

Estimate:

- Engagement
- Retention
- CTR
- Shareability
- Originality

====================================================
QUALITY RULES
====================================================

The post must:

- Feel human
- Feel premium
- Feel written by an expert
- Match the selected platform
- Match the audience
- Match the tone
- Match the content style
- Match the requested length

Never generate generic content.

====================================================
STRICT OUTPUT
====================================================

Return ONLY valid JSON.

No markdown.

No explanations.

No additional text.

Return exactly this schema:

{
  "platform": "",
  "tone": "",
  "contentStyle": "",
  "contentLength": "",
  "viralScore": 94,
  "hook": "",
  "post": "",
  "callToAction": "",
  "hashtags": [
    "",
    "",
    "",
    "",
    ""
  ]
}

====================================================
FINAL VALIDATION
====================================================

Before responding verify:

- Valid JSON
- No missing fields
- Hook exists
- Post exists
- CTA exists
- At least 5 hashtags
- Viral score is an integer
- Platform matches "${platform}"
- Tone matches "${tone}"
- Content Style matches "${contentStyle}"
- Length matches "${contentLength}"

Return ONLY the JSON.
`;

    // ========================================
    // 5. Generation Pipeline with Retry Logic
    // ========================================

    let retries = 3;
    let generatedData = null;
    let lastError = null;

    while (retries > 0) {
      try {
        console.log(
          `[ContentGenerator] Generating content. Attempts left: ${retries}`
        );

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        // ========================================
        // 6. Read Gemini Response
        // ========================================

        const responseText = response.text;

        console.log(
          "========== GEMINI RESPONSE =========="
        );

        console.log(responseText);

        console.log(
          "====================================="
        );

        if (!responseText || !responseText.trim()) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        // ========================================
        // 7. Parse JSON
        // ========================================

        try {
          generatedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "[ContentGenerator] Invalid JSON from Gemini:",
            responseText
          );

          throw new Error(
            "Gemini returned an invalid JSON response."
          );
        }

        // ========================================
        // 8. Validate Generated Content
        // ========================================

        if (
          !generatedData ||
          typeof generatedData !== "object" ||
          !generatedData.hook ||
          !generatedData.post ||
          !generatedData.callToAction ||
          !Array.isArray(generatedData.hashtags) ||
          generatedData.hashtags.length < 5
        ) {
          throw new Error(
            "AI response is missing required fields or at least 5 hashtags."
          );
        }

        if (
          !Number.isInteger(generatedData.viralScore) ||
          generatedData.viralScore < 1 ||
          generatedData.viralScore > 100
        ) {
          throw new Error(
            "AI returned an invalid viral score."
          );
        }

        // Ensure selected options are represented correctly.
        generatedData.platform =
          generatedData.platform || platform;

        generatedData.tone =
          generatedData.tone || tone;

        generatedData.contentStyle =
          generatedData.contentStyle || contentStyle;

        generatedData.contentLength =
          generatedData.contentLength || contentLength;

        // Successful generation: stop retrying.
        break;

      } catch (error) {
        lastError = error;

        console.error(
          "[ContentGenerator] Generation attempt failed:",
          error
        );

        retries--;

        console.warn(
          `[ContentGenerator] Retries remaining: ${retries}`
        );

        if (retries === 0) {
          throw lastError;
        }

        // Wait one second before retrying.
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );
      }
    }

    // ========================================
    // 9. Final Safety Check
    // ========================================

    if (!generatedData) {
      throw new Error(
        "Content generation failed after all retry attempts."
      );
    }

    // ========================================
    // 10. Send Success Response
    // ========================================

    return res.status(200).json({
      success: true,
      message: "Content generated successfully.",
      data: generatedData,
    });

  } catch (error) {
    // ========================================
    // 11. Handle Fatal Errors
    // ========================================

    console.error(
      "[ContentGenerator] Fatal Error:",
      error
    );

    const statusCode =
      Number(error?.status) >= 400 &&
      Number(error?.status) <= 599
        ? Number(error.status)
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error?.message ||
        "An unexpected server error occurred during content generation.",
      errorCode: error?.code || null,
    });
  }
};
