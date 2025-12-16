
// Basic AI Service using OpenRouter
// IMPORTANT: User must set their own API key in the settings for this to work.

export const processFoodAnalysis = async ({ image, text }, apiKey) => {
    if (!apiKey) {
        throw new Error('Geen API Key gevonden. Stel deze in bij Instellingen.');
    }

    // Use a cheap, fast vision model
    const MODEL = "google/gemini-2.0-flash-001";

    let prompt = `
  Analyze this food entry.Estimate calories and macros.
  Return ONLY raw JSON with this exact structure(no markdown, no backticks):
{
    "food": "Name of the food (in Dutch)",
        "calories": 500,
            "protein": 30,
                "carbs": 50,
                    "fat": 15
}
  If unsure, give your best estimate.Stay concise.
  `;

    const content = [{ type: "text", text: prompt }];

    if (text) {
        content.push({ type: "text", text: `Food Description / Portion: ${text} ` });
    }

    if (image) {
        content.push({
            type: "image_url",
            image_url: {
                "url": image
            }
        });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey} `,
                "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter for free models sometimes
                "X-Title": "Volleyball App",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": content
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`AI Request failed: ${err} `);
        }

        const data = await response.json();
        const responseContent = data.choices[0].message.content;

        // Clean up if the model wraps it in markdown code blocks despite instructions
        const cleanJson = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

        // ... existing code ...
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Error:", error);
        throw error;
    }
};

export const getCoachFeedback = async ({ logs, stats, schedule }, apiKey) => {
    if (!apiKey) throw new Error('Geen API Key gevonden.');

    const MODEL = "google/gemini-2.0-flash-001";

    const prompt = `
    Role: Professional Volleyball Performance Coach.
    Objective: Analyze the player's nutrition for the last week against their physical stats and training schedule.
    Language: Dutch (Nederlands).
    
    Player Stats:
    - Height: ${stats.height} cm
    - Weight: ${stats.weight} kg
    
    Training Schedule (Next 7 Days):
    ${JSON.stringify(schedule, null, 2)}
    
    Nutrition Logs (Last 7 Days):
    ${JSON.stringify(logs, null, 2)}
    
    Task:
    Provide a concise 3-bullet summary in Dutch. Focus on:
    1. Caloric intake vs intensity of training.
    2. Macro balance for recovery (protein) and energy (carbs).
    3. One specific actionable tip for tomorrow.
    
    Return ONLY JSON:
    {
      "feedback": [
        "Bullet 1...",
        "Bullet 2...",
        "Bullet 3..."
      ]
    }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Volleyball App",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        if (!response.ok) throw new Error('Coach request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Coach Error:", error);
        throw error;
    }
};

export const calculateNutritionGoals = async ({ stats, schedule }, apiKey) => {
    if (!apiKey) throw new Error('Geen API Key gevonden.');

    const MODEL = "google/gemini-2.0-flash-001";

    const prompt = `
    Role: Professional Sports Nutritionist.
    Objective: Calculate optimal daily calorie and macro targets for a volleyball player.

    Player Stats:
    - Height: ${stats.height} cm
    - Weight: ${stats.weight} kg
    
    Training Schedule (Next 7 Days):
    ${JSON.stringify(schedule, null, 2)}

    Task:
    Calculate the daily average targets for:
    1. Calories (Maintenance + Activity)
    2. Protein (e.g., 1.6-2.2g per kg)
    3. Carbs (e.g., moderate to high for performance)
    4. Fat (remainder)

    Return ONLY JSON:
    {
      "calories": 2800,
      "protein": 160,
      "carbs": 350,
      "fat": 80
    }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Volleyball App",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        if (!response.ok) throw new Error('Calculation request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Nutrition Calc Error:", error);
        throw error;
    }
};
