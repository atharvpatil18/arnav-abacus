import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReferralDto, UpdateReferralDto } from './referrals.dto';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReferralDto) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${data.studentId} not found`);
    }

    // Check if referral already exists for this student
    const existing = await this.prisma.referralTracking.findUnique({
      where: { studentId: data.studentId },
    });

    if (existing) {
      throw new BadRequestException('Referral tracking already exists for this student');
    }

    return this.prisma.referralTracking.create({
      data: {
        studentId: data.studentId,
        referredBy: data.referredBy,
        referredByPhone: data.referredByPhone,
        referralSource: data.referralSource,
        referralDate: data.referralDate ? new Date(data.referralDate) : new Date(),
        referralRewards: data.referralRewards,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.referralTracking.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
            status: true,
          },
        },
      },
      orderBy: { referralDate: 'desc' },
    });
  }

  async findByStudent(studentId: number) {
    return this.prisma.referralTracking.findUnique({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
            status: true,
          },
        },
      },
    });
  }

  async findByReferrer(referrerName: string) {
    return this.prisma.referralTracking.findMany({
      where: {
        referredBy: {
          contains: referrerName,
          mode: 'insensitive',
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
            status: true,
          },
        },
      },
      orderBy: { referralDate: 'desc' },
    });
  }

  async findBySource(source: string) {
    return this.prisma.referralTracking.findMany({
      where: {
        referralSource: source,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
            status: true,
          },
        },
      },
      orderBy: { referralDate: 'desc' },
    });
  }

  async getStats() {
    const total = await this.prisma.referralTracking.count();

    const bySource = await this.prisma.referralTracking.groupBy({
      by: ['referralSource'],
      _count: true,
    });

    const topReferrers = await this.prisma.referralTracking.groupBy({
      by: ['referredBy'],
      _count: true,
      orderBy: {
        _count: {
          referredBy: 'desc',
        },
      },
      take: 10,
    });

    return {
      total,
      bySource,
      topReferrers,
    };
  }

  async update(id: number, data: UpdateReferralDto) {
    const referral = await this.prisma.referralTracking.findUnique({
      where: { id },
    });

    if (!referral) {
      throw new NotFoundException(`Referral tracking with ID ${id} not found`);
    }

    return this.prisma.referralTracking.update({
      where: { id },
      data: {
        referredBy: data.referredBy,
        referredByPhone: data.referredByPhone,
        referralSource: data.referralSource,
        referralRewards: data.referralRewards,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const referral = await this.prisma.referralTracking.findUnique({
      where: { id },
    });

    if (!referral) {
      throw new NotFoundException(`Referral tracking with ID ${id} not found`);
    }

    return this.prisma.referralTracking.delete({
      where: { id },
    });
  }
}
