const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
  const { phone, password, name, location, farmSize } = req.body;
  if (!phone || !password || !name || !location || !farmSize) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phone, password: hashedPassword, name, location, farmSize: parseFloat(farmSize) },
    });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(400).json({ error: 'User with this phone number already exists.' });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'Could not register user.' });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
    if (lastLoginDate) {
        lastLoginDate.setHours(0, 0, 0, 0);
    }
    
    let newStreak = user.streak;
    if (lastLoginDate && lastLoginDate.getTime() === (today.getTime() - 86400000)) { // Yesterday
        newStreak++;
    } else if (!lastLoginDate || lastLoginDate.getTime() !== today.getTime()) {
        newStreak = 1;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), streak: newStreak }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, name: user.name });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;