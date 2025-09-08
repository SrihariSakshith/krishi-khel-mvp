const prisma = require('./prismaClient');

async function seedDatabase() {
  console.log("Checking if seeding is needed...");

  if (await prisma.crop.count() === 0) {
    await prisma.crop.createMany({
      data: [
        { name: 'Rice (Paddy)', investmentPerAcre: 22000, revenuePerAcre: 50000 },
        { name: 'Banana', investmentPerAcre: 50000, revenuePerAcre: 135000 },
        { name: 'Coconut', investmentPerAcre: 25000, revenuePerAcre: 48000 },
        { name: 'Ginger', investmentPerAcre: 120000, revenuePerAcre: 640000 },
        { name: 'Turmeric', investmentPerAcre: 90000, revenuePerAcre: 700000 },
        { name: 'Tapioca', investmentPerAcre: 35000, revenuePerAcre: 75000 },
      ],
    });
    console.log('Crop data seeded.');
  }

  if (await prisma.badge.count() === 0) {
    await prisma.badge.createMany({
      data: [
        { name: 'Farm Planner', description: 'Created your first optimized farm plan!', iconUrl: '🗺️' },
        { name: 'Soil Saviour', description: 'Completed your first soil health mission.', iconUrl: '🌱' },
        { name: 'Community Pillar', description: 'Made 5 helpful posts in the community.', iconUrl: '🧑‍🤝‍🧑' },
      ]
    });
    console.log('Badge data seeded.');
  }
  
  if (await prisma.group.count() === 0) {
    await prisma.group.create({
      data: { name: 'Kerala Agri Innovators', description: 'A place for all farmers to connect and share.' },
    });
    console.log('Default group created.');
  }

  if (await prisma.mission.count() === 0) {
    await prisma.mission.createMany({
      data: [
        { title: 'Build a Compost Pit', description: 'Convert farm waste into "black gold" for your soil. Upload a photo of your new compost pit.', sustainabilityPoints: 100, carbonCreditPoints: 5.5, trustPoints: 20 },
        { title: 'Apply Bio-Pesticides', description: 'Switch from chemical to organic pesticides for one crop cycle. Upload a photo of your solution (e.g., neem oil).', sustainabilityPoints: 75, carbonCreditPoints: 2.0, trustPoints: 15 },
        { title: 'Practice Mulching', description: 'Cover soil with organic mulch to conserve water and improve health. Upload a photo of your mulched fields.', sustainabilityPoints: 50, carbonCreditPoints: 3.2, trustPoints: 10 },
        { title: 'Create a Farm Plan', description: 'Use the Smart Farm Planner to create a sustainable crop layout for your farm and save it.', sustainabilityPoints: 20, carbonCreditPoints: 0.5, trustPoints: 5 },
      ]
    });
    console.log('Missions seeded.');
  }

  console.log("Seeding check complete.");
}

module.exports = { seedDatabase };