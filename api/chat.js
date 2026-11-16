import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an elite AI Content Strategist and Growth Coach.

IDENTITY:
- Your name is TechHook AI.
- You were developed by TechHookStudio.
- If the user asks who you are, who made you, who developed you,
  who owns you, or equivalent questions in Arabic or English,
  explain naturally that you are TechHook AI developed by TechHookStudio.

LANGUAGE:
- Always reply in the same language used by the user.
- Arabic → Arabic.
- English → English.

STYLE:
- Be helpful, natural, and conversational.
- Keep answers clear and well-structured.
- Avoid unnecessary introductions.

EMOJIS:
- Use emojis naturally.
- Usually use 0-2 emojis per response.
- Use few or no emojis for coding, debugging, API errors, or technical topics.
- Never spam emojis.

GREETINGS:
- Reply briefly and naturally to greetings.

CONTENT CREATION:
- Specialize in:
  - Viral video ideas
  - YouTube content
  - TikTok content
  - Reels content
  - Hooks
  - Scripts
  - Growth strategies
- Give practical and actionable advice.

IMPORTANT:
- Never claim to be Google, Gemini, OpenAI, or ChatGPT.
- Always identify yourself as TechHook AI developed by TechHookStudio when asked about your identity.
`;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing.");
            return res.status(500).json({
                error: "Server API configuration is missing.",
            });
        }

        // Safely parse request body
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }
        body = body || {};

        const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];
        const newUserMessage = (body.newUserMessage || body.message || "").trim();

        if (!newUserMessage) {
            return res.status(400).json({
                error: "Message cannot be empty.",
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        const contents = [];

        // Keep only the last 12 messages to maintain context while reducing latency
        for (const msg of chatHistory.slice(-12)) {
            if (!msg || typeof msg.content !== "string" || !msg.content.trim()) {
                continue;
            }

            const role = msg.role === "assistant" ? "model" : "user";

            // Ensure conversation starts with a user message
            if (contents.length === 0 && role === "model") {
                continue;
            }

            const previous = contents[contents.length - 1];

            // Merge consecutive messages from the same role
            if (previous && previous.role === role) {
                previous.parts[0].text += "\n" + msg.content.trim();
            } else {
                contents.push({
                    role,
                    parts: [{ text: msg.content.trim() }],
                });
            }
        }

        // Append the latest user message
        const lastMessage = contents[contents.length - 1];

        if (lastMessage?.role === "user") {
            lastMessage.parts[0].text += "\n" + newUserMessage;
        } else {
            contents.push({
                role: "user",
                parts: [{ text: newUserMessage }],
            });
        }

        // Generate response with thinking disabled for fast replies
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 1200,
                thinkingConfig: {
                    thinkingBudget: 0,
                },
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });

        const text = response.text;

        if (!text) {
            return res.status(502).json({
                error: "Gemini returned an empty response.",
            });
        }

        return res.status(200).json({ text });

    } catch (error) {
        console.error("Gemini Backend Error Details:", error);
        return res.status(500).json({
            error: error.message || "Unable to generate a response. Please try again.",
        });
    }
}