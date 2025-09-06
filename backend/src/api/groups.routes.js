const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadToDisk } = require('../middleware/upload.middleware'); // Corrected import
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
    const groups = await prisma.group.findMany();
    res.json(groups);
});

router.get('/:id/posts', authMiddleware, async (req, res) => {
    const posts = await prisma.post.findMany({
        where: { groupId: req.params.id },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
});

router.post('/:id/posts', authMiddleware, uploadToDisk.single('image'), async (req, res) => { // Corrected usage
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await prisma.post.create({
        data: {
            content,
            imageUrl,
            authorId: req.user.userId,
            groupId: req.params.id,
        },
    });
    res.status(201).json(post);
});

module.exports = router;