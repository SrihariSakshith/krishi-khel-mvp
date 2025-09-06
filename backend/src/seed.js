const prisma = require('./prismaClient'); // UPDATED LINE

async function seedDatabase() {
  console.log("Checking if seeding is needed...");

  // We no longer seed generic crops. Farmers will add their own.
  
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

  if (await prisma.mission.count() === 0) {
    await prisma.mission.createMany({
      data: [
        { title: 'Start a Compost Pit', description: 'Convert farm waste into valuable organic manure. Upload a photo of your new compost pit.', sustainabilityPoints: 100, carbonCreditPoints: 5.5 },
        { title: 'Apply Bio-Pesticides', description: 'Switch from chemical to organic pesticides for one crop cycle. Upload a photo of your bio-pesticide solution.', sustainabilityPoints: 75, carbonCreditPoints: 2.0 },
        { title: 'Use Mulching', description: 'Cover your soil with organic mulch to conserve water and improve soil health. Upload a photo.', sustainabilityPoints: 50, carbonCreditPoints: 3.2 },
      ]
    });
    console.log('Missions seeded.');
  }

  console.log("Seeding check complete.");
}

module.exports = { seedDatabase };