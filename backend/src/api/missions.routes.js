const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadToDisk } = require('../middleware/upload.middleware');
const prisma = require('../prismaClient');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const allMissions = await prisma.mission.findMany();
        const userMissions = await prisma.userMission.findMany({
            where: { userId }
        });

        const userMissionMap = new Map(userMissions.map(um => [um.missionId, um]));

        const missionsWithStatus = allMissions.map(mission => ({
            ...mission,
            status: userMissionMap.has(mission.id) ? userMissionMap.get(mission.id).status : 'AVAILABLE',
        }));
        
        res.json(missionsWithStatus);
    } catch (error) {
        console.error("Failed to get missions:", error);
        res.status(500).json({ error: "Could not retrieve missions." });
    }
});

router.post('/:id/complete', authMiddleware, uploadToDisk.single('proof'), async (req, res) => {
    const userId = req.user.userId;
    const missionId = req.params.id;
    const proofUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!proofUrl) {
        return res.status(400).json({ error: 'Proof of work (photo) is required.' });
    }

    try {
        const mission = await prisma.mission.findUnique({ where: { id: missionId } });
        if (!mission) {
            return res.status(404).json({ error: 'Mission not found.' });
        }

        const [, updatedUser] = await prisma.$transaction([
            prisma.userMission.upsert({
                where: { userId_missionId: { userId, missionId } },
                update: { status: 'COMPLETED', completedAt: new Date(), proofUrl },
                create: { userId, missionId, status: 'COMPLETED', completedAt: new Date(), proofUrl },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    sustainabilityScore: { increment: mission.sustainabilityPoints },
                    carbonCreditScore: { increment: mission.carbonCreditPoints },
                    digitalTrustScore: { increment: mission.trustPoints }, // Add trust points
                }
            })
        ]);
        
        res.json({ message: 'Mission completed!', newScore: updatedUser.sustainabilityScore });

    } catch (error) {
        console.error("Failed to complete mission:", error);
        res.status(500).json({ error: "Could not complete mission." });
    }
});

module.exports = router;