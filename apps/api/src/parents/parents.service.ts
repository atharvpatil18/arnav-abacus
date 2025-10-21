import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  private async verifyParentAccess(userId: number, studentId: number): Promise<boolean> {
    const guardian = await this.prisma.guardian.findFirst({
      where: { userId, studentId },
    });
    return guardian !== null;
  }

  async getDashboard(userId: number) {
    // Find the parent's children
    const guardianships = await this.prisma.guardian.findMany({
      where: { userId },
      include: {
        student: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (guardianships.length === 0) {
      return {
        children: [],
        upcomingFees: [],
      };
    }

    // Get children with recent data
    const children = await Promise.all(
      guardianships.map(async (guardianship) => {
        const student = guardianship.student;

        // Get recent tests (last 5)
        const recentTests = await this.prisma.test.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        // Get recent attendance (last 10 days)
        const recentAttendance = await this.prisma.attendance.findMany({
          where: { studentId: student.id },
          orderBy: { date: 'desc' },
          take: 10,
        });

        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName || ''}`.trim(),
          level: student.currentLevel,
          batch: {
            id: student.batch?.id || 0,
            name: student.batch?.name || 'Not assigned',
            timeSlot: student.batch?.timeSlot || 'N/A',
          },
          recentTests: recentTests.map((test) => ({
            id: test.id,
            testName: test.testName,
            date: test.date,
            percent: test.percent,
          })),
          recentAttendance: recentAttendance.map((att) => ({
            id: att.id,
            date: att.date,
            status: att.status,
          })),
        };
      }),
    );

    // Get upcoming fees for all children
    const studentIds = guardianships.map((g) => g.student.id);
    const upcomingFees = await this.prisma.fee.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { gte: new Date() },
      },
      include: {
        student: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    return {
      children,
      upcomingFees: upcomingFees.map((fee) => ({
        id: fee.id,
        amount: fee.amount,
        dueDate: fee.dueDate,
        status: fee.status,
        studentName: `${fee.student.firstName} ${fee.student.lastName || ''}`.trim(),
      })),
    };
  }

  async getChildren(userId: number) {
    const guardianships = await this.prisma.guardian.findMany({
      where: { userId },
      include: {
        student: {
          include: {
            batch: true,
          },
        },
      },
    });

    return guardianships.map((guardianship) => ({
      id: guardianship.student.id,
      name: `${guardianship.student.firstName} ${guardianship.student.lastName || ''}`.trim(),
      email: guardianship.student.email,
      phone: guardianship.student.parentPhone,
      dateOfBirth: guardianship.student.dob,
      level: guardianship.student.currentLevel,
      batch: guardianship.student.batch?.name || 'Not assigned',
      status: guardianship.student.status,
      photo: guardianship.student.photoUrl,
    }));
  }

  async getStudentProfile(studentId: number, userId: number) {
    const hasAccess = await this.verifyParentAccess(userId, studentId);
    if (!hasAccess) {
      throw new UnauthorizedException('Access denied to this student');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: true,
        guardians: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }
}
