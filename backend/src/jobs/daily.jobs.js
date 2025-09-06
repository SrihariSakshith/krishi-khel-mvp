const cron = require('node-cron');
const prisma = require('../prismaClient'); // UPDATED LINE

const checkUserStreaks = async () => {
    console.log('Running daily job: Checking user streaks...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Normalize to start of yesterday
    
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
    cron.schedule('1 0 * * *', checkUserStreaks); // Runs at 00:01 AM every day
};

module.exports = { startDailyJobs };