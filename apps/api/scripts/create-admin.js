// Creates an admin user directly using Prisma client. Run with:
// node apps/api/scripts/create-admin.js

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/../../.env' });

async function main() {
  const prisma = new PrismaClient();
  const email = 'admin@arnav-abacus.com';
  const password = 'admin123';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin already exists:', { id: existing.id, email: existing.email });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: 'Administrator',
        role: 'ADMIN',
        phoneNumber: null,
      },
    });

    console.log('Created admin user:', { id: user.id, email: user.email });
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exitCode = 1;
  } finally {
    try { await prisma.$disconnect(); } catch {};
  }
}

main();
