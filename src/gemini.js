export async function sendChatMessage(chatHistory, newUserMessage, onChunk, signal) {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chatHistory,
            newUserMessage,
        }),
        signal,
    });

    if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") break;

            try {
                const parsed = JSON.parse(payload);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.text) {
                    fullText += parsed.text;
                    if (onChunk) onChunk(fullText);
                }
            } catch (e) {
                if (e.message && !e.message.includes("JSON")) throw e;
            }
        }
    }

    return fullText;
}