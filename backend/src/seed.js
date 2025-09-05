const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("Checking if seeding is needed...");

  // Seed Crops
  if (await prisma.crop.count() === 0) {
    await prisma.crop.createMany({
      data: [
        { name: 'Banana', avgYieldPerAcre: 15, avgMarketPricePerUnit: 30, avgInputCostPerAcre: 50000 },
        { name: 'Tapioca', avgYieldPerAcre: 12, avgMarketPricePerUnit: 25, avgInputCostPerAcre: 35000 },
        { name: 'Rubber', avgYieldPerAcre: 0.6, avgMarketPricePerUnit: 150, avgInputCostPerAcre: 40000 },
        { name: 'Coconut', avgYieldPerAcre: 40, avgMarketPricePerUnit: 12, avgInputCostPerAcre: 25000 },
      ],
    });
    console.log('Crop data seeded.');
  }

  // Seed Badges
  if (await prisma.badge.count() === 0) {
    await prisma.badge.createMany({
      data: [
        { name: 'Farm Planner', description: 'You created your first farm plan!', iconUrl: '🗺️' },
        { name: 'First Harvest', description: 'Log your first harvest.', iconUrl: '🌾' },
        { name: 'Community Helper', description: 'Made 5 posts in the community groups.', iconUrl: '🧑‍🤝‍🧑' },
      ]
    });
    console.log('Badge data seeded.');
  }
  
  // Seed Group
  if (await prisma.group.count() === 0) {
    await prisma.group.create({
      data: { name: 'General Kerala Farmers', description: 'A place for all farmers to connect.' },
    });
    console.log('Default group created.');
  }

  console.log("Seeding check complete.");
}

module.exports = { seedDatabase };