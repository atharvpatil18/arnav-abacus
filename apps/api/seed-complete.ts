import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Setting up complete test environment...\n');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('password123', 10);
  const parentPassword = await bcrypt.hash('password123', 10);

  // Create/Update admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arnavabacus.com' },
    update: {},
    create: {
      email: 'admin@arnavabacus.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phoneNumber: '+1234567890',
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin user ready');

  // Create/Update teacher user with Teacher record
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@arnavabacus.com' },
    update: {},
    create: {
      email: 'teacher@arnavabacus.com',
      password: teacherPassword,
      name: 'Test Teacher',
      role: 'TEACHER',
      phoneNumber: '+1234567891',
      isEmailVerified: true,
    },
  });

  // Create Teacher record if it doesn't exist
  const existingTeacher = await prisma.teacher.findUnique({
    where: { userId: teacherUser.id },
  });

  if (!existingTeacher) {
    await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
      },
    });
    console.log('✅ Teacher user and Teacher record created');
  } else {
    console.log('✅ Teacher user and Teacher record ready');
  }

  // Create/Update parent user
  const parent = await prisma.user.upsert({
    where: { email: 'parent@arnavabacus.com' },
    update: {},
    create: {
      email: 'parent@arnavabacus.com',
      password: parentPassword,
      name: 'Test Parent',
      role: 'PARENT',
      phoneNumber: '+1234567892',
      isEmailVerified: true,
    },
  });
  console.log('✅ Parent user ready');

  // Create a sample level if none exists
  const level = await prisma.level.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Level 1',
      description: 'Beginner level',
      passingPercent: 70,
    },
  });
  console.log('✅ Sample level created');

  // Get the teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherUser.id },
  });

  // Create a sample batch
  const batch = await prisma.batch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Morning Batch A',
      levelId: level.id,
      teacherId: teacher!.id,
      dayMask: 127, // Binary 1111111 = all days
      timeSlot: '09:00-10:00',
      capacity: 20,
    },
  });
  console.log('✅ Sample batch created');

  // Create sample students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.student.upsert({
      where: { email: `student${i}@test.com` },
      update: {},
      create: {
        firstName: `Student`,
        lastName: `${i}`,
        email: `student${i}@test.com`,
        parentName: `Parent ${i}`,
        parentPhone: `+123456789${i}`,
        joiningDate: new Date(),
        currentLevel: 1,
        batchId: batch.id,
        status: 'ACTIVE',
      },
    });
    students.push(student);
  }
  console.log(`✅ Created ${students.length} sample students`);

  console.log('\n═══════════════════════════════════════');
  console.log('🎉 Test Environment Setup Complete!');
  console.log('═══════════════════════════════════════\n');
  
  console.log('📋 Test User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 Admin:');
  console.log('   Email: admin@arnavabacus.com');
  console.log('   Password: admin123\n');
  console.log('👨‍🏫 Teacher:');
  console.log('   Email: teacher@arnavabacus.com');
  console.log('   Password: password123\n');
  console.log('👨‍👩‍👧‍👦 Parent:');
  console.log('   Email: parent@arnavabacus.com');
  console.log('   Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 Sample Data Created:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('• 1 Level (Level 1)');
  console.log('• 1 Batch (Morning Batch A)');
  console.log('• 5 Students');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error setting up test environment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
