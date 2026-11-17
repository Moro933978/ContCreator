import { GoogleGenAI } from "@google/genai";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);

export const generateIdeas = async (req, res) => {
  console.log("🔥 generateIdeas called");

  try {
    const keysToTry = [
      process.env.GEMINI_API_KEY,
      process.env.CONTENT_GENERATOR,
    ].filter(Boolean);

    if (keysToTry.length === 0) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY not found",
      });
    }

    const {
      channelName,
      niche,
      subNiche,
      targetAudience,
      platforms,
      contentStyle,
      mainGoal,
      country,
      language,
      username,
      fullName,
      email,
      count = 10,
    } = req.body;

    const safePlatforms = Array.isArray(platforms) ? platforms : [];

    const prompt = `
You are an ELITE AI Content Strategist. Generate EXACTLY ${count} high-converting content ideas tailored to this creator profile:
- Channel/Brand Name: ${channelName}
- Username: ${username}
- Creator Name: ${fullName}
- Main Niche: ${niche}
- Sub Niche: ${subNiche}
- Target Audience: ${targetAudience}
- Target Platforms: ${safePlatforms.join(", ")}
- Content Style: ${contentStyle}
- Main Goal: ${mainGoal}
- Target Country Context: ${country}
- Output Language: ${language}

STRICT RULES:
1. Return ONLY a single valid JSON object. No markdown (\`\`\`json).
2. "ideas" array MUST contain EXACTLY ${count} items with incremental IDs starting from "01".
3. "title": 2 to 5 words max (15-40 chars), NO punctuation (: - ! ? , .).
4. "category": MUST strictly equal "${contentStyle}" across all items.
5. "platform": MUST strictly be one of [${safePlatforms.join(", ")}].
6. Language: ALL text values MUST be written in ${language === "AR" ? "Arabic" : "English"}.
7. SPEED & CONCISENESS RULE: Keep every string value ("desc", "strengths", "weaknesses", "thumbnailPrompt", "scriptOutline", "callToAction") ultra-concise (5 to 10 words max per string) so the response generates rapidly while keeping high quality.
8. "summary": Accurately calculate totalIdeas, highPotential, mediumPotential, lowPotential, trendingIdeas, and averageScore from the generated ideas array.

JSON SCHEMA:
{
  "ideas": [
    {
      "id": "01",
      "platform": "String",
      "title": "String",
      "category": "${contentStyle}",
      "potential": "High | Medium | Low",
      "isTrending": boolean,
      "analytics": {
        "viral": number,
        "interest": number,
        "ease": number,
        "competition": number,
        "seo": number,
        "engagement": number,
        "retention": number,
        "ctr": number,
        "score": number,
        "betterThan": number
      },
      "guide": [
        { "num": "1", "title": "String", "desc": "String" },
        { "num": "2", "title": "String", "desc": "String" },
        { "num": "3", "title": "String", "desc": "String" }
      ],
      "strengths": ["String", "String", "String"],
      "weaknesses": ["String", "String", "String"],
      "hashtags": ["String", "String", "String"],
      "keywords": ["String", "String", "String"],
      "thumbnailPrompt": "String",
      "scriptOutline": ["String", "String", "String"],
      "callToAction": "String"
    }
  ],
  "summary": {
    "totalIdeas": ${count},
    "highPotential": number,
    "mediumPotential": number,
    "lowPotential": number,
    "trendingIdeas": number,
    "averageScore": number
  }
}
`;

    let response;
    let lastError;

    for (const currentKey of keysToTry) {
      try {
        const currentAi = new GoogleGenAI({ apiKey: currentKey });
        response = await withTimeout(
          currentAi.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.7,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          25000
        );
        break;
      } catch (e) {
        lastError = e;
        console.warn("Attempt failed, trying fallback...", e?.message);
      }
    }

    if (!response) {
      return res.status(503).json({
        success: false,
        message: "Gemini servers are temporarily busy. Please click Generate again.",
        error: lastError?.message,
      });
    }

    const raw = response.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    try {
      const data = JSON.parse(cleaned);
      return res.status(200).json(data);
    } catch (err) {
      console.error("PARSE ERROR:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
      });
    }
  } catch (error) {
    console.error("generateIdeas Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};