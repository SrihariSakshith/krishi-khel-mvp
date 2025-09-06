const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

// --- CROP MANAGEMENT ---

router.get('/crops', authMiddleware, async (req, res) => {
    const userCrops = await prisma.userCrop.findMany({
        where: { ownerId: req.user.userId }
    });
    res.json(userCrops);
});

router.post('/crops', authMiddleware, async (req, res) => {
    const { name, investmentPerAcre, revenuePerAcre } = req.body;
    const newCrop = await prisma.userCrop.create({
        data: {
            name,
            investmentPerAcre: parseFloat(investmentPerAcre),
            revenuePerAcre: parseFloat(revenuePerAcre),
            ownerId: req.user.userId
        }
    });
    res.status(201).json(newCrop);
});

router.delete('/crops/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const crop = await prisma.userCrop.findUnique({ where: { id } });

    if (!crop || crop.ownerId !== req.user.userId) {
        return res.status(403).json({ error: "You can only delete your own crops." });
    }

    await prisma.userCrop.delete({ where: { id } });
    res.status(204).send();
});


// --- FARM PLAN MANAGEMENT ---

router.get('/my-plan', authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    res.json(user.farmPlan || { grid: null, totalAcres: user.farmSize });
});

router.post('/my-plan', authMiddleware, async (req, res) => {
    const { farmPlan } = req.body;
    const userId = req.user.userId;
    
    await prisma.user.update({
        where: { id: userId },
        data: { farmPlan },
    });
    res.status(200).json({ message: 'Plan saved successfully' });
});

router.post('/analyze', authMiddleware, async (req, res) => {
    const { plots } = req.body;
    
    let totalInvestment = 0;
    let totalRevenue = 0;
    
    const userCrops = await prisma.userCrop.findMany({
        where: { ownerId: req.user.userId }
    });
    const cropDataMap = new Map(userCrops.map(c => [c.id, c]));

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