import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSiblingDto } from './siblings.dto';

@Injectable()
export class SiblingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSiblingDto) {
    // Verify both students exist
    const student1 = await this.prisma.student.findUnique({
      where: { id: data.student1Id },
    });

    if (!student1) {
      throw new NotFoundException(`Student with ID ${data.student1Id} not found`);
    }

    const student2 = await this.prisma.student.findUnique({
      where: { id: data.student2Id },
    });

    if (!student2) {
      throw new NotFoundException(`Student with ID ${data.student2Id} not found`);
    }

    // Check if they're the same student
    if (data.student1Id === data.student2Id) {
      throw new BadRequestException('Cannot link a student as their own sibling');
    }

    // Check if relationship already exists (in either direction)
    const existing = await this.prisma.sibling.findFirst({
      where: {
        OR: [
          { student1Id: data.student1Id, student2Id: data.student2Id },
          { student1Id: data.student2Id, student2Id: data.student1Id },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Sibling relationship already exists');
    }

    return this.prisma.sibling.create({
      data: {
        student1Id: data.student1Id,
        student2Id: data.student2Id,
      },
      include: {
        student1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        student2: {
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
    return this.prisma.sibling.findMany({
      include: {
        student1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        student2: {
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
    // Find all sibling relationships where the student is either student1 or student2
    const siblings = await this.prisma.sibling.findMany({
      where: {
        OR: [
          { student1Id: studentId },
          { student2Id: studentId },
        ],
      },
      include: {
        student1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            currentLevel: true,
            batchId: true,
          },
        },
        student2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            currentLevel: true,
            batchId: true,
          },
        },
      },
    });

    // Return the sibling data (the other student in each relationship)
    return siblings.map((sibling) => {
      if (sibling.student1Id === studentId) {
        return {
          id: sibling.id,
          sibling: sibling.student2,
          createdAt: sibling.createdAt,
        };
      } else {
        return {
          id: sibling.id,
          sibling: sibling.student1,
          createdAt: sibling.createdAt,
        };
      }
    });
  }

  async remove(id: number) {
    const sibling = await this.prisma.sibling.findUnique({
      where: { id },
    });

    if (!sibling) {
      throw new NotFoundException(`Sibling relationship with ID ${id} not found`);
    }

    return this.prisma.sibling.delete({
      where: { id },
    });
  }
}
