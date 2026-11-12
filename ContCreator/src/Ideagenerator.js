import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // التأكد إن الطلب القادم هو POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // استلام البيانات من الواجهة
    const { channelName, niche, targetAudience, platforms, count = 20 } = req.body;

    try {
        // 1. التهيئة الصحيحة للمكتبة الجديدة
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
        You are an expert social media strategist and content creator working for "${channelName}".
        Your task is to generate exactly ${count} highly engaging content ideas for the niche: "${niche}".
        The target audience is: "${targetAudience}".
        The target platforms are: ${platforms.join(', ')}.
        
        You MUST return ONLY a valid JSON object with the following exact structure:
        
        {
          "ideas": [
            {
              "id": "01",
              "platform": "youtube",
              "title": "String (Catchy title)",
              "category": "String",
              "potential": "High",
              "isTrending": true,
              "analytics": {
                "viral": 90,
                "ease": 85,
                "interest": 95,
                "competition": 60,
                "score": 82
              },
              "guide": [
                { "num": "1", "title": "Hook (0-5 sec)", "desc": "String" },
                { "num": "2", "title": "Main Content", "desc": "String" },
                { "num": "3", "title": "Call to Action", "desc": "String" }
              ],
              "strengths": ["String", "String"],
              "weaknesses": ["String", "String"]
            }
          ]
        }
        `;

        // 2. طريقة الاستدعاء الجديدة للموديل
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                // هذه الخاصية تضمن رجوع البيانات كـ JSON صالح 100%
                responseMimeType: "application/json",
            }
        });

        // 3. استخراج النص في المكتبة الجديدة
        const responseText = response.text;

        // 4. تحويل النص لـ Object
        const generatedData = JSON.parse(responseText);

        // إرسال البيانات للواجهة
        return res.status(200).json(generatedData);

    } catch (error) {
        console.error("AI Generation Error:", error);
        return res.status(500).json({ error: "Failed to generate ideas. Please try again." });
    }
}