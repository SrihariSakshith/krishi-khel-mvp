const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const prisma = require('../prismaClient'); // UPDATED LINE
const router = express.Router();

// Get comments for a post
router.get('/:id/comments', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
        where: { postId: id },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
});

// Add a comment to a post
router.post('/:id/comments', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.create({
        data: {
            content,
            postId: id,
            authorId: req.user.userId,
        },
        include: { author: { select: { name: true } } },
    });
    res.status(201).json(comment);
});

// Update a post
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const post = await prisma.post.findUnique({ where: { id } });

    if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: "You can only edit your own posts." });
    }

    const updatedPost = await prisma.post.update({
        where: { id },
        data: { content },
    });
    res.json(updatedPost);
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: "You can only delete your own posts." });
    }

    await prisma.post.delete({ where: { id } });
    res.status(204).send();
});

// Add/Update emoji reaction
router.post('/:id/react', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({ where: { id } });
    const currentEmoji = (post.emoji || {});
    
    if (!currentEmoji[emoji]) {
        currentEmoji[emoji] = [];
    }
    
    if (currentEmoji[emoji].includes(userId)) {
        currentEmoji[emoji] = currentEmoji[emoji].filter(uid => uid !== userId);
    } else {
        currentEmoji[emoji].push(userId);
    }

    const updatedPost = await prisma.post.update({
        where: { id },
        data: { emoji: currentEmoji },
    });

    res.json(updatedPost);
});

module.exports = router;