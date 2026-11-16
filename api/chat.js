const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, prompt, contents } = req.body || {};
    const userPrompt = message || prompt || contents;

    if (!userPrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Verify API key availability
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in environment variables' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Call the Gemini model
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userPrompt,
    });

    const replyText = response.text || "Sorry, no response was generated.";

    // Return the response in multiple formats to match any frontend parser
    return res.status(200).json({ 
      text: replyText,
      reply: replyText,
      message: replyText,
      candidates: [{ content: { parts: [{ text: replyText }] } }]
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString() 
    });
  }
};