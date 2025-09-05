const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This job runs every day at midnight.
const checkUserStreaks = async () => {
    console.log('Running daily job: Checking user streaks...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Find users who haven't logged in since yesterday and reset their streak
    const usersToReset = await prisma.user.findMany({
        where: {
            lastLogin: {
                lt: yesterday,
            },
            streak: {
                gt: 0,
            },
        },
    });

    for (const user of usersToReset) {
        await prisma.user.update({
            where: { id: user.id },
            data: { streak: 0 },
        });
        console.log(`Reset streak for user ${user.name}`);
    }
};

const startDailyJobs = () => {
    // Schedule to run at 00:01 AM every day
    cron.schedule('1 0 * * *', checkUserStreaks);
};

module.exports = { startDailyJobs };