import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arnavabacus.com' },
    update: {},
    create: {
      email: 'admin@arnavabacus.com',
      password: hashedPassword,
      name: 'Admin User',
      phoneNumber: '+1234567890',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  console.log('Default admin user created:', admin.email);
  console.log('Password: admin123');
  console.log('Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });