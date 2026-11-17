import { GoogleGenAI } from "@google/genai";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);

export const analyzeViralContent = async (req, res) => {
    try {
        const primaryKey = process.env.VIRAL_METER_API || process.env.GEMINI_API_KEY;
        const backupKey = process.env.CONTENT_GENERATOR || primaryKey;

        const attempts = [
            { key: primaryKey, model: "gemini-3.8-flash" },
            { key: backupKey, model: "gemini-2.5-flash" },
            { key: primaryKey, model: "gemini-2.5-flash" },
        ].filter((item) => Boolean(item.key));

        if (attempts.length === 0) {
            return res.status(500).json({
                success: false,
                message: "No API keys found in environment variables."
            });
        }

        const {
            content, 
            platform,
            creatorId
        } = req.body;

        if (!content || !platform) {
            return res.status(400).json({
                success: false,
                message: "Content and Platform are required."
            });
        }

        const prompt = `
You are a Senior Social Media Growth Expert.

Analyze the following content.

Platform:
${platform}

Creator ID:
${creatorId || "Unknown"}

Content:
"""
${content}
"""

Predict the following:

1. Viral Score (0-100)
2. Predicted Views
3. Predicted Likes
4. Predicted Shares
5. Predicted Subscribers
6. Predicted Dislikes
7. Engagement Rate
8. Audience Sentiment
9. Platform Breakdown
10. Engagement Timeline
11. 4 Content Insights

Return ONLY a single valid JSON object. No markdown (\`\`\`json).

Format:
{
  "viralScore": 87,
  "engagementRate": 8.7,
  "predictedViews": 125000,
  "predictedLikes": 8420,
  "predictedShares": 2150,
  "predictedSubscribers": 1250,
  "predictedDislikes": 320,
  "sentiment": {
      "positive": 87,
      "neutral": 8,
      "negative": 5
  },
  "timeline": [
      {"time": "0h", "value": 2000},
      {"time": "6h", "value": 6500},
      {"time": "12h", "value": 9000},
      {"time": "18h", "value": 10500},
      {"time": "24h", "value": 12500},
      {"time": "48h", "value": 13500},
      {"time": "72h", "value": 14500},
      {"time": "1 Week", "value": 19000}
  ],
  "platformBreakdown": [
      {
          "name": "YouTube",
          "percentage": 65,
          "views": 81200
      },
      {
          "name": "Instagram",
          "percentage": 15,
          "views": 18700
      },
      {
          "name": "TikTok",
          "percentage": 10,
          "views": 12500
      },
      {
          "name": "Facebook",
          "percentage": 7,
          "views": 8700
      },
      {
          "name": "LinkedIn",
          "percentage": 3,
          "views": 3700
      }
  ],
  "insights": [
      "Strong Hook",
      "High Replay Potential",
      "Great Topic",
      "Add CTA"
  ]
}
`;

        let response;
        let lastError;

        for (const attempt of attempts) {
            try {
                const currentAi = new GoogleGenAI({ apiKey: attempt.key });
                response = await withTimeout(
                    currentAi.models.generateContent({
                        model: attempt.model,
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            temperature: 0.7,
                            thinkingConfig: { thinkingBudget: 0 },
                        },
                    }),
                    20000
                );
                break;
            } catch (e) {
                lastError = e;
                console.warn(`ViralMeter attempt on [${attempt.model}] failed:`, e?.message);
            }
        }

        if (!response) {
            return res.status(503).json({
                success: false,
                message: lastError?.message || "Gemini servers are busy. Please try again."
            });
        }

        const rawText = response.text || "{}";
        const cleanedText = rawText.replace(/```json|```/g, "").trim();

        const data = JSON.parse(cleanedText);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        console.error("Viral Meter Controller Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};