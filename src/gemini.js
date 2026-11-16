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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
    }

    const text = data.text || "";
    if (onChunk && text) {
        onChunk(text);
    }

    return text;
}