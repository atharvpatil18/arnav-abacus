import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReferralDto, UpdateReferralDto } from './referrals.dto';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  // Normalize phone number by stripping non-digits
  private canonicalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

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
        source: data.referralSource || data.source,
        referralSource: data.referralSource,
        referredBy: data.referredBy,
        referredByPhone: data.referredByPhone,
        referralCode: data.referralCode,
        referralDate: data.referralDate ? new Date(data.referralDate) : new Date(),
        conversionDate: data.conversionDate ? new Date(data.conversionDate) : null,
        notes: data.notes,
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
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPhone(phone: string) {
    // Canonicalize the search term
    const canonical = this.canonicalizePhone(phone);

    // Get all referrals with phone numbers
    const allReferrals = await this.prisma.referralTracking.findMany({
      where: {
        referredByPhone: {
          not: null,
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
    });

    // Filter by canonicalized phone numbers
    return allReferrals.filter((referral) => {
      if (!referral.referredByPhone) return false;
      const dbCanonical = this.canonicalizePhone(referral.referredByPhone);
      return dbCanonical.includes(canonical);
    });
  }

  async findBySource(source: string) {
    return this.prisma.referralTracking.findMany({
      where: {
        source: source,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const total = await this.prisma.referralTracking.count();

    const bySource = await this.prisma.referralTracking.groupBy({
      by: ['source'],
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
        source: data.referralSource || data.source,
        referralSource: data.referralSource,
        referredBy: data.referredBy,
        referredByPhone: data.referredByPhone,
        referralCode: data.referralCode,
        notes: data.notes,
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
