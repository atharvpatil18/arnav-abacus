import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: number) {
    // Get teacher record
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        batches: {
          include: {
            level: true,
            _count: {
              select: { students: true },
            },
          },
        },
      },
    });

    if (!teacher) {
      return {
        batches: [],
        todayBatches: [],
        upcomingTests: [],
      };
    }

    // Get today's day of week (0 = Sunday, 6 = Saturday)
    const today = new Date().getDay();
    const dayMask = 1 << today; // Convert to bitmask

    // Filter batches for today
    const todayBatches = teacher.batches
      .filter(batch => (batch.dayMask & dayMask) !== 0)
      .map(batch => ({
        id: batch.id,
        name: batch.name,
        timeSlot: batch.timeSlot,
      }));

    // Format batches data
    const batches = teacher.batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      studentCount: batch._count.students,
      level: {
        id: batch.level.id,
        name: batch.level.name,
      },
      dayMask: batch.dayMask,
      timeSlot: batch.timeSlot,
    }));

    // Get upcoming tests (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTests = await this.prisma.test.findMany({
      where: {
        batchId: {
          in: teacher.batches.map(b => b.id),
        },
        date: {
          gte: new Date(),
          lte: nextWeek,
        },
      },
      include: {
        batch: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const formattedTests = upcomingTests.map(test => ({
      id: test.id,
      batchName: test.batch?.name || 'Unknown',
      testDate: test.date.toISOString(),
      students: test.batch?._count?.students ?? 0,
    }));

    return {
      batches,
      todayBatches,
      upcomingTests: formattedTests,
    };
  }
}
