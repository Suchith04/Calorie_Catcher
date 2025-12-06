import { GoogleGenAI } from "@google/genai";

async function callModel(base64Image, gApiKey) {
    const ai = new GoogleGenAI({ apiKey: gApiKey });

    const imagePart = {
        inlineData: {
            data: base64Image.replace(/^data:image\/\w+;base64,/, ""), 
            mimeType: "image/jpeg",
        },
    };

    // Enhanced prompt requesting JSON output
    const prompt = `Analyze this food image and provide a detailed nutritional breakdown.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no additional text.

Return this exact JSON structure:
{
  "totalCalories": <number>,
  "foodItems": [
    {
      "name": "<string>",
      "portion": "<string>",
      "calories": <number>
    }
  ],
  "macronutrients": {
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fats": <number in grams>
  },
  "healthNotes": "<string>",
  "confidence": "<High|Medium|Low>"
}

Example:
{
  "totalCalories": 845,
  "foodItems": [
    {"name": "Whole Wheat Chapatis", "portion": "3 medium pieces (90g)", "calories": 285},
    {"name": "Jeera Rice", "portion": "1 cup (180g)", "calories": 210},
    {"name": "Dal (Lentil Curry)", "portion": "0.5 cup (120ml)", "calories": 120}
  ],
  "macronutrients": {
    "protein": 24,
    "carbs": 137,
    "fats": 23
  },
  "healthNotes": "This is a balanced Indian meal with good protein from dal and fiber from whole wheat chapatis. Consider adding more vegetables and reducing white rice for better nutrition.",
  "confidence": "High"
}

Be as accurate as possible. If you cannot identify the food clearly, set confidence to "Low".
REMEMBER: Return ONLY the JSON object, nothing else.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [imagePart, { text: prompt }], 
        });

        // const response = await mockGeminiResponse(); 

        let analysisText = response.text.trim();
        // let analysisText =response.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||"";


        // Remove markdown code blocks if present
        analysisText = analysisText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        
        // Parse JSON
        let parsedData;
        try {
            parsedData = JSON.parse(analysisText);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            console.error("Raw Response:", analysisText);
            
            // Fallback: Try to extract JSON from text
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not parse AI response as JSON");
            }
        }

        // Validate and normalize the parsed data
        const structured = {
            totalCalories: parsedData.totalCalories || 0,
            foodItems: Array.isArray(parsedData.foodItems) 
                ? parsedData.foodItems.map(item => ({
                    name: item.name || 'Unknown',
                    portion: item.portion || 'Unknown',
                    calories: item.calories || 0
                  }))
                : [],
            macronutrients: {
                protein: parsedData.macronutrients?.protein || 0,
                carbs: parsedData.macronutrients?.carbs || 0,
                fats: parsedData.macronutrients?.fats || 0
            },
            healthNotes: parsedData.healthNotes || '',
            confidence: parsedData.confidence || 'Medium'
        };

        // Create human-readable analysis text for storage
        const fullAnalysis = formatAnalysisText(structured);

        return {
            fullAnalysis,
            structured
        };

    } catch (error) {
        console.error("🔥 Error during Gemini API call:", error);
        throw error;
    }
}

async function mockGeminiResponse() {
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: `{
  "totalCalories": 780,
  "foodItems": [
    {
      "name": "Cooked Wheat Noodles",
      "portion": "250g (large serving)",
      "calories": 350
    },
    {
      "name": "Mixed Vegetables (Tomato, Bell Pepper, Onion)",
      "portion": "100g",
      "calories": 40
    },
    {
      "name": "Cooking Oil (Vegetable/Canola)",
      "portion": "2.5 tbsp (37.5ml)",
      "calories": 300
    },
    {
      "name": "Stir-fry Sauce (Soy sauce, Oyster sauce, Sugar, Thickener)",
      "portion": "60g",
      "calories": 90
    }
  ],
  "macronutrients": {
    "protein": 15,
    "carbs": 98,
    "fats": 40
  },
  "healthNotes": "This is a substantial meal...",
  "confidence": "Medium"
}`
            }
          ],
          role: "model"
        },
        finishReason: "STOP",
        index: 0
      }
    ],
    modelVersion: "gemini-2.5-flash"
  };
}


/**
 * Format structured data into human-readable text
 */
function formatAnalysisText(data) {
    let text = `Total Calories: ${data.totalCalories} kcal\n\n`;
    
    text += `**Food Items Identified:**\n`;
    data.foodItems.forEach(item => {
        text += `- ${item.name} (${item.portion}): ${item.calories} kcal\n`;
    });
    
    text += `\n**Macronutrients:**\n`;
    text += `- Protein: ${data.macronutrients.protein}g\n`;
    text += `- Carbohydrates: ${data.macronutrients.carbs}g\n`;
    text += `- Fats: ${data.macronutrients.fats}g\n`;
    
    if (data.healthNotes) {
        text += `\n**Health Notes:**\n${data.healthNotes}\n`;
    }
    
    text += `\n**Confidence Level:** ${data.confidence}`;
    
    return text;
}

export default callModel;