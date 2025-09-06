const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadToMemory } = require('../middleware/upload.middleware'); // Corrected import
const router = express.Router();

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/spr-mahe/plant-disease";
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

const organicSolutions = {
    'potato___early_blight': 'Apply a copper-based fungicide or a bio-fungicide containing Bacillus subtilis. Ensure good air circulation and avoid overhead watering.',
    'potato___late_blight': 'Remove and destroy infected plants immediately. Apply copper-based fungicides preventively. Ensure well-drained soil.',
    'potato___healthy': 'Your plant looks healthy! Keep up the good work with proper watering, soil nutrition, and regular monitoring.',
    'tomato___bacterial_spot': 'Use copper-based sprays. Avoid working with plants when they are wet. Remove infected plant parts.',
    'tomato___late_blight': 'Very difficult to control. Remove infected plants. Use preventative bio-fungicides and ensure good air flow.',
    'tomato___healthy': 'Your plant looks healthy! Ensure consistent watering and good air circulation to prevent future diseases.',
    'default': 'Practice crop rotation, ensure good soil health with compost, and remove any affected leaves to prevent spread. A neem oil spray can be effective against many common pests and fungi.'
};

router.post('/pest', authMiddleware, uploadToMemory.single('plantImage'), async (req, res) => { // Corrected usage
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
    }
    if (!HUGGING_FACE_TOKEN || HUGGING_FACE_TOKEN === "your_hugging_face_api_token_here") {
        console.error("Hugging Face API token is missing or is the default value.");
        return res.status(500).json({ error: 'AI service is not configured.' });
    }

    try {
        const response = await axios.post(HUGGING_FACE_API_URL, req.file.buffer, {
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
                'Content-Type': req.file.mimetype,
            },
        });

        const diagnosis = response.data;
        if (diagnosis && diagnosis.length > 0) {
            const topResult = diagnosis[0];
            const solutionKey = topResult.label.toLowerCase();
            const solution = organicSolutions[solutionKey] || organicSolutions['default'];
            
            res.json({
                disease: topResult.label.replace(/__/g, ' - ').replace(/_/g, ' '),
                confidence: (topResult.score * 100).toFixed(2) + '%',
                solution: solution
            });
        } else {
            res.status(404).json({ error: 'Could not identify the disease.' });
        }

    } catch (error) {
        console.error("Hugging Face API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'AI diagnosis failed. The model may be loading, please try again in a minute.' });
    }
});

module.exports = router;