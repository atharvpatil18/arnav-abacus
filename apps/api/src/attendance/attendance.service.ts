import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MarkBatchAttendanceDto } from './attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markBatchAttendance(userId: number, dto: MarkBatchAttendanceDto) {
    // Verify batch exists
    const batch = await this.prisma.batch.findUnique({
      where: { id: dto.batchId }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
    }

    // Create attendance entries for each student
    const attendanceEntries = await Promise.all(
      dto.entries.map(entry => 
        this.prisma.attendance.create({
          data: {
            studentId: entry.studentId,
            batchId: dto.batchId,
            date: dto.date,
            status: entry.status,
            note: entry.note,
            markedBy: userId,
          },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        })
      )
    );

    return attendanceEntries;
  }

  async findByStudent(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.prisma.attendance.findMany({
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
  }

  async findByBatchAndDate(batchId: number, date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        batchId,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        student: {
          firstName: 'asc'
        }
      }
    });
  }

  async getStudentAttendanceSummary(studentId: number, fromDate?: Date, toDate?: Date) {
    const where: any = { studentId };

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = fromDate;
      if (toDate) where.date.lte = toDate;
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      select: {
        status: true
      }
    });

    if (attendances.length === 0) {
      return {
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendancePercent: 0,
      };
    }

    const summary = attendances.reduce((acc, curr) => {
      switch (curr.status) {
        case AttendanceStatus.PRESENT:
          acc.presentCount++;
          break;
        case AttendanceStatus.ABSENT:
          acc.absentCount++;
          break;
        case AttendanceStatus.LATE:
          acc.lateCount++;
          break;
        case AttendanceStatus.EXCUSED:
          acc.excusedCount++;
          break;
      }
      return acc;
    }, {
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
    });

    const totalClasses = attendances.length;
    const effectivePresent = summary.presentCount + summary.lateCount + (summary.excusedCount * 0.5);
    const attendancePercent = (effectivePresent / totalClasses) * 100;

    return {
      totalClasses,
      ...summary,
      attendancePercent,
    };
  }
}