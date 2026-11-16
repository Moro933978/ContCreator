const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Safely parse request body whether it's an object or string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { message, prompt, contents } = body || {};
    const userPrompt = message || prompt || contents;

    if (!userPrompt) {
      return res.status(400).json({ error: 'Prompt is required in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel Environment Variables.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userPrompt,
    });

    const replyText = response.text || 
                      response.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "Sorry, no response text was returned.";

    return res.status(200).json({ 
      text: replyText,
      reply: replyText,
      message: replyText 
    });

  } catch (error) {
    console.error('Detailed API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString() 
    });
  }
};