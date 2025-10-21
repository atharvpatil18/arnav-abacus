import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create teacher user
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@arnavabacus.com' },
    update: {},
    create: {
      email: 'teacher@arnavabacus.com',
      password: hashedPassword,
      name: 'Test Teacher',
      role: 'TEACHER',
      phoneNumber: '+1234567891',
      isEmailVerified: true,
    },
  });

  console.log('✅ Created teacher user:', teacher.email);

  // Create parent user
  const parent = await prisma.user.upsert({
    where: { email: 'parent@arnavabacus.com' },
    update: {},
    create: {
      email: 'parent@arnavabacus.com',
      password: hashedPassword,
      name: 'Test Parent',
      role: 'PARENT',
      phoneNumber: '+1234567892',
      isEmailVerified: true,
    },
  });

  console.log('✅ Created parent user:', parent.email);

  console.log('\n📋 Test User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🏫 Teacher:');
  console.log('   Email: teacher@arnavabacus.com');
  console.log('   Password: password123');
  console.log('\n👨‍👩‍👧‍👦 Parent:');
  console.log('   Email: parent@arnavabacus.com');
  console.log('   Password: password123');
  console.log('\n👨‍💼 Admin (existing):');
  console.log('   Email: admin@arnavabacus.com');
  console.log('   Password: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
