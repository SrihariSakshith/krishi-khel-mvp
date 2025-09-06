const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/query', authMiddleware, async (req, res) => {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    try {
        // Fetch user data for context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                missions: { where: { status: 'COMPLETED' }, include: { mission: true } },
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Construct a detailed context prompt for Gemini
        const completedMissions = user.missions.map(m => m.mission.title).join(', ') || 'None yet';
        const contextPrompt = `
            You are "Krishi Mitra", a friendly and encouraging AI assistant for a South Indian farmer using the Krishi Khel app. Your goal is to provide helpful, simple, and sustainable farming advice.

            User's Context:
            - Name: ${user.name}
            - Location: ${user.location}, Kerala
            - Farm Size: ${user.farmSize} acres
            - Current Sustainability Score: ${user.sustainabilityScore}
            - Completed Missions: ${completedMissions}

            Based on this context, answer the user's question in a conversational and supportive tone. If the question is about what to plant, suggest crops suitable for their location and farm size (e.g., rice, coconut, banana, spices in Kerala). If the question is about a problem, suggest an organic or sustainable solution first. Always be positive.

            User's Question: "${message}"
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "The AI assistant is currently unavailable." });
    }
});

module.exports = router;