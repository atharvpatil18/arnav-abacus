import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeaveRequestDto, ApproveLeaveRequestDto } from './leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeaveRequestDto) {
    return this.prisma.leaveRequest.create({
      data: dto,
      include: {
        student: {
          include: {
            batch: {
              include: {
                level: true
              }
            }
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        student: {
          include: {
            batch: {
              include: {
                level: true
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  async findByStudent(studentId: number) {
    return this.prisma.leaveRequest.findMany({
      where: { studentId },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  async findPending() {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        student: {
          include: {
            batch: {
              include: {
                level: true
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'asc'
      }
    });
  }

  async findOne(id: number) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            batch: {
              include: {
                level: true
              }
            }
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
        respondedAt: new Date(),
        remarks: dto.remarks
      },
      include: {
        student: true
      }
    });
  }

  async delete(id: number) {
    return this.prisma.leaveRequest.delete({
      where: { id }
    });
  }

  async getLeaveStats(studentId: number) {
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        studentId,
        status: 'APPROVED'
      }
    });

    const totalDays = leaves.reduce((sum, leave) => {
      const days = Math.ceil((leave.toDate.getTime() - leave.fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
