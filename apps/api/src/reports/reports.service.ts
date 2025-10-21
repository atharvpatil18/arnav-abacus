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

  async getAttendanceIssues() {
    // Get students with low attendance in the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const students = await this.prisma.student.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        batch: {
          select: {
            name: true
          }
        },
        attendances: {
          where: {
            date: {
              gte: startOfMonth
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    const issues = students
      .map(student => {
        const totalClasses = student.attendances.length;
        const absences = student.attendances.filter(
          a => a.status === 'ABSENT'
        ).length;
        const lastAttendance = student.attendances.find(
          a => a.status === 'PRESENT' || a.status === 'LATE'
        );

        return {
          studentName: `${student.firstName} ${student.lastName}`,
          batchName: student.batch?.name || 'No Batch',
          absencesThisMonth: absences,
          totalClassesThisMonth: totalClasses,
          lastAttendance: lastAttendance?.date || null
        };
      })
      .filter(issue => issue.absencesThisMonth > 3) // Students with more than 3 absences
      .sort((a, b) => b.absencesThisMonth - a.absencesThisMonth);

    return issues;
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

  async getAllStudents() {
    return await this.prisma.student.findMany({
      include: {
        batch: {
          include: {
            level: true
          }
        }
      }
    });
  }

  async getAllAttendance() {
    return await this.prisma.attendance.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        batch: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 1000 // Limit to recent 1000 records
    });
  }

  async getAllFees() {
    return await this.prisma.fee.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  generateStudentsCSV(students: any[]) {
    let csv = 'ID,First Name,Last Name,Email,Phone,Batch,Level,Status\n';
    students.forEach(student => {
      csv += `${student.id},${student.firstName},${student.lastName},${student.email || 'N/A'},${student.phoneNumber || 'N/A'},${student.batch?.name || 'N/A'},${student.batch?.level?.name || 'N/A'},${student.status}\n`;
    });
    return csv;
  }

  generateAttendanceCSV(attendance: any[]) {
    let csv = 'Date,Student Name,Batch,Status\n';
    attendance.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      csv += `${date},${record.student.firstName} ${record.student.lastName},${record.batch.name},${record.status}\n`;
    });
    return csv;
  }

  generateFeesCSV(fees: any[]) {
    let csv = 'Invoice Number,Student Name,Amount,Paid Amount,Due Date,Status,Created Date\n';
    fees.forEach(fee => {
      const dueDate = new Date(fee.dueDate).toLocaleDateString();
      const createdDate = new Date(fee.createdAt).toLocaleDateString();
      csv += `${fee.invoiceNumber},${fee.student.firstName} ${fee.student.lastName},${fee.amount},${fee.paidAmount},${dueDate},${fee.status},${createdDate}\n`;
    });
    return csv;
  }
}