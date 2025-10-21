import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStudentPerformanceMetrics(studentId: number) {
    // Implementation for student performance analytics
    const tests = await this.prisma.test.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
    
    return tests;
  }

  async getBatchAttendanceStats(batchId: number) {
    // Implementation for batch attendance statistics
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { batchId },
      include: { student: true },
      orderBy: { date: 'desc' },
    });

    return attendanceRecords;
  }

  async getFeesCollection(startDate: Date, endDate: Date) {
    // Implementation for fees collection analytics
    const feesRecords = await this.prisma.fee.findMany({
      where: {
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PAID',
      },
      include: { student: true },
    });

    return feesRecords;
  }
}