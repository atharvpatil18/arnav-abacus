import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeaveRequestDto, ApproveLeaveRequestDto } from './leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeaveRequestDto) {
    return this.prisma.leaveRequest.create({
      data: {
        teacherId: dto.teacherId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        leaveType: dto.leaveType,
        reason: dto.reason,
        status: 'PENDING' as any,
      },
      include: {
        teacher: {
          include: {
            user: true,
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        teacher: {
          include: {
            user: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByTeacher(teacherId: number) {
    // Method for fetching leave requests by teacher
    return this.prisma.leaveRequest.findMany({
      where: { teacherId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findPending() {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        teacher: {
          include: {
            user: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async findOne(id: number) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: true,
          }
        }
      }
    });

    if (!leave) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leave;
  }

  async approveOrReject(dto: ApproveLeaveRequestDto) {
    return this.prisma.leaveRequest.update({
      where: { id: dto.leaveId },
      data: {
        status: dto.status,
        approvedBy: dto.approvedBy,
        approvedAt: new Date(),
      },
      include: {
        teacher: true
      }
    });
  }

  async delete(id: number) {
    return this.prisma.leaveRequest.delete({
      where: { id }
    });
  }

  async getLeaveStats(teacherId: number) {
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        teacherId,
        status: 'APPROVED'
      }
    });

    const totalDays = leaves.reduce((sum, leave) => {
      const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    return {
      totalRequests: leaves.length,
      totalDays,
      byType: {
        MEDICAL: leaves.filter(l => l.leaveType === 'MEDICAL').length,
        CASUAL: leaves.filter(l => l.leaveType === 'CASUAL').length,
        EMERGENCY: leaves.filter(l => l.leaveType === 'EMERGENCY').length,
        VACATION: leaves.filter(l => l.leaveType === 'VACATION').length
      }
    };
  }
}
