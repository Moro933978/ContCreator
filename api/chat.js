import { GoogleGenAI } from "@google/genai";

const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.5-pro"];
const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 6000;

const SYSTEM_INSTRUCTION = `
You are TechHook AI, an elite AI Content Strategist and Growth Coach.

IDENTITY:
- You are TechHook AI, developed by TechHookStudio.
- Explain your identity naturally when asked who created or developed you.

LANGUAGE:
- Always reply in the same language as the user's latest message.
- Arabic messages receive Arabic replies.
- English messages receive English replies.

STYLE:
- Be helpful, natural, direct, and conversational.
- Keep answers concise, clear, and actionable.
- Avoid unnecessary introductions.
- Use 0-2 emojis naturally.

EXPERTISE:
- You specialize in YouTube, TikTok, Instagram Reels,
viral video ideas, hooks, scripts, content strategy,
audience growth, and creator tools.

IMPORTANT:
- Never claim to be Google, Gemini, OpenAI, or ChatGPT.
- Do not invent facts.
`;

function normalizeHistory(history, newUserMessage) {
    const messages = [];

    for (const msg of history.slice(-MAX_HISTORY_MESSAGES)) {
        if (
            !msg ||
            typeof msg.content !== "string" ||
            !msg.content.trim()
        ) {
            continue;
        }

        const text = msg.content.trim().slice(0, MAX_MESSAGE_LENGTH);
        const role = msg.role === "assistant" ? "model" : "user";

        // Gemini conversations must start with a user message.
        if (messages.length === 0 && role !== "user") {
            continue;
        }

        // Merge consecutive messages with the same role.
        const previous = messages[messages.length - 1];

        if (previous && previous.role === role) {
            previous.parts[0].text += "\n" + text;
        } else {
            messages.push({
                role,
                parts: [{ text }]
            });
        }
    }

    // Prevent sending the current message twice.
    const lastMessage = messages[messages.length - 1];

    if (
        lastMessage?.role === "user" &&
        lastMessage.parts[0].text.trim() === newUserMessage
    ) {
        return messages;
    }

    if (lastMessage?.role === "user") {
        lastMessage.parts[0].text += "\n" + newUserMessage;
    } else {
        messages.push({
            role: "user",
            parts: [{ text: newUserMessage }]
        });
    }

    return messages;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const startTime = Date.now();

    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "Server API configuration is missing."
            });
        }

        let body = req.body;

        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                return res.status(400).json({
                    error: "Invalid JSON body."
                });
            }
        }

        body = body || {};

        const chatHistory = Array.isArray(body.chatHistory)
            ? body.chatHistory
            : [];

        const rawMessage =
            typeof body.newUserMessage === "string"
                ? body.newUserMessage
                : typeof body.message === "string"
                    ? body.message
                    : "";

        const newUserMessage = rawMessage.trim();

        if (!newUserMessage) {
            return res.status(400).json({
                error: "Message cannot be empty."
            });
        }

        if (newUserMessage.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                error: "Message is too long."
            });
        }

        const contents = normalizeHistory(
            chatHistory,
            newUserMessage
        );

        const ai = new GoogleGenAI({ apiKey });

        // Try multiple models in order to bypass 503 High Demand errors BEFORE opening the stream
        let responseStream = null;
        let lastError = null;

        for (const model of MODELS_TO_TRY) {
            try {
                responseStream = await ai.models.generateContentStream({
                    model: model,
                    contents,
                    config: {
                        systemInstruction: SYSTEM_INSTRUCTION,
                        temperature: 0.7,
                        maxOutputTokens: 600,
                        automaticContinuation: false
                    }
                });
                if (responseStream) {
                    console.log(`Successfully connected using model: ${model}`);
                    break;
                }
            } catch (err) {
                console.warn(`Model ${model} failed (likely 503 high demand), trying next...`, err.message);
                lastError = err;
            }
        }

        if (!responseStream) {
            throw lastError || new Error("All Gemini models are currently busy or unavailable.");
        }

        // Configure Server-Sent Events AFTER successfully obtaining the stream
        res.setHeader(
            "Content-Type",
            "text/event-stream; charset=utf-8"
        );
        res.setHeader(
            "Cache-Control",
            "no-cache, no-transform"
        );
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        let firstChunk = true;

        for await (const chunk of responseStream) {
            if (res.destroyed || res.writableEnded) {
                break;
            }

            const text = chunk.text;

            if (text) {
                if (firstChunk) {
                    console.log(
                        "Gemini first token:",
                        Date.now() - startTime,
                        "ms"
                    );
                    firstChunk = false;
                }

                res.write(
                    `data: ${JSON.stringify({ text })}\n\n`
                );
            }
        }

        if (!res.destroyed && !res.writableEnded) {
            res.write("data: [DONE]\n\n");
            res.end();
        }

        console.log(
            "Gemini total response time:",
            Date.now() - startTime,
            "ms"
        );

    } catch (error) {
        console.error("Gemini Streaming Error:", error);

        // إذا لم يتم إرسال الـ headers بعد، نرسل رد JSON طبيعي
        if (!res.headersSent) {
            return res.status(503).json({
                error: "The AI models are currently experiencing high demand. Please try again in a moment.",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            });
        }

        // إذا كانت الـ headers قد أُرسلت وتم فتح الـ Stream، نتحقق أن الاتصال متاح قبل الكتابة لمنع انهيار libuv
        if (!res.destroyed && res.writableEnded === false) {
            try {
                res.write(
                    `data: ${JSON.stringify({
                        error: "The response was interrupted. Please try again."
                    })}\n\n`
                );
                res.end();
            } catch (writeErr) {
                console.error("Error writing failure chunk to stream:", writeErr);
            }
        }
    }
}