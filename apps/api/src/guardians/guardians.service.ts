import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGuardianDto, UpdateGuardianDto } from './guardians.dto';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGuardianDto) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${data.studentId} not found`);
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }

    // Check if this user is already a guardian for this student
    const existing = await this.prisma.guardian.findFirst({
      where: {
        userId: data.userId,
        studentId: data.studentId,
      },
    });

    if (existing) {
      throw new BadRequestException('This user is already a guardian for this student');
    }

    return this.prisma.guardian.create({
      data: {
        userId: data.userId,
        studentId: data.studentId,
        relationship: data.relationship,
        isPrimary: data.isPrimary ?? false,
        canPickup: data.canPickup ?? true,
        emergencyContact: data.emergencyContact ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
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

  async findAll() {
    return this.prisma.guardian.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
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

  async findByStudent(studentId: number) {
    return this.prisma.guardian.findMany({
      where: { studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dob: true,
            parentPhone: true,
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found`);
    }

    return guardian;
  }

  async update(id: number, data: UpdateGuardianDto) {
    // Verify guardian exists
    await this.findOne(id);

    return this.prisma.guardian.update({
      where: { id },
      data: {
        relationship: data.relationship,
        isPrimary: data.isPrimary,
        canPickup: data.canPickup,
        emergencyContact: data.emergencyContact,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
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
    // Verify guardian exists
    await this.findOne(id);

    return this.prisma.guardian.delete({
      where: { id },
    });
  }
}
