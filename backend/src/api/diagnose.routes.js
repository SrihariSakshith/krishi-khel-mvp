const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require('../middleware/auth.middleware');
const { uploadToMemory } = require('../middleware/upload.middleware');
const router = express.Router();

// Initialize Gemini with the API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert image buffer to Gemini's format
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

router.post('/pest', authMiddleware, uploadToMemory.single('plantImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
    }
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_google_gemini_api_key_here") {
        return res.status(500).json({ error: 'AI service is not configured.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);

        const prompt = `
            You are an expert plant pathologist specializing in sustainable and organic farming in India.
            Analyze the attached image of a plant leaf.
            Identify the most likely disease or state if it appears healthy.
            Estimate your confidence level as a percentage.
            Provide a concise, actionable, and organic/sustainable solution.
            You must respond ONLY with a valid JSON object in the following format, with no other text before or after it:
            {
              "disease": "Name of the disease (e.g., 'Tomato - Late Blight')",
              "confidence": "Your confidence percentage (e.g., '95.2%')",
              "solution": "Your recommended organic solution."
            }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        // Clean up the response to ensure it's valid JSON
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the JSON response from Gemini
        const diagnosis = JSON.parse(text);
        
        res.json(diagnosis);

    } catch (error) {
        console.error("Gemini Vision API Error:", error);
        res.status(500).json({ error: 'AI diagnosis failed. Please check the image and try again.' });
    }
});

module.exports = router;