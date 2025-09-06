const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("Checking if seeding is needed...");

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
  
  if (await prisma.group.count() === 0) {
    await prisma.group.create({
      data: { name: 'General Kerala Farmers', description: 'A place for all farmers to connect.' },
    });
    console.log('Default group created.');
  }

  // Seed Missions
  if (await prisma.mission.count() === 0) {
    await prisma.mission.createMany({
      data: [
        { title: 'Start a Compost Pit', description: 'Convert farm waste into valuable organic manure. Upload a photo of your new compost pit.', sustainabilityPoints: 100, carbonCreditPoints: 5.5 },
        { title: 'Apply Bio-Pesticides', description: 'Switch from chemical to organic pesticides for one crop cycle. Upload a photo of your bio-pesticide solution.', sustainabilityPoints: 75, carbonCreditPoints: 2.0 },
        { title: 'Use Mulching', description: 'Cover your soil with organic mulch to conserve water and improve soil health. Upload a photo.', sustainabilityPoints: 50, carbonCreditPoints: 3.2 },
        { title: 'Complete your Farm Plan', description: 'Use the Farm Planner tool to create a sustainable crop layout for your farm.', sustainabilityPoints: 20, carbonCreditPoints: 0.5 },
      ]
    });
    console.log('Missions seeded.');
  }

  console.log("Seeding check complete.");
}

module.exports = { seedDatabase };