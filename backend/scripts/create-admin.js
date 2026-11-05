#!/usr/bin/env node
/**
 * Create (or refresh) the platform administrator account.
 *
 * Administrator accounts cannot be created through the public API by design,
 * so deployments need a deliberate, out-of-band way to bootstrap one.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='strong-secret' \
 *   DATABASE_URL='postgresql://...' node scripts/create-admin.js
 *
 * Idempotent: an existing account with the same email has its password, role
 * and status updated instead of being duplicated. The password is never
 * printed.
 */

require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = process.env.ADMIN_NAME || 'Platform Administrator';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMINISTRATOR', status: 'ACTIVE' },
    create: { email, name, passwordHash, role: 'ADMINISTRATOR', status: 'ACTIVE' },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  console.log(`Administrator ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    console.error('Failed to create administrator:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
