import { GoogleGenAI } from "@google/genai";



export const analyzeViralContent = async (req, res) => {
    try {

        const ai = new GoogleGenAI({
            apiKey: process.env.VIRAL_METER_API,
        });

        console.log(process.env.VIRAL_METER_API);

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

Return ONLY JSON.

Format:

{
  "viralScore":87,
  "engagementRate":8.7,
  "predictedViews":125000,
  "predictedLikes":8420,
  "predictedShares":2150,
  "predictedSubscribers":1250,
  "predictedDislikes":320,

  "sentiment":{
      "positive":87,
      "neutral":8,
      "negative":5
  },

  "timeline":[
      {"time":"0h","value":2000},
      {"time":"6h","value":6500},
      {"time":"12h","value":9000},
      {"time":"18h","value":10500},
      {"time":"24h","value":12500},
      {"time":"48h","value":13500},
      {"time":"72h","value":14500},
      {"time":"1 Week","value":19000}
  ],

  "platformBreakdown":[
      {
          "name":"YouTube",
          "percentage":65,
          "views":81200
      },
      {
          "name":"Instagram",
          "percentage":15,
          "views":18700
      },
      {
          "name":"TikTok",
          "percentage":10,
          "views":12500
      },
      {
          "name":"Facebook",
          "percentage":7,
          "views":8700
      },
      {
          "name":"LinkedIn",
          "percentage":3,
          "views":3700
      }
  ],

  "insights":[
      "Strong Hook",
      "High Replay Potential",
      "Great Topic",
      "Add CTA"
  ]
}
`;


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let text = response.text;

        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const data = JSON.parse(text);

        res.json({
            success: true,
            data
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};