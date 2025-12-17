
// Basic AI Service using OpenRouter
// IMPORTANT: User must set their own API key in the settings for this to work.

export const processFoodAnalysis = async ({ image, text }, apiKey) => {
    if (!apiKey) {
        throw new Error('Geen API Key gevonden. Stel deze in bij Instellingen.');
    }

    // Use a cheap, fast vision model
    const MODEL = "google/gemini-2.0-flash-001";

    let prompt = `
  Analyze this food entry for a Dutch user.
  IMPORTANT: Use standard Dutch portion sizes and nutritional values (NEVO table) for accuracy.
  - A standard slice of bread ("boterham") is approx 35g (~82 kcal).
  - Common toppings like jam, hagelslag, or cheese have specific standard portions (e.g., 15-20g).
  - Avoid overestimating: "1 boterham met kaas" is typically ~180-200 kcal, not 300+.

  Return ONLY raw JSON with this exact structure(no markdown, no backticks):
{
    "food": "Name of the food (in Dutch)",
    "quantity": "Estimated amount (e.g. 100g, 1 bowl, 2 slices)",
    "calories": 500,
    "protein": 30,
    "carbs": 50,
    "fat": 15
}
  If unsure, give your best estimate based on standard portions. Stay concise.
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

export const analyzeProgress = async ({ logs, goals }, apiKey) => {
    if (!apiKey) throw new Error('Geen API Key gevonden.');

    const MODEL = "google/gemini-2.0-flash-001";

    const prompt = `
    Role: Professional Sports Nutritionist.
    Objective: Analyze the player's nutrition data for the last 30 days.
    Language: Dutch (Nederlands).

    Goals:
    - Calories: ${goals.calories}
    - Protein: ${goals.protein}g
    - Carbs: ${goals.carbs}g
    - Fat: ${goals.fat}g

    Data Summary (Last 30 Days):
    ${JSON.stringify(logs, null, 2)}

    Task:
    Provide a friendly, motivating analysis in Dutch.
    1. **Overall Trend**: Are they hitting their goals? (Mention average calories/protein).
    2. **Consistency**: How stable is their intake?
    3. **3 Actionable Tips**: One each for Protein, Energy (Carbs), and General Health.

    Return ONLY JSON:
    {
      "summary": "Short paragraph summarizing the month...",
      "tips": [
        "Tip 1...",
        "Tip 2...",
        "Tip 3..."
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

        if (!response.ok) throw new Error('Analysis request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

export const generateMealSuggestion = async ({ remainingMacros, pantryItems }, apiKey) => {
    if (!apiKey) throw new Error('Geen API Key gevonden.');

    const MODEL = "google/gemini-2.0-flash-001";

    const prompt = `
    Role: Pragmatic nutrition logic engine.
    Task: Create a meal plan to match these remaining macros (±10%).
    
    Remaining Macros:
    - Calories: ${remainingMacros.calories}
    - Protein: ${remainingMacros.protein}g
    - Carbs: ${remainingMacros.carbs}g
    - Fat: ${remainingMacros.fat}g

    Available Pantry Ingredients (Priority 1):
    ${pantryItems.join(', ')}

    Strategy:
    1. Priority 1: Use 'Available Pantry Ingredients' provided.
    2. Priority 2: If ingredients are insufficient, fill gaps with "Easy Access" foods (generic, no-cook items like Fruit, Quark, Tuna, Protein Bar).
    
    Output Constraint: For every ingredient, add a "source" field: "pantry" (if from list) or "store" (if AI suggestion).
    
    Return ONLY JSON format:
    {
      "meal_name": "String (Creative name)",
      "ingredients": [
        {"name": "String", "amount": Number, "unit": "String", "source": "pantry|store", "id": "String|null", "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }}
      ],
      "match_score": Number (0-100)
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

        if (!response.ok) throw new Error('Suggestion request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Suggestion Error:", error);
        throw error;
    }
};


export const analyzeFuelEfficiency = async ({ trainingLog, recentNutritionLogs }, apiKey) => {
    if (!apiKey) throw new Error('Geen API Key gevonden.');

    const MODEL = "google/gemini-2.0-flash-001";

    const prompt = `
    Role: Professional Sports Nutritionist.
    Task: Correlate the user's workout performance with their nutrition history (last 24h).

    Workout Details:
    - Type: ${trainingLog.type}
    - Duration: ${trainingLog.duration} min
    - Rating: ${trainingLog.rating}/10
    - Notes: ${trainingLog.notes || 'None'}

    Nutrition (Last 24h):
    ${JSON.stringify(recentNutritionLogs.map(l => `${l.quantity} ${l.food} (${l.calories}kcal, P:${l.protein}g, C:${l.carbs}g, F:${l.fat}g)`), null, 2)}

    Analysis Goal:
    Identify ONE key nutritional factor that likely influenced this rating (positive or negative). 
    - If rating is high (>7), identify what fueled it (e.g., "Great carb timing", "Sufficient protein").
    - If rating is low (<6), identify what might be missing (e.g., "Low energy/carbs", "Heavy meal before training").

    Return ONLY JSON:
    {
      "score": "Calculated Fuel Efficiency Score (0-100 based on nutrition quality)",
      "insight": "One sentence explanation of the correlation.",
      "recommendation": "One specific tip for next time."
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

        if (!response.ok) throw new Error('Fuel analysis request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Fuel Analysis Error:", error);
        throw error;
    }
};
