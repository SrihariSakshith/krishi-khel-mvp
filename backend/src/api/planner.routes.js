const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();
const prisma = new PrismaClient();

async function awardBadge(userId, badgeName) {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (badge) {
        await prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
            update: {},
            create: { userId, badgeId: badge.id },
        });
        console.log(`Awarded '${badgeName}' badge to user ${userId}`);
    }
}

router.get('/crops', authMiddleware, async (req, res) => {
    const crops = await prisma.crop.findMany();
    res.json(crops);
});

router.get('/my-plan', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        // --- THIS IS THE FIX ---
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        // --- END OF FIX ---

        res.json(user.farmPlan || { plots: [], totalAcres: user.farmSize });
    } catch (error) {
        console.error("Error fetching farm plan:", error);
        res.status(500).json({ error: "Could not fetch farm plan." });
    }
});

router.post('/my-plan', authMiddleware, async (req, res) => {
    const { farmPlan } = req.body;
    const userId = req.user.userId;
    
    await prisma.user.update({
        where: { id: userId },
        data: { farmPlan },
    });

    await awardBadge(userId, 'Farm Planner');

    res.status(200).json({ message: 'Plan saved successfully' });
});

router.post('/analyze', authMiddleware, async (req, res) => {
    const { plots } = req.body;
    const crops = await prisma.crop.findMany();
    const cropMap = new Map(crops.map(c => [c.name, c]));

    let totalProfit = 0;
    let totalCost = 0;
    let totalLandUsed = 0;
    let tips = [];

    for (const plot of plots) {
        if (plot.area > 0) {
            const crop = cropMap.get(plot.crop);
            if (crop) {
                const revenue = plot.area * crop.avgYieldPerAcre * crop.avgMarketPricePerUnit;
                const cost = plot.area * crop.avgInputCostPerAcre;
                totalProfit += revenue - cost;
                totalCost += cost;
                totalLandUsed += plot.area;
            }
        }
    }
    
    if (plots.length === 1 && totalLandUsed > 1) {
        tips.push('Monocropping can deplete soil nutrients. Consider adding a secondary crop for better soil health and risk diversification.');
    }
    if (totalLandUsed > 0 && plots.length > 1) {
        tips.push('Excellent use of mixed cropping! This improves soil health and resilience.');
    }

    res.json({ totalProfit, totalCost, totalLandUsed, tips });
});

module.exports = router;