import { GoogleGenAI } from "@google/genai";

async function callModel(base64Image, gApiKey) {
    const ai = new GoogleGenAI({ apiKey: gApiKey });

    // 1. Prepare the image part
    // NOTE: The mimeType MUST match the actual image type (jpeg, png, etc.)
    const imagePart = {
        inlineData: {
            // Remove the data URL prefix (e.g., 'data:image/jpeg;base64,')
            data: base64Image.replace(/^data:image\/\w+;base64,/, ""), 
            mimeType: "image/jpeg", // ⬅️ Ensure this matches your image type
        },
    };

    const prompt = "Estimate the total number of calories in the food shown in this image. Provide a breakdown if possible.";

    try {
        // 2. Call generateContent and get the response in a single step
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            // The contents array should be a flat list of parts (text and image)
            contents: [imagePart, { text: prompt }], 
        });

        // 3. Return the text directly from the response object
        return response.text; // ⬅️ Access the text property directly

    } catch (error) {
        console.error("🔥 Error during Gemini API call:", error);
        throw error;
    }
}

export default callModel;