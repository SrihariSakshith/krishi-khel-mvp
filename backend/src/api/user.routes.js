const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const weatherService = require('../services/weather.service');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true, sustainabilityScore: true, carbonCreditScore: true, streak: true, location: true },
    });
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const weather = await weatherService.getWeather(user.location);

    const userBadges = await prisma.userBadge.findMany({
        where: { userId: req.user.userId },
        include: { badge: true }
    });
    const badges = userBadges.map(ub => ub.badge);

    res.json({ user, weather, badges });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

module.exports = router;