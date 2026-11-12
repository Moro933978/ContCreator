import { GoogleGenAI } from "@google/genai";

export const generateIdeas = async (req, res) => {
    console.log("🔥 generateIdeas called");
    console.log(req.body);

    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const {
            channelName,
            niche,
            subNiche,
            targetAudience,
            platforms,
            contentStyle,
            mainGoal,
            country,
            language,
            username,
            fullName,
            email,
            count = 10,
        } = req.body;


        const prompt = `
You are an ELITE AI Content Strategist, Data Scientist, and Viral Growth Engineer.
Your mission is to generate premium, highly-targeted content ideas tailored EXACTLY to the creator profile.

====================================================
CREATOR PROFILE DATA (STRICT CONSTRAINTS)
====================================================
- Channel/Brand Name: ${channelName}
- Username: ${username}
- Creator Name: ${fullName}
- Main Niche: ${niche}
- Sub Niche: ${subNiche}
- Target Audience: ${targetAudience}
- Target Platforms: ${platforms.join(", ")}
- Content Style: ${contentStyle}
- Main Goal: ${mainGoal}
- Target Country Context: ${country}
- Output Language: ${language}

Generate EXACTLY ${count} ideas.

This is NOT optional.

If fewer than ${count} ideas are generated, regenerate internally until the array contains exactly ${count} objects.

Never stop at 3,5,6 or 9 ideas.

The final JSON MUST contain exactly ${count} items inside ideas[].
====================================================
CRITICAL RULE HIERARCHY & PRIORITY
====================================================
Every idea MUST satisfy all profile fields. If an idea conflicts with any field, discard it immediately and generate a new one.
Priority alignment matrix: 
Content Style > Main Goal > Target Audience > Main & Sub Niche > Platforms > Country > Language

1. STRICT NICHE ALIGNMENT: 
   All ideas must stay inside [Main Niche: ${niche}] and [Sub Niche: ${subNiche}]. Do NOT cross over into unrelated industries unless explicitly bridged to the core sub-niche. (e.g., If coding: no generic design or business tips unless directly showing how it applies to programmers).

2. MAIN GOAL ENFORCEMENT:
   - If Main Goal = "Increase Engagement": Focus ideas on high-interaction triggers (controversies, debates, questions). Maximize comments, shares, and saves. The CTA must explicitly invite discussions.
   - If Main Goal = "Increase Followers": Focus ideas on high-relatability, extreme shareability, and broad value vectors to trigger virality.
   - If Main Goal = "Increase Sales / Conversions": Focus ideas on pain-points, transformations, trust-building, product utility, and clear high-intent conversion pathways.

3. STRATEGIC IDEA DIVERSIFICATION:
   Do not repeat the same content angle. The generated list of ideas must dynamically distribute across different conceptual formats while strictly preserving the requested [Content Style: ${contentStyle}]. Blend these frameworks:
   - Framework A: The Visual Comparison / Before-After
   - Framework B: Common Mistakes / What to Avoid
   - Framework C: High-Value Quick Tips / Hidden Hacks
   - Framework D: The Interactive Challenge / Hot Take
   - Framework E: Narrative Case Study / Storytelling Breakdown

====================================================
STRICT CATEGORY RULE
====================================================
The "category" field inside the JSON MUST ALWAYS match the exact string of the [Content Style] parameter provided.
- If Content Style = "${contentStyle}" -> Then category MUST be "${contentStyle}"
Any deviation, synonym, or creative alternative is considered a critical structure failure.

====================================================
STRICT TITLE RULES (BUBBLE-NODE UI OPTIMIZATION)
====================================================
The title will be rendered inside a tiny circular UI node bubble. It must be exceptionally punchy and minimal.
- Word Count: Between 2 to 5 words maximum.
- Character Count: Strictly between 15 to 40 characters maximum.
- Absolute Punctuation Ban: Do NOT use colons (:), dashes (-), exclamations (!), questions (?), commas (,), or periods (.).
- Fillers: Zero filler or fluff words. Must be direct, bold, and readable at a glance.

Good UI Examples: "AI Coding Secrets", "Git Branch Tricks", "Debug Code Faster", "React Hooks Mistakes"
Bad UI Examples: "3 Essential Git Commands Every Professional MUST Know:", "How to build an app with Python?"

====================================================
STRICT LANGUAGE & LOCALIZATION COMPLIANCE
====================================================
Look at the [Output Language: ${language}] variable:
- If Language is "EN" (English): Every single text field ("title", "category", "guide", "strengths", "weaknesses", "hashtags", "keywords", "thumbnailPrompt", "scriptOutline", "callToAction") MUST be written cleanly in English.
- If Language is "AR" (Arabic): Every single text field mentioned above MUST be written entirely in high-quality, professional Arabic.
- Country Context: Infuse regional cultural angles, trending vernacular, or geographical references if [Target Country Context: ${country}] is provided and relevant.

====================================================
REALISTIC ANALYTICS & TRENDING METRICS
====================================================
Do not generate repetitive, flat, or static analytical scores.
- "isTrending": Treat this as a premium flag. Only a small, realistic fraction of the ideas should be marked true (highly selective).
- Interdependence: If "competition" is exceptionally high, the overall "score" and "viral" metrics must realistically scale down unless the concept is remarkably unique. 
- Math Logic: The "score" field must be a realistic overall calculation derived logically from the other sub-metrics.

====================================================
ACTIONABLE DATA REFACTORING
====================================================
- "guide": Must be a highly practical, actionable 3-step blueprint. Avoid generic advice like "Explain topic". Write explicit actions (e.g., Step 1: "Show a broken line of code", Step 2: "Apply the single-line patch", Step 3: "Display execution speed difference").
- "callToAction": Must be explicitly tailored to the idea and the overall Main Goal. Do not copy-paste the same CTA across ideas.

====================================================
OUTPUT SCHEMA & PARSING GUARANTEE
====================================================
- Return ONLY a single, valid JSON object.
- Absolutely NO markdown wrapping (Do NOT use \`\`\`json or \`\`\`).
- No conversational text, intro, or outro.
- The JSON must be perfectly parseable via JSON.parse() instantly.

Follow this exact JSON structural blueprint:
{
  "ideas": [
    {
      "id": "01",
      "platform": "String (Must match one from the target platforms array)",
      "title": "String (2-5 words, NO punctuation, bubble optimized)",
      "category": "${contentStyle}",
      "potential": "String (High / Medium / Low)",
      "isTrending": boolean,
      "analytics": {
        "viral": number (70-100),
        "interest": number (70-100),
        "ease": number (60-100),
        "competition": number (10-90),
        "seo": number (70-100),
        "engagement": number (70-100),
        "retention": number (70-100),
        "ctr": number (70-100),
        "score": number (Realistic computed balance),
        "betterThan": number (70-99)
      },
      "guide": [
        { "num": "1", "title": "String", "desc": "String" },
        { "num": "2", "title": "String", "desc": "String" },
        { "num": "3", "title": "String", "desc": "String" }
      ],
      "strengths": ["String", "String", "String"],
      "weaknesses": ["String", "String", "String"],
      "hashtags": ["String", "String", "String"],
      "keywords": ["String", "String", "String"],
      "thumbnailPrompt": "String",
      "scriptOutline": ["String", "String", "String"],
      "callToAction": "String"
    }
  ],
  "summary": {
    "totalIdeas": ${count},
    "highPotential": number (Calculated accurately from the actual ideas array above),
    "mediumPotential": number (Calculated accurately from the actual ideas array above),
    "lowPotential": number (Calculated accurately from the actual ideas array above),
    "trendingIdeas": number (Exact count of items where isTrending is true),
    "averageScore": number (The precise mathematical average score of all generated ideas)
  }
}

====================================================
MANDATORY PRE-OUTPUT VALIDATION CHECKLIST
====================================================
Before rendering the JSON, execute an internal validation loop to guarantee:
1. Total elements in "ideas" array matches exactly: ${count}.
2. Every item has a unique, incremental string ID starting from "01".
3. The platform property is strictly restricted to this set: [${platforms.join(", ")}].
4. Every single title conforms to the length constraints and contains zero punctuation characters.
5. The category field strictly equals "${contentStyle}" across all objects.
6. The data arrays (strengths, weaknesses, hashtags, keywords, scriptOutline) contain exactly 3 items.
7. The language completely shifts to match "${language}" for all content values.
8. The "summary" object metrics are dynamically calculated using precise mathematical verification based on the generated ideas data.
`;
        let response;

        for (let i = 0; i < 3; i++) {
            try {
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                    },
                });

                break;
            } catch (e) {
                if (i === 2) throw e;

                console.log(`Retry ${i + 1}...`);
                await new Promise((r) => setTimeout(r, 2000));
            }
        }

        // اطبع الرد الخام من Gemini
        console.log("========== GEMINI RESPONSE ==========");
        console.log(response.text);
        console.log("=====================================");
        const raw = response.text;

        console.log("============== RAW START ==============");
        console.log(raw);
        console.log("============== RAW END ================");

        try {
            const data = JSON.parse(raw.trim());
            return res.json(data);
        } catch (err) {
            console.log("PARSE ERROR:", err.message);

            return res.status(500).send(raw); // ابعت الرد الخام للفرونت
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
            error,
        });
    }
};