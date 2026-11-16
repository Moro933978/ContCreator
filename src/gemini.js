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
        let errorMsg = "Failed to connect to AI server.";
        try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
        } catch {}
        throw new Error(errorMsg);
    }

    if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        if (onChunk) {
            onChunk(fullText);
        }
    }

    return fullText;
}