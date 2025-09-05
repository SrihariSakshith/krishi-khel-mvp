const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.middleware');
const weatherService = require('../services/weather.service');
const router = express.Router();
const prisma = new PrismaClient();

// Get user dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true, sustainabilityScore: true, streak: true, location: true },
    });
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const weather = await weatherService.getWeather(user.location);

    // Fetch user's badges
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