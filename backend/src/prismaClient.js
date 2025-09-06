const { PrismaClient } = require('@prisma/client');

// This instance will be imported by all other files
const prisma = new PrismaClient();

module.exports = prisma;