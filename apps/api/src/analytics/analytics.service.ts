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

  async getMonthlyRevenue(startDate: Date, endDate: Date) {
    // Generate array of months between start and end date
    const months: string[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      months.push(current.toISOString().slice(0, 7)); // YYYY-MM format
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    // Fetch fees and expenditures for each month
    const monthlyData = await Promise.all(
      months.map(async (month) => {
        const monthStart = new Date(`${month}-01`);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Last day of month

        // Get fees (revenue) - all amounts regardless of payment status
        const fees = await this.prisma.fee.findMany({
          where: {
            dueDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const revenue = fees.reduce((sum, fee) => sum + fee.amount, 0);
        const paid = fees
          .filter(fee => fee.status === 'PAID')
          .reduce((sum, fee) => sum + fee.paidAmount, 0);
        const pending = fees
          .filter(fee => fee.status === 'PENDING')
          .reduce((sum, fee) => sum + fee.amount, 0);
        const partial = fees
          .filter(fee => fee.status === 'PARTIAL')
          .reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0);

        // Get expenditures
        const expenditures = await this.prisma.expenditure.findMany({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const expenses = expenditures.reduce((sum, exp) => sum + exp.amount, 0);
        const net = revenue - expenses;

        return {
          month,
          revenue,
          expenses,
          net,
          paid,
          pending,
          partial,
        };
      })
    );

    return monthlyData;
  }
}