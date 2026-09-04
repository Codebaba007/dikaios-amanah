const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { role: 'INVESTOR' } }).then(console.log).finally(() => prisma.$disconnect());
