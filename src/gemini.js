// src/gemini.js

export async function sendChatMessage(chatHistory, newUserMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatHistory,
                newUserMessage,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate response from server.');
        }

        return data.text;
    } catch (error) {
        console.error('Gemini Frontend Error:', error);
        throw error;
    }
}