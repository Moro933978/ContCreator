import { GoogleGenAI } from "@google/genai";

export const generateIdeas = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in environment variables.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const {
      channelName = "Creator Channel",
      niche = "Content Creation",
      subNiche = "",
      targetAudience = "General Audience",
      platforms = ["YouTube", "Instagram", "TikTok"],
      contentStyle = "Educational",
      mainGoal = "Increase Engagement",
      country = "Global",
      language = "EN",
      count = 6,
    } = req.body;

    // نحدد العدد بحد أقصى 6 أفكار لضمان سرعة الرد في أقل من 5 ثوانٍ وعدم حدوث Timeout
    const safeCount = Math.min(Number(count) || 6, 6);
    const safePlatforms =
      Array.isArray(platforms) && platforms.length > 0
        ? platforms
        : ["YouTube", "Instagram", "TikTok"];

    const prompt = `
You are an elite AI Content Strategist. Generate EXACTLY ${safeCount} high-converting content ideas tailored to this creator:
- Channel: ${channelName}
- Niche: ${niche} ${subNiche ? `(${subNiche})` : ""}
- Audience: ${targetAudience}
- Platforms: ${safePlatforms.join(", ")}
- Style/Category: ${contentStyle}
- Goal: ${mainGoal}
- Country: ${country}
- Language: ${language} (ALL text values MUST be in ${language === "AR" ? "Arabic" : "English"})

STRICT RULES:
1. Return ONLY valid JSON matching the exact schema below. No markdown.
2. "ideas" array MUST have EXACTLY ${safeCount} items with IDs "01" to "0${safeCount}".
3. "title": 2 to 5 punchy words ONLY (15-40 chars), NO punctuation (: - ! ? , .).
4. "category": MUST be exactly "${contentStyle}".
5. "platform": MUST be one of [${safePlatforms.join(", ")}].
6. Keep descriptions concise, sharp, and actionable (1 short sentence per field).
7. Calculate "summary" metrics accurately from the generated ideas.

JSON SCHEMA:
{
  "ideas": [
    {
      "id": "01",
      "platform": "${safePlatforms[0]}",
      "title": "Punchy Title Here",
      "category": "${contentStyle}",
      "potential": "High",
      "isTrending": true,
      "analytics": {
        "viral": 88,
        "interest": 85,
        "ease": 80,
        "competition": 45,
        "seo": 84,
        "engagement": 90,
        "retention": 86,
        "ctr": 89,
        "score": 87,
        "betterThan": 91
      },
      "guide": [
        { "num": "1", "title": "Hook", "desc": "Short action" },
        { "num": "2", "title": "Value", "desc": "Short action" },
        { "num": "3", "title": "Payoff", "desc": "Short action" }
      ],
      "strengths": ["Point 1", "Point 2", "Point 3"],
      "weaknesses": ["Point 1", "Point 2", "Point 3"],
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "keywords": ["kw1", "kw2", "kw3"],
      "thumbnailPrompt": "Concise visual concept",
      "scriptOutline": ["Hook line", "Core tip", "Closing"],
      "callToAction": "Tailored CTA"
    }
  ],
  "summary": {
    "totalIdeas": ${safeCount},
    "highPotential": 0,
    "mediumPotential": 0,
    "lowPotential": 0,
    "trendingIdeas": 0,
    "averageScore": 85
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // إيقاف التفكير الزائد لتسريع الرد 3 أضعاف
      },
    });

    const raw = response.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (error) {
    console.error("generateIdeas Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate ideas",
    });
  }
};