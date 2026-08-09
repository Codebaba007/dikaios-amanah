const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'admin@dikaios.edu';
  const password = 'adminpassword123';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email,
        passwordHash,
        role: 'ADMINISTRATOR'
      }
    });

    console.log(`Successfully created ADMINISTRATOR account:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
