const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadToDisk } = require('../middleware/upload.middleware');
const prisma = require('../prismaClient');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    const groups = await prisma.group.findMany();
    res.json(groups);
});

router.get('/:id/posts', authMiddleware, async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { groupId: req.params.id },
            include: {
                author: { select: { name: true } },
                comments: {
                    include: {
                        author: { select: { name: true } }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Could not fetch posts." });
    }
});

// THIS IS THE CORRECTED ROUTE
router.post('/:id/posts', authMiddleware, uploadToDisk.single('image'), async (req, res) => {
    const { content } = req.body;
    const groupId = req.params.id;
    const authorId = req.user.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    try {
        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId,
                groupId,
            },
        });
        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: 'Could not create post.' });
    }
});


module.exports = router;