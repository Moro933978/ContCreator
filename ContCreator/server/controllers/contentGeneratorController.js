// controllers/contentGeneratorController.js
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gemini SDK
// Ensure CONTENT_GENERATOR API Key is defined in your environment variables (.env)



/**
 * @desc    Generate a complete social media post based on user idea and settings
 * @route   POST /api/content/generate
 * @access  Private
 */
export const generateContent = async (req, res) => {
    try {

        const ai = new GoogleGenAI({ apiKey: process.env.CONTENT_GENERATOR });

        const {
            idea,
            targetAudience,
            tone,
            platform,
            contentStyle,
            contentLength,
            // We destructure 'include' but ignore it in the prompt, 
            // ensuring the AI always generates all sections as required.
            include
        } = req.body;

        // 1. Validate incoming request
        if (!idea || !targetAudience || !tone || !platform || !contentStyle || !contentLength) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields. Please provide idea, targetAudience, tone, platform, contentStyle, and contentLength.'
            });
        }

        // 2. Construct the specialized Prompt
        const prompt = ` 
            You are Techook Studio AI, an elite Social Media Strategist, Copywriter, Viral Growth Expert, and Content Marketing Specialist.

            Your mission is to transform a single content idea into a premium, highly engaging, platform-optimized social media post.

            ====================================================
            USER INPUT
            ====================================================

            Idea:
            ${idea}

            Target Audience:
            ${targetAudience}

            Platform:
            ${platform}

            Content Style:
            ${contentStyle}

            Tone:
            ${tone}

            Content Length:
            ${contentLength}

            ====================================================
            MISSION
            ====================================================

            Generate ONE complete social media post.

            The content must feel completely human-written.

            Never sound robotic.

            Never mention AI.

            Write exactly as an experienced copywriter would.

            ====================================================
            PLATFORM OPTIMIZATION
            ====================================================

            Adapt the writing style according to the selected platform.

            Instagram:
            - Emotional
            - Short paragraphs
            - Scroll stopping
            - Emoji friendly
            - High engagement

            Facebook:
            - Conversational
            - Storytelling
            - Community focused

            LinkedIn:
            - Professional
            - Valuable
            - Credible
            - Business tone

            TikTok:
            - Fast
            - Exciting
            - Curiosity driven

            YouTube:
            - High retention
            - Strong hook
            - Viewer focused

            X (Twitter):
            - Concise
            - Powerful
            - Highly shareable

            ====================================================
            CONTENT STYLE
            ====================================================

            Respect the selected content style exactly.

            Examples:

            Educational

            Storytelling

            Professional

            Friendly

            Motivational

            Funny

            Inspirational

            Viral Hook

            Do not mix unrelated styles.

            ====================================================
            CONTENT LENGTH
            ====================================================

            Small
            ≈80–120 words

            Medium
            ≈150–250 words

            Large
            ≈300–500 words

            ====================================================
            HOOK RULES
            ====================================================

            The hook must immediately stop scrolling.

            Use one or more of:

            Curiosity

            Pain Point

            Bold Statement

            Unexpected Fact

            Question

            Contradiction

            Fear of Missing Out

            Never use boring openings.

            ====================================================
            POST RULES
            ====================================================

            Write naturally.

            Flow smoothly.

            Never repeat ideas.

            Keep the reader engaged until the end.

            Use line breaks where appropriate.

            Use emojis only when suitable for the platform.

            Avoid keyword stuffing.

            Never sound generated.

            ====================================================
            CALL TO ACTION
            ====================================================

            Generate ONE CTA.

            It must fit the platform.

            Examples:

            Ask for comments.

            Ask users to save.

            Ask users to share.

            Ask users to follow.

            Ask users to visit website.

            Do NOT repeat generic CTAs.

            ====================================================
            HASHTAGS
            ====================================================

            Generate between 5 and 10 hashtags.

            Rules:

            Relevant

            Platform specific

            Trending when possible

            No duplicates

            Mix:

            High competition

            Medium competition

            Low competition

            ====================================================
            VIRAL SCORE
            ====================================================

            Return an integer from 1–100.

            Estimate:

            Engagement

            Retention

            CTR

            Shareability

            Originality

            ====================================================
            QUALITY RULES
            ====================================================

            The post must:

            ✔ Feel human

            ✔ Feel premium

            ✔ Feel written by an expert

            ✔ Match the selected platform

            ✔ Match the audience

            ✔ Match the tone

            ✔ Match the content style

            ✔ Match the requested length

            Never generate generic content.

            ====================================================
            STRICT OUTPUT
            ====================================================

            Return ONLY valid JSON.

            No markdown.

            No explanations.

            No additional text.

            Return exactly this schema:

            {
            "platform": "",
            "tone": "",
            "contentStyle": "",
            "contentLength": "",
            "viralScore": 94,

            "hook": "",

            "post": "",

            "callToAction": "",

            "hashtags": [
                "",
                "",
                "",
                "",
                ""
            ]
            }

            ====================================================
            FINAL VALIDATION
            ====================================================

            Before responding verify:

            ✓ Valid JSON

            ✓ No missing fields

            ✓ Hook exists

            ✓ Post exists

            ✓ CTA exists

            ✓ At least 5 hashtags

            ✓ Viral score is an integer

            ✓ Platform matches "${platform}"

            ✓ Tone matches "${tone}"

            ✓ Content Style matches "${contentStyle}"

            ✓ Length matches "${contentLength}"

            Return ONLY the JSON.
        `;

        // 3. Generation Pipeline with Retry Logic
        let retries = 3;
        let generatedData = null;

        while (retries > 0) {
            try {
                // Call Gemini using the latest @google/genai SDK
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        // Enforce JSON parsing on the Google backend
                        responseMimeType: 'application/json',
                        temperature: 0.7,
                    }
                });

                // Parse the response text to JSON
                const responseText = response.text;

                console.log("========== GEMINI RESPONSE ==========");
                console.log(responseText);
                console.log("=====================================");

                generatedData = JSON.parse(responseText);

                // 4. Output Validation
                // Ensure the AI actually followed the strict schema requirements
                if (
                    !generatedData.hook ||
                    !generatedData.post ||
                    !generatedData.callToAction ||
                    !Array.isArray(generatedData.hashtags)
                ) {
                    throw new Error('AI response is missing required layout fields (hook, post, cta, or hashtags).');
                }

                // If validation passes, break out of the retry loop
                break;

            } catch (error) {
                console.error("========================================");
                console.error("❌ Content Generator Error");
                console.error(error);

                // لو Gemini رجع نص خام اطبعه
                if (error.response) {
                    console.error("Response:", error.response);
                }

                if (error.message) {
                    console.error("Message:", error.message);
                }

                console.error("========================================");

                retries--;

                console.warn(
                    `[ContentGenerator] Attempt failed. Retries remaining: ${retries}`
                );

                if (retries === 0) {
                    throw error; // ارمي الخطأ الحقيقي بدل رسالة عامة
                }

                // انتظار ثانية قبل إعادة المحاولة
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 5. Send Success Response to Frontend
        return res.status(200).json({
            success: true,
            data: generatedData
        });

    } catch (error) {
        console.error('[ContentGenerator] Fatal Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An unexpected server error occurred during content generation.'
        });
    }
};