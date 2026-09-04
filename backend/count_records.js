const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
Promise.all([
  prisma.campaign.count(),
  prisma.business.count(),
  prisma.user.findFirst({ where: { role: 'BUSINESS_OWNER' } })
]).then(console.log).finally(() => prisma.$disconnect());
