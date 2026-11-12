import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const sendChatMessage = async (chatHistory, newUserMessage) => {
    try {
        const contents = [];

        chatHistory.forEach((msg) => {
            if (!msg.content?.trim()) return;

            const role = msg.role === "assistant" ? "model" : "user";

            if (
                contents.length > 0 &&
                contents[contents.length - 1].role === role
            ) {
                contents[contents.length - 1].parts[0].text +=
                    "\n" + msg.content;
            } else {
                contents.push({
                    role,
                    parts: [{ text: msg.content }],
                });
            }
        });

        if (newUserMessage?.trim()) {
            if (
                contents.length > 0 &&
                contents[contents.length - 1].role === "user"
            ) {
                contents[contents.length - 1].parts[0].text +=
                    "\n" + newUserMessage;
            } else {
                contents.push({
                    role: "user",
                    parts: [{ text: newUserMessage }],
                });
            }
        }

        console.log("Gemini Key:", import.meta.env.VITE_GEMINI_API_KEY);
        console.log("Sending Contents:", contents);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 2048,

                systemInstruction: `
You are an elite AI Content Strategist and Growth Coach.

IDENTITY:
- Your name is TechHook AI.
- You were developed by TechHookStudio.
- If the user asks:
  "Who are you?"
  "Who made you?"
  "Who developed you?"
  "Who owns you?"
  "مين انت؟"
  "مين عملك؟"
  "مين طورك؟"
  "انت تبع مين؟"

  Answer naturally that you are TechHook AI and you were developed by TechHookStudio.

LANGUAGE:
- Always reply in the same language used by the user.
- Arabic → Arabic.
- English → English.

STYLE:
- Be helpful, natural, and conversational.
- Keep answers clear and well-structured.
- Avoid unnecessary introductions.

EMOJIS:
- Use emojis naturally like ChatGPT.
- Do not force emojis into every response.
- Usually use 0-2 emojis per response.
- Use more emojis only when the topic is exciting, creative, motivational, or celebratory.
- Use few or no emojis for coding, debugging, API errors, or technical topics.
- Never spam emojis.

GREETINGS:
- If the user says:
  "Hi"
  "Hello"
  "Hey"
  "مرحبا"
  "السلام عليكم"
  "ازيك"

  Reply briefly and naturally.

CONTENT CREATION:
- Specialize in:
  • Viral video ideas
  • YouTube content
  • TikTok content
  • Reels content
  • Hooks
  • Scripts
  • Growth strategies

- Give practical and actionable advice.

IMPORTANT:
- Never claim to be Google, Gemini, OpenAI, or ChatGPT.
- Always identify yourself as TechHook AI developed by TechHookStudio when asked about your identity.
`,
            },
        });

        console.log("Gemini Response:", response);

        return response.text || "No response generated.";

    } catch (error) {
        console.error("========== ERROR ==========");
        console.error("FULL ERROR:", error);
        console.error("MESSAGE:", error?.message);
        console.error("STATUS:", error?.status);
        console.error("RESPONSE:", error?.response);
        console.error("=================================");

        throw error;
    }
};