const express = require('express');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { name: true, phone: true, location: true, farmSize: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch profile." });
    }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
    const { name, location, farmSize } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                name,
                location,
                farmSize: parseFloat(farmSize),
            },
        });
        res.json({ message: "Profile updated successfully.", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Could not update profile." });
    }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect current password." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword },
        });
        res.json({ message: "Password changed successfully." });
    } catch (error) {
        res.status(500).json({ error: "Could not change password." });
    }
});

module.exports = router;