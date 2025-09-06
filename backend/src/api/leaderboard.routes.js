const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const nationalLeaderboard = await prisma.user.findMany({
            take: 10,
            orderBy: {
                sustainabilityScore: 'desc',
            },
            select: {
                id: true,
                name: true,
                location: true,
                sustainabilityScore: true,
            }
        });
        
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { location: true }
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found to determine district.' });
        }

        const districtLeaderboard = await prisma.user.findMany({
            where: {
                location: currentUser.location,
            },
            take: 10,
            orderBy: {
                sustainabilityScore: 'desc',
            },
            select: {
                id: true,
                name: true,
                location: true,
                sustainabilityScore: true,
            }
        });

        res.json({ national: nationalLeaderboard, district: districtLeaderboard });

    } catch (error) {
        console.error("Failed to fetch leaderboards:", error);
        res.status(500).json({ error: "Could not retrieve leaderboards." });
    }
});

module.exports = router;