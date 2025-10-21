import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalStudents,
      activeBatches,
      attendanceStats,
      feesDue
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.batch.count(),
      this.getOverallAttendance(),
      this.getTotalFeesDue()
    ]);

    return {
      totalStudents,
      activeBatches,
      attendancePercentOverall: attendanceStats.overallPercent,
      feesDue
    };
  }

  async getStudentLevelSummary(studentId: number) {
    const tests = await this.prisma.test.findMany({
      where: { studentId },
      include: {
        batch: {
          include: {
            level: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const levelSummaries = new Map();

    tests.forEach(test => {
      if (!levelSummaries.has(test.level)) {
        levelSummaries.set(test.level, {
          level: test.level,
          totalPercent: 0,
          testsCount: 0,
          lastTestDate: test.date
        });
      }

      const summary = levelSummaries.get(test.level);
      summary.totalPercent += test.percent;
      summary.testsCount++;
    });

    return Array.from(levelSummaries.values()).map(summary => ({
      ...summary,
      avgPercent: summary.totalPercent / summary.testsCount
    }));
  }

  async getBatchAttendance(batchId: number, fromDate?: Date, toDate?: Date) {
    const where: any = { batchId };
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = fromDate;
      if (toDate) where.date.lte = toDate;
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const studentStats = new Map();

    attendances.forEach(record => {
      if (!studentStats.has(record.studentId)) {
        studentStats.set(record.studentId, {
          studentId: record.studentId,
          studentName: `${record.student.firstName} ${record.student.lastName}`,
          totalClasses: 0,
          presentCount: 0
        });
      }

      const stats = studentStats.get(record.studentId);
      stats.totalClasses++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        stats.presentCount++;
      }
    });

    return Array.from(studentStats.values()).map(stats => ({
      ...stats,
      presentPercent: (stats.presentCount / stats.totalClasses) * 100
    }));
  }

  private async getOverallAttendance() {
    const attendances = await this.prisma.attendance.findMany({
      select: {
        status: true
      }
    });

    const totalClasses = attendances.length;
    if (totalClasses === 0) {
      return { overallPercent: 0 };
    }

    const presentCount = attendances.filter(
      a => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;

    return {
      overallPercent: (presentCount / totalClasses) * 100
    };
  }

  private async getTotalFeesDue() {
    const fees = await this.prisma.fee.aggregate({
      _sum: {
        amount: true,
        paidAmount: true
      }
    });

    const totalAmount = fees._sum.amount || 0;
    const totalPaid = fees._sum.paidAmount || 0;
    
    return totalAmount - totalPaid;
  }
}