const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient');
const router = express.Router();

// Get all available crops (generic list)
router.get('/crops', authMiddleware, async (req, res) => {
    const crops = await prisma.crop.findMany();
    res.json(crops);
});

// Get user's saved farm plan
router.get('/my-plan', authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    res.json(user.farmPlan || { grid: null, totalAcres: user.farmSize });
});

// Save user's farm plan
router.post('/my-plan', authMiddleware, async (req, res) => {
    const { farmPlan } = req.body;
    const userId = req.user.userId;
    
    await prisma.user.update({
        where: { id: userId },
        data: { farmPlan },
    });
    res.status(200).json({ message: 'Plan saved successfully' });
});

// Analyze a given plan
router.post('/analyze', authMiddleware, async (req, res) => {
    const { plots } = req.body; // plots is now an array like [{ cropId: '...', area: 2.5 }, ...]
    
    let totalInvestment = 0;
    let totalRevenue = 0;
    
    const allCrops = await prisma.crop.findMany();
    const cropDataMap = new Map(allCrops.map(c => [c.id, c]));

    for (const plot of plots) {
        const cropData = cropDataMap.get(plot.cropId);
        if (cropData) {
            totalInvestment += plot.area * cropData.investmentPerAcre;
            totalRevenue += plot.area * cropData.revenuePerAcre;
        }
    }
    
    const totalProfit = totalRevenue - totalInvestment;

    res.json({ totalInvestment, totalRevenue, totalProfit });
});

module.exports = router;